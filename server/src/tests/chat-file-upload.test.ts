import { chatService } from '../services/chat.service.js';
import { ProcessedFile } from '../utils/fileProcessing.js';

const mockPdfFile: ProcessedFile = {
  mimeType: 'text/plain',
  dataUri: '',
  isText: true,
  originalName: 'BCS508.pdf',
  textContent: `
VISVESVARAYA TECHNOLOGICAL UNIVERSITY, BELAGAVI
B.E. in Computer Science and Engineering
Semester - V
Course Title: Database Management Systems
Course Code: BCS508
CIE Marks: 50, SEE Marks: 50, Total Marks: 100
Teaching Hours/Week (L:T:P: S): 3:0:0:0
Credits: 03, Exam Hours: 03

Module-1
Introduction to Database Systems: Databases and Database Users, Characteristics of Database Approach, Database System Concepts and Architecture, Data Models, Schemas, and Instances, Three-Schema Architecture, Data Independence, Database Languages and Interfaces.
Teaching Hours: 08

Module-2
Relational Data Model and SQL: Relational Model Concepts, Relational Model Constraints and Relational Database Schemas, Basic SQL, Complex SQL Queries, Triggers and Views, Relational Algebra, Relational Calculus.
Teaching Hours: 08

Module-3
Database Design and Normalization: Functional Dependencies, Normal Forms Based on Primary Keys, Second and Third Normal Forms, Boyce-Codd Normal Form (BCNF), Multivalued Dependencies and Fourth Normal Form, Join Dependencies and Fifth Normal Form.
Teaching Hours: 08

Module-4
Transaction Processing and Concurrency: Introduction to Transaction Processing, Transaction and System Concepts, Desirable Properties of Transactions (ACID), Concurrency Control Techniques, Two-Phase Locking, Deadlock Handling.
Teaching Hours: 08

Module-5
NoSQL Databases and Big Data Storage: Introduction to NoSQL Systems, CAP Theorem, Document Stores, Key-Value Stores, Column-Family Stores, Graph Databases, MapReduce and Distributed Query Processing.
Teaching Hours: 08
`,
};

async function testChatWithFile() {
  console.log('--- Testing chatService.processMessage with BCS508.pdf attachment ---');
  const response = await chatService.processMessage(
    'Create the timetable according to this syllabus',
    [],
    undefined,
    'test-conv-123',
    [mockPdfFile]
  );

  console.log('\n--- Chat Response Output ---');
  console.log('Reply Text:');
  console.log(response.replyText);
  console.log('Tools Used:', response.toolsUsed);
  console.log('Extraction Data Type:', response.extractionData?.type);
  console.log('Extracted Subjects:', response.extractionData?.data?.subjects?.length);
  console.log('Synthesized Study Sessions:', response.extractionData?.data?.studySessions?.length);

  if (
    response.replyText &&
    response.extractionData?.type === 'syllabus' &&
    response.extractionData?.data?.subjects?.length > 0 &&
    (response.extractionData?.data?.studySessions?.length || 0) > 0
  ) {
    console.log('\n✅ CHAT FILE UPLOAD TEST PASSED COMPLETELY!');
    process.exit(0);
  } else {
    console.error('\n❌ TEST FAILED: Extraction data or reply missing!');
    process.exit(1);
  }
}

testChatWithFile().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
