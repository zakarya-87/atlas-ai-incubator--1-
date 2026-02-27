import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from './ai-provider.factory';
import { MistralProvider } from './mistral.provider';
import { GrokProvider } from './grok.provider';
import { OpenAIProvider } from './openai.provider';
import { AIProvider, AIProviderRequest } from '../interfaces/ai-provider.interface';
import { InternalServerErrorException } from '@nestjs/common';

describe('AIProviderFactory', () => {
  let factory: AIProviderFactory;
  let configService: ConfigService;
  let mistralProvider: MistralProvider;
  let grokProvider: GrokProvider;
  let openAIProvider: OpenAIProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIProviderFactory,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'DEFAULT_AI_PROVIDER') return 'mistral';
              return undefined;
            }),
          },
        },
        {
          provide: MistralProvider,
          useValue: {
            getName: jest.fn().mockReturnValue(AIProvider.MISTRAL),
            complete: jest.fn(),
          },
        },
        {
          provide: GrokProvider,
          useValue: {
            getName: jest.fn().mockReturnValue(AIProvider.GROK),
            complete: jest.fn(),
          },
        },
        {
          provide: OpenAIProvider,
          useValue: {
            getName: jest.fn().mockReturnValue(AIProvider.OPENAI),
            complete: jest.fn(),
          },
        },
      ],
    }).compile();

    factory = module.get<AIProviderFactory>(AIProviderFactory);
    configService = module.get<ConfigService>(ConfigService);
    mistralProvider = module.get<MistralProvider>(MistralProvider);
    grokProvider = module.get<GrokProvider>(GrokProvider);
    openAIProvider = module.get<OpenAIProvider>(OpenAIProvider);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('getProvider', () => {
    it('should return Mistral provider', () => {
      const provider = factory.getProvider(AIProvider.MISTRAL);
      expect(provider).toBe(mistralProvider);
    });

    it('should return Grok provider', () => {
      const provider = factory.getProvider(AIProvider.GROK);
      expect(provider).toBe(grokProvider);
    });

    it('should return OpenAI provider', () => {
      const provider = factory.getProvider(AIProvider.OPENAI);
      expect(provider).toBe(openAIProvider);
    });

    it('should return undefined for unregistered provider', () => {
      // Test with a non-existent provider
      const provider = factory.getProvider('gemini' as AIProvider);
      expect(provider).toBeUndefined();
    });
  });

  describe('getAvailableProviders', () => {
    it('should return all registered providers', () => {
      const providers = factory.getAvailableProviders();
      expect(providers).toContain(AIProvider.MISTRAL);
      expect(providers).toContain(AIProvider.GROK);
      expect(providers).toContain(AIProvider.OPENAI);
      expect(providers.length).toBe(3);
    });
  });

  describe('complete', () => {
    const mockRequest: AIProviderRequest = {
      prompt: 'Test prompt',
      context: 'Test context',
      schema: { type: 'object' },
      systemInstruction: 'You are a test assistant',
    };

    it('should complete request with specified provider', async () => {
      const mockResponse = {
        text: 'Test response',
        data: { result: 'test' },
      };
      jest.spyOn(mistralProvider, 'complete').mockResolvedValue(mockResponse);

      const result = await factory.complete(mockRequest, AIProvider.MISTRAL);

      expect(mistralProvider.complete).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should use default provider from config when not specified', async () => {
      const mockResponse = {
        text: 'Test response',
        data: { result: 'test' },
      };
      jest.spyOn(mistralProvider, 'complete').mockResolvedValue(mockResponse);

      await factory.complete(mockRequest);

      expect(configService.get).toHaveBeenCalledWith('DEFAULT_AI_PROVIDER');
      expect(mistralProvider.complete).toHaveBeenCalledWith(mockRequest);
    });

    it('should fallback to MISTRAL when no default is configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      const mockResponse = {
        text: 'Test response',
        data: { result: 'test' },
      };
      jest.spyOn(mistralProvider, 'complete').mockResolvedValue(mockResponse);

      await factory.complete(mockRequest);

      expect(mistralProvider.complete).toHaveBeenCalledWith(mockRequest);
    });

    it('should throw error for non-existent provider', async () => {
      await expect(
        factory.complete(mockRequest, 'gemini' as AIProvider)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should propagate provider errors', async () => {
      const error = new Error('Provider error');
      jest.spyOn(mistralProvider, 'complete').mockRejectedValue(error);

      await expect(
        factory.complete(mockRequest, AIProvider.MISTRAL)
      ).rejects.toThrow(error);
    });

    it('should complete with Grok provider', async () => {
      const mockResponse = {
        text: 'Grok response',
        data: { result: 'grok' },
      };
      jest.spyOn(grokProvider, 'complete').mockResolvedValue(mockResponse);

      const result = await factory.complete(mockRequest, AIProvider.GROK);

      expect(grokProvider.complete).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should complete with OpenAI provider', async () => {
      const mockResponse = {
        text: 'OpenAI response',
        data: { result: 'openai' },
      };
      jest.spyOn(openAIProvider, 'complete').mockResolvedValue(mockResponse);

      const result = await factory.complete(mockRequest, AIProvider.OPENAI);

      expect(openAIProvider.complete).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should handle request without schema', async () => {
      const requestWithoutSchema: AIProviderRequest = {
        prompt: 'Simple prompt',
        context: '',
      };
      const mockResponse = {
        text: 'Simple response',
        data: { text: 'Simple response' },
      };
      jest.spyOn(mistralProvider, 'complete').mockResolvedValue(mockResponse);

      await factory.complete(requestWithoutSchema, AIProvider.MISTRAL);

      expect(mistralProvider.complete).toHaveBeenCalledWith(requestWithoutSchema);
    });

    it('should handle request with images', async () => {
      const requestWithImages: AIProviderRequest = {
        prompt: 'Analyze image',
        context: '',
        images: ['base64image1', 'base64image2'],
      };
      const mockResponse = {
        text: 'Image analysis',
        data: { objects: ['cat', 'dog'] },
      };
      jest.spyOn(mistralProvider, 'complete').mockResolvedValue(mockResponse);

      await factory.complete(requestWithImages, AIProvider.MISTRAL);

      expect(mistralProvider.complete).toHaveBeenCalledWith(requestWithImages);
    });
  });

  describe('provider registration', () => {
    it('should have all three providers registered on initialization', () => {
      const providers = factory.getAvailableProviders();
      expect(providers).toHaveLength(3);
      expect(providers).toEqual(
        expect.arrayContaining([AIProvider.MISTRAL, AIProvider.GROK, AIProvider.OPENAI])
      );
    });
  });
});
