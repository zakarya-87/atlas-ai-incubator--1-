export enum AIProvider {
  GEMINI = 'gemini',
  GROK = 'grok',
  MISTRAL = 'mistral',
  OPENAI = 'openai',
}

export interface AIProviderRequest {
  prompt: string;
  context: string;
  schema?: any;
  systemInstruction?: string;
  images?: string[];
  tools?: any[];
}

export interface AIProviderResponse {
  text: string;
  data: any;
  rawResponse?: any;
}

export interface AIProviderInterface {
  complete(request: AIProviderRequest): Promise<AIProviderResponse>;
  getName(): AIProvider;
}
