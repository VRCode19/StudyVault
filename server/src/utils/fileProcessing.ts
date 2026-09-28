import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export interface ProcessedFile {
  mimeType: string;
  dataUri: string;
  isText: boolean;
  textContent?: string;
  originalName: string;
}

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'application/rtf',
  'text/rtf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/octet-stream', // often used by browsers for doc/docx
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit

/**
 * Fallback extractor for legacy binary .doc or raw documents
 */
function extractPrintableText(buffer: Buffer): string {
  const binaryStr = buffer.toString('binary');
  const matches = binaryStr.match(/[\x20-\x7E\t\r\n]{4,}/g);
  if (matches && matches.length > 0) {
    return matches.filter((s) => s.trim().length > 3).join('\n');
  }
  return '';
}

/**
 * Extract text from PDF buffer
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text || '';
  } catch (err) {
    console.warn('[FileProcessing] PDFParse failed to parse text:', err);
    return '';
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // cleanup ignore
      }
    }
  }
}

/**
 * Extract text from Word DOCX or DOC
 */
async function extractWordDocText(buffer: Buffer, filename: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    if (result.value && result.value.trim().length > 0) {
      return result.value.trim();
    }
  } catch (err) {
    console.warn(`[FileProcessing] Mammoth extraction failed for ${filename}:`, err);
  }

  // Fallback for .doc or corrupted docx
  const fallback = extractPrintableText(buffer);
  return fallback;
}

export async function processUploadedFile(file: Express.Multer.File): Promise<ProcessedFile> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.originalname}" exceeds the 15MB size limit.`);
  }

  const mimeType = file.mimetype;
  const buffer = file.buffer;
  const lowerName = file.originalname.toLowerCase();

  // 1. Text, Markdown, CSV, JSON files
  if (
    mimeType.includes('text') ||
    mimeType.includes('json') ||
    mimeType.includes('csv') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.rtf')
  ) {
    const text = buffer.toString('utf-8');
    return {
      mimeType: 'text/plain',
      dataUri: '',
      isText: true,
      textContent: text,
      originalName: file.originalname,
    };
  }

  // 2. Word documents (.docx, .doc)
  if (
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc') ||
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('msword')
  ) {
    console.log(`[FileProcessing] Extracting text from Word document: ${file.originalname}`);
    const wordText = await extractWordDocText(buffer, file.originalname);
    return {
      mimeType: 'text/plain',
      dataUri: '',
      isText: true,
      textContent: wordText || `[Word Document: ${file.originalname} - No readable text extracted]`,
      originalName: file.originalname,
    };
  }

  // 3. PDF files (.pdf)
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    console.log(`[FileProcessing] Extracting text from PDF: ${file.originalname}`);
    const pdfText = await extractPdfText(buffer);

    // If PDF contains readable digital text (standard syllabus PDFs)
    if (pdfText && pdfText.trim().length > 30) {
      console.log(`[FileProcessing] Successfully extracted ${pdfText.length} characters of text from PDF.`);
      return {
        mimeType: 'text/plain',
        dataUri: '',
        isText: true,
        textContent: pdfText,
        originalName: file.originalname,
      };
    }

    // Scanned image PDF fallback: encode as base64 dataUri
    console.log(`[FileProcessing] PDF appears to be scanned or image-only. Passing dataUri.`);
    const base64 = buffer.toString('base64');
    return {
      mimeType: 'application/pdf',
      dataUri: `data:application/pdf;base64,${base64}`,
      isText: false,
      textContent: pdfText || undefined,
      originalName: file.originalname,
    };
  }

  // 4. Image files (.jpg, .jpeg, .png, .webp, .gif)
  const base64 = buffer.toString('base64');
  let effectiveMimeType = mimeType;

  if (lowerName.endsWith('.png')) {
    effectiveMimeType = 'image/png';
  } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
    effectiveMimeType = 'image/jpeg';
  } else if (lowerName.endsWith('.webp')) {
    effectiveMimeType = 'image/webp';
  } else if (lowerName.endsWith('.gif')) {
    effectiveMimeType = 'image/gif';
  }

  const dataUri = `data:${effectiveMimeType};base64,${base64}`;

  return {
    mimeType: effectiveMimeType,
    dataUri,
    isText: false,
    originalName: file.originalname,
  };
}

/**
 * Process multiple uploaded files asynchronously.
 */
export async function processUploadedFiles(files: Express.Multer.File[]): Promise<ProcessedFile[]> {
  return Promise.all(files.map((file) => processUploadedFile(file)));
}

/**
 * Validate that a file is a supported type.
 */
export function validateFileType(file: Express.Multer.File): boolean {
  const mimeOk = SUPPORTED_MIME_TYPES.has(file.mimetype);
  const extOk =
    file.originalname.match(/\.(jpg|jpeg|png|webp|gif|pdf|txt|md|json|csv|rtf|docx|doc)$/i) !== null;
  return mimeOk || extOk;
}
