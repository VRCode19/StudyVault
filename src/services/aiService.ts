import {
  ChatActionCard,
  ChatMessage,
  Subject,
  ExtractionPreview,
  StudySession,
  DayOfWeek,
  TimetableSlotItem,
} from '../types/studyvault';

// In development, Vite proxies /api/ai → localhost:5001.
// In production, VITE_AI_SERVICE_URL points to the Render deployment.
const AI_API_BASE = import.meta.env.VITE_AI_SERVICE_URL
  ? `${import.meta.env.VITE_AI_SERVICE_URL}/api/ai`
  : (import.meta.env.VITE_AI_API_URL || '/api/ai');

export interface AIStructuredAction {
  type: string;
  status: string;
  parameters?: Record<string, any>;
  details?: any;
}

export interface ChatServiceResponse {
  replyText: string;
  actionCard?: ChatActionCard;
  toolsUsed?: string[];
  extractionData?: ExtractionPreview;
  actions?: AIStructuredAction[];
}

export interface ExtractedTopic {
  name: string;
  module: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
}

export interface ExtractedStudySession {
  id?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  subjectName: string;
  topicName: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  adaptiveReason?: string;
}

export interface ExtractedSubject {
  name: string;
  code: string;
  description?: string;
  examDate?: string;
  topics?: ExtractedTopic[];
  modules?: Array<{
    number?: number;
    title?: string;
    topics?: ExtractedTopic[];
  }>;
}

export interface SyllabusAnalysisResult {
  status: 'success' | 'unreadable' | 'ambiguous';
  confidence?: 'high' | 'medium' | 'low';
  confidenceScore?: number;
  rejectionReason?: string;
  institution?: string;
  term?: string;
  subjects: ExtractedSubject[];
  studySessions?: ExtractedStudySession[];
  timetable?: {
    weeklySchedule: Array<{
      day: string;
      slots: TimetableSlotItem[];
    }>;
  };
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
      context?: any;
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
      if (options.context) {
        formData.append('context', JSON.stringify(options.context));
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
        context: options?.context,
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
          errorData.message || 'AI service is temporarily unavailable. Please try again.'
        );
      }

      return (await response.json()) as ChatServiceResponse;
    } catch (err: any) {
      console.error('[AIService] Diagnostic log:', err?.message || err);
      if (!err.message || err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        throw new Error("I couldn't connect to the AI service right now. Please try again in a moment.");
      }
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
          errorData.message || 'Image analysis service is temporarily unavailable. Please try again.'
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
          errorData.message || 'Timetable analysis service is temporarily unavailable. Please try again.'
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
          errorData.message || 'Exam timetable analysis service is temporarily unavailable. Please try again.'
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
          errorData.message || 'Syllabus analysis service is temporarily unavailable. Please try again.'
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

      // Extract topics from either direct topics array or nested modules array
      const rawTopics: ExtractedTopic[] = [];
      if (Array.isArray(ext.topics) && ext.topics.length > 0) {
        rawTopics.push(...ext.topics);
      } else if (Array.isArray(ext.modules)) {
        ext.modules.forEach((mod) => {
          const modTitle = mod.title || (mod.number ? `Module ${mod.number}` : 'Core Module');
          if (Array.isArray(mod.topics)) {
            mod.topics.forEach((t) => {
              rawTopics.push({
                name: typeof t === 'string' ? t : t.name,
                module: (t as any).module || modTitle,
                estimatedMinutes: t.estimatedMinutes || 45,
                difficulty: t.difficulty || 'medium',
                notes: t.notes,
              });
            });
          }
        });
      }

      const topics = rawTopics.map((t, tIdx) => ({
        id: `top-ai-${Date.now()}-${idx}-${tIdx}`,
        subjectId: subId,
        name: t.name,
        module: t.module || 'Core Module',
        estimatedMinutes: t.estimatedMinutes || 45,
        difficulty: t.difficulty || 'medium',
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

  /**
   * Synthesize adaptive weekly study sessions from a list of subjects and topics.
   * Balances topic difficulty, estimated study time, and student daily preferences.
   */
  generateScheduleFromSubjects(
    subjects: Subject[],
    options?: {
      preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
      dailyHours?: number;
      excludeWeekends?: boolean;
    }
  ): StudySession[] {
    const days: DayOfWeek[] = options?.excludeWeekends
      ? ['MON', 'TUE', 'WED', 'THU', 'FRI']
      : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const timeSlots = [
      { start: '09:00', end: '09:45', duration: 45, period: 'morning', label: 'Morning Deep Work' },
      { start: '10:30', end: '11:15', duration: 45, period: 'morning', label: 'Late Morning Focus' },
      { start: '14:00', end: '14:50', duration: 50, period: 'afternoon', label: 'Afternoon Analysis' },
      { start: '15:30', end: '16:15', duration: 45, period: 'afternoon', label: 'Applied Practice' },
      { start: '17:30', end: '18:15', duration: 45, period: 'evening', label: 'Twilight Consolidation' },
      { start: '19:30', end: '20:15', duration: 45, period: 'evening', label: 'Evening Recall' },
    ];

    if (options?.preferredTimeOfDay === 'afternoon') {
      timeSlots.sort((a, b) => (a.period === 'afternoon' ? -1 : b.period === 'afternoon' ? 1 : 0));
    } else if (options?.preferredTimeOfDay === 'evening') {
      timeSlots.sort((a, b) => (a.period === 'evening' ? -1 : b.period === 'evening' ? 1 : 0));
    }

    // Flatten all topics
    const allTopics: Array<{
      subjectId: string;
      subjectName: string;
      subjectColor: string;
      topicId: string;
      topicName: string;
      difficulty: 'easy' | 'medium' | 'hard';
      estimatedMinutes: number;
    }> = [];

    for (const sub of subjects) {
      if (Array.isArray(sub.topics)) {
        for (const t of sub.topics) {
          allTopics.push({
            subjectId: sub.id,
            subjectName: sub.name,
            subjectColor: sub.accentColor || '#3b82f6',
            topicId: t.id,
            topicName: t.name,
            difficulty: t.difficulty || 'medium',
            estimatedMinutes: t.estimatedMinutes || 45,
          });
        }
      }
    }

    if (allTopics.length === 0) return [];

    // Prioritize harder topics into prime focus windows
    const hardTopics = allTopics.filter((t) => t.difficulty === 'hard');
    const mediumTopics = allTopics.filter((t) => t.difficulty === 'medium');
    const easyTopics = allTopics.filter((t) => t.difficulty === 'easy');
    const orderedTopics = [...hardTopics, ...mediumTopics, ...easyTopics];

    const sessions: StudySession[] = [];
    const maxRounds = options?.dailyHours ? Math.max(1, Math.min(4, Math.round(options.dailyHours))) : 3;
    let topicIdx = 0;

    for (let round = 0; round < maxRounds && topicIdx < orderedTopics.length; round++) {
      for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
        if (topicIdx >= orderedTopics.length) break;

        const day = days[dayIdx];
        const slot = timeSlots[round % timeSlots.length];
        const topic = orderedTopics[topicIdx++];

        sessions.push({
          id: `sess-vault-${Date.now()}-${dayIdx}-${topicIdx}`,
          subjectId: topic.subjectId,
          subjectName: topic.subjectName,
          subjectColor: topic.subjectColor,
          topicId: topic.topicId,
          topicName: topic.topicName,
          startTime: slot.start,
          endTime: slot.end,
          durationMinutes: topic.estimatedMinutes || slot.duration,
          date: new Date().toISOString().split('T')[0],
          dayOfWeek: day,
          status: 'pending',
          isAdaptive: true,
          adaptiveReason: `${
            topic.difficulty === 'hard'
              ? 'High-difficulty syllabus module'
              : topic.difficulty === 'easy'
              ? 'Foundational concept review'
              : 'Core syllabus progression'
          } scheduled in ${slot.label}`,
        });
      }
    }

    return sessions;
  }
}

export const aiService = new AIService();
