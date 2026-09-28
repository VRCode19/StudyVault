import assert from 'node:assert';
import { synthesizeStudySessionsFromSubjects } from '../utils/timetableSynthesis.js';
import { processUploadedFile } from '../utils/fileProcessing.js';

async function testTimetableSynthesisAndFileProcessing() {
  console.log('--- 🧪 Testing Timetable Synthesis & File Processing ---');

  // Test 1: Timetable synthesis from syllabus subjects
  const sampleSubjects = [
    {
      name: 'Distributed Systems',
      code: 'CS401',
      topics: [
        { name: 'Consensus & Raft', module: 'Module 1', estimatedMinutes: 60, difficulty: 'hard' },
        { name: 'Paxos Protocol', module: 'Module 1', estimatedMinutes: 50, difficulty: 'hard' },
        { name: 'Vector Clocks', module: 'Module 2', estimatedMinutes: 45, difficulty: 'medium' },
        { name: 'CAP Theorem', module: 'Module 2', estimatedMinutes: 30, difficulty: 'easy' },
      ],
    },
    {
      name: 'Cloud Computing',
      code: 'CS402',
      topics: [
        { name: 'Virtualization & Containers', module: 'Module 1', estimatedMinutes: 45, difficulty: 'medium' },
        { name: 'Kubernetes Orchestration', module: 'Module 2', estimatedMinutes: 60, difficulty: 'hard' },
      ],
    },
  ];

  const result = synthesizeStudySessionsFromSubjects(sampleSubjects, { dailyHours: 3, preferredTimeOfDay: 'morning' });

  assert(result.studySessions.length > 0, 'Generated study sessions should not be empty');
  assert(result.timetable.weeklySchedule.length > 0, 'Generated timetable should have weekly schedule');

  console.log(`✅ Timetable Synthesis: Generated ${result.studySessions.length} adaptive study sessions across ${result.timetable.weeklySchedule.length} days.`);

  // Verify hard topics are scheduled first
  const firstSession = result.studySessions[0];
  assert(firstSession.difficulty === 'hard', 'Hard topics should be prioritized in prime study slots');
  assert(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(firstSession.dayOfWeek), 'Valid day of week');

  console.log(`✅ Session Slotting: First session is "${firstSession.topicName}" on ${firstSession.dayOfWeek} at ${firstSession.startTime} (${firstSession.difficulty})`);

  // Test 2: Text file processing
  const textFile: Express.Multer.File = {
    fieldname: 'files',
    originalname: 'syllabus.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    buffer: Buffer.from('Course: Computer Architecture\nModule 1: Pipeline Hazards\nModule 2: Cache Hierarchy'),
    size: 90,
    destination: '',
    filename: 'syllabus.txt',
    path: '',
    stream: null as any,
  };

  const processedText = await processUploadedFile(textFile);
  assert(processedText.isText === true, 'Text file should have isText = true');
  assert(processedText.textContent?.includes('Pipeline Hazards'), 'Text content should be preserved');
  console.log('✅ FileProcessing: Plain text document processed successfully.');

  // Test 3: Markdown file processing
  const mdFile: Express.Multer.File = {
    ...textFile,
    originalname: 'course.md',
    mimetype: 'text/markdown',
    buffer: Buffer.from('# Course: Machine Learning\n## Supervised Learning\n- Linear Regression\n- Decision Trees'),
  };
  const processedMd = await processUploadedFile(mdFile);
  assert(processedMd.isText === true, 'MD file should have isText = true');
  assert(processedMd.textContent?.includes('Decision Trees'), 'MD content should be preserved');
  console.log('✅ FileProcessing: Markdown document processed successfully.');

  // Test 4: Image file processing
  const imgFile: Express.Multer.File = {
    ...textFile,
    originalname: 'timetable.png',
    mimetype: 'image/png',
    buffer: Buffer.from('fake-png-binary-data'),
  };
  const processedImg = await processUploadedFile(imgFile);
  assert(processedImg.isText === false, 'Image file should have isText = false');
  assert(processedImg.dataUri.startsWith('data:image/png;base64,'), 'Image should have valid base64 dataUri');
  console.log('✅ FileProcessing: Image file processed with base64 data URI.');

  console.log('--- 🎉 Timetable Synthesis & File Processing Tests Passed! ---');
}

testTimetableSynthesisAndFileProcessing().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
