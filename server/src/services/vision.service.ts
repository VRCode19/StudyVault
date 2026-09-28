import {
  openRouterClient,
  ChatCompletionMessage,
} from '../clients/openrouter.client.js';
import { config } from '../config/env.config.js';
import {
  DOCUMENT_TYPE_DETECTION_PROMPT,
  TIMETABLE_EXTRACTION_PROMPT,
  EXAM_TIMETABLE_EXTRACTION_PROMPT,
  SYLLABUS_EXTRACTION_PROMPT,
  MODULE_EXTRACTION_PROMPT,
} from '../prompts/visionPrompts.js';
import {
  DocumentTypeResultSchema,
  TimetableExtractionSchema,
  ExamTimetableExtractionSchema,
  SyllabusExtractionSchema,
  ModuleExtractionSchema,
  type DocumentTypeResult,
  type TimetableExtraction,
  type ExamTimetableExtraction,
  type SyllabusExtraction,
  type ModuleExtraction,
} from '../schemas/vision.schema.js';
import { ProcessedFile } from '../utils/fileProcessing.js';
import { extractJson } from '../utils/jsonExtractor.js';
import { synthesizeStudySessionsFromSubjects } from '../utils/timetableSynthesis.js';
import { extractSyllabusFromTextHeuristic } from '../utils/syllabusHeuristicParser.js';

type VisionResult =
  | { type: 'document_type'; data: DocumentTypeResult }
  | { type: 'timetable'; data: TimetableExtraction }
  | { type: 'exam_timetable'; data: ExamTimetableExtraction }
  | { type: 'syllabus'; data: SyllabusExtraction }
  | { type: 'module'; data: ModuleExtraction };

// ───────────────────────────────────────────────────────
// Vision Service — multimodal image analysis via OpenRouter
// ───────────────────────────────────────────────────────

export class VisionService {
  /**
   * Build multimodal message content array from processed files.
   */
  private buildImageContent(
    textPrompt: string,
    files: ProcessedFile[]
  ): string | Array<{ type: string; text?: string; image_url?: { url: string } }> {
    const hasImages = files.some((f) => !f.isText && Boolean(f.dataUri));

    if (!hasImages) {
      let fullText = textPrompt;
      for (const file of files) {
        if (file.isText && file.textContent) {
          fullText += `\n\n--- Document: ${file.originalName || 'uploaded-document'} ---\n${file.textContent}\n--- End of document ---`;
        }
      }
      return fullText;
    }

    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: textPrompt },
    ];

    for (const file of files) {
      if (file.isText && file.textContent) {
        content.push({
          type: 'text',
          text: `\n--- Uploaded text document (${file.originalName}) ---\n${file.textContent}\n--- End of document ---`,
        });
      } else if (file.dataUri) {
        content.push({
          type: 'image_url',
          image_url: { url: file.dataUri },
        });
      }
    }

    return content;
  }

  /**
   * Send image(s) to the vision model and parse the JSON response.
   */
  private async callVisionModel(
    systemPrompt: string,
    userText: string,
    files: ProcessedFile[]
  ): Promise<any> {
    const userContent = this.buildImageContent(userText, files);

    const messages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Return valid JSON only. Do not include introductory text or unformatted chat commentary.' },
      { role: 'user', content: userContent },
    ];

    const hasActualImages = files.some((f) => !f.isText && Boolean(f.dataUri));
    const targetModel = hasActualImages
      ? config.openrouter.visionModel
      : config.openrouter.chatModel;

    console.log(
      `[VisionService] Sending ${files.length} file(s) (hasImages: ${hasActualImages}) to model: ${targetModel}`
    );

    const response = await openRouterClient.createChatCompletion({
      model: targetModel,
      messages,
      max_tokens: 3500,
      temperature: 0.1,
      timeoutMs: hasActualImages ? 15000 : 7000,
      maxFallbacks: hasActualImages ? 4 : 2,
    });

    const choice = response.choices?.[0];
    if (!choice || !choice.message.content) {
      throw new Error('Vision model returned an empty response.');
    }

    const contentText =
      typeof choice.message.content === 'string'
        ? choice.message.content
        : JSON.stringify(choice.message.content);

    try {
      return extractJson(contentText);
    } catch (e) {
      console.error('[VisionService] Failed to parse vision model JSON output:', contentText);
      throw new Error('Vision model did not return valid JSON. The image may be unreadable.');
    }
  }

  /**
   * Detect what type of academic document the image(s) or files contain.
   */
  async detectDocumentType(files: ProcessedFile[]): Promise<DocumentTypeResult> {
    // 1. Instant heuristic detection if readable text was extracted (PDF, DOCX, TXT)
    const textFile = files.find((f) => f.isText && f.textContent?.trim());
    if (textFile && textFile.textContent) {
      const lower = textFile.textContent.toLowerCase();
      const fn = (textFile.originalName || '').toLowerCase();

      const isExam =
        lower.includes('exam timetable') ||
        lower.includes('examination schedule') ||
        lower.includes('date of examination') ||
        fn.includes('exam');

      const isTimetable =
        lower.includes('class timetable') ||
        lower.includes('time table') ||
        (lower.includes('period') && lower.includes('monday')) ||
        fn.includes('timetable');

      const isSyllabus =
        lower.includes('module') ||
        lower.includes('unit') ||
        lower.includes('syllabus') ||
        lower.includes('course code') ||
        lower.includes('course title') ||
        lower.includes('course outcome') ||
        fn.includes('syllabus') ||
        /\b[a-z]{2,5}\d{3,4}\b/.test(fn);

      if (isSyllabus && !isExam && !isTimetable) {
        console.log(`[VisionService] Document "${textFile.originalName}" classified as SYLLABUS via text heuristics.`);
        return {
          document_type: 'syllabus',
          confidence: 'high',
          requires_clarification: false,
        };
      } else if (isExam) {
        console.log(`[VisionService] Document "${textFile.originalName}" classified as EXAM_TIMETABLE via text heuristics.`);
        return {
          document_type: 'exam_timetable',
          confidence: 'high',
          requires_clarification: false,
        };
      } else if (isTimetable) {
        console.log(`[VisionService] Document "${textFile.originalName}" classified as TIMETABLE via text heuristics.`);
        return {
          document_type: 'timetable',
          confidence: 'high',
          requires_clarification: false,
        };
      }
    }

    // 2. Call multimodal vision model for scanned image documents
    try {
      const raw = await this.callVisionModel(
        DOCUMENT_TYPE_DETECTION_PROMPT,
        'Please classify this academic document.',
        files
      );

      const result = DocumentTypeResultSchema.safeParse(raw);
      if (result.success) {
        return result.data;
      }
      console.warn('[VisionService] Document type schema validation failed:', result.error.format());
    } catch (err: any) {
      console.warn('[VisionService] AI document classification failed:', err.message);
    }

    // If text was present but ambiguous, default to syllabus
    if (textFile && textFile.textContent && textFile.textContent.length > 50) {
      return {
        document_type: 'syllabus',
        confidence: 'medium',
        requires_clarification: false,
      };
    }

    return {
      document_type: 'unknown',
      confidence: 'low',
      requires_clarification: true,
      clarification_question: 'I could not determine the document type. What does this image contain?',
    };
  }

  /**
   * Extract class timetable from image(s).
   */
  async extractTimetable(files: ProcessedFile[]): Promise<TimetableExtraction> {
    const raw = await this.callVisionModel(
      TIMETABLE_EXTRACTION_PROMPT,
      'Please extract the class timetable from this image.',
      files
    );

    const result = TimetableExtractionSchema.safeParse(raw);
    if (result.success) {
      return result.data;
    }

    console.warn('[VisionService] Timetable schema validation failed, attempting recovery');
    return {
      document_type: 'timetable',
      confidence: 'low',
      warnings: ['Schema validation failed. Some entries may be missing or incorrect.'],
      entries: Array.isArray(raw.entries)
        ? raw.entries.map((e: any) => ({
            day: e.day || 'Unknown',
            start_time: e.start_time || '00:00',
            end_time: e.end_time || '00:00',
            subject: e.subject || 'Unknown',
            ...e,
          }))
        : [],
    };
  }

  /**
   * Extract exam timetable from image(s).
   */
  async extractExamTimetable(files: ProcessedFile[]): Promise<ExamTimetableExtraction> {
    const raw = await this.callVisionModel(
      EXAM_TIMETABLE_EXTRACTION_PROMPT,
      'Please extract the exam dates and schedule from this image.',
      files
    );

    const result = ExamTimetableExtractionSchema.safeParse(raw);
    if (result.success) {
      return result.data;
    }

    console.warn('[VisionService] Exam timetable schema validation failed, attempting recovery');
    return {
      document_type: 'exam_timetable',
      confidence: 'low',
      warnings: ['Schema validation failed. Some exam entries may be missing.'],
      exams: Array.isArray(raw.exams)
        ? raw.exams.map((e: any) => ({
            subject: e.subject || 'Unknown',
            date: e.date || 'Unknown',
            ...e,
          }))
        : [],
    };
  }

  /**
   * Extract syllabus with subjects, modules, and topics from image(s) or document text.
   * If AI models are rate-limited (HTTP 429) or unreachable, automatically falls back
   * to the local curriculum parser when document text is available.
   */
  async extractSyllabus(files: ProcessedFile[]): Promise<SyllabusExtraction> {
    const textFile = files.find((f) => f.isText && f.textContent?.trim());

    try {
      const raw = await this.callVisionModel(
        SYLLABUS_EXTRACTION_PROMPT,
        'Please analyze this syllabus and extract subjects, modules, and topics.',
        files
      );

      const result = SyllabusExtractionSchema.safeParse(raw);
      if (result.success) {
        const data = result.data;
        if (data.status !== 'unreadable' && Array.isArray(data.subjects) && data.subjects.length > 0) {
          if ((!data.studySessions || data.studySessions.length === 0) && data.subjects.length > 0) {
            const synthesized = synthesizeStudySessionsFromSubjects(data.subjects);
            data.studySessions = synthesized.studySessions;
            if (!data.timetable) {
              data.timetable = synthesized.timetable;
            }
          }
          return data;
        }
      }

      console.warn('[VisionService] Syllabus schema validation failed, attempting recovery');

      // Graceful fallback from raw subjects
      if (Array.isArray(raw?.subjects) && raw.subjects.length > 0) {
        const synthesized = synthesizeStudySessionsFromSubjects(raw.subjects);
        return {
          document_type: 'syllabus',
          status: 'success',
          confidence: 'medium',
          confidenceScore: 0.75,
          warnings: ['Recovered structured subjects from raw output.'],
          subjects: raw.subjects,
          studySessions: synthesized.studySessions,
          timetable: synthesized.timetable,
        };
      }
    } catch (modelError: any) {
      console.warn(
        `[VisionService] AI model call failed (${modelError.message}). Checking for local text fallback...`
      );
    }

    // 100% resilient fallback: If document text was extracted (from PDF, Word doc, or text paste),
    // parse curriculum locally and synthesize weekly study timetable without any external failure risk.
    if (textFile && textFile.textContent && textFile.textContent.trim().length > 30) {
      console.log(
        `[VisionService] Executing local syllabus text parser for "${textFile.originalName || 'uploaded-document'}" (${textFile.textContent.length} chars)`
      );
      return extractSyllabusFromTextHeuristic(textFile.textContent, textFile.originalName);
    }

    return {
      document_type: 'syllabus',
      status: 'unreadable',
      confidence: 'low',
      confidenceScore: 0,
      rejectionReason: 'Could not extract syllabus data from the provided document. Please ensure the document is clear and readable.',
      subjects: [],
    };
  }

  /**
   * Extract module-specific details (topics) from image(s).
   */
  async extractModuleDetails(
    files: ProcessedFile[],
    subjectName?: string,
    moduleNumber?: number
  ): Promise<ModuleExtraction> {
    let contextNote = 'Please extract the module details and topics from this image.';
    if (subjectName) contextNote += ` This is for the subject: ${subjectName}.`;
    if (moduleNumber) contextNote += ` This is Module ${moduleNumber}.`;

    const raw = await this.callVisionModel(
      MODULE_EXTRACTION_PROMPT,
      contextNote,
      files
    );

    const result = ModuleExtractionSchema.safeParse(raw);
    if (result.success) {
      return result.data;
    }

    console.warn('[VisionService] Module schema validation failed');
    return {
      document_type: 'module',
      confidence: 'low',
      warnings: ['Schema validation failed. Topics may be incomplete.'],
      subject_name: subjectName,
      module_number: moduleNumber,
      topics: Array.isArray(raw.topics)
        ? raw.topics.map((t: any) => ({
            name: t.name || 'Unknown Topic',
            estimatedMinutes: t.estimatedMinutes || 45,
            difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty) ? t.difficulty : 'medium',
          }))
        : [],
    };
  }

  /**
   * Auto-detect document type and extract accordingly.
   * This is the main entry point for generic image uploads.
   */
  async analyzeImage(files: ProcessedFile[]): Promise<VisionResult> {
    // Step 1: Detect document type
    const detection = await this.detectDocumentType(files);
    console.log(`[VisionService] Detected document type: ${detection.document_type} (${detection.confidence})`);

    // Step 2: Route to appropriate extractor
    switch (detection.document_type) {
      case 'timetable': {
        const data = await this.extractTimetable(files);
        return { type: 'timetable', data };
      }
      case 'exam_timetable': {
        const data = await this.extractExamTimetable(files);
        return { type: 'exam_timetable', data };
      }
      case 'syllabus': {
        const data = await this.extractSyllabus(files);
        return { type: 'syllabus', data };
      }
      case 'module': {
        const data = await this.extractModuleDetails(files);
        return { type: 'module', data };
      }
      case 'mixed':
      case 'unknown':
      default: {
        // For mixed/unknown, return the detection result so the chat can ask for clarification
        return { type: 'document_type', data: detection };
      }
    }
  }
}

export const visionService = new VisionService();
