
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';
import { Tool } from '@google/generative-ai';

@Injectable()
export class ResearchAgent extends BaseAgent {
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
    let searchContents: any;

    if (images && images.length > 0) {
      const parts: any[] = [{ text: searchPrompt }];
      images.forEach(imgBase64 => {
        const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        });
      });
      // Pass parts array directly for multimodal content
      searchContents = parts;
    } else {
      // For text-only, pass as string
      searchContents = searchPrompt;
    }

    // Use getClient() for lazy loading
    const model = this.getClient().getGenerativeModel({
      model: 'gemini-2.5-pro',
      tools: [{ googleSearch: {} } as any], // Enable Grounding
      generationConfig: {
        temperature: 0.3, // Low temperature for factual accuracy
      },
    });

    const searchResponse = await model.generateContent(searchContents);

    const rawText = searchResponse.response.text();

    // Extract citations (Grounding Metadata)
    const groundingChunks = searchResponse.response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web?.uri ? { title: chunk.web.title, url: chunk.web.uri } : null)
      .filter((source: any) => source !== null);

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
      'gemini-2.5-pro',
      formattingPrompt,
      schema,
      "You are a strict JSON formatting engine."
    );

    // --- MERGE & RETURN ---
    // Inject the sources into the result data so the frontend can display them
    const finalData = {
      ...formattedResponse.data,
      _sources: sources
    };

    return {
      text: formattedResponse.text,
      data: finalData
    };
  }
}