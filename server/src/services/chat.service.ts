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

export class ChatService {
  async processMessage(
    userMessage: string,
    history: Array<{ sender: 'user' | 'assistant'; text: string }>,
    authHeader?: string,
    conversationId?: string,
    imageFiles?: ProcessedFile[]
  ): Promise<ChatResponse> {
    const convId = conversationId || 'default';

    // 1. If images were uploaded, analyze them first
    let imageAnalysisContext = '';
    let extractionData: any = null;

    if (imageFiles && imageFiles.length > 0) {
      try {
        console.log(`[ChatService] Processing ${imageFiles.length} uploaded image(s) for conversation ${convId}`);
        const visionResult = await visionService.analyzeImage(imageFiles);

        extractionData = visionResult;
        imageAnalysisContext = `\n\n[SYSTEM: The user uploaded ${imageFiles.length} image(s). The vision system analyzed them and returned the following extraction result. Use this data to respond to the user. Do NOT re-analyze — the analysis is already done.]\n\nExtraction Result:\n${JSON.stringify(visionResult, null, 2)}`;

        // Track in conversation context
        conversationService.setPendingExtraction(convId, visionResult.type, visionResult.data);

        // Update onboarding state
        if (visionResult.type === 'timetable') {
          conversationService.updateOnboarding(convId, { timetableUploaded: true });
        } else if (visionResult.type === 'exam_timetable') {
          conversationService.updateOnboarding(convId, { examTimetableUploaded: true });
        } else if (visionResult.type === 'syllabus') {
          conversationService.updateOnboarding(convId, { syllabusUploaded: true });
        }
      } catch (err: any) {
        console.error('[ChatService] Vision analysis failed:', err);
        imageAnalysisContext = `\n\n[SYSTEM: The user uploaded image(s) but analysis failed: ${err.message}. Inform the user and ask them to try again with a clearer image.]`;
      }
    }

    // 2. Get conversation context summary
    const contextSummary = conversationService.getContextSummary(convId);
    const contextNote = contextSummary
      ? `\n[SYSTEM CONTEXT: ${contextSummary}]`
      : '';

    // 3. Build message list
    const recentHistory = history.slice(-12); // Sliding window: last 12 turns

    const messages: ChatCompletionMessage[] = [
      {
        role: 'system',
        content: CHAT_SYSTEM_PROMPT + contextNote,
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
    let actions: Array<{ type: string; status: string; details?: any }> = [];
    const MAX_TOOL_TURNS = 6;

    // 4. Autonomous multi-turn tool calling loop
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      const response = await openRouterClient.createChatCompletion({
        model: config.openrouter.chatModel,
        messages,
        tools: AI_TOOLS,
        tool_choice: 'auto',
        temperature: 0.2,
      });

      const choice = response.choices?.[0];
      if (!choice) {
        throw new Error('OpenRouter returned an empty response with no choices.');
      }

      const assistantMessage = choice.message;
      messages.push(assistantMessage);

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

          // Track write actions
          if (result.status && result.status !== 'proposal_created') {
            actions.push({
              type: functionName,
              status: result.status,
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
      const replyText =
        typeof assistantMessage.content === 'string'
          ? assistantMessage.content
          : JSON.stringify(assistantMessage.content);

      return {
        replyText: replyText || "I've analyzed your request.",
        actionCard: pendingProposal,
        toolsUsed: Array.from(new Set(toolsUsed)),
        actions: actions.length > 0 ? actions : undefined,
        extractionData: extractionData || undefined,
      };
    }

    // If max turns reached, return latest generated response
    const lastAssistant = messages.filter((m) => m.role === 'assistant').pop();
    const fallbackText = lastAssistant?.content
      ? typeof lastAssistant.content === 'string'
        ? lastAssistant.content
        : JSON.stringify(lastAssistant.content)
      : "I've compiled your schedule details and verified your deadlines.";

    return {
      replyText: fallbackText,
      actionCard: pendingProposal,
      toolsUsed: Array.from(new Set(toolsUsed)),
      actions: actions.length > 0 ? actions : undefined,
      extractionData: extractionData || undefined,
    };
  }
}

export const chatService = new ChatService();
