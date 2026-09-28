// ───────────────────────────────────────────────────────
// Conversation Context Service — lightweight in-memory state
// ───────────────────────────────────────────────────────
// Tracks per-conversation context for onboarding, module collection flows, etc.
// Persistent academic data is always saved through the backend adapter.

export interface CollectedSubject {
  name: string;
  code?: string;
  modules: Array<{
    moduleNumber: number;
    title: string;
    topics: Array<{
      name: string;
      estimatedMinutes?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    }>;
  }>;
}

export interface SubjectOnboardingState {
  active: boolean;
  totalSubjects?: number;
  currentSubjectIndex: number; // 0 for Subject 1, 1 for Subject 2, etc.
  collectedSubjects: CollectedSubject[];
  step: 'ASK_SUBJECT_COUNT' | 'COLLECT_SUBJECT_SYLLABUS' | 'ALL_COLLECTED' | 'IDLE';
}

interface ConversationContext {
  id: string;
  createdAt: number;
  lastActivity: number;
  // Onboarding progress
  onboarding: {
    timetableUploaded: boolean;
    examTimetableUploaded: boolean;
    syllabusUploaded: boolean;
    preferencesCollected: boolean;
    scheduleGenerated: boolean;
  };
  // Multi-subject onboarding flow state
  subjectOnboarding: SubjectOnboardingState;
  // Module collection state
  moduleCollection: {
    active: boolean;
    subjectName?: string;
    totalModules?: number;
    collectedModules: number[];
  };
  // Extracted but unconfirmed data
  pendingExtraction?: {
    type: string;
    data: any;
    confirmed: boolean;
  };
}

const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

class ConversationService {
  private contexts = new Map<string, ConversationContext>();

  getOrCreate(conversationId: string): ConversationContext {
    this.cleanup();

    let ctx = this.contexts.get(conversationId);
    if (!ctx) {
      ctx = {
        id: conversationId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        onboarding: {
          timetableUploaded: false,
          examTimetableUploaded: false,
          syllabusUploaded: false,
          preferencesCollected: false,
          scheduleGenerated: false,
        },
        subjectOnboarding: {
          active: false,
          collectedSubjects: [],
          currentSubjectIndex: 0,
          step: 'IDLE',
        },
        moduleCollection: {
          active: false,
          collectedModules: [],
        },
      };
      this.contexts.set(conversationId, ctx);
    }

    ctx.lastActivity = Date.now();
    return ctx;
  }

  update(conversationId: string, updates: Partial<ConversationContext>): void {
    const ctx = this.getOrCreate(conversationId);
    Object.assign(ctx, updates, { lastActivity: Date.now() });
    this.contexts.set(conversationId, ctx);
  }

  updateOnboarding(conversationId: string, updates: Partial<ConversationContext['onboarding']>): void {
    const ctx = this.getOrCreate(conversationId);
    Object.assign(ctx.onboarding, updates);
    ctx.lastActivity = Date.now();
  }

  setPendingExtraction(conversationId: string, type: string, data: any): void {
    const ctx = this.getOrCreate(conversationId);
    ctx.pendingExtraction = { type, data, confirmed: false };
    ctx.lastActivity = Date.now();
  }

  confirmExtraction(conversationId: string): any | null {
    const ctx = this.contexts.get(conversationId);
    if (ctx?.pendingExtraction && !ctx.pendingExtraction.confirmed) {
      ctx.pendingExtraction.confirmed = true;
      return ctx.pendingExtraction.data;
    }
    return null;
  }

  startModuleCollection(conversationId: string, subjectName: string, totalModules: number): void {
    const ctx = this.getOrCreate(conversationId);
    ctx.moduleCollection = {
      active: true,
      subjectName,
      totalModules,
      collectedModules: [],
    };
  }

  recordModuleCollected(conversationId: string, moduleNumber: number): void {
    const ctx = this.getOrCreate(conversationId);
    if (!ctx.moduleCollection.collectedModules.includes(moduleNumber)) {
      ctx.moduleCollection.collectedModules.push(moduleNumber);
    }
    // Check if all modules collected
    if (
      ctx.moduleCollection.totalModules &&
      ctx.moduleCollection.collectedModules.length >= ctx.moduleCollection.totalModules
    ) {
      ctx.moduleCollection.active = false;
    }
  }

  startSubjectOnboarding(conversationId: string, totalSubjects?: number): void {
    const ctx = this.getOrCreate(conversationId);
    ctx.subjectOnboarding = {
      active: true,
      totalSubjects,
      currentSubjectIndex: 0,
      collectedSubjects: [],
      step: totalSubjects && totalSubjects > 0 ? 'COLLECT_SUBJECT_SYLLABUS' : 'ASK_SUBJECT_COUNT',
    };
    ctx.lastActivity = Date.now();
  }

  setTotalSubjects(conversationId: string, total: number): void {
    const ctx = this.getOrCreate(conversationId);
    ctx.subjectOnboarding.active = true;
    ctx.subjectOnboarding.totalSubjects = total;
    ctx.subjectOnboarding.step = 'COLLECT_SUBJECT_SYLLABUS';
    ctx.lastActivity = Date.now();
  }

  addCollectedSubject(conversationId: string, subject: CollectedSubject): void {
    const ctx = this.getOrCreate(conversationId);
    ctx.subjectOnboarding.active = true;
    // Prevent duplicate entries for same subject name
    const existingIdx = ctx.subjectOnboarding.collectedSubjects.findIndex(
      (s) => s.name.toLowerCase() === subject.name.toLowerCase()
    );
    if (existingIdx >= 0) {
      ctx.subjectOnboarding.collectedSubjects[existingIdx] = subject;
    } else {
      ctx.subjectOnboarding.collectedSubjects.push(subject);
      ctx.subjectOnboarding.currentSubjectIndex += 1;
    }

    if (
      ctx.subjectOnboarding.totalSubjects &&
      ctx.subjectOnboarding.collectedSubjects.length >= ctx.subjectOnboarding.totalSubjects
    ) {
      ctx.subjectOnboarding.step = 'ALL_COLLECTED';
    } else {
      ctx.subjectOnboarding.step = 'COLLECT_SUBJECT_SYLLABUS';
    }
    ctx.lastActivity = Date.now();
  }

  getOnboardingState(conversationId: string): SubjectOnboardingState {
    const ctx = this.getOrCreate(conversationId);
    return ctx.subjectOnboarding;
  }

  resetSubjectOnboarding(conversationId: string): void {
    const ctx = this.getOrCreate(conversationId);
    ctx.subjectOnboarding = {
      active: false,
      collectedSubjects: [],
      currentSubjectIndex: 0,
      step: 'IDLE',
    };
    ctx.lastActivity = Date.now();
  }

  getContextSummary(conversationId: string): string {
    const ctx = this.contexts.get(conversationId);
    if (!ctx) return '';

    const parts: string[] = [];

    // 1. Multi-subject onboarding directives
    if (ctx.subjectOnboarding.active) {
      if (ctx.subjectOnboarding.step === 'ASK_SUBJECT_COUNT') {
        parts.push(
          'ONBOARDING STEP 1: Ask the student: "How many subjects are you studying this semester/term?" Do NOT ask for syllabuses yet.'
        );
      } else if (ctx.subjectOnboarding.step === 'COLLECT_SUBJECT_SYLLABUS') {
        const curNum = ctx.subjectOnboarding.currentSubjectIndex + 1;
        const total = ctx.subjectOnboarding.totalSubjects || '?';
        const collectedNames = ctx.subjectOnboarding.collectedSubjects.map((s) => s.name).join(', ') || 'None';
        parts.push(
          `ONBOARDING STEP 2: Currently collecting Subject ${curNum} of ${total}. ` +
          `Already collected subjects: [${collectedNames}]. ` +
          `Prompt the user for Subject ${curNum}'s name and ask them to upload or paste its syllabus (document, image, or topics list).`
        );
      } else if (ctx.subjectOnboarding.step === 'ALL_COLLECTED') {
        const total = ctx.subjectOnboarding.collectedSubjects.length;
        const subjectNames = ctx.subjectOnboarding.collectedSubjects.map((s) => s.name).join(', ');
        parts.push(
          `ONBOARDING STEP 3: All ${total} subjects collected (${subjectNames})! ` +
          `Now synthesize and arrange all their curriculum modules across Monday to Sunday into balanced daily focus blocks in the calendar. ` +
          `Call create_schedule and propose the schedule-proposal action card so the user can lock it into their calendar!`
        );
      }
    }

    if (ctx.moduleCollection.active) {
      parts.push(
        `Currently collecting modules for ${ctx.moduleCollection.subjectName}. ` +
        `Collected: ${ctx.moduleCollection.collectedModules.join(', ')} of ${ctx.moduleCollection.totalModules}.`
      );
      const nextModule = this.getNextModuleNeeded(conversationId);
      if (nextModule) {
        parts.push(`Next expected: Module ${nextModule}.`);
      }
    }

    if (ctx.pendingExtraction && !ctx.pendingExtraction.confirmed) {
      parts.push(`There is pending ${ctx.pendingExtraction.type} extraction awaiting user confirmation.`);
    }

    return parts.join(' ');
  }

  getNextModuleNeeded(conversationId: string): number | null {
    const ctx = this.contexts.get(conversationId);
    if (!ctx || !ctx.moduleCollection.active || !ctx.moduleCollection.totalModules) return null;

    for (let i = 1; i <= ctx.moduleCollection.totalModules; i++) {
      if (!ctx.moduleCollection.collectedModules.includes(i)) {
        return i;
      }
    }
    return null;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, ctx] of this.contexts) {
      if (now - ctx.lastActivity > EXPIRY_MS) {
        this.contexts.delete(id);
      }
    }
  }
}

export const conversationService = new ConversationService();
