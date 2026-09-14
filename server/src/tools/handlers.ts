import { getBackendAdapter } from '../adapters/index.js';

export interface ActionCardProposal {
  type: 'schedule-update';
  title: string;
  originalSummary: string;
  updatedSummary: string;
  shifts: Array<{
    sessionId: string;
    subject: string;
    from: string;
    to: string;
    duration: string;
  }>;
  deadlineProtected: boolean;
  applied: boolean;
}

export async function executeToolCall(
  name: string,
  args: any,
  authHeader?: string
): Promise<{ result: any; proposal?: ActionCardProposal }> {
  const adapter = getBackendAdapter();

  switch (name) {
    case 'get_user_schedule': {
      const startDate = args.startDate || 'today';
      const endDate = args.endDate;
      const sessions = await adapter.fetchUserSchedule(
        { start: startDate, end: endDate },
        authHeader
      );
      return {
        result: {
          count: sessions.length,
          sessions,
        },
      };
    }

    case 'get_subject_progress': {
      const subjects = await adapter.fetchSubjectProgress(args.subjectId, authHeader);
      return {
        result: {
          subjects,
        },
      };
    }

    case 'get_exam_deadlines': {
      const exams = await adapter.fetchExamDeadlines(authHeader);
      return {
        result: {
          exams,
        },
      };
    }

    case 'get_study_preferences': {
      const preferences = await adapter.fetchUserPreferences(authHeader);
      return {
        result: {
          preferences,
        },
      };
    }

    case 'propose_schedule_shifts': {
      // Create the structured proposal without modifying the database
      const proposal: ActionCardProposal = {
        type: 'schedule-update',
        title: args.title,
        originalSummary: args.originalSummary,
        updatedSummary: args.updatedSummary,
        shifts: args.shifts || [],
        deadlineProtected: Boolean(args.deadlineProtected),
        applied: false,
      };

      return {
        result: {
          status: 'proposal_created',
          message:
            'The proposal has been structured into an action card for the student to review and confirm. The database was NOT modified.',
          shiftsCount: proposal.shifts.length,
        },
        proposal,
      };
    }

    default:
      return {
        result: {
          error: `Tool "${name}" is not implemented or recognized.`,
        },
      };
  }
}
