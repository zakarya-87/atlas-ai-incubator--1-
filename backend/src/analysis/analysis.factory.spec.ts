
import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisAgentFactory } from './analysis.factory';
import { DefaultAgent } from './agents/default.agent';
import { ResearchAgent } from './agents/research.agent';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('AnalysisAgentFactory', () => {
  let factory: AnalysisAgentFactory;
  let defaultAgent: DefaultAgent;
  let researchAgent: ResearchAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisAgentFactory,
        { provide: DefaultAgent, useValue: { name: 'DefaultAgent' } },
        { provide: ResearchAgent, useValue: { name: 'ResearchAgent' } },
      ],
    }).compile();

    factory = module.get<AnalysisAgentFactory>(AnalysisAgentFactory);
    defaultAgent = module.get<DefaultAgent>(DefaultAgent);
    researchAgent = module.get<ResearchAgent>(ResearchAgent);
  });

  it('should return ResearchAgent for marketAnalysis module', () => {
    const agent = factory.getAgent('marketAnalysis', 'overview');
    expect(agent).toBe(researchAgent);
  });

  it('should return ResearchAgent for specific research tools', () => {
    expect(factory.getAgent('strategy', 'competitorAnalysis')).toBe(researchAgent);
    expect(factory.getAgent('strategy', 'marketResearch')).toBe(researchAgent);
    expect(factory.getAgent('funding', 'investorDatabase')).toBe(researchAgent);
  });

  it('should return DefaultAgent for strategy tools', () => {
    expect(factory.getAgent('strategy', 'swot')).toBe(defaultAgent);
    expect(factory.getAgent('strategy', 'pestel')).toBe(defaultAgent);
    expect(factory.getAgent('finance', 'budgetGenerator')).toBe(defaultAgent);
  });
});
