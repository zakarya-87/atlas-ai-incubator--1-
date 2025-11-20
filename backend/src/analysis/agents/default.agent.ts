
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
    
    // Default to Flash model for speed and efficiency on standard tasks
    return this.executeGeminiCall(
      'gemini-2.5-flash',
      fullPrompt,
      schema,
      systemInstruction,
      images
    );
  }
}
