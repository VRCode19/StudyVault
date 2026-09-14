// ───────────────────────────────────────────────────────
// Conversation Context Service — lightweight in-memory state
// ───────────────────────────────────────────────────────
// Tracks per-conversation context for onboarding, module collection flows, etc.
// Persistent academic data is always saved through the backend adapter.

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

  getContextSummary(conversationId: string): string {
    const ctx = this.contexts.get(conversationId);
    if (!ctx) return '';

    const parts: string[] = [];

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
