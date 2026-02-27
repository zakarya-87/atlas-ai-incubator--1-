import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PromptFactoryService {
  constructor(private configService: ConfigService) {}

  /**
   * Wraps a raw user prompt with initiative context and BABOK standards.
   */
  wrapPrompt(prompt: string, context: Record<string, any> = {}): string {
    const { venture, sector, requirements } = context;

    return `
# CONTEXT: BABOK® ANALYTICAL FRAMEWORK
As an elite Business Analyst / Management Consultant, apply the following context to your analysis.

${venture ? `## INITIATIVE CONTEXT: ${venture.name}\n${venture.description || ''}` : ''}
${sector ? `## SECTOR COMPLIANCE: ${sector}` : ''}

# TASK
${prompt}

# REQUIREMENTS
1. Adhere to BABOK® v3 standards for all definitions and outputs.
2. Use professional, data-driven terminology.
3. ${requirements || 'Ensure the output is structured and actionable.'}

# OUTPUT FORMAT
Strictly follow the requested format. If JSON is requested, ensure it is valid and follows the provided schema.
`;
  }

  /**
   * Generates a "Double-Pass" validation prompt.
   */
  createValidationPrompt(draft: string): string {
    return `
Analyze the following drafting logic for a business model or diagram.
Self-correct any ID reference gaps, logical inconsistencies, or compliance violations.

DRAFT CONTENT:
${draft}

Provide the refined, final version of this logic.
`;
  }
}
