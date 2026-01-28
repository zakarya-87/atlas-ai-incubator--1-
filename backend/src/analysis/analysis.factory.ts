import { Injectable } from '@nestjs/common';
import { DefaultAgent } from './agents/default.agent';
import { ResearchAgent } from './agents/research.agent';
import { DesignAgent } from './agents/design.agent';
import { AiAgent } from './interfaces/ai-agent.interface';

@Injectable()
export class AnalysisAgentFactory {
  constructor(
    private readonly defaultAgent: DefaultAgent,
    private readonly researchAgent: ResearchAgent,
    private readonly designAgent: DesignAgent
  ) {}

  getAgent(module: string, tool: string): AiAgent {
    // Visual Tools
    if (tool === 'brandIdentity') {
      return this.designAgent;
    }

    // Dispatch ResearchAgent for tools that require live data
    if (module === 'marketAnalysis') {
      return this.researchAgent;
    }

    const researchHeavyTools = [
      'competitorAnalysis',
      'marketResearch',
      'problemValidation', // Needs market size data
      'investorDatabase', // Needs real investor info
      'expansionStrategy', // Needs market trend info
    ];

    if (researchHeavyTools.includes(tool)) {
      return this.researchAgent;
    }

    // Default for internal strategic logic (SWOT, Roadmap, etc.)
    return this.defaultAgent;
  }
}
