import { z } from 'zod';

export const ChatMessageInputSchema = z.object({
  id: z.string().optional(),
  sender: z.enum(['user', 'assistant']),
  text: z.string().min(1, 'Message text is required'),
  timestamp: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'User message cannot be empty').max(5000, 'Message exceeds length limit'),
  history: z.array(ChatMessageInputSchema).default([]),
  conversation_id: z.string().optional(),
});

export const ActionCardShiftSchema = z.object({
  sessionId: z.string(),
  subject: z.string(),
  from: z.string(),
  to: z.string(),
  duration: z.string(),
});

export const ActionCardSchema = z.object({
  type: z.literal('schedule-update'),
  title: z.string(),
  originalSummary: z.string(),
  updatedSummary: z.string(),
  shifts: z.array(ActionCardShiftSchema),
  deadlineProtected: z.boolean(),
  applied: z.boolean().default(false),
});

export const ActionSchema = z.object({
  type: z.string(),
  status: z.string(),
  details: z.any().optional(),
});

export const ChatResponseSchema = z.object({
  replyText: z.string(),
  actionCard: ActionCardSchema.optional(),
  toolsUsed: z.array(z.string()).optional(),
  actions: z.array(ActionSchema).optional(),
  extractionData: z.any().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ActionCard = z.infer<typeof ActionCardSchema>;
