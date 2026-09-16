import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current working dir, server dir, or parent dir
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config(); // Fallback to standard resolution

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    chatModel: process.env.OPENROUTER_CHAT_MODEL || process.env.OPENROUTER_MODEL || 'nex-agi/nex-n2.5-mini:free',
    visionModel: process.env.OPENROUTER_VISION_MODEL || 'inclusionai/ling-3.0-flash-vl:free',
    // Legacy fallback
    model: process.env.OPENROUTER_CHAT_MODEL || process.env.OPENROUTER_MODEL || 'nex-agi/nex-n2.5-mini:free',
    fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'nex-agi/nex-n2.5-pro:free',
  },

  backend: {
    mode: (process.env.BACKEND_MODE || 'mock') as 'mock' | 'http',
    baseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:5000/api/v1',
  },
};
