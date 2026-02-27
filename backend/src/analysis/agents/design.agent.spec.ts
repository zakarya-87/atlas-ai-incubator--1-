import { Test, TestingModule } from '@nestjs/testing';
import { DesignAgent } from './design.agent';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../providers/ai-provider.factory';

describe('DesignAgent', () => {
  let agent: DesignAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignAgent,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'test-api-key';
              if (key === 'DEFAULT_AI_PROVIDER') return 'gemini';
              return null;
            }),
          },
        },
        {
          provide: AIProviderFactory,
          useValue: {
            getAvailableProviders: jest.fn().mockReturnValue(['gemini']),
            complete: jest.fn().mockResolvedValue({ text: 'mock response', data: {} }),
            getActiveProvider: jest.fn().mockReturnValue('gemini'),
            isProviderAvailable: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    agent = module.get<DesignAgent>(DesignAgent);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  // Add more tests here to mock the generate method and other functionalities
  describe('generate', () => {
    it('should return a mock design', async () => {
      const mockData = { text: 'Mock design concepts', data: {} };
      jest.spyOn(agent, 'generate').mockResolvedValue(mockData);

      const result = await agent.generate('Test Topic', 'Test Context');
      expect(result).toEqual(mockData);
    });
  });
});
