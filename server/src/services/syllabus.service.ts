import {
  openRouterClient,
  ChatCompletionMessage,
} from '../clients/openrouter.client.js';
import { SYLLABUS_SYSTEM_PROMPT } from '../prompts/syllabusPrompt.js';
import {
  SyllabusAnalysisResponse,
  SyllabusAnalysisResponseSchema,
} from '../schemas/syllabus.schema.js';
import { ProcessedFile } from '../utils/fileProcessing.js';

export class SyllabusService {
  async analyzeSyllabus(options: {
    rawText?: string;
    processedFile?: ProcessedFile;
  }): Promise<SyllabusAnalysisResponse> {
    const { rawText, processedFile } = options;

    if (!rawText && !processedFile) {
      throw new Error('Either rawText or a syllabus file must be provided for analysis.');
    }

    // Build the user message content
    let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

    if (processedFile && !processedFile.isText && processedFile.dataUri) {
      // Multimodal vision input
      userContent = [
        {
          type: 'text',
          text: 'Please analyze this syllabus document and extract subjects, modules, topics, difficulty, and exam dates into structured JSON. If this document is blurry, illegible, or not an academic syllabus, return status="unreadable".',
        },
        {
          type: 'image_url',
          image_url: {
            url: processedFile.dataUri,
          },
        },
      ];
    } else {
      // Text input
      const textToAnalyze = rawText || processedFile?.textContent || '';
      if (!textToAnalyze.trim()) {
        throw new Error('The provided syllabus text or file is completely empty.');
      }

      userContent = `Please analyze this course syllabus text and extract subjects, modules, topics, difficulty, and exam dates into structured JSON. If the text does not contain a discernible academic curriculum, return status="unreadable":\n\n${textToAnalyze}`;
    }

    const messages: ChatCompletionMessage[] = [
      {
        role: 'system',
        content: SYLLABUS_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userContent,
      },
    ];

    console.log('[SyllabusService] Sending document to OpenRouter multimodal analyzer...');

    const response = await openRouterClient.createChatCompletion({
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.1, // Near-zero temperature for structured precision
    });

    const choice = response.choices?.[0];
    if (!choice || !choice.message.content) {
      throw new Error('OpenRouter returned an empty response during syllabus analysis.');
    }

    const contentText =
      typeof choice.message.content === 'string'
        ? choice.message.content
        : JSON.stringify(choice.message.content);

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(contentText);
    } catch (parseError) {
      console.error('[SyllabusService] Failed to parse model output as JSON:', contentText);
      return {
        status: 'unreadable',
        confidenceScore: 0.0,
        rejectionReason:
          'Could not parse curriculum output from the document. Please ensure the document is clear.',
        subjects: [],
      };
    }

    // Validate with Zod
    const validationResult = SyllabusAnalysisResponseSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.warn(
        '[SyllabusService] Schema validation warning, attempting recovery:',
        validationResult.error.format()
      );

      // Graceful fallback if subjects array exists
      if (Array.isArray(parsedJson.subjects) && parsedJson.subjects.length > 0) {
        return {
          status: 'ambiguous',
          confidenceScore: 0.6,
          rejectionReason: 'Extracted partial curriculum with non-standard fields.',
          subjects: parsedJson.subjects.map((sub: any, idx: number) => ({
            name: sub.name || `Subject ${idx + 1}`,
            code: sub.code || `SUB${idx + 1}`,
            description: sub.description,
            examDate: sub.examDate,
            topics: Array.isArray(sub.topics)
              ? sub.topics.map((t: any, tIdx: number) => ({
                  name: t.name || `Topic ${tIdx + 1}`,
                  module: t.module || 'Module 1',
                  estimatedMinutes: typeof t.estimatedMinutes === 'number' ? t.estimatedMinutes : 45,
                  difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty)
                    ? t.difficulty
                    : 'medium',
                  notes: t.notes,
                }))
              : [],
          })),
        };
      }

      return {
        status: 'unreadable',
        confidenceScore: 0.0,
        rejectionReason:
          parsedJson.rejectionReason ||
          'The document does not appear to contain structured academic curriculum data.',
        subjects: [],
      };
    }

    return validationResult.data;
  }
}

export const syllabusService = new SyllabusService();
