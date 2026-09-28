import { extractSyllabusFromTextHeuristic } from '../utils/syllabusHeuristicParser.js';

const sampleVTUTypeSyllabus = `
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

Text Books:
1. Elmasri and Navathe, Fundamentals of Database Systems, 7th Edition, Pearson, 2016.
`;

console.log('--- Testing extractSyllabusFromTextHeuristic ---');
const result = extractSyllabusFromTextHeuristic(sampleVTUTypeSyllabus, 'BCS508.pdf');

console.log('Result status:', result.status);
console.log('Confidence score:', result.confidenceScore);
console.log('Extracted subjects count:', result.subjects.length);

const subject = result.subjects[0];
console.log('Subject name:', subject.name);
console.log('Subject code:', subject.code);
console.log('Modules count:', subject.modules?.length);

subject.modules?.forEach((mod) => {
  console.log(`  [Module ${mod.number}] ${mod.title}`);
  console.log(`      Topics (${mod.topics.length}):`, mod.topics.slice(0, 3).map((t) => t.name).join(', '));
});

console.log('\nSynthesized study sessions count:', result.studySessions?.length);
console.log('Sample sessions:');
result.studySessions?.slice(0, 3).forEach((s) => {
  console.log(`  - [${s.dayOfWeek}] ${s.startTime}-${s.endTime} | ${s.subjectName} | ${s.topicName} (${s.adaptiveReason})`);
});

if (
  result.status === 'success' &&
  subject.name.includes('Database Management Systems') &&
  subject.code === 'BCS508' &&
  (subject.modules?.length || 0) === 5 &&
  (result.studySessions?.length || 0) > 0
) {
  console.log('\n✅ ALL ASSERTIONS PASSED! Heuristic parser is accurate and resilient.');
} else {
  console.error('\n❌ ASSERTION FAILED!');
  process.exit(1);
}
