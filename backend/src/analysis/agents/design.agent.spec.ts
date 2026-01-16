import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DesignAgent } from './design.agent';

declare const describe: any;
declare const beforeEach: any;
declare const afterEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

describe('DesignAgent', () => {
  let agent: DesignAgent;
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
              imageUrl: 'https://example.com/generated-image.jpg',
              prompt: 'Professional tech startup logo',
              style: 'modern minimalist',
            }),
          },
        }),
      }),
    };

    jest.mock('@google/generative-ai');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignAgent,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    agent = module.get<DesignAgent>(DesignAgent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should generate design content with image generation', async () => {
      const prompt = 'Create a modern tech startup logo';
      const schema = {
        type: 'object',
        properties: {
          imageUrl: { type: 'string' },
          style: { type: 'string' },
        },
      };

      const result = await agent.generate(prompt, '', schema);

      expect(result).toBeDefined();
      expect(result.data).toHaveProperty('imageUrl');
      expect(result.data).toHaveProperty('style');
    });

    it('should use Imagen 3 model for image generation', async () => {
      const getModelSpy = jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({}),
          },
        }),
      });

      mockGeminiClient.getGenerativeModel = getModelSpy;

      await agent.generate('Generate logo', '');

      expect(getModelSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'imagen-3.0-generate-002',
        })
      );
    });

    it('should structure design generation with detailed prompts', async () => {
      const generateSpy = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            designs: [
              { concept: 'Modern minimalist', description: 'Clean lines' },
              { concept: 'Bold geometric', description: 'Angular shapes' },
            ],
          }),
        },
      });

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: generateSpy,
      });

      await agent.generate('Brand identity concept', 'SaaS startup');

      expect(generateSpy).toHaveBeenCalled();
    });

    it('should handle brand guidelines in context', async () => {
      const generateSpy = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({ brandGuidelinesApplied: true }),
        },
      });

      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: generateSpy,
      });

      const context = 'Tech-forward, trustworthy, innovative brand';
      await agent.generate('Create brand identity', context);

      const callArgs = generateSpy.mock.calls[0][0];
      const promptText = callArgs[0].parts[0].text;

      expect(promptText).toContain(context);
    });

    it('should generate multiple design variations', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              variations: [
                { id: 'v1', style: 'Minimalist', colors: ['blue', 'white'] },
                { id: 'v2', style: 'Bold', colors: ['red', 'black'] },
                { id: 'v3', style: 'Playful', colors: ['purple', 'yellow'] },
              ],
            }),
          },
        }),
      });

      const result = await agent.generate('Logo variations', '');

      expect(result.data).toHaveProperty('variations');
      expect(result.data.variations.length).toBe(3);
    });

    it('should handle color palette generation', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              primaryColors: ['#0066FF', '#00D4FF'],
              secondaryColors: ['#F0F4FF', '#E6F2FF'],
              accentColors: ['#FF6B6B', '#FFD93D'],
            }),
          },
        }),
      });

      const result = await agent.generate('Generate color palette', 'Tech brand');

      expect(result.data).toHaveProperty('primaryColors');
      expect(result.data).toHaveProperty('secondaryColors');
      expect(result.data).toHaveProperty('accentColors');
    });

    it('should generate typography recommendations', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              headings: 'Poppins Bold, 32px',
              body: 'Inter Regular, 16px',
              accent: 'Montserrat Medium, 14px',
            }),
          },
        }),
      });

      const result = await agent.generate('Design system', '');

      expect(result.data).toHaveProperty('headings');
      expect(result.data).toHaveProperty('body');
      expect(result.data).toHaveProperty('accent');
    });

    it('should provide design usage guidelines', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              guidelines: {
                logoMinSize: '40px',
                logoMargin: '20px clear space',
                backgroundRequirements: 'Solid color or light gradient',
              },
            }),
          },
        }),
      });

      const result = await agent.generate('Brand guidelines', '');

      expect(result.data).toHaveProperty('guidelines');
      expect(result.data.guidelines).toHaveProperty('logoMinSize');
    });

    it('should handle accessibility considerations', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              accessibility: {
                contrastRatio: 'WCAG AAA compliant',
                colorBlindnessFriendly: true,
                readabilityScore: 'High',
              },
            }),
          },
        }),
      });

      const result = await agent.generate('Accessible design', 'Fintech app');

      expect(result.data).toHaveProperty('accessibility');
      expect(result.data.accessibility.colorBlindnessFriendly).toBe(true);
    });

    it('should export design specifications', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              exportFormats: ['SVG', 'PNG', 'PDF'],
              specifications: {
                width: '1200px',
                height: '630px',
                resolution: '72dpi',
              },
            }),
          },
        }),
      });

      const result = await agent.generate('Export spec', '');

      expect(result.data).toHaveProperty('exportFormats');
      expect(result.data).toHaveProperty('specifications');
    });

    it('should use default system instruction for design', async () => {
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
          systemInstruction: expect.any(String),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle image generation failures', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(
          new Error('Image generation failed')
        ),
      });

      await expect(agent.generate('test', '')).rejects.toThrow(
        'Image generation failed'
      );
    });

    it('should handle rate limiting', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(
          new Error('Rate limit exceeded for imagen-3.0-generate-002')
        ),
      });

      await expect(agent.generate('test', '')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('should handle invalid design prompts', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({ error: 'Invalid design parameters' }),
          },
        }),
      });

      const result = await agent.generate('', '');

      expect(result).toBeDefined();
    });
  });

  describe('design tool capabilities', () => {
    it('should generate responsive design variations', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              responsive: {
                mobile: { layout: 'Single column', breakpoint: '375px' },
                tablet: { layout: 'Two column', breakpoint: '768px' },
                desktop: { layout: 'Three column', breakpoint: '1200px' },
              },
            }),
          },
        }),
      });

      const result = await agent.generate('Responsive layout', '');

      expect(result.data).toHaveProperty('responsive');
    });

    it('should provide icon set recommendations', async () => {
      mockGeminiClient.getGenerativeModel.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              iconSets: ['Feather', 'Heroicons', 'Material Icons'],
              usage: 'Use Feather for consistent 24x24px icons',
            }),
          },
        }),
      });

      const result = await agent.generate('Icon library', '');

      expect(result.data).toHaveProperty('iconSets');
    });
  });
});
