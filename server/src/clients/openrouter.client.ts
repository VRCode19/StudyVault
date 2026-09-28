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
  timeoutMs?: number;
  maxFallbacks?: number;
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
    'openrouter/free',
    'liquid/lfm-2.5-2.6b:free',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'cohere/north-mini-code:free',
    'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
  ];

  private static readonly FREE_VISION_FALLBACKS = [
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'openrouter/free',
    'dots-studio/dots-3-note-preview:free',
    'google/gemma-4-26b-a4b-it:free',
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
    let modelCascade = Array.from(new Set([primaryModel, ...fallbackList]));
    if (typeof options.maxFallbacks === 'number') {
      modelCascade = modelCascade.slice(0, Math.max(1, options.maxFallbacks + 1));
    }

    let lastError: Error | null = null;
    const requestTimeout = options.timeoutMs ?? 15000;

    for (let i = 0; i < modelCascade.length; i++) {
      const currentModel = modelCascade[i];
      let format = options.response_format;
      console.log(`[OpenRouter] Requesting model [${i + 1}/${modelCascade.length}]: ${currentModel}`);

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
            signal: AbortSignal.timeout(requestTimeout),
          });

          if (!response.ok) {
            const errorText = await response.text();

            // Check if model rejected response_format (structured outputs)
            if (
              response.status === 400 &&
              format &&
              (errorText.includes('structured-outputs') ||
                errorText.includes('response_format') ||
                errorText.includes('INVALID_REQUEST_BODY'))
            ) {
              console.warn(
                `[OpenRouter] Model ${currentModel} does not support structured-outputs. Retrying without response_format...`
              );
              format = undefined;
              continue; // Retry same model without response_format
            }

            // Check for 400, 402, 404, 429, or 5xx -> cascade to next model in cascade
            console.warn(
              `[OpenRouter] Model ${currentModel} returned HTTP ${response.status}: ${errorText}`
            );
            lastError = new Error(`OpenRouter API error (${response.status}): ${errorText}`);
            if (i + 1 < modelCascade.length) {
              console.log(`[OpenRouter] Cascading to next fallback model: ${modelCascade[i + 1]}`);
            }
            break; // Break inner loop to try next model in cascade
          }

          const result = (await response.json()) as any;

          // Check for error payload from OpenRouter even if status was 200 or not caught
          if (result.error) {
            const errMsg = result.error.message || JSON.stringify(result.error);
            console.warn(`[OpenRouter] Model ${currentModel} returned error:`, errMsg);
            lastError = new Error(`Model ${currentModel}: ${errMsg}`);
            if (i + 1 < modelCascade.length) {
              console.log(`[OpenRouter] Cascading to next fallback model: ${modelCascade[i + 1]}`);
            }
            break;
          }

          const hasValidChoice =
            Array.isArray(result.choices) &&
            result.choices.length > 0 &&
            Boolean(result.choices[0].message) &&
            (Boolean(result.choices[0].message.content) ||
              Boolean(result.choices[0].message.tool_calls && result.choices[0].message.tool_calls.length > 0));

          if (!hasValidChoice) {
            console.warn(`[OpenRouter] Model ${currentModel} returned empty content or no choices.`);
            lastError = new Error(`Model ${currentModel} returned empty content or no choices.`);
            if (i + 1 < modelCascade.length) {
              console.log(`[OpenRouter] Cascading to next fallback model: ${modelCascade[i + 1]}`);
            }
            break; // Break attempt loop to advance to next candidate model
          }

          return result as ChatCompletionResponse;
        } catch (err: any) {
          lastError = err;
          const isTimeoutOrAbort =
            err.name === 'TimeoutError' ||
            err.name === 'AbortError' ||
            err.cause?.name === 'TimeoutError' ||
            err.cause?.name === 'AbortError' ||
            err.message?.includes('aborted') ||
            err.message?.includes('timeout');

          if (isTimeoutOrAbort) {
            console.warn(`[OpenRouter] Model ${currentModel} timed out. Cascading to next fallback model...`);
            break;
          }
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
