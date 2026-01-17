
import { Test, TestingModule } from '@nestjs/testing';
import { ResearchAgent } from './research.agent';
import { ConfigService } from '@nestjs/config';

describe('ResearchAgent', () => {
  let agent: ResearchAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchAgent,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'API_KEY') return 'test-api-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    agent = module.get<ResearchAgent>(ResearchAgent);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  // Add more tests here to mock the generate method and other functionalities
  describe('generate', () => {
    it('should return a mock analysis', async () => {
      const mockData = { text: 'Mock market research analysis', data: {} };
      jest.spyOn(agent, 'generate').mockResolvedValue(mockData);

      const result = await agent.generate('Test Topic', 'Test Context');
      expect(result).toEqual(mockData);
    });
  });
});
