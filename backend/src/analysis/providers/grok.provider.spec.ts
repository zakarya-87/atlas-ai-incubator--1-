import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GrokProvider } from './grok.provider';
import { AIProvider, AIProviderRequest } from '../interfaces/ai-provider.interface';
import { InternalServerErrorException } from '@nestjs/common';

// Mock global fetch
global.fetch = jest.fn();

describe('GrokProvider', () => {
  let provider: GrokProvider;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrokProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                'GROK_API_KEY': 'test-grok-api-key',
                'GROK_MODEL': 'grok-beta',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<GrokProvider>(GrokProvider);
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
    expect(provider.getName()).toBe(AIProvider.GROK);
  });

  describe('constructor', () => {
    it('should use default model when GROK_MODEL is not configured', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GrokProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
                if (key === 'GROK_API_KEY') return 'test-api-key';
                return defaultValue;
              }),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<GrokProvider>(GrokProvider);
      expect(testProvider).toBeDefined();
    });

    it('should throw error when API key is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GrokProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(undefined),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<GrokProvider>(GrokProvider);
      
      await expect(
        testProvider.complete({ prompt: 'test', context: '' })
      ).rejects.toThrow('GROK_API_KEY is not defined');
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
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-grok-api-key',
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

    it('should disable streaming', async () => {
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
      
      expect(body.stream).toBe(false);
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

    it('should use configured model in request', async () => {
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
      
      expect(body.model).toBe('grok-beta');
    });

    it('should throw error on API failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValueOnce('Internal Server Error'),
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
      expect(body.messages[0].content).toBe('Test context\n\nTask: Test prompt');
    });
  });
});
