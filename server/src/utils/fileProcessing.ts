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
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function processUploadedFile(file: Express.Multer.File): ProcessedFile {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.originalname}" exceeds the 10MB size limit.`);
  }

  const mimeType = file.mimetype;
  const buffer = file.buffer;

  // Text files
  if (
    mimeType.includes('text') ||
    mimeType.includes('json') ||
    file.originalname.endsWith('.txt') ||
    file.originalname.endsWith('.md')
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

  // Image or PDF → base64 data URI
  const base64 = buffer.toString('base64');
  let effectiveMimeType = mimeType;

  if (file.originalname.endsWith('.pdf')) {
    effectiveMimeType = 'application/pdf';
  } else if (file.originalname.endsWith('.png')) {
    effectiveMimeType = 'image/png';
  } else if (file.originalname.endsWith('.jpg') || file.originalname.endsWith('.jpeg')) {
    effectiveMimeType = 'image/jpeg';
  } else if (file.originalname.endsWith('.webp')) {
    effectiveMimeType = 'image/webp';
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
 * Process multiple uploaded files.
 */
export function processUploadedFiles(files: Express.Multer.File[]): ProcessedFile[] {
  return files.map((file) => processUploadedFile(file));
}

/**
 * Validate that a file is a supported type.
 */
export function validateFileType(file: Express.Multer.File): boolean {
  const mimeOk = SUPPORTED_MIME_TYPES.has(file.mimetype);
  const extOk =
    file.originalname.match(/\.(jpg|jpeg|png|webp|gif|pdf|txt|md|json)$/i) !== null;
  return mimeOk || extOk;
}
