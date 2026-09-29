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
// Production-safe CORS: allow configured origins + dev fallback
const allowedOrigins = config.corsOrigin
  .split(',')
  .map((o: string) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed: string) => origin === allowed || allowed === '*')) {
        return callback(null, true);
      }
      // In development, allow localhost origins
      if (config.nodeEnv === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
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

// Root status endpoint — fixes 404 Cannot GET / on Render
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StudyVault AI Service</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #090d16;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            max-width: 520px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.15);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(52, 211, 153, 0.3);
            margin-bottom: 20px;
          }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
          }
          h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0 0 10px 0;
            background: linear-gradient(135deg, #60a5fa, #22d3ee);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          .info {
            background: rgba(2, 6, 23, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 16px;
            font-family: monospace;
            font-size: 12px;
            color: #cbd5e1;
            margin-bottom: 24px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .info-row:last-child { margin-bottom: 0; }
          .info-label { color: #64748b; }
          .endpoints {
            font-size: 12px;
            color: #64748b;
          }
          .endpoints code {
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <span class="dot"></span>
            Operational
          </div>
          <h1>StudyVault AI Service</h1>
          <p>The dedicated backend AI Web Service is running and ready to handle syllabus ingestion, calendar scheduling, and AI strategist queries.</p>
          <div class="info">
            <div class="info-row">
              <span class="info-label">Service:</span>
              <span>studyvault-ai-service</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span style="color: #34d399;">200 OK</span>
            </div>
            <div class="info-row">
              <span class="info-label">API Key:</span>
              <span>${config.openrouter.apiKey ? 'Configured (Active)' : 'Missing'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Chat Model:</span>
              <span>${config.openrouter.chatModel}</span>
            </div>
          </div>
          <div class="endpoints">
            Health Check: <code>GET /health</code> • Chat API: <code>POST /api/ai/chat</code>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  res.status(200).json({
    status: 'ok',
    service: 'studyvault-ai-service',
    openrouterConfigured: Boolean(config.openrouter.apiKey),
    chatModel: config.openrouter.chatModel,
    visionModel: config.openrouter.visionModel,
    backendMode: config.backend.mode,
    endpoints: {
      health: '/health',
      chat: '/api/ai/chat',
      syllabus: '/api/ai/analyze-syllabus',
      timetable: '/api/ai/analyze-timetable',
    },
  });
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

// Also serve health check at /api/health and /api/ai/health for Vercel/proxy compatibility
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'studyvault-ai-service',
    openrouterConfigured: Boolean(config.openrouter.apiKey),
    chatModel: config.openrouter.chatModel,
    visionModel: config.openrouter.visionModel,
    backendMode: config.backend.mode,
  });
});

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

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'studyvault-ai-service' });
});

app.get('/api', (_req, res) => {
  res.redirect('/');
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

// 404 handler for unmatched routes
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>404 Not Found - StudyVault AI Service</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 36px; text-align: center; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          h1 { color: #f87171; font-size: 22px; margin: 0 0 12px 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
          a { display: inline-block; background: #0284c7; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Route Not Found</h1>
          <p>The endpoint <code>${req.method} ${req.originalUrl}</code> does not exist on this AI service.</p>
          <a href="/">Go to AI Service Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: ['/', '/health', '/api/health', '/api/ai/chat', '/api/ai/analyze-syllabus', '/api/ai/analyze-timetable'],
  });
});

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
  app.listen(config.port, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`⚡ StudyVault AI Service running on port ${config.port}`);
    console.log(`🤖 Chat Model: ${config.openrouter.chatModel}`);
    console.log(`📸 Vision Model: ${config.openrouter.visionModel}`);
    console.log(`🔗 Backend Mode: ${config.backend.mode}`);
    console.log(`🌐 Allowed Origins: ${config.corsOrigin}`);
    console.log(`🔑 API Key configured: ${Boolean(config.openrouter.apiKey)}`);
    console.log('====================================================');
    console.log('Routes:');
    console.log('  POST /api/ai/chat                    — AI chatbot (text + images)');
    console.log('  POST /api/ai/analyze-syllabus         — Syllabus extraction');
    console.log('  POST /api/ai/analyze-image            — Generic image analysis');
    console.log('  POST /api/ai/analyze-timetable        — Class timetable extraction');
    console.log('  POST /api/ai/analyze-exam-timetable   — Exam timetable extraction');
    console.log('  GET  /api/ai/health                   — Health check');
    console.log('  GET  /health                          — Health check (alt)');
    console.log('====================================================');
  });
}

export default app;
