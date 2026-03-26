import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';
import { AIProviderFactory } from '../providers/ai-provider.factory';

@Injectable()
export class ResearchAgent extends BaseAgent {
  private readonly agentLogger = new Logger(ResearchAgent.name);

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
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    const sysInstruction = systemInstruction || 'You are the ATLAS AI Engine. Conduct comprehensive market research.';

    // --- PASS 1: GATHER INTELLIGENCE ---
    // Prefer Gemini with Google Search grounding if key is available.
    // Otherwise, use the provider factory (no live web search but still useful).
    const searchPrompt = `
      ${sysInstruction}
      
      TASK: Conduct comprehensive market research based on the user's input.
      USER INPUT: "${prompt}"
      CONTEXT: ${context}
      
      REQUIREMENTS:
      1. Find real competitors, pricing, and trends for this market.
      2. Do not hallucinate numbers — base estimates on plausible market data.
      ${images && images.length > 0 ? '3. ANALYZE THE PROVIDED IMAGE. It is a screenshot of a competitor or relevant market material. Extract key features, design choices, and pricing if visible.' : ''}
      4. Provide a detailed, text-based summary of your findings.
    `;

    let rawText = '';
    let sources: { title: string; url: string }[] = [];

    if (geminiKey && geminiKey.length > 10 && !geminiKey.startsWith('placeholder')) {
      // Use Gemini with Google Search grounding
      this.agentLogger.log('[ResearchAgent] Using Gemini with Google Search grounding');
      try {
        const searchResponse = await this.executeGeminiCall(
          '',
          searchPrompt,
          null,
          sysInstruction,
          images,
          [{ googleSearch: {} } as Record<string, unknown>]
        );

        rawText = searchResponse.text;

        const rawResponse = searchResponse.rawResponse as Record<string, unknown>;
        const candidates = (rawResponse?.response as Record<string, unknown>)?.candidates as Record<string, unknown>[];
        const groundingMetadata = candidates?.[0]?.groundingMetadata as Record<string, unknown>;
        const groundingChunks = (groundingMetadata?.groundingChunks as Record<string, unknown>[]) || [];

        sources = groundingChunks
          .map((chunk) => {
            const web = chunk.web as Record<string, string>;
            return web?.uri ? { title: web.title, url: web.uri } : null;
          })
          .filter((s): s is { title: string; url: string } => s !== null);
      } catch (err) {
        this.agentLogger.warn(`[ResearchAgent] Gemini grounding failed, falling back: ${err instanceof Error ? err.message : err}`);
        rawText = '';
      }
    }

    // If Gemini grounding wasn't used or failed, gather research via the provider factory
    if (!rawText) {
      this.agentLogger.log('[ResearchAgent] Using provider factory for research pass');
      const response = await this.providerFactory.completeWithFallback({
        prompt: searchPrompt,
        context: '',
        systemInstruction: sysInstruction,
      });
      rawText = response.text;
    }

    // --- PASS 2: STRUCTURE DATA (JSON Formatting) ---
    const formattingPrompt = `
      You are a Data Structuring Specialist. 
      
      SOURCE MATERIAL:
      ${rawText}
      
      TASK:
      Convert the detailed research notes above into the following JSON structure.
      Ensure all fields are populated based on the research provided.
      If specific data points are missing, make reasonable strategic estimates based on the context.
    `;

    this.agentLogger.log('[ResearchAgent] Structuring research into JSON via provider factory');
    const formattedResponse = await this.providerFactory.completeWithFallback({
      prompt: formattingPrompt,
      context: '',
      schema: schema || undefined,
      systemInstruction: 'You are a strict JSON formatting engine.',
    });

    const finalData = {
      ...formattedResponse.data,
      _sources: sources,
    };

    return {
      text: formattedResponse.text,
      data: finalData,
    };
  }
}
