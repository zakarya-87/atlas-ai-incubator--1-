import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';
import { AIProviderFactory } from '../providers/ai-provider.factory';
import { AIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class DefaultAgent extends BaseAgent {
  private readonly agentLogger = new Logger(DefaultAgent.name);

  constructor(
    configService: ConfigService,
    protected readonly providerFactory: AIProviderFactory
  ) {
    super(configService, providerFactory);
  }

  async generate(
    prompt: string,
    context: string,
    schema?: Record<string, unknown>,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse> {
    const fullPrompt = context ? `${prompt}\n${context}` : prompt;
    const defaultProvider = this.configService.get<string>('DEFAULT_AI_PROVIDER') as AIProvider | undefined;

    this.agentLogger.log(`[DefaultAgent] Starting generation via provider: ${defaultProvider || 'mistral'}`);

    const response = await this.providerFactory.completeWithFallback(
      {
        prompt: fullPrompt,
        context: '',
        schema,
        systemInstruction:
          systemInstruction ||
          'You are the ATLAS AI Engine. Provide actionable, structured business analysis.',
        images,
      },
      defaultProvider
    );

    return { text: response.text, data: response.data };
  }
}
