import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ResearchAgent } from './research.agent';

describe('ResearchAgent', () => {
  let agent: ResearchAgent;
  let configService: any;
  let mockGeminiClient: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'API_KEY') return 'test-api-key';
        return undefined;
      }),
    };

    mockGeminiClient = {
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              competitors: ['Competitor A', 'Competitor B'],
              pricing: { avg: 50, range: '25-100' },
              market_trends: ['Trend 1', 'Trend 2'],
            }),
          },
        }),
      }),
    };

    jest.mock('@google/generative-ai');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchAgent,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    agent = module.get<ResearchAgent>(ResearchAgent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should execute two-pass research (search + structure)', async () => {
      const prompt = 'Analyze the CRM market';
      const context = 'For a B2B SaaS startup';
      const schema = {
        type: 'object',
        properties: {
          competitors: { type: 'array' },
          pricing: { type: 'object' },
        },
      };

      const result = await agent.generate(prompt, context, schema);

      expect(result).toBeDefined();
      expect(result.data).toHaveProperty('competitors');
      expect(result.data).toHaveProperty('pricing');
    });

    it('should enable googleSearch tool for market research', async () => {
      const getModelSpy = jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({ searchResults: [] }),
          },
        }),
      });

      mockGeminiClient.getGenerativeModel = getModelSpy;

      await agent.generate('Market research', '');

      // First call should have googleSearch tool
      expect(getModelSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.arrayContaining([
            expect.objectContaining({
              googleSearch: {},
            }),
          ]),
        })
      );
    });

    it('should use low temperature for factual accuracy', async () => {
      const getModelSpy = jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({}),
          },
        }),
      });

      mockGeminiClient.getGenerativeModel = getModelSpy;

      await agent.generate('test', '');

      expect(getModelSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          generationConfig: expect.objectContaining({
            temperature: 0.3, // Low for factual accuracy
          }),
        })
      );
    });

    it('should handle image processing in research', async () => {
      const generateSpy = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            imageAnalysis: 'Competitor screenshot shows pricing model',
          }),
        },
      });

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: generateSpy,
      });

      const imageBase64 = 'data:image/png;base64,test';
      await agent.generate('Analyze competitor', '', {}, undefined, [imageBase64]);

      expect(generateSpy).toHaveBeenCalled();
    });

    it('should parse real-time search results', async () => {
      const searchResults = {
        searchResults: [
          {
            title: 'Competitor A Pricing',
            content: 'Starting at $50/month',
          },
          {
            title: 'Market Report 2025',
            content: 'CRM market growing 15% YoY',
          },
        ],
      };

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(searchResults),
          },
        }),
      });

      const result = await agent.generate('Research CRM market', '');

      expect(result.data).toHaveProperty('searchResults');
      expect(result.data.searchResults.length).toBeGreaterThan(0);
    });

    it('should include context in search prompt', async () => {
      const generateSpy = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({ ok: true }),
        },
      });

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: generateSpy,
      });

      const context = 'We target mid-market B2B companies';
      const prompt = 'Analyze competitors';

      await agent.generate(prompt, context);

      const callArgs = generateSpy.mock.calls[0][0];
      const promptText = callArgs[0].parts[0].text;

      expect(promptText).toContain(prompt);
      expect(promptText).toContain(context);
    });

    it('should instruct model not to hallucinate numbers', async () => {
      const generateSpy = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({ data: 'only from search results' }),
        },
      });

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: generateSpy,
      });

      await agent.generate('test', '');

      const callArgs = generateSpy.mock.calls[0][0];
      const promptText = callArgs[0].parts[0].text;

      expect(promptText).toContain("Do not halluncinate numbers");
    });

    it('should handle missing search results gracefully', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({ error: 'No search results found' }),
          },
        }),
      });

      const result = await agent.generate('Niche market research', '');

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should process competitor screenshots for feature analysis', async () => {
      const generateSpy = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            features: ['Feature A', 'Feature B'],
            pricing: 'visible in screenshot',
          }),
        },
      });

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: generateSpy,
      });

      const screenshotBase64 = 'data:image/png;base64,screenshot';
      await agent.generate(
        'Analyze competitor UI',
        'SaaS dashboard',
        {},
        undefined,
        [screenshotBase64]
      );

      expect(generateSpy).toHaveBeenCalled();
      const callArgs = generateSpy.mock.calls[0][0];
      expect(callArgs[0].parts.length).toBeGreaterThan(1); // Text + image
    });

    it('should use gemini-2.5-pro model for research', async () => {
      const getModelSpy = jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({}),
          },
        }),
      });

      mockGeminiClient.getGenerativeModel = getModelSpy;

      await agent.generate('test', '');

      expect(getModelSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-pro',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(
          new Error('API rate limit exceeded')
        ),
      });

      await expect(agent.generate('test', '')).rejects.toThrow(
        'API rate limit exceeded'
      );
    });

    it('should handle timeout scenarios', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockImplementation(
          () => new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 100)
          )
        ),
      });

      await expect(agent.generate('test', '')).rejects.toThrow();
    });
  });

  describe('performance', () => {
    it('should complete research within reasonable time', async () => {
      const generateSpy = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({ quick: true }),
        },
      });

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: generateSpy,
      });

      const start = Date.now();
      await agent.generate('test', '');
      const duration = Date.now() - start;

      // Should not timeout (mock is fast, but real API might be slow)
      expect(duration).toBeLessThan(5000);
    });
  });
});