// ───────────────────────────────────────────────────────
// Backend Adapter Interface — Single source of truth
// ───────────────────────────────────────────────────────

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
  dayOfWeek?: string;
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
  subjectId?: string;
  subjectName?: string;
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

export interface BackendUserProfile {
  studentName: string;
  preferences: BackendUserPreferences;
  enrolledSubjects: number;
  totalTopics: number;
  completedTopics: number;
  streakDays: number;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  availableMinutes: number;
}

export interface AvailableStudyTime {
  date: string;
  totalAvailableMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  slots: TimeSlot[];
}

// ─── Mutation Payloads ───

export interface NewSessionPayload {
  subjectId: string;
  subjectName: string;
  topicName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isAdaptive?: boolean;
  adaptiveReason?: string;
}

export interface SessionUpdate {
  date?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  status?: string;
  adaptiveReason?: string;
}

export interface NewSubjectPayload {
  name: string;
  code: string;
  description?: string;
  examDate?: string;
  modules: {
    number: number;
    title: string;
    topics: {
      name: string;
      estimatedMinutes: number;
      difficulty: 'easy' | 'medium' | 'hard';
      notes?: string;
    }[];
  }[];
}

export interface SchedulePlanPayload {
  subjects: {
    subjectId: string;
    subjectName: string;
    topicIds: string[];
  }[];
  startDate: string;
  endDate: string;
  dailyCapacityMinutes: number;
  preferredTimeOfDay: string;
  excludeDays?: string[];
}

export interface RedistributionResult {
  redistributedSessions: BackendSession[];
  message: string;
}

// ───────────────────────────────────────────────────────
// IBackendAdapter — clean abstraction for AI → Backend
// ───────────────────────────────────────────────────────

/**
 * Clean abstraction over the backend.
 * The core backend developer can implement this interface against their real database/APIs.
 * The AI service relies solely on these methods as the single source of truth.
 */
export interface IBackendAdapter {
  // ─── Read operations ───

  fetchUserSchedule(
    dateOrRange: { start: string; end?: string },
    authHeader?: string
  ): Promise<BackendSession[]>;

  fetchTodaySchedule(
    authHeader?: string
  ): Promise<BackendSession[]>;

  fetchWeekSchedule(
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

  fetchUserProfile(
    authHeader?: string
  ): Promise<BackendUserProfile>;

  fetchRemainingTopics(
    subjectId?: string,
    authHeader?: string
  ): Promise<BackendTopic[]>;

  fetchAvailableStudyTime(
    date?: string,
    authHeader?: string
  ): Promise<AvailableStudyTime>;

  // ─── Write/Action operations ───

  createStudySession(
    session: NewSessionPayload,
    authHeader?: string
  ): Promise<BackendSession>;

  updateStudySession(
    sessionId: string,
    updates: SessionUpdate,
    authHeader?: string
  ): Promise<BackendSession>;

  completeStudySession(
    sessionId: string,
    authHeader?: string
  ): Promise<BackendSession>;

  markSessionMissed(
    sessionId: string,
    authHeader?: string
  ): Promise<RedistributionResult>;

  rescheduleSession(
    sessionId: string,
    newDate: string,
    newTime: string,
    authHeader?: string
  ): Promise<BackendSession>;

  createSubject(
    subject: NewSubjectPayload,
    authHeader?: string
  ): Promise<{ subjectId: string; topicCount: number }>;

  createModule(
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
  ): Promise<{ moduleId: string; topicCount: number }>;

  createSchedule(
    plan: SchedulePlanPayload,
    authHeader?: string
  ): Promise<{ sessions: BackendSession[]; message: string }>;
}
