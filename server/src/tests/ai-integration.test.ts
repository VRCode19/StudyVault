import { getBackendAdapter } from '../adapters/index.js';
import { AI_TOOLS } from '../tools/definitions.js';
import { executeToolCall } from '../tools/handlers.js';
import {
  TimetableExtractionSchema,
  ExamTimetableExtractionSchema,
  SyllabusExtractionSchema,
  ModuleExtractionSchema,
  DocumentTypeResultSchema,
} from '../schemas/vision.schema.js';
import { conversationService } from '../services/conversation.service.js';

async function runIntegrationTests() {
  console.log('====================================================');
  console.log('🧪 StudyVault AI Layer Comprehensive Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // ─── 1. Tool Definitions Verification ───
  console.log('--- 1. AI Tool Definitions ---');
  assert(AI_TOOLS.length === 18, `Registered all 18 AI tools (found: ${AI_TOOLS.length})`);
  
  const toolNames = new Set(AI_TOOLS.map((t) => t.function.name));
  const expectedTools = [
    'get_user_schedule',
    'get_today_schedule',
    'get_week_schedule',
    'get_remaining_topics',
    'get_available_study_time',
    'get_user_profile',
    'get_subject_progress',
    'get_exam_deadlines',
    'get_study_preferences',
    'create_study_session',
    'update_study_session',
    'complete_study_session',
    'mark_session_missed',
    'reschedule_session',
    'create_subject',
    'create_module',
    'create_schedule',
    'propose_schedule_shifts',
  ];

  for (const name of expectedTools) {
    assert(toolNames.has(name), `AI Tool '${name}' is registered`);
  }

  // ─── 2. Tool Execution Handlers ───
  console.log('\n--- 2. Tool Handlers & Mock Backend Adapter ---');
  
  // Test Read Tools
  const scheduleRes = await executeToolCall('get_user_schedule', { startDate: 'today' });
  assert(scheduleRes.result.sessions.length > 0, 'get_user_schedule returned sessions');

  const todayRes = await executeToolCall('get_today_schedule', {});
  assert(Array.isArray(todayRes.result.sessions), 'get_today_schedule returned today sessions');

  const weekRes = await executeToolCall('get_week_schedule', {});
  assert(Array.isArray(weekRes.result.sessions), 'get_week_schedule returned week sessions');

  const remainingTopicsRes = await executeToolCall('get_remaining_topics', {});
  assert(remainingTopicsRes.result.count >= 0, 'get_remaining_topics returned count');

  const availTimeRes = await executeToolCall('get_available_study_time', { date: 'today' });
  assert(
    availTimeRes.result.availability && availTimeRes.result.availability.totalAvailableMinutes > 0,
    'get_available_study_time returned availability breakdown'
  );

  const profileRes = await executeToolCall('get_user_profile', {});
  assert(Boolean(profileRes.result.profile.studentName), 'get_user_profile returned studentName');

  const progressRes = await executeToolCall('get_subject_progress', {});
  assert(progressRes.result.subjects.length > 0, 'get_subject_progress returned subjects');

  const examsRes = await executeToolCall('get_exam_deadlines', {});
  assert(examsRes.result.exams.length > 0, 'get_exam_deadlines returned exam milestones');

  const prefsRes = await executeToolCall('get_study_preferences', {});
  assert(Boolean(prefsRes.result.preferences), 'get_study_preferences returned preferences');

  // Test Write / Action Tools
  const createSessionRes = await executeToolCall('create_study_session', {
    subjectName: 'Computer Networks',
    topicName: 'TCP Congestion Control',
    date: '2026-09-15',
    startTime: '14:00',
    durationMinutes: 45,
  });
  assert(createSessionRes.result.status === 'session_created', 'create_study_session created session');

  const updateSessionRes = await executeToolCall('update_study_session', {
    sessionId: 'sess-today-1',
    startTime: '10:30',
  });
  assert(updateSessionRes.result.status === 'session_updated', 'update_study_session updated session');

  const completeSessionRes = await executeToolCall('complete_study_session', {
    sessionId: 'sess-today-1',
  });
  assert(completeSessionRes.result.status === 'session_completed', 'complete_study_session marked completed');

  const missedSessionRes = await executeToolCall('mark_session_missed', {
    sessionId: 'sess-today-2',
  });
  assert(missedSessionRes.result.status === 'session_missed_and_redistributed', 'mark_session_missed handled redistribution');

  const rescheduleRes = await executeToolCall('reschedule_session', {
    sessionId: 'sess-today-2',
    newDate: '2026-09-16',
    newTime: '17:00',
  });
  assert(rescheduleRes.result.status === 'session_rescheduled', 'reschedule_session rescheduled session');

  const createSubjectRes = await executeToolCall('create_subject', {
    name: 'Compiler Design',
    code: 'CS402',
    examDate: '2026-10-15',
    modules: [
      {
        number: 1,
        title: 'Lexical Analysis',
        topics: [{ name: 'DFA Minimization', estimatedMinutes: 45, difficulty: 'medium' }],
      },
    ],
  });
  assert(createSubjectRes.result.status === 'subject_created', 'create_subject created new subject');

  const createModuleRes = await executeToolCall('create_module', {
    subjectName: 'Compiler Design',
    moduleNumber: 2,
    moduleTitle: 'Syntax Analysis',
    topics: [{ name: 'LL(1) Parsing', estimatedMinutes: 60, difficulty: 'hard' }],
  });
  assert(createModuleRes.result.status === 'module_created', 'create_module created module under subject');

  const createScheduleRes = await executeToolCall('create_schedule', {
    startDate: '2026-09-15',
    endDate: '2026-09-22',
    dailyCapacityMinutes: 180,
  });
  assert(createScheduleRes.result.status === 'schedule_created', 'create_schedule created full study plan');

  const proposalRes = await executeToolCall('propose_schedule_shifts', {
    title: 'Adaptive Evening Shift',
    originalSummary: '1 session pending',
    updatedSummary: 'Moved to 19:00',
    shifts: [{ sessionId: 'sess-today-1', subject: 'Database Systems', from: '16:00', to: '19:00', duration: '45m' }],
    deadlineProtected: true,
  });
  assert(Boolean(proposalRes.proposal), 'propose_schedule_shifts generated action card proposal');

  // ─── 3. Vision Schemas Validation ───
  console.log('\n--- 3. Vision Zod Schemas Validation ---');

  const validTimetable = {
    document_type: 'timetable',
    confidence: 'high',
    entries: [
      {
        day: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        subject: 'Operating Systems',
        room: 'LH-1',
      },
    ],
  };
  const timetableParse = TimetableExtractionSchema.safeParse(validTimetable);
  assert(timetableParse.success, 'TimetableExtractionSchema validated valid timetable');

  const validExams = {
    document_type: 'exam_timetable',
    confidence: 'high',
    exams: [
      { subject: 'Database Systems', date: '2026-09-28', time: '09:30 AM', venue: 'Hall A' },
    ],
  };
  const examsParse = ExamTimetableExtractionSchema.safeParse(validExams);
  assert(examsParse.success, 'ExamTimetableExtractionSchema validated valid exam schedule');

  const validSyllabus = {
    document_type: 'syllabus',
    status: 'success',
    confidence: 'high',
    subjects: [
      {
        name: 'Distributed Systems',
        code: 'CS401',
        modules: [
          {
            number: 1,
            title: 'Consensus Protocols',
            topics: [
              { name: 'Raft Consensus', estimatedMinutes: 60, difficulty: 'hard' },
            ],
          },
        ],
      },
    ],
  };
  const syllabusParse = SyllabusExtractionSchema.safeParse(validSyllabus);
  assert(syllabusParse.success, 'SyllabusExtractionSchema validated valid syllabus');

  const validModule = {
    document_type: 'module',
    confidence: 'medium',
    subject_name: 'Computer Networks',
    module_number: 3,
    module_title: 'Transport Layer',
    topics: [
      { name: 'TCP Handshake', estimatedMinutes: 45, difficulty: 'medium' },
    ],
  };
  const moduleParse = ModuleExtractionSchema.safeParse(validModule);
  assert(moduleParse.success, 'ModuleExtractionSchema validated module extraction');

  const validDocDetection = {
    document_type: 'timetable',
    confidence: 'high',
    description: 'Weekly timetable schedule with days and time blocks',
  };
  const docDetectParse = DocumentTypeResultSchema.safeParse(validDocDetection);
  assert(docDetectParse.success, 'DocumentTypeResultSchema validated document type detection');

  // ─── 4. Conversation Service ───
  console.log('\n--- 4. Conversation State & Onboarding Lifecycle ---');
  const convId = 'test-conv-' + Date.now();
  
  const ctx = conversationService.getOrCreate(convId);
  assert(ctx.id === convId, 'Created new conversation context');

  conversationService.startModuleCollection(convId, 'Data Structures', 5);
  const nextMod = conversationService.getNextModuleNeeded(convId);
  assert(nextMod === 1, 'First needed module is Module 1');

  conversationService.recordModuleCollected(convId, 1);
  const nextMod2 = conversationService.getNextModuleNeeded(convId);
  assert(nextMod2 === 2, 'Next needed module advances to Module 2');

  const summary = conversationService.getContextSummary(convId);
  assert(summary.includes('Data Structures'), 'Summary reflects active module collection');

  conversationService.setPendingExtraction(convId, 'timetable', { test: true });
  const confirmed = conversationService.confirmExtraction(convId);
  assert(confirmed !== null && confirmed.test === true, 'Confirmed pending extraction data');

  // ─── Summary ───
  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
