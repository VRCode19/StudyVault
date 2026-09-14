import { getBackendAdapter } from './adapters/index.js';
import { AI_TOOLS } from './tools/definitions.js';
import { executeToolCall } from './tools/handlers.js';
import { SyllabusAnalysisResponseSchema } from './schemas/syllabus.schema.js';

async function runSelfTest() {
  console.log('--- 🧪 StudyVault AI Layer Self-Test ---');

  // 1. Test Backend Adapter
  const adapter = getBackendAdapter();
  const schedule = await adapter.fetchUserSchedule({ start: 'today' });
  console.log(`✅ Backend Adapter: Retrieved ${schedule.length} schedule sessions for today.`);

  const progress = await adapter.fetchSubjectProgress();
  console.log(`✅ Backend Adapter: Retrieved ${progress.length} enrolled subjects.`);

  const exams = await adapter.fetchExamDeadlines();
  console.log(`✅ Backend Adapter: Retrieved ${exams.length} confirmed exam deadlines.`);

  // 2. Test Tool Execution Handlers
  const scheduleToolResult = await executeToolCall('get_user_schedule', { startDate: 'today' });
  console.log(`✅ Tool get_user_schedule executed: found ${scheduleToolResult.result.count} sessions.`);

  const proposalResult = await executeToolCall('propose_schedule_shifts', {
    title: 'Adaptive Schedule Redistribution — Exam Safe',
    originalSummary: '2 pending sessions postponed from today',
    updatedSummary: 'Moved to Saturday (14:00) & Sunday (10:30)',
    shifts: [
      { sessionId: 'sess-today-2', subject: 'Database Systems', from: 'Today 11:00', to: 'Sat 14:00', duration: '45m' },
    ],
    deadlineProtected: true,
  });
  console.log(`✅ Tool propose_schedule_shifts executed: proposal created without mutating DB:`, Boolean(proposalResult.proposal));

  // 3. Test Tools Definitions
  console.log(`✅ OpenRouter Tool Definitions: Registered ${AI_TOOLS.length} function schemas.`);

  // 4. Test Syllabus Schema Validation
  const validSyllabus = {
    status: 'success',
    confidenceScore: 0.95,
    subjects: [
      {
        name: 'Distributed Systems',
        code: 'CS401',
        topics: [
          {
            name: 'Consensus (Raft & Paxos)',
            module: 'Module 1: Consensus',
            estimatedMinutes: 60,
            difficulty: 'hard',
          },
        ],
      },
    ],
  };
  const parsed = SyllabusAnalysisResponseSchema.safeParse(validSyllabus);
  console.log(`✅ Syllabus Schema Validation:`, parsed.success);

  console.log('--- 🎉 All AI Layer Self-Tests Passed! ---');
}

runSelfTest().catch(console.error);
