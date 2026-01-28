export interface AgentGenerationResponse {
  text: string;
  data: any;
  rawResponse?: any;
}

export interface AiAgent {
  generate(
    prompt: string,
    context: string,
    schema?: any,
    systemInstruction?: string,
    images?: string[]
  ): Promise<AgentGenerationResponse>;
}
