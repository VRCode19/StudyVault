// ───────────────────────────────────────────────────────
// Legacy Syllabus Schema — re-exports from vision.schema.ts
// ───────────────────────────────────────────────────────
// Kept for backward compatibility with test-ai.ts and any
// code that imports from this module.

export {
  SyllabusExtractionSchema as SyllabusAnalysisResponseSchema,
  SyllabusTopicSchema,
  SyllabusModuleSchema,
  SyllabusSubjectSchema,
  type SyllabusExtraction as SyllabusAnalysisResponse,
  type SyllabusTopic,
  type SyllabusModule,
  type SyllabusSubject,
} from './vision.schema.js';
