import { z } from 'zod';

export const SyllabusTopicSchema = z.object({
  name: z.string().min(1, 'Topic name is required'),
  module: z.string().default('General Module'),
  estimatedMinutes: z.number().int().min(10).max(240).default(45),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  notes: z.string().optional(),
});

export const SyllabusSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().default('SUB101'),
  description: z.string().optional(),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  topics: z.array(SyllabusTopicSchema).min(1, 'Subject must contain at least 1 topic'),
});

export const SyllabusAnalysisResponseSchema = z.object({
  status: z.enum(['success', 'unreadable', 'ambiguous']),
  confidenceScore: z.number().min(0).max(1),
  rejectionReason: z.string().optional(),
  institution: z.string().optional(),
  term: z.string().optional(),
  subjects: z.array(SyllabusSubjectSchema).default([]),
});

export type SyllabusTopic = z.infer<typeof SyllabusTopicSchema>;
export type SyllabusSubject = z.infer<typeof SyllabusSubjectSchema>;
export type SyllabusAnalysisResponse = z.infer<typeof SyllabusAnalysisResponseSchema>;
