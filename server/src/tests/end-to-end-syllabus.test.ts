import { visionService } from '../services/vision.service.js';
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

Course Outcomes:
At the end of the course the student will be able to:
CO1: Understand database architecture and ER modeling.
CO2: Write complex SQL queries.
`,
};

async function testExtraction() {
  console.log('--- Testing visionService.extractSyllabus with BCS508 text file ---');
  const result = await visionService.extractSyllabus([mockPdfFile]);

  console.log('Result status:', result.status);
  console.log('Confidence:', result.confidence);
  console.log('Confidence score:', result.confidenceScore);
  console.log('Subjects extracted:', result.subjects.length);

  const subject = result.subjects[0];
  console.log(`Subject: "${subject.name}" (${subject.code}) with ${subject.modules?.length || 0} modules`);

  subject.modules?.forEach((mod) => {
    console.log(`  - ${mod.title}: ${mod.topics.length} topics`);
  });

  console.log('Study sessions generated:', result.studySessions?.length);
  console.log('Sample sessions:');
  result.studySessions?.slice(0, 3).forEach((sess) => {
    console.log(`  * [${sess.dayOfWeek} ${sess.startTime}-${sess.endTime}] ${sess.subjectName} -> ${sess.topicName}`);
  });

  if (
    result.status === 'success' &&
    result.subjects.length > 0 &&
    (result.studySessions?.length || 0) > 0
  ) {
    console.log('\n🎉 END-TO-END SYLLABUS EXTRACTION TEST SUCCEEDED!');
    process.exit(0);
  } else {
    console.error('\n❌ TEST FAILED with result:', result);
    process.exit(1);
  }
}

testExtraction().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
