/**
 * Robust JSON extractor for LLM completions.
 * Safely extracts JSON from pure JSON, markdown fenced blocks,
 * or text containing reasoning traces.
 */
export function extractJson<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Cannot extract JSON from empty or non-string input');
  }

  const text = rawText.trim();

  // 1. Try direct JSON parsing
  try {
    return JSON.parse(text) as T;
  } catch {}

  // 2. Try markdown fenced code blocks: ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    } catch {}
  }

  // 3. Find outermost object { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate) as T;
    } catch {}
  }

  // 4. Find outermost array [ ... ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const candidate = text.substring(firstBracket, lastBracket + 1);
      return JSON.parse(candidate) as T;
    } catch {}
  }

  throw new Error(
    `Failed to extract valid JSON from model response. Preview: ${text.slice(0, 150)}...`
  );
}
