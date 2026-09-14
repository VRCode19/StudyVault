export interface ProcessedFile {
  mimeType: string;
  dataUri: string;
  isText: boolean;
  textContent?: string;
}

export function processUploadedFile(file: Express.Multer.File): ProcessedFile {
  const mimeType = file.mimetype;
  const buffer = file.buffer;

  // If text file or markdown
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
    };
  }

  // If image or PDF, convert to base64 data URI
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
  };
}
