
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';

@Injectable()
export class DefaultAgent extends BaseAgent {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async generate(
    prompt: string,
    context: string,
    schema?: any,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse> {
    const fullPrompt = `${prompt}\n${context}`;

    // Default to Pro model for advanced reasoning and comprehensive analysis
    return this.executeGeminiCall(
      'gemini-2.5-pro',
      fullPrompt,
      schema,
      systemInstruction,
      images
    );
  }
}