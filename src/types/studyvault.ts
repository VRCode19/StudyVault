export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type SessionStatus = 'pending' | 'in-progress' | 'completed' | 'rescheduled' | 'missed';

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  module: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  accentColor: string; // Tailwind class or hex
  glowColor: string;
  totalTopics: number;
  completedTopics: number;
  totalMinutes: number;
  completedMinutes: number;
  progressPercentage: number;
  examDate?: string;
  topics: Topic[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topicId: string;
  topicName: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:45"
  durationMinutes: number;
  date: string;      // "2026-09-11"
  dayOfWeek: DayOfWeek;
  status: SessionStatus;
  isAdaptive: boolean;
  adaptiveReason?: string;
  originalSlot?: string;
  notes?: string;
}

export interface AdaptiveNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'reschedule' | 'warning' | 'protection' | 'completion' | 'rebalance';
  read: boolean;
  actionRequired?: boolean;
  details?: {
    original: string;
    updated: string;
  };
}

export interface ScheduleShift {
  sessionId?: string;
  subject: string;
  from: string;
  to: string;
  duration: string;
}

export interface ScheduleUpdateCard {
  type: 'schedule-update';
  title: string;
  originalSummary: string;
  updatedSummary: string;
  shifts: ScheduleShift[];
  deadlineProtected: boolean;
  applied: boolean;
}

export interface TimetableSlotItem {
  day: string;
  timeSlot: string;
  subject: string;
  room?: string;
  type?: string;
}

export interface ExamDateItem {
  subject: string;
  date: string;
  time?: string;
  code?: string;
  venue?: string;
}

export interface SyllabusSubjectItem {
  name: string;
  code: string;
  modules?: {
    moduleNumber: number;
    title: string;
    topics: {
      name: string;
      estimatedMinutes?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    }[];
  }[];
  topics?: {
    name: string;
    estimatedMinutes?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }[];
}

export interface ExtractionPreview {
  document_type: 'timetable' | 'exam_timetable' | 'syllabus' | 'module_details' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  confidenceScore?: number;
  warnings?: string[];
  timetable?: {
    weeklySchedule: {
      day: string;
      slots: TimetableSlotItem[];
    }[];
  };
  examTimetable?: {
    exams: ExamDateItem[];
  };
  syllabus?: {
    subjects: SyllabusSubjectItem[];
  };
  moduleDetails?: {
    subjectName: string;
    moduleNumber: number;
    moduleTitle: string;
    topics: {
      name: string;
      estimatedMinutes: number;
      difficulty: 'easy' | 'medium' | 'hard';
    }[];
  };
  confirmed?: boolean;
}

export interface ExtractionPreviewCardData {
  type: 'extraction-preview';
  title: string;
  extraction: ExtractionPreview;
  applied?: boolean;
}

export interface ScheduleProposalCardData {
  type: 'schedule-proposal';
  title: string;
  description: string;
  totalHours: number;
  sessionsCount: number;
  sessions: {
    day: string;
    subject: string;
    topic: string;
    time: string;
    duration: number;
  }[];
  applied: boolean;
}

export interface OnboardingProgressCardData {
  type: 'onboarding-progress';
  title: string;
  step: string;
  completedSteps: string[];
  pendingSteps: string[];
  percentage: number;
  applied?: boolean;
}

export type ChatActionCard =
  | ScheduleUpdateCard
  | ExtractionPreviewCardData
  | ScheduleProposalCardData
  | OnboardingProgressCardData;

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  type: 'image' | 'pdf' | 'text';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  actionCard?: ChatActionCard;
  extractionPreview?: ExtractionPreview;
  toolsUsed?: string[];
}

export interface ExamDeadline {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  daysRemaining: number;
  subjects: string[];
  readinessPercentage: number;
}

export interface UserStats {
  studentName: string;
  todayStudyMinutes: number;
  todayTargetMinutes: number;
  weeklyProgressPercentage: number;
  totalTopics: number;
  completedTopics: number;
  examCountdownDays: number;
  streakDays: number;
  weeklyStudyHours: { day: DayOfWeek; hours: number; target: number }[];
}

export interface StudySettings {
  dailyStudyCapacityHours: number;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  breakDuration: 'pomodoro_25' | 'deep_50' | 'standard_30';
  difficultyPreference: 'balanced' | 'high_yield_first' | 'gradual';
  weekendAvailability: boolean;
  studyReminders: boolean;
  scheduleChangesAlert: boolean;
  examCountdownAlert: boolean;
  glassIntensity: 'subtle' | 'balanced' | 'high';
  accentTheme: 'electric' | 'cyan' | 'slate';
  reducedMotion: boolean;
}

export type ActivePage = 'landing' | 'dashboard' | 'schedule' | 'syllabus' | 'progress' | 'assistant' | 'settings';
