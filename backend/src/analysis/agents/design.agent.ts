import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';
import { AIProviderFactory } from '../providers/ai-provider.factory';

@Injectable()
export class DesignAgent extends BaseAgent {
  private readonly agentLogger = new Logger(DesignAgent.name);

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
    _systemInstruction?: string,
    _images?: string[]
  ): Promise<AgentGenerationResponse> {
    try {
      const brandPrompt = `
        CONTEXT: ${context}
        USER INPUT: ${prompt}
        
        TASK: Create a comprehensive brand identity concept for this business.
        
        Generate a JSON response with:
        1. "imagePrompt": A detailed prompt that could be used to generate a logo (describe the visual style, colors, symbols)
        2. "rationale": Explain the design choices and how they connect to the brand values
        3. "palette": An array of 5 hex color codes that form a cohesive brand palette
        4. "logoImage": Set this to an empty string (image generation requires additional setup)
        
        Make the design modern, professional, and appropriate for the business type.
      `;

      this.agentLogger.log('[DesignAgent] Generating brand identity via provider factory');

      const response = await this.providerFactory.completeWithFallback({
        prompt: brandPrompt,
        context: '',
        schema: schema || undefined,
        systemInstruction: 'You are a creative director and brand strategist specializing in startup branding.',
      });

      const data = {
        logoImage: response.data?.logoImage || '',
        imagePrompt: response.data?.imagePrompt || 'A modern, minimalist logo concept',
        rationale: response.data?.rationale || 'Brand identity designed to convey professionalism and innovation',
        palette: response.data?.palette || ['#6366F1', '#818CF8', '#A5B4FC', '#1E293B', '#F8FAFC'],
      };

      return {
        text: 'Brand identity concept generated successfully.',
        data,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to generate brand identity: ${message}`);
    }
  }
}
