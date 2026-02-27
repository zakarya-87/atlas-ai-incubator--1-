import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Part, RequestOptions, Schema } from '@google/generative-ai';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
  AgentGenerationResponse,
  AiAgent,
} from '../interfaces/ai-agent.interface';
import { AIProviderFactory } from '../providers/ai-provider.factory';
import { AIProvider } from '../interfaces/ai-provider.interface';

export abstract class BaseAgent implements AiAgent {
  protected readonly logger = new Logger(BaseAgent.name);
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
    schema?: Record<string, unknown>,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse>;

  protected getClient(): GoogleGenerativeAI {
    if (this.aiClient) return this.aiClient;

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error(
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
    schema: Record<string, unknown> | null,
    systemInstruction?: string,
    images?: string[],
    tools?: Record<string, unknown>[]
  ): Promise<AgentGenerationResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    const requestOptions = this.getGeminiRequestOptions();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.attemptGeminiCall(
          modelName,
          fullPrompt,
          schema,
          systemInstruction,
          images,
          tools,
          requestOptions,
          attempt,
          maxRetries
        );
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.isRateLimit(lastError.message) && attempt < maxRetries - 1) {
          await this.handleRateLimitRetry(attempt, maxRetries);
          continue;
        }

        const fallbackResult = await this.handleCallError(
          lastError,
          modelName,
          attempt,
          maxRetries,
          fullPrompt,
          schema,
          systemInstruction,
          images
        );

        if (fallbackResult) return fallbackResult;
        throw lastError;
      }
    }

    throw lastError || new Error('Unknown AI generation error');
  }

  private getGeminiRequestOptions(): RequestOptions {
    const baseUrl = this.configService.get<string>('GEMINI_API_BASE_URL');
    const apiVersion = this.configService.get<string>('GEMINI_API_VERSION');
    const requestOptions: RequestOptions = { timeout: 300000 };

    if (baseUrl) requestOptions.baseUrl = baseUrl;
    if (apiVersion) requestOptions.apiVersion = apiVersion;
    return requestOptions;
  }

  private async attemptGeminiCall(
    modelName: string,
    fullPrompt: string,
    schema: Record<string, unknown> | null,
    systemInstruction: string | undefined,
    images: string[] | undefined,
    tools: Record<string, unknown>[] | undefined,
    requestOptions: RequestOptions,
    attempt: number,
    maxRetries: number
  ): Promise<AgentGenerationResponse> {
    const client = this.getClient();
    const contents = this.prepareContent(fullPrompt, images);
    const selectedModel =
      modelName ||
      this.configService.get<string>('GEMINI_MODEL', 'gemini-2.0-flash-lite');

    const model = client.getGenerativeModel(
      {
        model: selectedModel,
        systemInstruction:
          systemInstruction ||
          'You are the ATLAS AI Engine. Provide actionable, structured business analysis.',
        tools: (tools as unknown) as Record<string, unknown>[],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: (schema as unknown) as Schema,
        },
      },
      requestOptions
    );

    this.logger.log(
      `[Gemini] Starting generation with model: ${selectedModel} (attempt ${attempt + 1}/${maxRetries})`
    );

    const response = await this.raceWithTimeout(
      model.generateContent(contents),
      300000
    );

    const resultText = response.response.text();

    if (!resultText) {
      throw new InternalServerErrorException('AI model returned empty response');
    }

    try {
      const resultData = JSON.parse(resultText) as Record<string, unknown>;
      return { text: resultText, data: resultData, rawResponse: (response as unknown) as Record<string, unknown> };
    } catch {
      this.logger.error('JSON Parse Error. Raw output:', resultText);
      throw new InternalServerErrorException(
        'The AI model produced malformed JSON. Please try again.'
      );
    }
  }

  private prepareContent(
    prompt: string,
    images?: string[]
  ): string | (string | Part)[] {
    if (!images || images.length === 0) return prompt;

    const parts: (string | Part)[] = [{ text: prompt }];
    images.forEach((imgBase64) => {
      const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    });
    return parts;
  }

  private async raceWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error(`Gemini API timeout after ${timeoutMs / 1000} seconds`)),
        timeoutMs
      );
      // Allow Node.js to exit even if this timer is still pending (important for test teardown)
      timeoutHandle.unref();
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutHandle);
    });
  }

  private isRateLimit(message: string): boolean {
    return (
      message.includes('429') ||
      message.includes('quota') ||
      message.includes('rate limit') ||
      message.includes('RESOURCE_EXHAUSTED')
    );
  }

  private async handleRateLimitRetry(
    attempt: number,
    maxRetries: number
  ): Promise<void> {
    const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
    this.logger.warn(
      `[Gemini] Rate limit hit (429), retrying in ${Math.round(delayMs)}ms... (Attempt ${attempt + 1}/${maxRetries})`
    );
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, delayMs);
      timer.unref();
    });
  }

  private async handleCallError(
    error: Error,
    modelName: string,
    attempt: number,
    maxRetries: number,
    prompt: string,
    schema: Record<string, unknown> | null,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse | null> {
    const message = error.message;
    this.logger.error(
      `[Gemini] AI Agent Error [Model: ${modelName || 'default'}, Attempt ${attempt + 1}/${maxRetries}]: ${message}`
    );

    if (message.includes('timeout')) {
      throw new InternalServerErrorException(
        'AI analysis is taking too long. Please try a shorter description or try again later.'
      );
    }

    if (message.includes('GEMINI_API_KEY') || message.includes('401')) {
      throw new InternalServerErrorException(
        'API configuration error. Please check your Gemini API key.'
      );
    }

    if (this.isRateLimit(message)) {
      this.logger.warn(`[Gemini] Rate limit exhausted after ${maxRetries} attempts.`);
      return this.attemptFallback(prompt, schema, systemInstruction, images);
    }

    // Throw for non-rate-limit errors (like invalid model name, safety filters, etc.)
    throw error;
  }

  private async attemptFallback(
    prompt: string,
    schema: Record<string, unknown> | null,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse | null> {
    if (!this.providerFactory) return null;

    const availableProviders = this.providerFactory.getAvailableProviders();
    const fallbacks = availableProviders.filter((p) => p !== AIProvider.GEMINI);

    for (const fbProvider of fallbacks) {
      this.logger.log(`[Fallback] Attempting ${fbProvider} due to Gemini rate limits...`);
      try {
        const provider = this.providerFactory.getProvider(fbProvider);
        if (!provider) continue;

        const response = await provider.complete({
          prompt,
          context: '',
          schema: schema || undefined,
          systemInstruction:
            systemInstruction ||
            'You are the ATLAS AI Engine. Provide actionable, structured business analysis.',
          images,
        });

        return { text: response.text, data: response.data };
      } catch (fbError: unknown) {
        const msg = fbError instanceof Error ? fbError.message : String(fbError);
        this.logger.error(`[Fallback] ${fbProvider} also failed: ${msg}`);
      }
    }

    throw new InternalServerErrorException(
      'API rate limit exceeded. We attempted multiple retries and fallbacks. Please wait 60 seconds and try again.'
    );
  }
}
