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
    // Build a schema-aware prompt to help enforce structure
    const schemaDescription = schema ? JSON.stringify(schema, null, 2) : null;
    
    let fullPrompt = `${prompt}\n${context}`;
    
    if (schemaDescription) {
      fullPrompt = `
CRITICAL INSTRUCTION: Your response MUST be a JSON object that EXACTLY matches this schema:
${schemaDescription}

Do NOT add wrapper keys like "analysis_result" or "response". 
The top-level keys of your JSON must be EXACTLY the keys defined in the schema above.

USER REQUEST:
${prompt}

CONTEXT:
${context}

OUTPUT: Return ONLY the JSON object matching the schema above.
`;
    }

    return this.executeGeminiCall(
      '',
      fullPrompt,
      schema || null,
      systemInstruction,
      images
    );
  }
}
