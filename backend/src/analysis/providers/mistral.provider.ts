import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIProviderInterface,
  AIProviderRequest,
  AIProviderResponse,
  ChatCompletionResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class MistralProvider implements AIProviderInterface {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl = 'https://api.mistral.ai/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MISTRAL_API_KEY') || '';
    this.model = this.configService.get<string>('MISTRAL_MODEL', 'mistral-large-latest');
  }

  getName(): AIProvider {
    return AIProvider.MISTRAL;
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (!this.apiKey) {
      throw new Error('MISTRAL_API_KEY is not defined');
    }

    const messages = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
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
          Authorization: `Bearer ${this.apiKey}`,
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
          data = JSON.parse(text) as Record<string, unknown>;
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
