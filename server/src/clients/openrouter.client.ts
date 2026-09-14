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

  async createChatCompletion(
    options: ChatCompletionOptions,
    retries = 2
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is not configured in server/.env. Please provide a valid key.'
      );
    }

    const payload = {
      model: options.model || this.defaultModel,
      messages: options.messages,
      tools: options.tools,
      tool_choice: options.tool_choice,
      temperature: options.temperature ?? 0.2,
      response_format: options.response_format,
      max_tokens: options.max_tokens,
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
        if (response.status === 429 && retries > 0) {
          console.warn('[OpenRouter] Rate limited (429). Retrying in 2 seconds...');
          await new Promise((res) => setTimeout(res, 2000));
          return this.createChatCompletion(options, retries - 1);
        }
        throw new Error(
          `OpenRouter API error (${response.status} ${response.statusText}): ${errorText}`
        );
      }

      return (await response.json()) as ChatCompletionResponse;
    } catch (err: any) {
      if (retries > 0 && err.name === 'FetchError') {
        console.warn('[OpenRouter] Network fetch error. Retrying...', err.message);
        await new Promise((res) => setTimeout(res, 1500));
        return this.createChatCompletion(options, retries - 1);
      }
      throw err;
    }
  }
}

export const openRouterClient = new OpenRouterClient();
