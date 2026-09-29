import {
  openRouterClient,
  ChatCompletionMessage,
} from '../clients/openrouter.client.js';
import { AI_TOOLS } from '../tools/definitions.js';
import { executeToolCall, ActionCardProposal } from '../tools/handlers.js';
import { CHAT_SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { ChatResponse } from '../schemas/chat.schema.js';
import { conversationService } from './conversation.service.js';
import { visionService } from './vision.service.js';
import { ProcessedFile } from '../utils/fileProcessing.js';
import { config } from '../config/env.config.js';
import { synthesizeStudySessionsFromSubjects } from '../utils/timetableSynthesis.js';

export class ChatService {
  async processMessage(
    userMessage: string,
    history: Array<{ sender: 'user' | 'assistant'; text: string }>,
    authHeader?: string,
    conversationId?: string,
    imageFiles?: ProcessedFile[],
    studyvaultContext?: any
  ): Promise<ChatResponse> {
    const convId = conversationId || 'default';
    const trimmedMsg = userMessage.trim();
    let onboardingState = conversationService.getOnboardingState(convId);

    // 1. Detect onboarding triggers & subject count from user message
    const isPlanningRequest =
      /set\s*up|start|create\s*(?:my\s*)?timetable|arrange\s*(?:my\s*)?module|plan\s*(?:my\s*)?study|how\s*many\s*subject|syllabus|subject/i.test(
        trimmedMsg
      );

    if (!onboardingState.active && isPlanningRequest) {
      conversationService.startSubjectOnboarding(convId);
      onboardingState = conversationService.getOnboardingState(convId);
    }

    // Check if user is specifying subject count (e.g. "3", "3 subjects", "I have 4 subjects", "five")
    const wordNumbers: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
    };
    const digitMatch = trimmedMsg.match(/\b([1-9]|10)\b(?:\s*(?:subjects?|courses?|classes?))?/i);
    const wordMatch = trimmedMsg.match(
      /\b(one|two|three|four|five|six|seven|eight|nine|ten)\b(?:\s*(?:subjects?|courses?|classes?))?/i
    );

    let detectedCount: number | null = null;
    if (digitMatch) {
      detectedCount = parseInt(digitMatch[1], 10);
    } else if (wordMatch) {
      detectedCount = wordNumbers[wordMatch[1].toLowerCase()];
    }

    if (
      detectedCount &&
      (!onboardingState.totalSubjects || onboardingState.step === 'ASK_SUBJECT_COUNT')
    ) {
      conversationService.setTotalSubjects(convId, detectedCount);
      onboardingState = conversationService.getOnboardingState(convId);
    }

    // 2. If images were uploaded, analyze them first
    let imageAnalysisContext = '';
    let extractionData: any = null;

    if (imageFiles && imageFiles.length > 0) {
      try {
        console.log(`[ChatService] Processing ${imageFiles.length} uploaded file(s) for conversation ${convId}`);
        const visionResult = await visionService.analyzeImage(imageFiles);

        extractionData = visionResult;
        imageAnalysisContext = `\n\n[SYSTEM: The user uploaded ${imageFiles.length} file(s). The vision/document system analyzed them and returned the following extraction result. Use this data to respond to the user. Do NOT re-analyze — the analysis is already done.]\n\nExtraction Result:\n${JSON.stringify(visionResult, null, 2)}`;

        // Track in conversation context
        conversationService.setPendingExtraction(convId, visionResult.type, visionResult.data);

        // Update onboarding state
        if (visionResult.type === 'timetable') {
          conversationService.updateOnboarding(convId, { timetableUploaded: true });
        } else if (visionResult.type === 'exam_timetable') {
          conversationService.updateOnboarding(convId, { examTimetableUploaded: true });
        } else if (visionResult.type === 'syllabus') {
          conversationService.updateOnboarding(convId, { syllabusUploaded: true });

          // Record in sequential multi-subject collector
          if (visionResult.data?.subjects && visionResult.data.subjects.length > 0) {
            for (const sub of visionResult.data.subjects) {
              conversationService.addCollectedSubject(convId, {
                name: sub.name,
                code: sub.code,
                modules:
                  sub.modules && sub.modules.length > 0
                    ? sub.modules.map((m: any, idx: number) => ({
                        moduleNumber: m.moduleNumber || m.number || idx + 1,
                        title: m.title || m.name || `Module ${idx + 1}`,
                        topics: Array.isArray(m.topics)
                          ? m.topics.map((t: any) => ({
                              name: typeof t === 'string' ? t : t.name,
                              estimatedMinutes: typeof t === 'object' ? t.estimatedMinutes : 45,
                              difficulty:
                                typeof t === 'object' && ['easy', 'medium', 'hard'].includes(t.difficulty)
                                  ? t.difficulty
                                  : 'medium',
                            }))
                          : [],
                      }))
                    : sub.topics && sub.topics.length > 0
                    ? [
                        {
                          moduleNumber: 1,
                          title: 'Core Curriculum',
                          topics: sub.topics.map((t: any) => ({
                            name: typeof t === 'string' ? t : t.name,
                            estimatedMinutes: typeof t === 'object' ? t.estimatedMinutes : 45,
                            difficulty:
                              typeof t === 'object' && ['easy', 'medium', 'hard'].includes(t.difficulty)
                                ? t.difficulty
                                : 'medium',
                          })),
                        },
                      ]
                    : [],
              });
            }
            onboardingState = conversationService.getOnboardingState(convId);
          }
        }
      } catch (err: any) {
        console.error('[ChatService] Document/Image analysis failed:', err);
        imageAnalysisContext = `\n\n[SYSTEM: The user uploaded file(s) but analysis failed: ${err.message}. Inform the user and ask them to try again with a clearer image or document.]`;
      }
    }

    // 3. Get conversation context summary for system prompt
    const contextSummary = conversationService.getContextSummary(convId);
    let stateContext = '';
    if (studyvaultContext) {
      stateContext = `\n\n[CURRENT REAL-TIME STUDYVAULT DATA]:\n${JSON.stringify(studyvaultContext, null, 2)}\nUse this real-time data to answer questions about the student's current subjects, today's schedule, planned study time, completed study time, and remaining time. Always calculate remaining study accurately: planned - completed.`;
    }
    const contextNote = contextSummary ? `\n[SYSTEM CONTEXT: ${contextSummary}]` : '';

    // 4. Build message list
    const recentHistory = history.slice(-12); // Sliding window: last 12 turns

    const messages: ChatCompletionMessage[] = [
      {
        role: 'system',
        content: CHAT_SYSTEM_PROMPT + contextNote + stateContext,
      },
      ...recentHistory.map((msg) => ({
        role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text,
      })),
      {
        role: 'user',
        content: userMessage + imageAnalysisContext,
      },
    ];

    const toolsUsed: string[] = [];
    let pendingProposal: ActionCardProposal | undefined = undefined;
    let actions: Array<{ type: string; status: string; parameters?: any; details?: any }> = [];
    let currentTurnAssistantReply: string | null = null;
    const MAX_TOOL_TURNS = 3;

    // 5. Autonomous multi-turn tool calling loop
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      let response: any = null;
      try {
        response = await openRouterClient.createChatCompletion({
          model: config.openrouter.chatModel,
          messages,
          tools: AI_TOOLS,
          tool_choice: 'auto',
          temperature: 0.2,
          timeoutMs: 15000,
          maxFallbacks: 3,
        });
      } catch (chatError: any) {
        console.warn(`[ChatService] OpenRouter call failed on turn ${turn}:`, chatError.message);
        break; // Exit tool loop to synthesize response from tool execution outputs / extraction
      }

      const choice = response?.choices?.[0];
      if (!choice || !choice.message) {
        console.warn(`[ChatService] OpenRouter returned no choices on turn ${turn}. Breaking tool loop.`);
        break;
      }

      const assistantMessage = choice.message;
      messages.push(assistantMessage);

      if (assistantMessage.content) {
        currentTurnAssistantReply =
          typeof assistantMessage.content === 'string'
            ? assistantMessage.content
            : JSON.stringify(assistantMessage.content);
      }

      // Check if model called any tools
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          toolsUsed.push(functionName);

          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(toolCall.function.arguments || '{}');
          } catch (e) {
            console.warn(`[ChatService] Failed to parse arguments for tool ${functionName}`, e);
          }

          console.log(`[ChatService] Executing tool: ${functionName}`, parsedArgs);
          const { result, proposal } = await executeToolCall(
            functionName,
            parsedArgs,
            authHeader
          );

          if (proposal) {
            pendingProposal = proposal;
          }

          // Track write actions with full validated parameters
          if (result.status && result.status !== 'proposal_created') {
            actions.push({
              type: functionName,
              status: result.status,
              parameters: {
                ...parsedArgs,
                ...result,
              },
              details: result.message,
            });
          }

          // Feed tool execution output back to OpenRouter
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: functionName,
            content: JSON.stringify(result),
          });
        }
        // Continue loop so OpenRouter processes tool outputs
        continue;
      }

      // If no tool calls, model returned final textual response
      const replyText = currentTurnAssistantReply;

      // If all subjects collected and no action proposal created yet, synthesize master timetable
      const currentOnboarding = conversationService.getOnboardingState(convId);
      if (
        currentOnboarding.active &&
        currentOnboarding.step === 'ALL_COLLECTED' &&
        currentOnboarding.collectedSubjects.length > 0 &&
        !pendingProposal
      ) {
        const synthesized = synthesizeStudySessionsFromSubjects(currentOnboarding.collectedSubjects);
        pendingProposal = {
          type: 'schedule-proposal',
          title: `Master Study Timetable (${currentOnboarding.collectedSubjects.length} Subjects)`,
          description: `Balanced ${synthesized.studySessions.length} weekly sessions across Monday–Sunday, distributed by topic difficulty into prime focus blocks.`,
          totalHours: Math.round(
            synthesized.studySessions.reduce((acc, s) => acc + (s.durationMinutes || 45), 0) / 60
          ),
          sessionsCount: synthesized.studySessions.length,
          sessions: synthesized.studySessions.map((s) => ({
            day: s.dayOfWeek,
            subject: s.subjectName,
            topic: s.topicName,
            time: `${s.startTime} - ${s.endTime}`,
            duration: s.durationMinutes,
          })),
          applied: false,
        };
      }

      return {
        replyText: replyText || "I've analyzed your request.",
        actionCard: pendingProposal,
        toolsUsed: Array.from(new Set(toolsUsed)),
        actions: actions.length > 0 ? actions : undefined,
        extractionData: extractionData || undefined,
      };
    }

    // 6. Resilient Fallback / Synthesis if tool loop ended or model response was empty
    let replyText = currentTurnAssistantReply || '';

    const finalOnboarding = conversationService.getOnboardingState(convId);

    // If all subjects are collected, synthesize the master timetable into the calendar
    if (
      finalOnboarding.active &&
      (finalOnboarding.step === 'ALL_COLLECTED' ||
        finalOnboarding.collectedSubjects.length >= (finalOnboarding.totalSubjects || 1)) &&
      finalOnboarding.collectedSubjects.length > 0
    ) {
      const synthesized = synthesizeStudySessionsFromSubjects(finalOnboarding.collectedSubjects);
      if (!pendingProposal) {
        pendingProposal = {
          type: 'schedule-proposal',
          title: `Master Study Timetable (${finalOnboarding.collectedSubjects.length} Subjects)`,
          description: `Balanced ${synthesized.studySessions.length} weekly sessions across Monday–Sunday, distributed by topic difficulty into prime focus blocks.`,
          totalHours: Math.round(
            synthesized.studySessions.reduce((acc, s) => acc + (s.durationMinutes || 45), 0) / 60
          ),
          sessionsCount: synthesized.studySessions.length,
          sessions: synthesized.studySessions.map((s) => ({
            day: s.dayOfWeek,
            subject: s.subjectName,
            topic: s.topicName,
            time: `${s.startTime} - ${s.endTime}`,
            duration: s.durationMinutes,
          })),
          applied: false,
        };
      }

      if (!replyText || replyText.trim().length < 15) {
        const subList = finalOnboarding.collectedSubjects.map((s) => `**${s.name}**`).join(', ');
        replyText =
          `🎉 **All ${finalOnboarding.collectedSubjects.length} subjects have been gathered!** (${subList})\n\n` +
          `I have organized all your modules across Monday to Sunday into a balanced weekly timetable in your calendar:\n\n` +
          `• 🧠 **High-complexity topics** are assigned to morning focus blocks for maximum retention.\n` +
          `• 🔄 **Subjects are alternated across the week** to maintain cognitive momentum without burnout.\n` +
          `• 📅 Total **${synthesized.studySessions.length} focus sessions** prepared.\n\n` +
          `Click **'Lock In Schedule'** below to sync these sessions directly into your calendar!`;
      }
    } else if (finalOnboarding.active && finalOnboarding.step === 'COLLECT_SUBJECT_SYLLABUS') {
      const nextNum = finalOnboarding.currentSubjectIndex + 1;
      const total = finalOnboarding.totalSubjects || '?';
      const justExtracted = extractionData?.data?.subjects?.[0];

      if (!replyText || replyText.trim().length < 15) {
        if (justExtracted) {
          replyText =
            `✅ I have successfully analyzed the syllabus for **${justExtracted.name}** (${justExtracted.code || ''}) and extracted **${justExtracted.modules?.length || 0} modules**!\n\n` +
            `Now let's move to **Subject ${nextNum} of ${total}**:\n` +
            `What is the name of Subject ${nextNum}, and could you upload or paste its syllabus?`;
        } else {
          replyText =
            `Great! You have **${total} subjects** this semester.\n\n` +
            `Let's set them up one by one so I can organize every module properly into your calendar.\n\n` +
            `👉 **Subject ${nextNum} of ${total}**: What is the name of this subject, and please upload or paste its syllabus (document, image, or topics list).`;
        }
      }
    } else if (finalOnboarding.active && finalOnboarding.step === 'ASK_SUBJECT_COUNT') {
      if (!replyText || replyText.trim().length < 15) {
        replyText =
          `Welcome to StudyVault! To arrange every module into your calendar in a balanced, realistic schedule:\n\n` +
          `👉 **How many subjects are you studying this semester?** (e.g., 3, 4, 5...)\n\n` +
          `Once you reply with the number, we'll go through them one by one: Subject 1 syllabus, then Subject 2 syllabus, etc.!`;
      }
    } else if (!replyText || replyText.trim().length < 5) {
      if (extractionData && extractionData.type === 'timetable') {
        replyText = `I've successfully extracted your class timetable! Your weekly classes have been synced to your study plan.`;
      } else if (extractionData && extractionData.type === 'exam_timetable') {
        replyText = `I've extracted your exam schedule and synchronized your countdown deadlines.`;
      } else if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\b/i.test(trimmedMsg)) {
        replyText =
          `👋 **Hello! I am StudyVault AI, your personal academic strategist.**\n\n` +
          `I can help you:\n` +
          `• **Plan & balance your weekly schedule** across all your subjects\n` +
          `• **Analyze uploaded syllabi or class timetables**\n` +
          `• **Track planned vs completed study hours** in real time\n` +
          `• **Adapt study sessions** when you fall behind or need a break\n\n` +
          `What would you like to work on today?`;
      } else if (/today|schedule|what.*study|plan/i.test(trimmedMsg) && studyvaultContext) {
        const todaySessions = studyvaultContext.todayScheduledSessions || [];
        const progressList = studyvaultContext.subjectProgressToday || [];
        const totalPlanned = progressList.reduce((acc: number, p: any) => acc + (p.plannedMinutes || 0), 0);
        const totalCompleted = progressList.reduce((acc: number, p: any) => acc + (p.completedMinutes || 0), 0);
        const totalRemaining = Math.max(0, totalPlanned - totalCompleted);

        if (todaySessions.length > 0) {
          const sessionList = todaySessions
            .map((s: any) => `• **${s.subjectName}** (${s.startTime}): ${s.durationMinutes} min (${s.topicName || 'Focus'})`)
            .join('\n');
          replyText =
            `📅 **Here is your schedule for today (${studyvaultContext.currentDate || 'Today'}):**\n\n` +
            `${sessionList}\n\n` +
            `⏱ **Target Summary**: ${totalCompleted}m completed of ${totalPlanned}m planned (${totalRemaining}m remaining).`;
        } else {
          replyText =
            `📅 You have no scheduled study sessions for today (${studyvaultContext.currentDate || 'Today'}).\n\n` +
            `Would you like me to schedule a focus block for one of your subjects?`;
        }
      } else if (/tired|exhausted|push.*task|skip|break|can'?t study/i.test(trimmedMsg)) {
        replyText =
          `🛋 **Take a well-deserved breather!** Consistent rest prevents burnout.\n\n` +
          `I can automatically push your remaining tasks for today into your upcoming weekend buffer slots. Check your calendar or tell me how much time you'd like to adjust.`;
      } else if (/exam|runway|deadline/i.test(trimmedMsg)) {
        replyText =
          `🎯 **Upcoming Exam Deadlines & Runway:**\n\n` +
          `Check your Calendar view to see countdowns to your exam milestones. I will prioritize high-difficulty topics in your morning focus blocks leading up to test dates!`;
      } else {
        replyText =
          `I am StudyVault AI, your personal academic strategist.\n\n` +
          `To build your personalized study schedule and arrange every module into your calendar:\n\n` +
          `👉 **How many subjects are you studying this semester?** (e.g., 3, 4, 5...)`;
      }
    }

    return {
      replyText,
      actionCard: pendingProposal,
      toolsUsed: Array.from(new Set(toolsUsed)),
      actions: actions.length > 0 ? actions : undefined,
      extractionData: extractionData || undefined,
    };
  }
}

export const chatService = new ChatService();
