import { Request, Response } from 'express';
import { chatService } from '../services/chat.service.js';
import { ChatRequestSchema } from '../schemas/chat.schema.js';
import { handleControllerError } from '../utils/errorHandler.js';

export async function handleChat(req: Request, res: Response) {
  try {
    const validatedData = ChatRequestSchema.parse(req.body);
    const authHeader = req.headers.authorization;

    const result = await chatService.processMessage(
      validatedData.message,
      validatedData.history,
      authHeader
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return handleControllerError(res, error, 'handleChat');
  }
}
