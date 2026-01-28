import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MistralProvider } from './mistral.provider';
import { GrokProvider } from './grok.provider';
import { OpenAIProvider } from './openai.provider';
import {
  AIProvider,
  AIProviderInterface,
  AIProviderRequest,
  AIProviderResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class AIProviderFactory {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();

  constructor(
    private configService: ConfigService,
    private mistralProvider: MistralProvider,
    private grokProvider: GrokProvider,
    private openAIProvider: OpenAIProvider
  ) {
    this.providers.set(AIProvider.MISTRAL, this.mistralProvider);
    this.providers.set(AIProvider.GROK, this.grokProvider);
    this.providers.set(AIProvider.OPENAI, this.openAIProvider);
  }

  getProvider(name: AIProvider): AIProviderInterface | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  async complete(
    request: AIProviderRequest,
    providerName?: AIProvider
  ): Promise<AIProviderResponse> {
    const selectedProviderName =
      providerName ||
      (this.configService.get<string>('DEFAULT_AI_PROVIDER') as AIProvider) ||
      AIProvider.MISTRAL;

    const provider = this.getProvider(selectedProviderName);

    if (!provider) {
      throw new InternalServerErrorException(
        `AI Provider ${selectedProviderName} not found or not implemented`
      );
    }

    try {
      return await provider.complete(request);
    } catch (error) {
      console.error(`[AIProviderFactory] Error with ${selectedProviderName}:`, error.message);
      throw error;
    }
  }
}
