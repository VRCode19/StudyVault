import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config/env.config.js';
import { handleChat } from './controllers/chat.controller.js';
import { handleAnalyzeSyllabus } from './controllers/syllabus.controller.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer in-memory storage for syllabus uploads (PDF / images / text)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'studyvault-ai-service',
    openrouterConfigured: Boolean(config.openrouter.apiKey),
    model: config.openrouter.model,
    backendMode: config.backend.mode,
  });
});

// AI Routes
app.post('/api/ai/chat', handleChat);
app.post('/api/ai/analyze-syllabus', upload.single('file'), handleAnalyzeSyllabus);

// Global unhandled error middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[AI Service Unhandled Error]', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || 'An unexpected error occurred.',
    });
  }
);

// Start server
app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`⚡ StudyVault AI Service running on port ${config.port}`);
  console.log(`🤖 OpenRouter Model: ${config.openrouter.model}`);
  console.log(`🔗 Backend Mode: ${config.backend.mode}`);
  console.log(`🌐 Allowed Origin: ${config.corsOrigin}`);
  console.log('====================================================');
});
