export interface BackendSession {
  id: string;
  subjectId: string;
  subjectName: string;
  topicName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  status: 'pending' | 'in-progress' | 'completed' | 'rescheduled' | 'missed';
  isAdaptive?: boolean;
  adaptiveReason?: string;
}

export interface BackendTopic {
  id: string;
  name: string;
  module: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in-progress' | 'completed';
}

export interface BackendSubjectProgress {
  subjectId: string;
  subjectName: string;
  code: string;
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  topics: BackendTopic[];
}

export interface BackendExam {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD
  daysRemaining: number;
  readinessPercentage: number;
  subjectNames: string[];
}

export interface BackendUserPreferences {
  dailyStudyCapacityHours: number;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  breakDuration: 'pomodoro_25' | 'deep_50' | 'standard_30';
  weekendAvailability: boolean;
}

/**
 * Clean abstraction over the backend.
 * The core backend developer can implement this interface against their real database/APIs.
 * The AI service relies solely on these methods as the single source of truth.
 */
export interface IBackendAdapter {
  fetchUserSchedule(
    dateOrRange: { start: string; end?: string },
    authHeader?: string
  ): Promise<BackendSession[]>;

  fetchSubjectProgress(
    subjectId?: string,
    authHeader?: string
  ): Promise<BackendSubjectProgress[]>;

  fetchExamDeadlines(
    authHeader?: string
  ): Promise<BackendExam[]>;

  fetchUserPreferences(
    authHeader?: string
  ): Promise<BackendUserPreferences>;
}
