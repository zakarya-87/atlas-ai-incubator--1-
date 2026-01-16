
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { InternalServerErrorException } from '@nestjs/common';
import { AiAgent, AgentGenerationResponse } from '../interfaces/ai-agent.interface';

export abstract class BaseAgent implements AiAgent {
  protected aiClient: GoogleGenerativeAI | undefined;

  constructor(protected configService: ConfigService) {
    // Lazy initialization to prevent startup crash
  }

  abstract generate(
    prompt: string,
    context: string,
    schema?: any,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse>;

  protected getClient(): GoogleGenerativeAI {
    if (this.aiClient) return this.aiClient;

    const apiKey = this.configService.get<string>('API_KEY');
    if (!apiKey) {
      console.error("CRITICAL: API_KEY is missing from backend environment variables.");
      throw new Error('API_KEY is not defined. Please check backend/.env');
    }

    this.aiClient = new GoogleGenerativeAI(apiKey);
    return this.aiClient;
  }

  protected async executeGeminiCall(
    modelName: string,
    fullPrompt: string,
    schema: any,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse> {
    try {
      const client = this.getClient();

      // Construct content parts
      // For text-only: pass string directly
      // For multimodal (with images): pass array of parts
      let contents: any;

      if (images && images.length > 0) {
        const parts: any[] = [{ text: fullPrompt }];
        images.forEach(imgBase64 => {
          // Assume JPEG for simplicity, or we could pass mimeType in DTO. 
          // Stripping header if present (data:image/png;base64,)
          const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          });
        });
        // For multimodal content, pass the parts array directly
        contents = parts;
      } else {
        // For text-only content, pass as string
        contents = fullPrompt;
      }

      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || "You are the ATLAS AI Engine. Provide actionable, structured business analysis.",
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        }
      });

      console.log(`[Gemini] Starting generation with model: ${modelName}`);
      const startTime = Date.now();

      // Add timeout for Gemini API call (90 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout after 90 seconds')), 90000);
      });

      const response = await Promise.race([
        model.generateContent(contents),
        timeoutPromise
      ]) as any;

      const elapsed = Date.now() - startTime;
      console.log(`[Gemini] Generation completed in ${elapsed}ms`);

      const resultText = response.response.text();
      let resultData;

      try {
        resultData = JSON.parse(resultText);
      } catch (e) {
        console.error("JSON Parse Error. Raw output:", resultText);
        throw new InternalServerErrorException("The AI model produced malformed JSON. Please try again.");
      }

      return {
        text: resultText,
        data: resultData
      };
    } catch (error: any) {
      console.error(`AI Agent Error [Model: ${modelName}]:`, error);

      // Provide more specific error messages
      if (error.message?.includes('timeout')) {
        throw new InternalServerErrorException('AI analysis is taking too long. Please try a shorter description or try again later.');
      }
      if (error.message?.includes('API_KEY') || error.message?.includes('401')) {
        throw new InternalServerErrorException('API configuration error. Please check your Gemini API key.');
      }
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new InternalServerErrorException('API rate limit exceeded. Please wait a moment and try again.');
      }

      throw new InternalServerErrorException(`AI Generation failed: ${error.message}`);
    }
  }
}
