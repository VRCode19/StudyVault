import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config/env.config.js';
import { handleChat } from './controllers/chat.controller.js';
import { handleAnalyzeSyllabus } from './controllers/syllabus.controller.js';
import {
  handleAnalyzeImage,
  handleAnalyzeTimetable,
  handleAnalyzeExamTimetable,
} from './controllers/vision.controller.js';

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

// Multer in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10, // Max 10 files
  },
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'studyvault-ai-service',
    openrouterConfigured: Boolean(config.openrouter.apiKey),
    chatModel: config.openrouter.chatModel,
    visionModel: config.openrouter.visionModel,
    backendMode: config.backend.mode,
  });
});

// Also serve health check at /api/ai/health for Vercel compatibility
app.get('/api/ai/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'studyvault-ai-service',
    openrouterConfigured: Boolean(config.openrouter.apiKey),
    chatModel: config.openrouter.chatModel,
    visionModel: config.openrouter.visionModel,
    backendMode: config.backend.mode,
  });
});

// ─── AI Routes ───

// Chat endpoint — supports text + optional image attachments
app.post('/api/ai/chat', upload.array('files', 10), handleChat);

// Syllabus analysis — single or multi-file upload + text paste
app.post('/api/ai/analyze-syllabus', upload.array('files', 10), handleAnalyzeSyllabus);

// Generic image analysis — auto-detects document type
app.post('/api/ai/analyze-image', upload.array('files', 10), handleAnalyzeImage);

// Targeted timetable extraction
app.post('/api/ai/analyze-timetable', upload.array('files', 10), handleAnalyzeTimetable);

// Targeted exam timetable extraction
app.post('/api/ai/analyze-exam-timetable', upload.array('files', 10), handleAnalyzeExamTimetable);

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

// Start server if not in serverless/test environment
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`⚡ StudyVault AI Service running on port ${config.port}`);
    console.log(`🤖 Chat Model: ${config.openrouter.chatModel}`);
    console.log(`📸 Vision Model: ${config.openrouter.visionModel}`);
    console.log(`🔗 Backend Mode: ${config.backend.mode}`);
    console.log(`🌐 Allowed Origin: ${config.corsOrigin}`);
    console.log('====================================================');
    console.log('Routes:');
    console.log('  POST /api/ai/chat                    — AI chatbot (text + images)');
    console.log('  POST /api/ai/analyze-syllabus         — Syllabus extraction');
    console.log('  POST /api/ai/analyze-image            — Generic image analysis');
    console.log('  POST /api/ai/analyze-timetable        — Class timetable extraction');
    console.log('  POST /api/ai/analyze-exam-timetable   — Exam timetable extraction');
    console.log('  GET  /api/ai/health                   — Health check');
    console.log('====================================================');
  });
}

export default app;
