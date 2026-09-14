import { Request, Response } from 'express';
import { chatService } from '../services/chat.service.js';
import { ChatRequestSchema } from '../schemas/chat.schema.js';
import { handleControllerError } from '../utils/errorHandler.js';
import { processUploadedFiles } from '../utils/fileProcessing.js';

export async function handleChat(req: Request, res: Response) {
  try {
    // Parse text fields (may come from multipart or JSON)
    const messageText = req.body?.message || '';
    const historyRaw = req.body?.history;
    const conversationId = req.body?.conversation_id;

    // Parse history (it might be a string if sent via FormData)
    let history = [];
    if (typeof historyRaw === 'string') {
      try { history = JSON.parse(historyRaw); } catch { history = []; }
    } else if (Array.isArray(historyRaw)) {
      history = historyRaw;
    }

    const validatedData = ChatRequestSchema.parse({
      message: messageText,
      history,
      conversation_id: conversationId,
    });

    const authHeader = req.headers.authorization;

    // Process any uploaded images
    const files = req.files as Express.Multer.File[] | undefined;
    const processedFiles = files && files.length > 0 ? processUploadedFiles(files) : undefined;

    const result = await chatService.processMessage(
      validatedData.message,
      validatedData.history,
      authHeader,
      validatedData.conversation_id,
      processedFiles
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return handleControllerError(res, error, 'handleChat');
  }
}
