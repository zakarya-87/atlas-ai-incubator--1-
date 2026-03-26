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
  private readonly openaiApiKey: string;
  private readonly openaiModel: string;
  private readonly azureApiKey: string;
  private readonly azureEndpoint: string;
  private readonly azureDeployment: string;
  private readonly azureApiVersion: string;

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.openaiModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
    this.azureApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY') || '';
    this.azureEndpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT') || '';
    this.azureDeployment = this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT') || '';
    this.azureApiVersion = this.configService.get<string>('AZURE_OPENAI_API_VERSION', '2024-04-01-preview');
  }

  getName(): AIProvider {
    return AIProvider.OPENAI;
  }

  isAvailable(): boolean {
    return !!(this.openaiApiKey || (this.azureApiKey && this.azureEndpoint && this.azureDeployment));
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (this.openaiApiKey) {
      return this.completeWithStandardOpenAI(request);
    }
    if (this.azureApiKey && this.azureEndpoint && this.azureDeployment) {
      return this.completeWithAzureOpenAI(request);
    }
    throw new Error('OpenAI configuration is missing. Set OPENAI_API_KEY or Azure OpenAI credentials.');
  }

  private buildMessages(request: AIProviderRequest): { role: string; content: string }[] {
    const messages: { role: string; content: string }[] = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }
    const userContent = request.context
      ? `${request.context}\n\nTask: ${request.prompt}`
      : request.prompt;
    messages.push({ role: 'user', content: userContent });
    return messages;
  }

  private parseResponse(text: string, hasSchema: boolean): Record<string, unknown> {
    if (!hasSchema) return { text };
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      console.error('[OpenAI] JSON Parse Error:', text);
      throw new InternalServerErrorException('OpenAI model produced malformed JSON');
    }
  }

  private async completeWithStandardOpenAI(request: AIProviderRequest): Promise<AIProviderResponse> {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const messages = this.buildMessages(request);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages,
        response_format: request.schema ? { type: 'json_object' } : undefined,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const result = (await response.json()) as ChatCompletionResponse;
    const text = result.choices[0].message.content;
    const data = this.parseResponse(text, !!request.schema);
    return { text, data, rawResponse: result };
  }

  private async completeWithAzureOpenAI(request: AIProviderRequest): Promise<AIProviderResponse> {
    const apiUrl = `${this.azureEndpoint}/openai/deployments/${this.azureDeployment}/chat/completions?api-version=${this.azureApiVersion}`;
    const messages = this.buildMessages(request);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.azureApiKey,
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
    const data = this.parseResponse(text, !!request.schema);
    return { text, data, rawResponse: result };
  }
}
