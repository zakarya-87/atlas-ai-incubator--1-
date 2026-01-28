import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProviderInterface,
  AIProvider,
  AIProviderRequest,
  AIProviderResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GrokProvider implements AIProviderInterface {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl = 'https://api.x.ai/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROK_API_KEY');
    this.model = this.configService.get<string>('GROK_MODEL', 'grok-beta');
  }

  getName(): AIProvider {
    return AIProvider.GROK;
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (!this.apiKey) {
      throw new Error('GROK_API_KEY is not defined');
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
          stream: false,
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Grok API error: ${response.status} ${error}`);
      }

      const result = await response.json();
      const text = result.choices[0].message.content;
      let data = text;

      if (request.schema) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('[Grok] JSON Parse Error:', text);
          throw new InternalServerErrorException('Grok model produced malformed JSON');
        }
      }

      return {
        text,
        data,
        rawResponse: result,
      };
    } catch (error) {
      console.error('[Grok] API Call failed:', error.message);
      throw new InternalServerErrorException(`Grok generation failed: ${error.message}`);
    }
  }
}
