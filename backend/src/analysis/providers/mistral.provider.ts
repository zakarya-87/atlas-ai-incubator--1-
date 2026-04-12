import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIProviderInterface,
  AIProviderRequest,
  AIProviderResponse,
  ChatCompletionResponse,
} from '../interfaces/ai-provider.interface';

/**
 * Recursively converts a Gemini-style JSON schema into a concrete JSON template
 * that Mistral can follow verbatim.  The template uses meaningful placeholder
 * values (e.g. "string value", [{ ... }]) so the model understands the expected
 * type at every level without being able to invent its own keys.
 */
function schemaToTemplate(schema: Record<string, unknown>): unknown {
  const type = schema['type'] as string | undefined;

  if (type === 'OBJECT' || type === 'object') {
    const props = (schema['properties'] as Record<string, unknown>) || {};
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(props)) {
      result[key] = schemaToTemplate(val as Record<string, unknown>);
    }
    return result;
  }

  if (type === 'ARRAY' || type === 'array') {
    const items = schema['items'] as Record<string, unknown> | undefined;
    return items ? [schemaToTemplate(items)] : [];
  }

  if (type === 'STRING' || type === 'string') return 'string value';
  if (type === 'NUMBER' || type === 'number') return 0;
  if (type === 'BOOLEAN' || type === 'boolean') return false;
  if (type === 'INTEGER' || type === 'integer') return 0;

  return null;
}

@Injectable()
export class MistralProvider implements AIProviderInterface {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MISTRAL_API_KEY') || '';
    this.model = this.configService.get<string>('MISTRAL_MODEL', 'mistral-large-latest');
    this.apiUrl = this.configService.get<string>(
      'MISTRAL_API_URL',
      'https://api.mistral.ai/v1/chat/completions'
    );
  }

  getName(): AIProvider {
    return AIProvider.MISTRAL;
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    const isLocal =
      this.apiUrl.includes('localhost') || this.apiUrl.includes('127.0.0.1');

    if (!this.apiKey && !isLocal) {
      throw new Error('MISTRAL_API_KEY is not defined');
    }

    const messages = [];

    let systemContent = request.systemInstruction || '';

    if (request.schema) {
      const template = schemaToTemplate(request.schema as Record<string, unknown>);
      const schemaInstruction = [
        '\n\n## OUTPUT FORMAT',
        'You MUST respond with ONLY a valid JSON object — no markdown fences, no explanation, no extra text.',
        'The JSON object MUST use EXACTLY these keys and value types (replace placeholder values with real content):',
        '```json',
        JSON.stringify(template, null, 2),
        '```',
        'Do NOT add any keys that are not listed above. Do NOT wrap the object in another key.',
      ].join('\n');

      systemContent = systemContent
        ? `${systemContent}${schemaInstruction}`
        : schemaInstruction;
    }

    if (systemContent) {
      messages.push({ role: 'system', content: systemContent });
    }

    let userContent = request.prompt;
    if (request.context) {
      userContent = `${request.context}\n\nTask: ${request.prompt}`;
    }

    messages.push({ role: 'user', content: userContent });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey || 'local'}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          response_format: request.schema ? { type: 'json_object' } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mistral API error: ${response.status} ${error}`);
      }

      const result = (await response.json()) as ChatCompletionResponse;
      const text = result.choices[0].message.content;
      let data: Record<string, unknown> = { text };

      if (request.schema) {
        try {
          // Strip markdown fences if the model wraps JSON in ```json ... ```
          const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
          data = JSON.parse(cleaned) as Record<string, unknown>;
        } catch {
          console.error('[Mistral] JSON Parse Error:', text);
          throw new InternalServerErrorException('Mistral model produced malformed JSON');
        }
      }

      return {
        text,
        data: data as Record<string, unknown>,
        rawResponse: result,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Mistral] API Call failed:', msg);
      throw new InternalServerErrorException(`Mistral generation failed: ${msg}`);
    }
  }
}
