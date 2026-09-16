import { config } from '../config/env.config.js';

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatCompletionMessage[];
  tools?: any[];
  tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
  temperature?: number;
  response_format?: { type: 'json_object' };
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: ChatCompletionMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = config.openrouter.apiKey;
    this.baseUrl = config.openrouter.baseUrl;
    this.defaultModel = config.openrouter.model;
  }

  private static readonly FREE_CHAT_FALLBACKS = [
    'nex-agi/nex-n2.5-mini:free',
    'nex-agi/nex-n2.5-pro:free',
    'google/gemma-4-31b-it:free',
    'liquid/lfm-2.5-2.6b:free',
  ];

  private static readonly FREE_VISION_FALLBACKS = [
    'inclusionai/ling-3.0-flash-vl:free',
    'dots-studio/dots-3-note-preview:free',
  ];

  async createChatCompletion(
    options: ChatCompletionOptions,
    retries = 2
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is not configured in server/.env. Please provide a valid key.'
      );
    }

    // Determine if request includes image/multimodal content
    const hasImages = options.messages.some(
      (m) => Array.isArray(m.content) && m.content.some((c) => c.type === 'image_url')
    );

    const primaryModel = options.model || (hasImages ? config.openrouter.visionModel : this.defaultModel);
    const fallbackList = hasImages
      ? OpenRouterClient.FREE_VISION_FALLBACKS
      : OpenRouterClient.FREE_CHAT_FALLBACKS;

    // Build unique model candidate cascade
    const modelCascade = Array.from(new Set([primaryModel, ...fallbackList]));

    let lastError: Error | null = null;

    for (let i = 0; i < modelCascade.length; i++) {
      const currentModel = modelCascade[i];
      let format = options.response_format;

      // Attempt calling currentModel, with possible fallback if structured-outputs is unsupported
      for (let attempt = 0; attempt < 2; attempt++) {
        const payload = {
          model: currentModel,
          messages: options.messages,
          tools: options.tools,
          tool_choice: options.tool_choice,
          temperature: options.temperature ?? 0.2,
          response_format: format,
          max_tokens: options.max_tokens ?? 2500,
        };

        try {
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'https://studyvault.app',
              'X-Title': 'StudyVault AI Strategy Engine',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text();

            // Check if model rejected response_format (structured outputs)
            if (response.status === 400 && format && errorText.includes('structured-outputs')) {
              console.warn(
                `[OpenRouter] Model ${currentModel} does not support structured-outputs. Retrying without response_format...`
              );
              format = undefined;
              continue; // Retry same model without response_format
            }

            // Check for 402 (Insufficient credits) or 429 (Rate limited) -> cascade to next model
            if (response.status === 402 || response.status === 429) {
              const reason = response.status === 402 ? 'Insufficient credits' : 'Rate limited';
              console.warn(
                `[OpenRouter] Model ${currentModel} failed with ${response.status} (${reason}).`
              );
              if (i + 1 < modelCascade.length) {
                console.log(`[OpenRouter] Cascading to next fallback model: ${modelCascade[i + 1]}`);
              }
              lastError = new Error(`OpenRouter API error (${response.status}): ${errorText}`);
              break; // Break inner loop to try next model in cascade
            }

            // Upstream 5xx error -> retry or cascade
            if (response.status >= 500) {
              console.warn(`[OpenRouter] Model ${currentModel} server error (${response.status}).`);
              lastError = new Error(`OpenRouter API error (${response.status}): ${errorText}`);
              break;
            }

            throw new Error(
              `OpenRouter API error (${response.status} ${response.statusText}): ${errorText}`
            );
          }

          const result = (await response.json()) as ChatCompletionResponse;

          // If choice content was empty or only reasoning without tool calls, log warning
          if (
            result.choices?.[0]?.message &&
            !result.choices[0].message.content &&
            (!result.choices[0].message.tool_calls || result.choices[0].message.tool_calls.length === 0)
          ) {
            console.warn(`[OpenRouter] Model ${currentModel} returned empty content.`);
            // Try next model if available
            if (i + 1 < modelCascade.length) {
              continue;
            }
          }

          return result;
        } catch (err: any) {
          lastError = err;
          if (err.name === 'FetchError' && retries > 0) {
            console.warn('[OpenRouter] Network fetch error. Retrying...', err.message);
            await new Promise((res) => setTimeout(res, 1500));
            return this.createChatCompletion(options, retries - 1);
          }
          console.warn(`[OpenRouter] Attempt with model ${currentModel} failed:`, err.message);
          break; // Advance to next model in cascade
        }
      }
    }

    throw lastError || new Error('All OpenRouter models in fallback cascade failed.');
  }
}

export const openRouterClient = new OpenRouterClient();
