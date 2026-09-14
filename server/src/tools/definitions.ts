export const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_user_schedule',
      description:
        'Fetch the student real scheduled study sessions for a specific date or date range. You MUST call this before discussing, answering questions about, or proposing changes to any schedule.',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: "ISO date string YYYY-MM-DD or the literal string 'today'",
          },
          endDate: {
            type: 'string',
            description: "Optional ISO date string YYYY-MM-DD (defaults to startDate)",
          },
        },
        required: ['startDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_subject_progress',
      description:
        'Fetch real syllabus progress across all enrolled courses. Returns actual topic counts, completed topics, and percentages. NEVER invent topic names or completion percentages.',
      parameters: {
        type: 'object',
        properties: {
          subjectId: {
            type: 'string',
            description: 'Optional specific subject ID. Omit to fetch all subjects.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_exam_deadlines',
      description:
        'Fetch confirmed upcoming exam dates and countdown days. Call this to check whether schedule adjustments preserve exam buffers.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_study_preferences',
      description:
        'Fetch student preferences including daily study capacity hours, preferred focus window (morning/afternoon/evening), and session rhythm.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_schedule_shifts',
      description:
        'Format a structured schedule reallocation proposal for student approval. Call this when the student requests to push, postpone, or rebalance study sessions. This does NOT mutate the database; it returns an interactive proposal card for user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: "A clear heading, e.g. 'Adaptive Schedule Redistribution — Exam Safe'",
          },
          originalSummary: {
            type: 'string',
            description: "Summary of sessions being moved, e.g. '2 pending sessions postponed from today'",
          },
          updatedSummary: {
            type: 'string',
            description: "Summary of where sessions are moved, e.g. 'Moved to Saturday (14:00) and Sunday (10:30)'",
          },
          shifts: {
            type: 'array',
            description: 'List of individual session adjustments',
            items: {
              type: 'object',
              properties: {
                sessionId: { type: 'string', description: 'ID of the session being shifted' },
                subject: { type: 'string', description: 'Subject and topic name' },
                from: { type: 'string', description: "Original slot, e.g. 'Today 11:00'" },
                to: { type: 'string', description: "Proposed slot, e.g. 'Sat 14:00'" },
                duration: { type: 'string', description: "Duration string, e.g. '45m'" },
              },
              required: ['sessionId', 'subject', 'from', 'to', 'duration'],
            },
          },
          deadlineProtected: {
            type: 'boolean',
            description: 'True if all shifts still precede any upcoming exam deadline with adequate buffer',
          },
        },
        required: ['title', 'originalSummary', 'updatedSummary', 'shifts', 'deadlineProtected'],
      },
    },
  },
];
