export interface AgentGenerationResponse {
  text: string;
  data: Record<string, unknown>;
  rawResponse?: unknown;
}

export interface AiAgent {
  generate(
    prompt: string,
    context: string,
    schema?: Record<string, unknown>,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse>;
}
