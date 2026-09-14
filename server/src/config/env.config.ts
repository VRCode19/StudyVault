import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
    fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'anthropic/claude-3.5-sonnet',
  },

  backend: {
    mode: (process.env.BACKEND_MODE || 'mock') as 'mock' | 'http',
    baseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:5000/api/v1',
  },
};
