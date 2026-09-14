// ───────────────────────────────────────────────────────
// AI Tool Definitions — OpenAI Function Calling Format
// ───────────────────────────────────────────────────────

export const AI_TOOLS = [
  // ─── Read Tools ───

  {
    type: 'function',
    function: {
      name: 'get_user_schedule',
      description:
        'Fetch the student\'s scheduled study sessions for a specific date or date range. You MUST call this before discussing, answering questions about, or proposing changes to any schedule.',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: "ISO date string YYYY-MM-DD or the literal string 'today'",
          },
          endDate: {
            type: 'string',
            description: 'Optional ISO date string YYYY-MM-DD (defaults to startDate)',
          },
        },
        required: ['startDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_today_schedule',
      description:
        "Shortcut to fetch today's study sessions. Use when the student asks about 'today', 'right now', or 'what should I study'.",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_week_schedule',
      description:
        "Fetch the full week's study schedule. Use when the student asks about 'this week', 'weekly plan', or 'what\'s coming up'.",
      parameters: {
        type: 'object',
        properties: {},
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
      name: 'get_user_profile',
      description:
        'Fetch student profile including name, enrolled subjects count, total/completed topics, and streak days. Use when greeting the student or providing personalized summaries.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_remaining_topics',
      description:
        'Fetch all pending or in-progress topics. Use to determine what topics still need to be studied and to plan future sessions.',
      parameters: {
        type: 'object',
        properties: {
          subjectId: {
            type: 'string',
            description: 'Optional subject ID to filter topics. Omit for all subjects.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_available_study_time',
      description:
        'Fetch the student\'s available study time for a given date, computed from their daily capacity minus already-scheduled sessions. Returns remaining minutes and available time slots.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: "ISO date string YYYY-MM-DD or 'today'. Defaults to today.",
          },
        },
      },
    },
  },

  // ─── Write/Action Tools ───

  {
    type: 'function',
    function: {
      name: 'create_study_session',
      description:
        'Create a new study session through the backend scheduler. Use when the AI needs to add a session to the student\'s timetable. The backend validates the session and saves it.',
      parameters: {
        type: 'object',
        properties: {
          subjectId: { type: 'string', description: 'ID of the subject' },
          subjectName: { type: 'string', description: 'Name of the subject' },
          topicName: { type: 'string', description: 'Topic to study' },
          date: { type: 'string', description: 'Session date YYYY-MM-DD' },
          startTime: { type: 'string', description: 'Start time HH:mm' },
          endTime: { type: 'string', description: 'End time HH:mm' },
          durationMinutes: { type: 'number', description: 'Duration in minutes' },
          adaptiveReason: { type: 'string', description: 'Why this session was created (optional)' },
        },
        required: ['subjectName', 'topicName', 'date', 'startTime', 'durationMinutes'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'complete_study_session',
      description:
        'Mark a study session as completed. Use when the student says they finished a session or topic.',
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'ID of the session to mark complete' },
        },
        required: ['sessionId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_session_missed',
      description:
        'Mark a study session as missed and trigger automatic redistribution. The backend will calculate new sessions to cover the missed content. Use when the student says they missed or skipped a session.',
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'ID of the missed session' },
        },
        required: ['sessionId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_session',
      description:
        'Move a study session to a different date and time. Use when the student asks to push, postpone, or move a specific session.',
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'ID of the session to reschedule' },
          newDate: { type: 'string', description: 'New date YYYY-MM-DD' },
          newTime: { type: 'string', description: 'New start time HH:mm' },
        },
        required: ['sessionId', 'newDate', 'newTime'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_subject',
      description:
        'Register a new subject (with its modules and topics) into the backend from AI extraction results. Use after the student confirms extracted syllabus data.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Subject name' },
          code: { type: 'string', description: 'Course code, e.g. CS201' },
          examDate: { type: 'string', description: 'Exam date YYYY-MM-DD (optional)' },
          modules: {
            type: 'array',
            description: 'Modules with their topics',
            items: {
              type: 'object',
              properties: {
                number: { type: 'number', description: 'Module number' },
                title: { type: 'string', description: 'Module title' },
                topics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      estimatedMinutes: { type: 'number' },
                      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                    },
                    required: ['name'],
                  },
                },
              },
              required: ['number', 'title', 'topics'],
            },
          },
        },
        required: ['name', 'code', 'modules'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_module',
      description:
        'Register a specific module under an existing subject with its list of topics. Use during module-by-module syllabus ingestion flows.',
      parameters: {
        type: 'object',
        properties: {
          subjectName: { type: 'string', description: 'Name of the subject' },
          moduleNumber: { type: 'number', description: 'Module number, e.g. 1' },
          moduleTitle: { type: 'string', description: 'Module title' },
          topics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                estimatedMinutes: { type: 'number' },
                difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
              },
              required: ['name'],
            },
          },
        },
        required: ['subjectName', 'moduleNumber', 'moduleTitle', 'topics'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_schedule',
      description:
        'Generate and save a complete study schedule through the backend scheduling engine. Provide the subjects, date range, and daily capacity. The backend calculates optimal session placement and saves the result.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Schedule start date YYYY-MM-DD' },
          endDate: { type: 'string', description: 'Schedule end date YYYY-MM-DD' },
          dailyCapacityMinutes: { type: 'number', description: 'Daily study capacity in minutes' },
          preferredTimeOfDay: {
            type: 'string',
            enum: ['morning', 'afternoon', 'evening', 'night'],
            description: 'Preferred study time window',
          },
          excludeDays: {
            type: 'array',
            items: { type: 'string' },
            description: 'Days of week to exclude, e.g. ["Sunday"]',
          },
        },
        required: ['startDate', 'endDate', 'dailyCapacityMinutes'],
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
  {
    type: 'function',
    function: {
      name: 'update_study_session',
      description:
        'Update an existing study session\'s time, date, or duration. Use for partial modifications that are not full reschedules.',
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'ID of the session to update' },
          date: { type: 'string', description: 'New date YYYY-MM-DD (optional)' },
          startTime: { type: 'string', description: 'New start time HH:mm (optional)' },
          endTime: { type: 'string', description: 'New end time HH:mm (optional)' },
          durationMinutes: { type: 'number', description: 'New duration in minutes (optional)' },
          adaptiveReason: { type: 'string', description: 'Reason for the update' },
        },
        required: ['sessionId'],
      },
    },
  },
];
