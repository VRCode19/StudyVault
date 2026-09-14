import {
  IBackendAdapter,
  BackendSession,
  BackendSubjectProgress,
  BackendExam,
  BackendUserPreferences,
} from './backend.interface.js';
import { config } from '../config/env.config.js';

/**
 * Production HTTP adapter that forwards requests to the core backend.
 * The core backend developer can implement their REST APIs matching these endpoints.
 */
export class HttpBackendAdapter implements IBackendAdapter {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.backend.baseUrl;
  }

  private async request<T>(endpoint: string, authHeader?: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Backend API Error [${response.status}] ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async fetchUserSchedule(
    dateOrRange: { start: string; end?: string },
    authHeader?: string
  ): Promise<BackendSession[]> {
    const query = new URLSearchParams({
      start: dateOrRange.start,
      ...(dateOrRange.end ? { end: dateOrRange.end } : {}),
    });
    return this.request<BackendSession[]>(`/schedule?${query.toString()}`, authHeader);
  }

  async fetchSubjectProgress(
    subjectId?: string,
    authHeader?: string
  ): Promise<BackendSubjectProgress[]> {
    const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    return this.request<BackendSubjectProgress[]>(`/subjects/progress${query}`, authHeader);
  }

  async fetchExamDeadlines(authHeader?: string): Promise<BackendExam[]> {
    return this.request<BackendExam[]>('/exams', authHeader);
  }

  async fetchUserPreferences(authHeader?: string): Promise<BackendUserPreferences> {
    return this.request<BackendUserPreferences>('/user/preferences', authHeader);
  }
}
