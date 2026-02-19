/**
 * ai-defensive-parser.ts
 * 
 * Sanitizes and parses AI-generated JSON responses, handling markdown 
 * markers and providing type-safe fallbacks to prevent runtime crashes.
 */

export class AIDefensiveParser {
  /**
   * Sanitizes a raw string from an AI and parses it as JSON.
   */
  static parse<T>(raw: string, fallback: T): T {
    if (!raw) return fallback;

    try {
      // 1. Remove Markdown code blocks (```json ... ```)
      let clean = raw.trim();
      if (clean.includes('```')) {
        const matches = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (matches && matches[1]) {
          clean = matches[1];
        } else {
          // If match fails but it has backticks, try stripping them
          clean = clean.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
        }
      }

      // 2. Locate the first '{' and last '}' to handle conversational noise
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }

      // 3. Parse JSON
      return JSON.parse(clean) as T;
    } catch (error) {
      console.error('[AIDefensiveParser] Failed to parse AI response:', error);
      console.debug('[AIDefensiveParser] Raw content was:', raw);
      return fallback;
    }
  }

  /**
   * Specifically handles BPMN/ERD diagram structures.
   */
  static parseDiagram(raw: string) {
    return this.parse(raw, { nodes: [], edges: [] });
  }
}
