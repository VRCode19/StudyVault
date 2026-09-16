import {
  ChatActionCard,
  ChatMessage,
  Subject,
  ExtractionPreview,
} from '../types/studyvault';

const AI_API_BASE =
  import.meta.env.VITE_AI_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api/ai'
    : 'http://localhost:5001/api/ai');

export interface ChatServiceResponse {
  replyText: string;
  actionCard?: ChatActionCard;
  toolsUsed?: string[];
  extractionData?: ExtractionPreview;
  actions?: string[];
}

export interface ExtractedTopic {
  name: string;
  module: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
}

export interface ExtractedSubject {
  name: string;
  code: string;
  description?: string;
  examDate?: string;
  topics: ExtractedTopic[];
}

export interface SyllabusAnalysisResult {
  status: 'success' | 'unreadable' | 'ambiguous';
  confidence?: 'high' | 'medium' | 'low';
  confidenceScore?: number;
  rejectionReason?: string;
  institution?: string;
  term?: string;
  subjects: ExtractedSubject[];
}

export class AIService {
  /**
   * Send a natural language message to the AI strategist.
   * Supports optional file attachments (images/documents) and persistent conversation_id.
   * The server runs the multi-turn tool calling loop via OpenRouter and returns grounded responses.
   */
  async askAssistant(
    message: string,
    history: ChatMessage[],
    options?: {
      files?: File[];
      conversationId?: string;
      authHeader?: string;
    }
  ): Promise<ChatServiceResponse> {
    const headers: Record<string, string> = {};
    if (options?.authHeader) {
      headers['Authorization'] = options.authHeader;
    }

    const historyPayload = history.slice(-12).map((msg) => ({
      sender: msg.sender,
      text: msg.text,
    }));

    let body: FormData | string;

    if (options?.files && options.files.length > 0) {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('history', JSON.stringify(historyPayload));
      if (options.conversationId) {
        formData.append('conversation_id', options.conversationId);
      }
      for (const file of options.files) {
        formData.append('files', file);
      }
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        message,
        history: historyPayload,
        conversation_id: options?.conversationId,
      });
    }

    try {
      const response = await fetch(`${AI_API_BASE}/chat`, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `AI Server responded with status ${response.status}`
        );
      }

      return (await response.json()) as ChatServiceResponse;
    } catch (err: any) {
      console.error('[AIService] Error communicating with AI service:', err);
      throw err;
    }
  }

  /**
   * Send one or multiple images for automatic document type detection and extraction.
   * Auto-detects timetable, exam dates, syllabus, or module sheets.
   */
  async analyzeImage(
    files: File[],
    context?: string,
    authHeader?: string
  ): Promise<ExtractionPreview> {
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    if (context) {
      formData.append('context', context);
    }

    try {
      const response = await fetch(`${AI_API_BASE}/analyze-image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Vision engine responded with status ${response.status}`
        );
      }

      return (await response.json()) as ExtractionPreview;
    } catch (err: any) {
      console.error('[AIService] Error during image analysis:', err);
      throw err;
    }
  }

  /**
   * Targeted class timetable extraction from uploaded timetable images.
   */
  async analyzeTimetable(
    files: File[],
    authHeader?: string
  ): Promise<ExtractionPreview> {
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      const response = await fetch(`${AI_API_BASE}/analyze-timetable`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Timetable analyzer responded with status ${response.status}`
        );
      }

      return (await response.json()) as ExtractionPreview;
    } catch (err: any) {
      console.error('[AIService] Error during timetable extraction:', err);
      throw err;
    }
  }

  /**
   * Targeted exam timetable extraction from uploaded exam notices or datesheets.
   */
  async analyzeExamTimetable(
    files: File[],
    authHeader?: string
  ): Promise<ExtractionPreview> {
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      const response = await fetch(`${AI_API_BASE}/analyze-exam-timetable`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Exam timetable analyzer responded with status ${response.status}`
        );
      }

      return (await response.json()) as ExtractionPreview;
    } catch (err: any) {
      console.error('[AIService] Error during exam timetable extraction:', err);
      throw err;
    }
  }

  /**
   * Send a syllabus document (single/multi-file or raw text) to the multimodal analyzer.
   * Returns structured subjects and topics without hallucinations.
   */
  async analyzeSyllabus(
    input: File | File[] | string,
    authHeader?: string
  ): Promise<SyllabusAnalysisResult> {
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    let body: FormData | string;

    if (typeof input === 'string') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ text: input });
    } else {
      const formData = new FormData();
      const fileList = Array.isArray(input) ? input : [input];
      for (const file of fileList) {
        formData.append('files', file);
      }
      body = formData;
    }

    try {
      const response = await fetch(`${AI_API_BASE}/analyze-syllabus`, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Syllabus analyzer responded with status ${response.status}`
        );
      }

      return (await response.json()) as SyllabusAnalysisResult;
    } catch (err: any) {
      console.error('[AIService] Error during syllabus analysis:', err);
      throw err;
    }
  }

  /**
   * Helper to convert extracted subjects from the AI analyzer into the frontend Subject interface.
   */
  mapExtractedSubjectsToDomain(extracted: ExtractedSubject[]): Subject[] {
    const colors = [
      { accent: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
      { accent: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
      { accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
      { accent: '#818cf8', glow: 'rgba(129, 140, 248, 0.4)' },
      { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
    ];

    return extracted.map((ext, idx) => {
      const subId = `sub-ai-${Date.now()}-${idx}`;
      const colorScheme = colors[idx % colors.length];

      const topics = ext.topics.map((t, tIdx) => ({
        id: `top-ai-${Date.now()}-${idx}-${tIdx}`,
        subjectId: subId,
        name: t.name,
        module: t.module,
        estimatedMinutes: t.estimatedMinutes || 45,
        difficulty: t.difficulty,
        status: 'pending' as const,
        notes: t.notes,
      }));

      const totalMins = topics.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

      return {
        id: subId,
        name: ext.name,
        code: ext.code || `SUB${idx + 1}`,
        accentColor: colorScheme.accent,
        glowColor: colorScheme.glow,
        totalTopics: topics.length,
        completedTopics: 0,
        totalMinutes: totalMins,
        completedMinutes: 0,
        progressPercentage: 0,
        examDate: ext.examDate,
        topics,
      };
    });
  }
}

export const aiService = new AIService();
