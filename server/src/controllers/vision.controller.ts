import { Request, Response } from 'express';
import { visionService } from '../services/vision.service.js';
import { processUploadedFiles, validateFileType } from '../utils/fileProcessing.js';
import { handleControllerError } from '../utils/errorHandler.js';

/**
 * POST /api/ai/analyze-image
 * Auto-detects document type and extracts structured data.
 * Accepts multipart/form-data with field name 'files' (up to 10 images).
 */
export async function handleAnalyzeImage(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please upload at least one image file.',
      });
    }

    // Validate file types
    for (const file of files) {
      if (!validateFileType(file)) {
        return res.status(400).json({
          error: 'Unsupported File Type',
          message: `File "${file.originalname}" is not a supported format. Please upload JPG, PNG, WebP, PDF, or TXT files.`,
        });
      }
    }

    const processedFiles = processUploadedFiles(files);
    console.log(`[VisionController] Analyzing ${processedFiles.length} file(s): ${files.map((f) => f.originalname).join(', ')}`);

    const result = await visionService.analyzeImage(processedFiles);

    return res.status(200).json(result);
  } catch (error: any) {
    return handleControllerError(res, error, 'handleAnalyzeImage');
  }
}

/**
 * POST /api/ai/analyze-timetable
 * Targeted timetable extraction from image(s).
 */
export async function handleAnalyzeTimetable(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please upload at least one timetable image.',
      });
    }

    const processedFiles = processUploadedFiles(files);
    const result = await visionService.extractTimetable(processedFiles);

    return res.status(200).json(result);
  } catch (error: any) {
    return handleControllerError(res, error, 'handleAnalyzeTimetable');
  }
}

/**
 * POST /api/ai/analyze-exam-timetable
 * Targeted exam timetable extraction from image(s).
 */
export async function handleAnalyzeExamTimetable(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please upload at least one exam timetable image.',
      });
    }

    const processedFiles = processUploadedFiles(files);
    const result = await visionService.extractExamTimetable(processedFiles);

    return res.status(200).json(result);
  } catch (error: any) {
    return handleControllerError(res, error, 'handleAnalyzeExamTimetable');
  }
}
