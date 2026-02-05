import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from './openai.provider';
import { AIProvider, AIProviderRequest } from '../interfaces/ai-provider.interface';
import { InternalServerErrorException } from '@nestjs/common';

// Mock global fetch
global.fetch = jest.fn();

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                'AZURE_OPENAI_API_KEY': 'test-azure-api-key',
                'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                'AZURE_OPENAI_DEPLOYMENT': 'test-deployment',
                'AZURE_OPENAI_API_VERSION': '2024-04-01-preview',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<OpenAIProvider>(OpenAIProvider);
    configService = module.get<ConfigService>(ConfigService);
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return correct provider name', () => {
    expect(provider.getName()).toBe(AIProvider.OPENAI);
  });

  describe('constructor', () => {
    it('should use default API version when not configured', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
                const config: Record<string, string> = {
                  'AZURE_OPENAI_API_KEY': 'test-key',
                  'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                  'AZURE_OPENAI_DEPLOYMENT': 'test-deployment',
                };
                return config[key] || defaultValue;
              }),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<OpenAIProvider>(OpenAIProvider);
      expect(testProvider).toBeDefined();
    });

    it('should throw error when API key is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string) => {
                const config: Record<string, string | undefined> = {
                  'AZURE_OPENAI_API_KEY': undefined,
                  'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                  'AZURE_OPENAI_DEPLOYMENT': 'test-deployment',
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<OpenAIProvider>(OpenAIProvider);
      
      await expect(
        testProvider.complete({ prompt: 'test', context: '' })
      ).rejects.toThrow('Azure OpenAI configuration is incomplete');
    });

    it('should throw error when endpoint is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string) => {
                const config: Record<string, string | undefined> = {
                  'AZURE_OPENAI_API_KEY': 'test-key',
                  'AZURE_OPENAI_ENDPOINT': undefined,
                  'AZURE_OPENAI_DEPLOYMENT': 'test-deployment',
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<OpenAIProvider>(OpenAIProvider);
      
      await expect(
        testProvider.complete({ prompt: 'test', context: '' })
      ).rejects.toThrow('Azure OpenAI configuration is incomplete');
    });

    it('should throw error when deployment is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string) => {
                const config: Record<string, string | undefined> = {
                  'AZURE_OPENAI_API_KEY': 'test-key',
                  'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                  'AZURE_OPENAI_DEPLOYMENT': undefined,
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<OpenAIProvider>(OpenAIProvider);
      
      await expect(
        testProvider.complete({ prompt: 'test', context: '' })
      ).rejects.toThrow('Azure OpenAI configuration is incomplete');
    });
  });

  describe('complete', () => {
    const mockRequest: AIProviderRequest = {
      prompt: 'Test prompt',
      context: 'Test context',
      schema: { type: 'object' },
      systemInstruction: 'You are a test assistant',
    };

    it('should successfully complete a request', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'test' }),
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await provider.complete(mockRequest);

      expect(fetch).toHaveBeenCalledWith(
        'https://test.openai.azure.com/openai/deployments/test-deployment/chat/completions?api-version=2024-04-01-preview',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'api-key': 'test-azure-api-key',
          }),
          body: expect.any(String),
        })
      );

      expect(result).toEqual({
        text: JSON.stringify({ result: 'test' }),
        data: { result: 'test' },
        rawResponse: mockResponse,
      });
    });

    it('should include system instruction in messages when provided', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'test' }),
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await provider.complete(mockRequest);

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0]).toEqual({
        role: 'system',
        content: 'You are a test assistant',
      });
      expect(body.messages[1].role).toBe('user');
    });

    it('should combine context and prompt in user message', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'test' }),
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await provider.complete(mockRequest);

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.messages[1].content).toBe('Test context\n\nTask: Test prompt');
    });

    it('should request JSON format when schema is provided', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'test' }),
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await provider.complete(mockRequest);

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.response_format).toEqual({ type: 'json_object' });
    });

    it('should not include response_format when schema is not provided', async () => {
      const requestWithoutSchema: AIProviderRequest = {
        prompt: 'Simple prompt',
        context: '',
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Simple response',
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await provider.complete(requestWithoutSchema);

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.response_format).toBeUndefined();
    });

    it('should set temperature to 0', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test response',
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await provider.complete({ prompt: 'test', context: '' });

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.temperature).toBe(0);
    });

    it('should throw error on API failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValueOnce('Error details'),
      });

      await expect(provider.complete(mockRequest)).rejects.toThrow(
        InternalServerErrorException
      );
    });

    it('should throw error on network failure', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(provider.complete(mockRequest)).rejects.toThrow(
        InternalServerErrorException
      );
    });

    it('should throw error when response contains malformed JSON with schema', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Not valid JSON',
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await expect(provider.complete(mockRequest)).rejects.toThrow(
        InternalServerErrorException
      );
    });

    it('should handle request without system instruction', async () => {
      const requestWithoutSystem: AIProviderRequest = {
        prompt: 'Test prompt',
        context: 'Test context',
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test response',
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await provider.complete(requestWithoutSystem);

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
    });
  });
});
