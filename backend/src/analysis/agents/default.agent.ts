import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';
import { AIProviderFactory } from '../providers/ai-provider.factory';

@Injectable()
export class DefaultAgent extends BaseAgent {
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
    const fullPrompt = `${prompt}\n${context}`;

    return this.executeGeminiCall(
      '',
      fullPrompt,
      schema || null,
      systemInstruction,
      images
    );
  }
}
