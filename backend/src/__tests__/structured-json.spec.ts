/**
 * Structured JSON Output Tests for LLM Providers
 * 
 * Tests for:
 * - OpenAI, Grok, Mistral providers returning strict JSON
 * - System prompts enforcing JSON schema
 * - Error handling for non-JSON responses
 * - Response format configuration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from '../analysis/providers/openai.provider';
import { GrokProvider } from '../analysis/providers/grok.provider';
import { MistralProvider } from '../analysis/providers/mistral.provider';
import { AIProvider, AIProviderRequest } from '../analysis/interfaces/ai-provider.interface';

// Mock fetch globally
global.fetch = jest.fn();

describe('Structured JSON Output from LLM Providers', () => {
    let mockFetch: jest.Mock;

    beforeEach(() => {
        mockFetch = global.fetch as jest.Mock;
        jest.clearAllMocks();
    });

    describe('OpenAI Provider (JSON Object Mode)', () => {
        let provider: OpenAIProvider;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    OpenAIProvider,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn((key: string) => {
                                const config: Record<string, string> = {
                                    'AZURE_OPENAI_API_KEY': 'test-openai-key',
                                    'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                                    'AZURE_OPENAI_DEPLOYMENT': 'gpt-4',
                                    'AZURE_OPENAI_API_VERSION': '2024-04-01-preview',
                                };
                                return config[key];
                            }),
                        },
                    },
                ],
            }).compile();

            provider = module.get<OpenAIProvider>(OpenAIProvider);
        });

        it('should use response_format: { type: "json_object" } when schema provided (TC-SJ-001)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Analyze this data',
                context: 'Test context',
                schema: { type: 'object', properties: { result: { type: 'string' }, confidence: { type: 'number' } } },
                systemInstruction: 'You are a helpful assistant that always returns JSON.',
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"result":"analysis","confidence":0.95}' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await provider.complete(request);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('"response_format":{"type":"json_object"}'),
                })
            );
        });

        it('should parse JSON when schema is provided (TC-SJ-002)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate analysis',
                context: 'Test context',
                schema: { type: 'object', properties: { analysis: { type: 'string' }, score: { type: 'number' } } },
            };

            const expectedJson = { analysis: 'test analysis', score: 85 };
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify(expectedJson) } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const result = await provider.complete(request);

            expect(result.data).toEqual(expectedJson);
            expect(result.text).toBe(JSON.stringify(expectedJson));
        });

        it('should throw InternalServerErrorException for malformed JSON (TC-SJ-003)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate analysis',
                context: 'Test context',
                schema: { type: 'object', properties: { result: { type: 'string' } } },
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: 'This is not valid JSON {broken' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await expect(provider.complete(request)).rejects.toThrow('malformed JSON');
        });

        it('should return raw text when no schema provided (TC-SJ-004)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Just give me text',
                context: 'Test context',
                // No schema
            };

            const plainText = 'This is plain text response';
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: plainText } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const result = await provider.complete(request);

            expect(result.data).toBe(plainText);
            expect(result.text).toBe(plainText);
        });

        it('should include system instruction in messages (TC-SJ-005)', async () => {
            const systemInstruction = 'You must always return valid JSON.';
            const request: AIProviderRequest = {
                prompt: 'Test prompt',
                context: 'Test context',
                schema: { type: 'object', properties: {} },
                systemInstruction,
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"valid":true}' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await provider.complete(request);

            const fetchCall = mockFetch.mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.messages).toHaveLength(2);
            expect(body.messages[0].role).toBe('system');
            expect(body.messages[0].content).toBe(systemInstruction);
        });
    });

    describe('Grok Provider (JSON Object Mode)', () => {
        let provider: GrokProvider;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    GrokProvider,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn((key: string) => {
                                const config: Record<string, string> = {
                                    'GROK_API_KEY': 'test-grok-key',
                                    'GROK_MODEL': 'grok-beta',
                                };
                                return config[key];
                            }),
                        },
                    },
                ],
            }).compile();

            provider = module.get<GrokProvider>(GrokProvider);
        });

        it('should use response_format: { type: "json_object" } when schema provided (TC-SJ-006)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Analyze with Grok',
                context: 'Test context',
                schema: { type: 'object', properties: { result: { type: 'string' } } },
                systemInstruction: 'Return JSON output.',
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"result":"grok-analysis"}' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await provider.complete(request);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.x.ai/v1/chat/completions',
                expect.objectContaining({
                    body: expect.stringContaining('"response_format":{"type":"json_object"}'),
                })
            );
        });

        it('should parse JSON correctly from Grok response (TC-SJ-007)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate JSON',
                context: 'Test context',
                schema: { type: 'object', properties: { data: { type: 'string' }, status: { type: 'string' } } },
            };

            const expectedJson = { data: 'grok data', status: 'success' };
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify(expectedJson) } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const result = await provider.complete(request);

            expect(result.data).toEqual(expectedJson);
        });

        it('should throw error for malformed JSON from Grok (TC-SJ-008)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate analysis',
                context: 'Test context',
                schema: { type: 'object', properties: { result: { type: 'string' } } },
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: 'Invalid JSON { incomplete' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await expect(provider.complete(request)).rejects.toThrow('malformed JSON');
        });

        it('should set stream: false in request (TC-SJ-009)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Test',
                context: 'Test context',
                schema: { type: 'object', properties: {} },
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"valid":true}' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await provider.complete(request);

            const fetchCall = mockFetch.mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.stream).toBe(false);
        });

        it('should set temperature to 0 (TC-SJ-010)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Test',
                context: 'Test context',
                schema: { type: 'object', properties: {} },
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"valid":true}' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await provider.complete(request);

            const fetchCall = mockFetch.mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.temperature).toBe(0);
        });
    });

    describe('Mistral Provider (JSON Object Mode)', () => {
        let provider: MistralProvider;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    MistralProvider,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn((key: string) => {
                                const config: Record<string, string> = {
                                    'MISTRAL_API_KEY': 'test-mistral-key',
                                    'MISTRAL_MODEL': 'mistral-large-latest',
                                };
                                return config[key];
                            }),
                        },
                    },
                ],
            }).compile();

            provider = module.get<MistralProvider>(MistralProvider);
        });

        it('should use response_format: { type: "json_object" } when schema provided (TC-SJ-011)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Analyze with Mistral',
                context: 'Test context',
                schema: { type: 'object', properties: { result: { type: 'string' } } },
                systemInstruction: 'Always return JSON.',
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"result":"mistral-analysis"}' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await provider.complete(request);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.mistral.ai/v1/chat/completions',
                expect.objectContaining({
                    body: expect.stringContaining('"response_format":{"type":"json_object"}'),
                })
            );
        });

        it('should parse JSON correctly from Mistral response (TC-SJ-012)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate JSON',
                context: 'Test context',
                schema: { type: 'object', properties: { analysis: { type: 'string' }, score: { type: 'number' } } },
            };

            const expectedJson = { analysis: 'mistral result', score: 92 };
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify(expectedJson) } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const result = await provider.complete(request);

            expect(result.data).toEqual(expectedJson);
        });

        it('should throw error for malformed JSON from Mistral (TC-SJ-013)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate analysis',
                context: 'Test context',
                schema: { type: 'object', properties: { result: { type: 'string' } } },
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{broken json' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await expect(provider.complete(request)).rejects.toThrow('malformed JSON');
        });

        it('should handle context in prompt (TC-SJ-014)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Analyze this',
                context: 'Previous context data',
                schema: { type: 'object', properties: {} },
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"result":"ok"}' } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            await provider.complete(request);

            const fetchCall = mockFetch.mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            // Mistral provider merges context with prompt into a single user message
            expect(body.messages).toHaveLength(1);
            const userMessage = body.messages[0];
            expect(userMessage.role).toBe('user');
            expect(userMessage.content).toContain('Previous context data');
            expect(userMessage.content).toContain('Analyze this');
        });
    });

    describe('All Providers - JSON Enforcement', () => {
        it('should handle empty JSON object response (TC-SJ-015)', async () => {
            const createProvider = async (ProviderClass: any, config: any) => {
                const module = await Test.createTestingModule({
                    providers: [ProviderClass, { provide: ConfigService, useValue: { get: () => config } }],
                }).compile();
                return module.get(ProviderClass);
            };

            const openaiProvider = await createProvider(OpenAIProvider, 'key');
            const grokProvider = await createProvider(GrokProvider, 'key');
            const mistralProvider = await createProvider(MistralProvider, 'key');

            const providers = [openaiProvider, grokProvider, mistralProvider];

            for (const provider of providers) {
                const mockResponse = {
                    ok: true,
                    json: jest.fn().mockResolvedValue({
                        choices: [{ message: { content: '{}' } }],
                    }),
                };
                mockFetch.mockResolvedValue(mockResponse);

                const result = await provider.complete({
                    prompt: 'test',
                    context: 'test',
                    schema: { type: 'object', properties: {} },
                });

                expect(result.data).toEqual({});
            }
        });

        it('should handle nested JSON objects (TC-SJ-016)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate nested JSON',
                context: 'Test context',
                schema: {
                    type: 'object',
                    properties: {
                        outer: {
                            type: 'object',
                            properties: {
                                inner: { type: 'string' },
                                array: { type: 'array' },
                            },
                        },
                    },
                },
            };

            const expectedJson = {
                outer: {
                    inner: 'value',
                    array: [1, 2, 3],
                },
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify(expectedJson) } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const provider = new MistralProvider({ get: () => 'key' } as any);
            const result = await provider.complete(request);

            expect(result.data).toEqual(expectedJson);
        });

        it('should handle JSON with special characters (TC-SJ-017)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate JSON with special chars',
                context: 'Test context',
                schema: { type: 'object', properties: { text: { type: 'string' } } },
            };

            const expectedJson = {
                text: 'Special chars: "quotes", \\backslash, /slash, \nnewline, \ttab',
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify(expectedJson) } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const provider = new GrokProvider({ get: () => 'key' } as any);
            const result = await provider.complete(request);

            expect(result.data).toEqual(expectedJson);
        });

        it('should handle JSON with unicode characters (TC-SJ-018)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Generate JSON with unicode',
                context: 'Test context',
                schema: { type: 'object', properties: { unicode: { type: 'string' }, emoji: { type: 'string' } } },
            };

            const expectedJson = {
                unicode: '日本語, 한국어, 中文',
                emoji: '🚀 🎉 💻',
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify(expectedJson) } }],
                }),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const provider = new OpenAIProvider({
                get: () => ({
                    'AZURE_OPENAI_API_KEY': 'key',
                    'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                    'AZURE_OPENAI_DEPLOYMENT': 'gpt-4',
                })
            } as any);
            const result = await provider.complete(request);

            expect(result.data).toEqual(expectedJson);
        });

        it('should include rawResponse in result (TC-SJ-019)', async () => {
            const request: AIProviderRequest = {
                prompt: 'Test',
                context: 'Test context',
                schema: { type: 'object', properties: {} },
            };

            const rawApiResponse = {
                id: 'chatcmpl-123',
                object: 'chat.completion',
                created: 1234567890,
                model: 'gpt-4',
                choices: [{ message: { content: '{"valid":true}' } }],
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(rawApiResponse),
            };
            mockFetch.mockResolvedValue(mockResponse);

            const provider = new OpenAIProvider({
                get: () => ({
                    'AZURE_OPENAI_API_KEY': 'key',
                    'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                    'AZURE_OPENAI_DEPLOYMENT': 'gpt-4',
                })
            } as any);
            const result = await provider.complete(request);

            expect(result.rawResponse).toEqual(rawApiResponse);
        });
    });

    describe('Error Handling', () => {
        it('should throw for API errors (TC-SJ-020)', async () => {
            const provider = new OpenAIProvider({
                get: () => ({
                    'AZURE_OPENAI_API_KEY': 'key',
                    'AZURE_OPENAI_ENDPOINT': 'https://test.openai.azure.com',
                    'AZURE_OPENAI_DEPLOYMENT': 'gpt-4',
                })
            } as any);

            mockFetch.mockResolvedValue({
                ok: false,
                status: 429,
                text: jest.fn().mockResolvedValue('Rate limit exceeded'),
            });

            await expect(
                provider.complete({ prompt: 'test', context: 'test', schema: { type: 'object', properties: {} } })
            ).rejects.toThrow('Azure OpenAI API error');
        });

        it('should throw for network errors (TC-SJ-021)', async () => {
            const provider = new GrokProvider({ get: () => 'key' } as any);

            mockFetch.mockRejectedValue(new Error('Network error'));

            await expect(
                provider.complete({ prompt: 'test', context: 'test', schema: { type: 'object', properties: {} } })
            ).rejects.toThrow('Network error');
        });

        it('should handle missing API key gracefully (TC-SJ-022)', async () => {
            const provider = new MistralProvider({ get: () => undefined } as any);

            await expect(
                provider.complete({ prompt: 'test', context: 'test', schema: { type: 'object', properties: {} } })
            ).rejects.toThrow('MISTRAL_API_KEY is not defined');
        });
    });
});
