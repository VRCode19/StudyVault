import { getBackendAdapter } from '../adapters/index.js';
import { ActionCard } from '../schemas/chat.schema.js';

export type ActionCardProposal = ActionCard;

export async function executeToolCall(
  name: string,
  args: any,
  authHeader?: string
): Promise<{ result: any; proposal?: ActionCardProposal }> {
  const adapter = getBackendAdapter();

  switch (name) {
    // ─── Read Tools ───

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

    case 'get_today_schedule': {
      const sessions = await adapter.fetchTodaySchedule(authHeader);
      return {
        result: {
          count: sessions.length,
          sessions,
        },
      };
    }

    case 'get_week_schedule': {
      const sessions = await adapter.fetchWeekSchedule(authHeader);
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

    case 'get_user_profile': {
      const profile = await adapter.fetchUserProfile(authHeader);
      return {
        result: {
          profile,
        },
      };
    }

    case 'get_remaining_topics': {
      const topics = await adapter.fetchRemainingTopics(args.subjectId, authHeader);
      return {
        result: {
          count: topics.length,
          topics,
        },
      };
    }

    case 'get_available_study_time': {
      const availability = await adapter.fetchAvailableStudyTime(args.date, authHeader);
      return {
        result: {
          availability,
        },
      };
    }

    // ─── Write/Action Tools ───

    case 'schedule_study_session':
    case 'create_study_session': {
      const today = new Date().toISOString().split('T')[0];
      const targetDate = !args.date || args.date === 'today' ? today : args.date;
      const targetStart = args.startTime || '14:00';
      const duration = Number(args.durationMinutes) || 60;
      const topic = args.topicName || `${args.subjectName} Focus Session`;

      const session = await adapter.createStudySession(
        {
          subjectId: args.subjectId || '',
          subjectName: args.subjectName,
          topicName: topic,
          date: targetDate,
          startTime: targetStart,
          endTime: args.endTime || '',
          durationMinutes: duration,
          isAdaptive: true,
          adaptiveReason: args.adaptiveReason || 'Scheduled by AI assistant',
        },
        authHeader
      );
      return {
        result: {
          status: 'session_created',
          session,
          subjectName: args.subjectName,
          topicName: topic,
          date: targetDate,
          startTime: targetStart,
          durationMinutes: duration,
          adaptiveReason: args.adaptiveReason || 'Scheduled by AI assistant',
          message: `Study session for "${topic}" on ${targetDate} at ${targetStart} (${duration}m) has been created.`,
        },
      };
    }

    case 'complete_study_session': {
      const session = await adapter.completeStudySession(args.sessionId, authHeader);
      return {
        result: {
          status: 'session_completed',
          session,
          message: `Session "${session.topicName}" has been marked as completed.`,
        },
      };
    }

    case 'mark_session_missed': {
      const redistribution = await adapter.markSessionMissed(args.sessionId, authHeader);
      return {
        result: {
          status: 'session_missed_and_redistributed',
          redistributedSessions: redistribution.redistributedSessions,
          message: redistribution.message,
        },
      };
    }

    case 'reschedule_session': {
      const session = await adapter.rescheduleSession(
        args.sessionId,
        args.newDate,
        args.newTime,
        authHeader
      );
      return {
        result: {
          status: 'session_rescheduled',
          session,
          message: `Session rescheduled to ${args.newDate} at ${args.newTime}.`,
        },
      };
    }

    case 'update_study_session': {
      const session = await adapter.updateStudySession(
        args.sessionId,
        {
          date: args.date,
          startTime: args.startTime,
          endTime: args.endTime,
          durationMinutes: args.durationMinutes,
          adaptiveReason: args.adaptiveReason,
        },
        authHeader
      );
      return {
        result: {
          status: 'session_updated',
          session,
          message: `Session has been updated.`,
        },
      };
    }

    case 'create_subject': {
      const fallbackCode = args.code || `${(args.name || 'SUB').replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'SUB'}101`;
      const studyDuration = args.studyDurationMinutes || args.studyDuration || 120;

      const created = await adapter.createSubject(
        {
          name: args.name,
          code: fallbackCode,
          examDate: args.examDate,
          modules: args.modules || [],
        },
        authHeader
      );
      return {
        result: {
          status: 'subject_created',
          subjectId: created.subjectId,
          topicCount: created.topicCount,
          name: args.name,
          code: fallbackCode,
          examDate: args.examDate,
          studyDurationMinutes: studyDuration,
          description: args.description,
          professor: args.professor,
          color: args.color,
          message: `Subject "${args.name}" (${fallbackCode}) has been created with target study duration of ${studyDuration}m.`,
        },
      };
    }

    case 'create_task': {
      return {
        result: {
          status: 'task_created',
          title: args.title,
          subject: args.subject,
          dueDate: args.dueDate || 'Today',
          priority: args.priority || 'medium',
          message: `Task "${args.title}" has been created.`,
        },
      };
    }

    case 'create_module': {
      const created = await adapter.createModule(
        args.subjectName,
        {
          number: args.moduleNumber,
          title: args.moduleTitle,
          topics: args.topics || [],
        },
        authHeader
      );
      return {
        result: {
          status: 'module_created',
          moduleId: created.moduleId,
          topicCount: created.topicCount,
          message: `Module ${args.moduleNumber}: "${args.moduleTitle}" for "${args.subjectName}" registered with ${created.topicCount} topics.`,
        },
      };
    }

    case 'create_schedule': {
      const scheduleResult = await adapter.createSchedule(
        {
          subjects: args.subjects || [],
          startDate: args.startDate,
          endDate: args.endDate,
          dailyCapacityMinutes: args.dailyCapacityMinutes,
          preferredTimeOfDay: args.preferredTimeOfDay || 'morning',
          excludeDays: args.excludeDays,
        },
        authHeader
      );
      return {
        result: {
          status: 'schedule_created',
          sessionCount: scheduleResult.sessions.length,
          sessions: scheduleResult.sessions,
          message: scheduleResult.message,
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
