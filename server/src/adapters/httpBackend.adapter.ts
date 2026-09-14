import {
  IBackendAdapter,
  BackendSession,
  BackendSubjectProgress,
  BackendExam,
  BackendUserPreferences,
  BackendUserProfile,
  BackendTopic,
  AvailableStudyTime,
  NewSessionPayload,
  SessionUpdate,
  NewSubjectPayload,
  SchedulePlanPayload,
  RedistributionResult,
} from './backend.interface.js';
import { config } from '../config/env.config.js';

/**
 * Production HTTP adapter that forwards requests to the core backend.
 * The core backend developer implements REST APIs matching these endpoints.
 */
export class HttpBackendAdapter implements IBackendAdapter {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.backend.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: { method?: string; body?: any; authHeader?: string }
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options?.authHeader) {
      headers['Authorization'] = options.authHeader;
    }

    const fetchOptions: RequestInit = {
      method: options?.method || 'GET',
      headers,
    };

    if (options?.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Backend API Error [${response.status}] ${response.statusText}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  // ─── Read Operations ───

  async fetchUserSchedule(
    dateOrRange: { start: string; end?: string },
    authHeader?: string
  ): Promise<BackendSession[]> {
    const query = new URLSearchParams({
      start: dateOrRange.start,
      ...(dateOrRange.end ? { end: dateOrRange.end } : {}),
    });
    return this.request<BackendSession[]>(`/schedule?${query.toString()}`, { authHeader });
  }

  async fetchTodaySchedule(authHeader?: string): Promise<BackendSession[]> {
    return this.request<BackendSession[]>('/schedule/today', { authHeader });
  }

  async fetchWeekSchedule(authHeader?: string): Promise<BackendSession[]> {
    return this.request<BackendSession[]>('/schedule/week', { authHeader });
  }

  async fetchSubjectProgress(
    subjectId?: string,
    authHeader?: string
  ): Promise<BackendSubjectProgress[]> {
    const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    return this.request<BackendSubjectProgress[]>(`/subjects/progress${query}`, { authHeader });
  }

  async fetchExamDeadlines(authHeader?: string): Promise<BackendExam[]> {
    return this.request<BackendExam[]>('/exams', { authHeader });
  }

  async fetchUserPreferences(authHeader?: string): Promise<BackendUserPreferences> {
    return this.request<BackendUserPreferences>('/user/preferences', { authHeader });
  }

  async fetchUserProfile(authHeader?: string): Promise<BackendUserProfile> {
    return this.request<BackendUserProfile>('/user/profile', { authHeader });
  }

  async fetchRemainingTopics(
    subjectId?: string,
    authHeader?: string
  ): Promise<BackendTopic[]> {
    const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    return this.request<BackendTopic[]>(`/topics/remaining${query}`, { authHeader });
  }

  async fetchAvailableStudyTime(
    date?: string,
    authHeader?: string
  ): Promise<AvailableStudyTime> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.request<AvailableStudyTime>(`/schedule/availability${query}`, { authHeader });
  }

  // ─── Write/Action Operations ───

  async createStudySession(
    session: NewSessionPayload,
    authHeader?: string
  ): Promise<BackendSession> {
    return this.request<BackendSession>('/sessions', {
      method: 'POST',
      body: session,
      authHeader,
    });
  }

  async updateStudySession(
    sessionId: string,
    updates: SessionUpdate,
    authHeader?: string
  ): Promise<BackendSession> {
    return this.request<BackendSession>(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: updates,
      authHeader,
    });
  }

  async completeStudySession(
    sessionId: string,
    authHeader?: string
  ): Promise<BackendSession> {
    return this.request<BackendSession>(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      authHeader,
    });
  }

  async markSessionMissed(
    sessionId: string,
    authHeader?: string
  ): Promise<RedistributionResult> {
    return this.request<RedistributionResult>(`/sessions/${sessionId}/missed`, {
      method: 'POST',
      authHeader,
    });
  }

  async rescheduleSession(
    sessionId: string,
    newDate: string,
    newTime: string,
    authHeader?: string
  ): Promise<BackendSession> {
    return this.request<BackendSession>(`/sessions/${sessionId}/reschedule`, {
      method: 'POST',
      body: { newDate, newTime },
      authHeader,
    });
  }

  async createSubject(
    subject: NewSubjectPayload,
    authHeader?: string
  ): Promise<{ subjectId: string; topicCount: number }> {
    return this.request<{ subjectId: string; topicCount: number }>('/subjects', {
      method: 'POST',
      body: subject,
      authHeader,
    });
  }

  async createModule(
    subjectIdOrName: string,
    module: {
      number: number;
      title: string;
      topics: {
        name: string;
        estimatedMinutes?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
        notes?: string;
      }[];
    },
    authHeader?: string
  ): Promise<{ moduleId: string; topicCount: number }> {
    return this.request<{ moduleId: string; topicCount: number }>(`/subjects/${subjectIdOrName}/modules`, {
      method: 'POST',
      body: module,
      authHeader,
    });
  }

  async createSchedule(
    plan: SchedulePlanPayload,
    authHeader?: string
  ): Promise<{ sessions: BackendSession[]; message: string }> {
    return this.request<{ sessions: BackendSession[]; message: string }>('/schedule/generate', {
      method: 'POST',
      body: plan,
      authHeader,
    });
  }
}
