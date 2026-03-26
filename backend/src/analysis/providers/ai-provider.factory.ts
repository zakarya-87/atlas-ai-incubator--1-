import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AIProviderFactory.name);
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

  /**
   * Returns an ordered list of providers to try, starting with the configured
   * default and falling back through the rest.
   */
  private getFallbackChain(primary?: AIProvider): AIProvider[] {
    const defaultProvider = (
      primary ||
      (this.configService.get<string>('DEFAULT_AI_PROVIDER') as AIProvider) ||
      AIProvider.MISTRAL
    );

    const allProviders: AIProvider[] = [
      AIProvider.MISTRAL,
      AIProvider.OPENAI,
      AIProvider.GROK,
    ];

    return [
      defaultProvider,
      ...allProviders.filter((p) => p !== defaultProvider),
    ];
  }

  /**
   * Attempts the request with the primary provider, then automatically falls
   * back through the remaining providers if any error occurs.
   */
  async completeWithFallback(
    request: AIProviderRequest,
    primary?: AIProvider
  ): Promise<AIProviderResponse> {
    const chain = this.getFallbackChain(primary);
    const errors: string[] = [];

    for (const providerName of chain) {
      const provider = this.getProvider(providerName);
      if (!provider) continue;

      try {
        this.logger.log(`[AIProviderFactory] Trying provider: ${providerName}`);
        const result = await provider.complete(request);
        if (providerName !== chain[0]) {
          this.logger.warn(
            `[AIProviderFactory] Succeeded with fallback provider: ${providerName}`
          );
        }
        return result;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `[AIProviderFactory] Provider ${providerName} failed: ${msg}`
        );
        errors.push(`${providerName}: ${msg}`);
      }
    }

    throw new InternalServerErrorException(
      `All AI providers failed. Errors: ${errors.join(' | ')}`
    );
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[AIProviderFactory] Error with ${selectedProviderName}:`, msg);
      throw error;
    }
  }
}
