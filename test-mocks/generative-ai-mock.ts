// Mock for @google/generative-ai package (not available in frontend)
// This is only used in tests

export enum SchemaType {
    OBJECT = 'object',
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    ARRAY = 'array',
}

export const GoogleGenerativeAI = class {
    constructor(apiKey: string) { }

    getGenerativeModel() {
        return {
            generateContent: () => Promise.resolve({ text: '{}' }),
        };
    }
};
