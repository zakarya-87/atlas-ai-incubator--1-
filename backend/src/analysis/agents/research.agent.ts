import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';
import { AIProviderFactory } from '../providers/ai-provider.factory';

@Injectable()
export class ResearchAgent extends BaseAgent {
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
    // --- PASS 1: GATHER INTELLIGENCE (Google Search + Vision) ---
    // We cannot use responseSchema with googleSearch, so we get raw text first.
    const searchPrompt = `
      ${systemInstruction}
      
      TASK: Conduct comprehensive market research based on the user's input.
      USER INPUT: "${prompt}"
      CONTEXT: ${context}
      
      REQUIREMENTS:
      1. Use Google Search to find REAL-TIME data, competitors, pricing, and trends.
      2. Do not halluncinate numbers. Use the search results.
      ${images && images.length > 0 ? '3. ANALYZE THE PROVIDED IMAGE. It is a screenshot of a competitor or relevant market material. Extract key features, design choices, and pricing if visible.' : ''}
      4. Provide a detailed, text-based summary of your findings.
    `;

    // Prepare content parts (Text + Optional Images)
    // For generateContent: pass parts array directly, not wrapped with role
    if (images && images.length > 0) {
      const parts: Record<string, unknown>[] = [{ text: searchPrompt }];
      images.forEach((imgBase64) => {
        const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
      });
      // Pass parts array directly for multimodal content
    }

    const searchResponse = await this.executeGeminiCall(
      '',
      searchPrompt,
      null, // No schema for research pass
      systemInstruction || 'You are the ATLAS AI Engine. Conduct comprehensive market research.',
      images,
      [{ googleSearch: {} } as Record<string, unknown>] // Pass tools for Grounding
    );

    const rawText = searchResponse.text;

    // Extract citations (Grounding Metadata) from rawResponse safely
    const rawResponse = searchResponse.rawResponse as Record<string, unknown>;
    const candidates = (rawResponse?.response as Record<string, unknown>)
      ?.candidates as Record<string, unknown>[];
    const groundingMetadata = candidates?.[0]?.groundingMetadata as Record<
      string,
      unknown
    >;
    const groundingChunks =
      (groundingMetadata?.groundingChunks as Record<string, unknown>[]) || [];

    const sources = groundingChunks
      .map((chunk) => {
        const web = chunk.web as Record<string, string>;
        return web?.uri ? { title: web.title, url: web.uri } : null;
      })
      .filter(
        (source): source is { title: string; url: string } => source !== null
      );

    // --- PASS 2: STRUCTURE DATA (JSON Formatting) ---
    // Now we feed the research notes into a schema-enforced call to get the UI-ready JSON.

    const formattingPrompt = `
      You are a Data Structuring Specialist. 
      
      SOURCE MATERIAL:
      ${rawText}
      
      TASK:
      Convert the detailed research notes above into the following JSON structure.
      Ensure all fields are populated based on the research provided.
      If specific data points are missing in the notes, make reasonable strategic estimates based on the context, but prioritize the researched facts.
    `;

    const formattedResponse = await this.executeGeminiCall(
      '',
      formattingPrompt,
      schema || null,
      'You are a strict JSON formatting engine.'
    );

    // --- MERGE & RETURN ---
    // Inject the sources into the result data so the frontend can display them
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
