import { Test, TestingModule } from '@nestjs/testing';
import { DesignAgent } from './design.agent';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../providers/ai-provider.factory';

describe('DesignAgent', () => {
  let agent: DesignAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignAgent,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'test-api-key';
              if (key === 'DEFAULT_AI_PROVIDER') return 'gemini';
              return null;
            }),
          },
        },
        {
          provide: AIProviderFactory,
          useValue: {
            getAvailableProviders: jest.fn().mockReturnValue(['gemini']),
            complete: jest.fn().mockResolvedValue({ text: 'mock response', data: {} }),
            getActiveProvider: jest.fn().mockReturnValue('gemini'),
            isProviderAvailable: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    agent = module.get<DesignAgent>(DesignAgent);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  // Add more tests here to mock the generate method and other functionalities
  describe('generate', () => {
    it('should generate brand identity concept successfully', async () => {
      const mockResponse = {
        text: 'Generated brand concepts',
        data: {
          imagePrompt: 'A sleek tech logo',
          rationale: 'Blue represents trust',
          palette: ['#0000FF'],
          logoImage: '',
        },
      };

      const executeSpy = jest.spyOn(agent as any, 'executeGeminiCall').mockResolvedValue(mockResponse);

      const result = await agent.generate('Tech Brand', 'Modern startup');

      expect(executeSpy).toHaveBeenCalledWith(
        '',
        expect.stringContaining('Create a comprehensive brand identity'),
        null,
        'You are a creative director and brand strategist specializing in startup branding.'
      );

      expect(result.data).toEqual(mockResponse.data);
      expect(result.text).toContain('Brand identity concept generated successfully');
    });

    it('should provide default values when AI response is incomplete', async () => {
      const mockIncompleteResponse = {
        text: 'Some text',
        data: {}, // Missing fields
      };

      jest.spyOn(agent as any, 'executeGeminiCall').mockResolvedValue(mockIncompleteResponse);

      const result = await agent.generate('Test', 'Context');

      expect(result.data.imagePrompt).toBe('A modern, minimalist logo concept');
      expect(result.data.palette).toHaveLength(5);
      expect(result.data.rationale).toContain('Brand identity designed');
    });

    it('should throw InternalServerErrorException on API failure', async () => {
      jest.spyOn(agent as any, 'executeGeminiCall').mockRejectedValue(new Error('AI Offline'));

      await expect(agent.generate('Test', 'Context')).rejects.toThrow(
        'Failed to generate brand identity: AI Offline'
      );
    });
  });
});
