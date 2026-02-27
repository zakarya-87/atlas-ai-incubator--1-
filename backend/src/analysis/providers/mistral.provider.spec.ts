import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MistralProvider } from './mistral.provider';
import { AIProvider, AIProviderRequest } from '../interfaces/ai-provider.interface';
import { InternalServerErrorException } from '@nestjs/common';

// Mock global fetch
global.fetch = jest.fn();

describe('MistralProvider', () => {
  let provider: MistralProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MistralProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                'MISTRAL_API_KEY': 'test-mistral-api-key',
                'MISTRAL_MODEL': 'mistral-large-latest',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<MistralProvider>(MistralProvider);
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return correct provider name', () => {
    expect(provider.getName()).toBe(AIProvider.MISTRAL);
  });

  describe('constructor', () => {
    it('should use default model when MISTRAL_MODEL is not configured', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MistralProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
                if (key === 'MISTRAL_API_KEY') return 'test-api-key';
                return defaultValue;
              }),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<MistralProvider>(MistralProvider);
      expect(testProvider).toBeDefined();
    });

    it('should throw error when API key is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MistralProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(undefined),
            },
          },
        ],
      }).compile();

      const testProvider = module.get<MistralProvider>(MistralProvider);
      
      await expect(
        testProvider.complete({ prompt: 'test', context: '' })
      ).rejects.toThrow('MISTRAL_API_KEY is not defined');
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
        'https://api.mistral.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-mistral-api-key',
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
      const body = JSON.parse(callArgs[1].body as string);
      
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0]).toEqual({
        role: 'system',
        content: 'You are a test assistant',
      });
      expect(body.messages[1].role).toBe('user');
      expect(body.messages[1].content).toContain('Test prompt');
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
      const body = JSON.parse(callArgs[1].body as string);
      
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
      const body = JSON.parse(callArgs[1].body as string);
      
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
      const body = JSON.parse(callArgs[1].body as string);
      
      expect(body.response_format).toBeUndefined();
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
      const body = JSON.parse(callArgs[1].body as string);
      
      expect(body.model).toBe('mistral-large-latest');
    });
  });
});
