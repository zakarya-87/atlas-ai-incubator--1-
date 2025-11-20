
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base.agent';
import { AgentGenerationResponse } from '../interfaces/ai-agent.interface';

@Injectable()
export class DesignAgent extends BaseAgent {
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
    try {
      // 1. Refine the prompt for Image Generation using a text model first
      const refinementPrompt = `
        CONTEXT: ${context}
        USER INPUT: ${prompt}
        
        TASK: Create a highly detailed image generation prompt for a modern, professional startup logo based on the context above.
        
        REQUIREMENTS:
        - Describe the visual style (e.g., minimalist, geometric, abstract).
        - Specify colors and mood.
        - Do not include text in the logo description (generative models struggle with text).
        - Output ONLY the raw prompt string, nothing else.
      `;

      const refinementResponse = await this.executeGeminiCall(
        'gemini-2.5-flash',
        refinementPrompt,
        undefined,
        "You are a creative director."
      );

      const imagePrompt = refinementResponse.text;

      // 2. Generate Image using Imagen
      const client = this.getClient();
      const imageResponse = await client.models.generateImages({
        model: 'imagen-3.0-generate-001', 
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          outputMimeType: 'image/jpeg',
        }
      });

      if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
        throw new Error("No images generated.");
      }

      const base64Image = imageResponse.generatedImages[0].image.imageBytes;
      
      // 3. Generate Color Palette & Rationale (Text)
      const palettePrompt = `
        Based on this logo concept: "${imagePrompt}"
        Generate a JSON object with a 'rationale' (string) explaining the design choice 
        and a 'palette' (array of hex codes) that fits this brand identity.
      `;
      
      const paletteResponse = await this.executeGeminiCall(
          'gemini-2.5-flash',
          palettePrompt,
          schema,
          "You are a brand strategist."
      );

      return {
        text: "Logo generated successfully.",
        data: {
            ...paletteResponse.data,
            logoImage: `data:image/jpeg;base64,${base64Image}`,
            imagePrompt: imagePrompt
        }
      };

    } catch (error: any) {
      console.error("Design Agent Error:", error);
      throw new InternalServerErrorException(`Failed to generate brand identity: ${error.message}`);
    }
  }
}
