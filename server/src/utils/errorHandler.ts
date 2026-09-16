import { Response } from 'express';
import { ZodError } from 'zod';

export function handleControllerError(res: Response, error: any, contextMsg: string) {
  console.error(`[AI Service Error] ${contextMsg}:`, error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const errorMessage = error?.message || 'Internal AI Server Error';

  if (errorMessage.includes('OPENROUTER_API_KEY is not configured')) {
    return res.status(503).json({
      error: 'OpenRouter Not Configured',
      message:
        'The server OPENROUTER_API_KEY is not set. Please set OPENROUTER_API_KEY in server/.env.',
    });
  }

  if (errorMessage.includes('Rate limited') || errorMessage.includes('429')) {
    return res.status(429).json({
      error: 'Rate Limited',
      message:
        'OpenRouter API rate limit reached. Please wait a few moments and try again.',
    });
  }

  if (errorMessage.includes('402') || errorMessage.includes('Insufficient credits')) {
    return res.status(402).json({
      error: 'Insufficient OpenRouter Credits',
      message:
        'Your OpenRouter account has 0 credits. Add credits at https://openrouter.ai/settings/credits or configure free models.',
    });
  }

  return res.status(500).json({
    error: 'AI Processing Error',
    message: errorMessage,
  });
}
