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
export class OpenAIProvider implements AIProviderInterface {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly deployment: string;
  private readonly apiVersion: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY') || '';
    this.endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT') || '';
    this.deployment = this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT') || '';
    this.apiVersion = this.configService.get<string>('AZURE_OPENAI_API_VERSION', '2024-04-01-preview');
  }

  getName(): AIProvider {
    return AIProvider.OPENAI;
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (!this.apiKey || !this.endpoint || !this.deployment) {
      throw new Error('Azure OpenAI configuration is incomplete (API key, endpoint, or deployment missing)');
    }

    const apiUrl = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

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
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages,
          response_format: request.schema ? { type: 'json_object' } : undefined,
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Azure OpenAI API error: ${response.status} ${error}`);
      }

      const result = (await response.json()) as ChatCompletionResponse;
      const text = result.choices[0].message.content;
      let data: Record<string, unknown> = { text };

      if (request.schema) {
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          console.error('[Azure OpenAI] JSON Parse Error:', text);
          throw new InternalServerErrorException('Azure OpenAI model produced malformed JSON');
        }
      }

      return {
        text,
        data,
        rawResponse: result,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Azure OpenAI] API Call failed:', msg);
      throw new InternalServerErrorException(`Azure OpenAI generation failed: ${msg}`);
    }
  }
}
