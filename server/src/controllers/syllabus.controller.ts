import { Request, Response } from 'express';
import { visionService } from '../services/vision.service.js';
import { processUploadedFile, processUploadedFiles } from '../utils/fileProcessing.js';
import { handleControllerError } from '../utils/errorHandler.js';

export async function handleAnalyzeSyllabus(req: Request, res: Response) {
  try {
    const rawText = req.body?.text as string | undefined;

    // Handle single file (from multer.single)
    let processedFiles = [];
    if (req.file) {
      processedFiles.push(processUploadedFile(req.file));
    }
    // Handle multiple files (from multer.array)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      processedFiles = processUploadedFiles(req.files as Express.Multer.File[]);
    }

    // Handle raw text input
    if (rawText && rawText.trim()) {
      processedFiles.push({
        mimeType: 'text/plain',
        dataUri: '',
        isText: true,
        textContent: rawText,
        originalName: 'pasted-text',
      });
    }

    if (processedFiles.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide either a syllabus file upload or a text field.',
      });
    }

    const result = await visionService.extractSyllabus(processedFiles);
    return res.status(200).json(result);
  } catch (error: any) {
    return handleControllerError(res, error, 'handleAnalyzeSyllabus');
  }
}
