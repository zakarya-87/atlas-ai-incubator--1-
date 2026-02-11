export enum AIProvider {
  GEMINI = 'gemini',
  GROK = 'grok',
  MISTRAL = 'mistral',
  OPENAI = 'openai',
}

export interface AIProviderRequest {
  prompt: string;
  context: string;
  schema?: Record<string, unknown>;
  systemInstruction?: string;
  images?: string[];
  tools?: Record<string, unknown>[];
}

export interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface AIProviderResponse {
  text: string;
  data: Record<string, unknown>;
  rawResponse?: unknown;
}

export interface AIProviderInterface {
  complete(request: AIProviderRequest): Promise<AIProviderResponse>;
  getName(): AIProvider;
}
