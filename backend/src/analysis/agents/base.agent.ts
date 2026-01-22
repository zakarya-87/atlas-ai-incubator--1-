
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
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const client = this.getClient();

        let contents: any;

        if (images && images.length > 0) {
          const parts: any[] = [{ text: fullPrompt }];
          images.forEach(imgBase64 => {
            const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
            parts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
              }
            });
          });
          contents = parts;
        } else {
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

        console.log(`[Gemini] Starting generation with model: ${modelName} (attempt ${attempt + 1}/${maxRetries})`);
        const startTime = Date.now();

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
        lastError = error;

        const isRateLimit = error.message?.includes('429') ||
                           error.message?.includes('quota') ||
                           error.message?.includes('rate limit') ||
                           error.message?.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit && attempt < maxRetries - 1) {
          const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`[Gemini] Rate limit hit, retrying in ${Math.round(delayMs)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        console.error(`[Gemini] AI Agent Error [Model: ${modelName}, Attempt ${attempt + 1}/${maxRetries}]:`, error);

        if (error.message?.includes('timeout')) {
          throw new InternalServerErrorException('AI analysis is taking too long. Please try a shorter description or try again later.');
        }
        if (error.message?.includes('API_KEY') || error.message?.includes('401')) {
          throw new InternalServerErrorException('API configuration error. Please check your Gemini API key.');
        }
        if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
          throw new InternalServerErrorException('API rate limit exceeded. Please wait a moment and try again.');
        }

        throw new InternalServerErrorException(`AI Generation failed: ${error.message}`);
      }
    }

    throw lastError;
  }
}
