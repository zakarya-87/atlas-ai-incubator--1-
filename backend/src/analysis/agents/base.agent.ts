import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { InternalServerErrorException } from '@nestjs/common';
import {
  AiAgent,
  AgentGenerationResponse,
} from '../interfaces/ai-agent.interface';
import { AIProviderFactory } from '../providers/ai-provider.factory';
import { AIProvider } from '../interfaces/ai-provider.interface';

export abstract class BaseAgent implements AiAgent {
  protected aiClient: GoogleGenerativeAI | undefined;
  protected providerFactory?: AIProviderFactory;

  constructor(
    protected configService: ConfigService,
    providerFactory?: AIProviderFactory
  ) {
    this.providerFactory = providerFactory;
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

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.error(
        'CRITICAL: GEMINI_API_KEY is missing from backend environment variables.'
      );
      throw new Error(
        'GEMINI_API_KEY is not defined. Please check backend/.env'
      );
    }

    this.aiClient = new GoogleGenerativeAI(apiKey);
    return this.aiClient;
  }

  protected async executeGeminiCall(
    modelName: string,
    fullPrompt: string,
    schema: any,
    systemInstruction?: string,
    images?: string[],
    tools?: any[]
  ): Promise<AgentGenerationResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const client = this.getClient();

        let contents: any;

        if (images && images.length > 0) {
          const parts: any[] = [{ text: fullPrompt }];
          images.forEach((imgBase64) => {
            const cleanBase64 = imgBase64.replace(
              /^data:image\/\w+;base64,/,
              ''
            );
            parts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64,
              },
            });
          });
          contents = parts;
        } else {
          contents = fullPrompt;
        }

        const selectedModel = modelName || this.configService.get<string>(
          'GEMINI_MODEL',
          'gemini-2.0-flash-lite'
        );

        const model = client.getGenerativeModel({
          model: selectedModel,
          systemInstruction:
            systemInstruction ||
            'You are the ATLAS AI Engine. Provide actionable, structured business analysis.',
          tools: tools,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });

        console.log(
          `[Gemini] Starting generation with model: ${selectedModel} (attempt ${attempt + 1}/${maxRetries})`
        );
        const startTime = Date.now();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error('Gemini API timeout after 120 seconds')),
            120000
          );
        });

        const response = (await Promise.race([
          model.generateContent(contents),
          timeoutPromise,
        ])) as any;

        const elapsed = Date.now() - startTime;
        console.log(`[Gemini] Generation completed in ${elapsed}ms`);

        const resultText = response.response.text();
        let resultData;

        try {
          resultData = JSON.parse(resultText);
        } catch (e) {
          console.error('JSON Parse Error. Raw output:', resultText);
          throw new InternalServerErrorException(
            'The AI model produced malformed JSON. Please try again.'
          );
        }

        return {
          text: resultText,
          data: resultData,
          rawResponse: response,
        };
      } catch (error: any) {
        lastError = error;

        const isRateLimit =
          error.message?.includes('429') ||
          error.message?.includes('quota') ||
          error.message?.includes('rate limit') ||
          error.message?.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit && attempt < maxRetries - 1) {
          // Faster randomized exponential backoff: (2^attempt * 1000ms) + jitter
          const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.warn(
            `[Gemini] Rate limit hit (429), retrying in ${Math.round(delayMs)}ms... (Attempt ${attempt + 1}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        console.error(
          `[Gemini] AI Agent Error [Model: ${modelName || 'default'}, Attempt ${attempt + 1}/${maxRetries}]:`,
          error.message || error
        );

        if (error.message?.includes('timeout')) {
          throw new InternalServerErrorException(
            'AI analysis is taking too long. Please try a shorter description or try again later.'
          );
        }
        if (
          error.message?.includes('GEMINI_API_KEY') ||
          error.message?.includes('401')
        ) {
          throw new InternalServerErrorException(
            'API configuration error. Please check your Gemini API key.'
          );
        }

        if (isRateLimit) {
          console.warn(`[Gemini] Rate limit exhausted after ${maxRetries} attempts.`);

          if (this.providerFactory) {
            const availableProviders = this.providerFactory.getAvailableProviders();
            const fallbackProviders = availableProviders.filter(p => p !== AIProvider.GEMINI);

            for (const fallbackProvider of fallbackProviders) {
              console.log(`[Fallback] Attempting ${fallbackProvider} due to Gemini rate limits...`);
              try {
                const fallbackResponse = await this.providerFactory.complete({
                  prompt: fullPrompt,
                  context: '',
                  schema,
                  systemInstruction: systemInstruction || 'You are the ATLAS AI Engine. Provide actionable, structured business analysis.',
                  images,
                }, fallbackProvider);

                return {
                  text: fallbackResponse.text,
                  data: fallbackResponse.data,
                };
              } catch (fallbackError: any) {
                console.error(`[Fallback] ${fallbackProvider} also failed:`, fallbackError.message);
                // Continue to next provider in loop
              }
            }
          }

          throw new InternalServerErrorException(
            'API rate limit exceeded. We attempted multiple retries and fallbacks. Please wait 60 seconds and try again.'
          );
        }

        throw new InternalServerErrorException(
          `AI Generation failed: ${error.message}`
        );
      }
    }

    throw lastError;
  }
}
