
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
      let contents: any = fullPrompt;

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
        contents = [{ role: 'user', parts: parts }];
      }

      const response = await client.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          systemInstruction: systemInstruction || "You are the ATLAS AI Engine. Provide actionable, structured business analysis.",
        },
      });

      const resultText = response.text || '{}';
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
      throw new InternalServerErrorException(`AI Generation failed: ${error.message}`);
    }
  }
}
