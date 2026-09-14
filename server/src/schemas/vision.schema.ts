import { z } from 'zod';

// ───────────────────────────────────────────────────────
// Vision Confidence & Warnings (shared across all types)
// ───────────────────────────────────────────────────────

export const VisionConfidenceSchema = z.object({
  confidence: z.enum(['high', 'medium', 'low']),
  confidenceScore: z.number().min(0).max(1).optional(),
  warnings: z.array(z.string()).optional(),
});

// ───────────────────────────────────────────────────────
// Document Type Detection
// ───────────────────────────────────────────────────────

export const DocumentTypeResultSchema = z.object({
  document_type: z.enum(['timetable', 'exam_timetable', 'syllabus', 'module', 'mixed', 'unknown']),
  confidence: z.enum(['high', 'medium', 'low']),
  description: z.string().optional(),
  requires_clarification: z.boolean().optional(),
  clarification_question: z.string().optional(),
});

// ───────────────────────────────────────────────────────
// Timetable Extraction
// ───────────────────────────────────────────────────────

export const TimetableEntrySchema = z.object({
  day: z.string(),
  date: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  subject: z.string(),
  type: z.string().optional(), // lecture, lab, tutorial
  room: z.string().optional(),
});

export const TimetableExtractionSchema = z.object({
  document_type: z.literal('timetable'),
  confidence: z.enum(['high', 'medium', 'low']),
  warnings: z.array(z.string()).optional(),
  entries: z.array(TimetableEntrySchema),
});

// ───────────────────────────────────────────────────────
// Exam Timetable Extraction
// ───────────────────────────────────────────────────────

export const ExamEntrySchema = z.object({
  subject: z.string(),
  date: z.string(), // YYYY-MM-DD or raw text if ambiguous
  time: z.string().optional(),
  duration: z.string().optional(),
  venue: z.string().optional(),
  notes: z.string().optional(),
  date_uncertain: z.boolean().optional(),
});

export const ExamTimetableExtractionSchema = z.object({
  document_type: z.literal('exam_timetable'),
  confidence: z.enum(['high', 'medium', 'low']),
  warnings: z.array(z.string()).optional(),
  academic_year: z.string().optional(),
  semester: z.string().optional(),
  exams: z.array(ExamEntrySchema),
});

// ───────────────────────────────────────────────────────
// Syllabus Extraction
// ───────────────────────────────────────────────────────

export const SyllabusTopicSchema = z.object({
  name: z.string().min(1),
  estimatedMinutes: z.number().int().min(10).max(240).default(45),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  notes: z.string().optional(),
});

export const SyllabusModuleSchema = z.object({
  number: z.number().int().min(1),
  title: z.string(),
  topics: z.array(SyllabusTopicSchema).min(1),
});

export const SyllabusSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().default('SUB101'),
  description: z.string().optional(),
  examDate: z.string().optional(),
  modules: z.array(SyllabusModuleSchema).optional(),
  // Flat topics (when modules not clearly delineated)
  topics: z.array(SyllabusTopicSchema).optional(),
  module_count_detected: z.boolean().optional(),
});

export const SyllabusExtractionSchema = z.object({
  document_type: z.literal('syllabus'),
  status: z.enum(['success', 'unreadable', 'ambiguous']),
  confidence: z.enum(['high', 'medium', 'low']),
  confidenceScore: z.number().min(0).max(1).optional(),
  warnings: z.array(z.string()).optional(),
  rejectionReason: z.string().optional(),
  institution: z.string().optional(),
  term: z.string().optional(),
  subjects: z.array(SyllabusSubjectSchema).default([]),
  // Flag: AI could not determine module count
  needs_module_count: z.boolean().optional(),
  module_count_question: z.string().optional(),
});

// ───────────────────────────────────────────────────────
// Module-Specific Extraction
// ───────────────────────────────────────────────────────

export const ModuleExtractionSchema = z.object({
  document_type: z.literal('module'),
  confidence: z.enum(['high', 'medium', 'low']),
  warnings: z.array(z.string()).optional(),
  subject_name: z.string().optional(),
  module_number: z.number().optional(),
  module_title: z.string().optional(),
  topics: z.array(SyllabusTopicSchema),
});

// ───────────────────────────────────────────────────────
// Generic Vision Analysis Result (union of all types)
// ───────────────────────────────────────────────────────

export const VisionAnalysisResultSchema = z.discriminatedUnion('document_type', [
  TimetableExtractionSchema,
  ExamTimetableExtractionSchema,
  SyllabusExtractionSchema,
  ModuleExtractionSchema,
]);

// Legacy syllabus schema compatibility
export const SyllabusAnalysisResponseSchema = SyllabusExtractionSchema;

// ─── Type exports ───

export type DocumentTypeResult = z.infer<typeof DocumentTypeResultSchema>;
export type TimetableEntry = z.infer<typeof TimetableEntrySchema>;
export type TimetableExtraction = z.infer<typeof TimetableExtractionSchema>;
export type ExamEntry = z.infer<typeof ExamEntrySchema>;
export type ExamTimetableExtraction = z.infer<typeof ExamTimetableExtractionSchema>;
export type SyllabusTopic = z.infer<typeof SyllabusTopicSchema>;
export type SyllabusModule = z.infer<typeof SyllabusModuleSchema>;
export type SyllabusSubject = z.infer<typeof SyllabusSubjectSchema>;
export type SyllabusExtraction = z.infer<typeof SyllabusExtractionSchema>;
export type ModuleExtraction = z.infer<typeof ModuleExtractionSchema>;
export type SyllabusAnalysisResponse = z.infer<typeof SyllabusAnalysisResponseSchema>;
