import { Request, Response } from 'express';
import { syllabusService } from '../services/syllabus.service.js';
import { processUploadedFile } from '../utils/fileProcessing.js';
import { handleControllerError } from '../utils/errorHandler.js';

export async function handleAnalyzeSyllabus(req: Request, res: Response) {
  try {
    let rawText = req.body?.text as string | undefined;
    let processedFile = undefined;

    if (req.file) {
      processedFile = processUploadedFile(req.file);
    }

    if (!rawText && !processedFile) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide either a syllabus file upload or a text field.',
      });
    }

    const result = await syllabusService.analyzeSyllabus({
      rawText,
      processedFile,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return handleControllerError(res, error, 'handleAnalyzeSyllabus');
  }
}
