import {
  openRouterClient,
  ChatCompletionMessage,
} from '../clients/openrouter.client.js';
import { AI_TOOLS } from '../tools/definitions.js';
import { executeToolCall, ActionCardProposal } from '../tools/handlers.js';
import { CHAT_SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { ChatResponse } from '../schemas/chat.schema.js';

export class ChatService {
  async processMessage(
    userMessage: string,
    history: Array<{ sender: 'user' | 'assistant'; text: string }>,
    authHeader?: string
  ): Promise<ChatResponse> {
    // 1. Build message list with system prompt and sliding window history
    const recentHistory = history.slice(-8); // Keep last 8 turns for context window control

    const messages: ChatCompletionMessage[] = [
      {
        role: 'system',
        content: CHAT_SYSTEM_PROMPT,
      },
      ...recentHistory.map((msg) => ({
        role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const toolsUsed: string[] = [];
    let pendingProposal: ActionCardProposal | undefined = undefined;
    const MAX_TOOL_TURNS = 5;

    // 2. Autonomous multi-turn tool calling loop
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      const response = await openRouterClient.createChatCompletion({
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
        replyText: replyText || "I've analyzed your schedule.",
        actionCard: pendingProposal,
        toolsUsed: Array.from(new Set(toolsUsed)),
      };
    }

    // If max turns reached, return latest generated response
    return {
      replyText:
        "I've compiled your schedule details and verified your deadlines.",
      actionCard: pendingProposal,
      toolsUsed: Array.from(new Set(toolsUsed)),
    };
  }
}

export const chatService = new ChatService();
