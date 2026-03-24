import { Test, TestingModule } from '@nestjs/testing';
import { ResearchAgent } from './research.agent';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../providers/ai-provider.factory';

describe('ResearchAgent', () => {
  let agent: ResearchAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchAgent,
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

    agent = module.get<ResearchAgent>(ResearchAgent);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  // Add more tests here to mock the generate method and other functionalities
  describe('generate', () => {
    it('should perform two-pass logic: research then formatting', async () => {
      const executeSpy = jest.spyOn(agent as any, 'executeGeminiCall');

      // Mock Pass 1: Research
      executeSpy.mockResolvedValueOnce({
        text: 'Detailed research notes',
        data: {},
        rawResponse: {
          response: {
            candidates: [
              {
                groundingMetadata: {
                  groundingChunks: [
                    { web: { title: 'Source 1', uri: 'https://example.com/1' } },
                    { web: { title: 'Source 2', uri: 'https://example.com/2' } },
                  ],
                },
              },
            ],
          },
        },
      });

      // Mock Pass 2: Formatting
      executeSpy.mockResolvedValueOnce({
        text: '{"marketSize": "1B"}',
        data: { marketSize: '1B' },
      });

      const result = await agent.generate('Test Prompt', 'Test Context', { type: 'object' });

      // Verify two calls were made
      expect(executeSpy).toHaveBeenCalledTimes(2);

      // Verify Pass 1 arguments (Tools for Grounding should be present)
      expect(executeSpy).toHaveBeenNthCalledWith(
        1,
        '',
        expect.stringContaining('Conduct comprehensive market research'),
        null,
        expect.any(String),
        undefined,
        expect.arrayContaining([{ googleSearch: {} }])
      );

      // Verify Pass 2 arguments (Schema should be passed)
      expect(executeSpy).toHaveBeenNthCalledWith(
        2,
        '',
        expect.stringContaining('Convert the research notes above into a JSON object that EXACTLY matches the schema'),
        { type: 'object' },
        'You are a strict JSON formatting engine.'
      );

      // Verify final merged response
      expect(result.data).toEqual({
        marketSize: '1B',
        _sources: [
          { title: 'Source 1', url: 'https://example.com/1' },
          { title: 'Source 2', url: 'https://example.com/2' },
        ],
      });
    });

    it('should handle images by stripping data URL prefixes', async () => {
      const executeSpy = jest.spyOn(agent as any, 'executeGeminiCall').mockResolvedValue({
        text: 'Result',
        data: {},
        rawResponse: {},
      });

      const images = ['data:image/png;base64,imagedata123'];
      await agent.generate('Prompt', 'Context', {}, 'Instruction', images);

      // Verify Pass 1 was called with images
      expect(executeSpy).toHaveBeenCalledWith(
        '',
        expect.any(String),
        null,
        'Instruction',
        images,
        expect.anything()
      );
    });

    it('should handle missing grounding metadata gracefully', async () => {
      jest.spyOn(agent as any, 'executeGeminiCall')
        .mockResolvedValueOnce({ text: 'Research', data: {}, rawResponse: {} })
        .mockResolvedValueOnce({ text: 'Formatted', data: { ok: true } });

      const result = await agent.generate('Prompt', 'Context');
      expect(result.data._sources).toEqual([]);
    });
  });
});
