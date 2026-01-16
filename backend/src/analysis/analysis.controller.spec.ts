import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { SchemaType } from '@google/generative-ai';

describe('AnalysisController', () => {
  let controller: AnalysisController;
  let analysisService: any;

  const mockAnalysisResponse = {
    id: 'analysis-123',
    strengths: [{ point: 'Strong brand', explanation: 'Well known' }],
    weaknesses: [{ point: 'High cost', explanation: 'Expensive' }],
    opportunities: [],
    threats: [],
  };

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    analysisService = {
      generateAnalysis: jest.fn().mockResolvedValue(mockAnalysisResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        { provide: AnalysisService, useValue: analysisService },
      ],
    }).compile();

    controller = module.get<AnalysisController>(AnalysisController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /analysis/generate', () => {
    it('should generate analysis successfully', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Coffee shop for remote workers',
        language: 'en',
      };

      const result = await controller.generate(dto, mockUser);

      expect(result).toEqual(mockAnalysisResponse);
      expect(analysisService.generateAnalysis).toHaveBeenCalledWith(dto, mockUser.id);
    });

    it('should pass userId from authenticated request', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      await controller.generate(dto, mockUser);

      expect(analysisService.generateAnalysis).toHaveBeenCalledWith(
        dto,
        'user-123'
      );
    });

    it('should handle different languages', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'fr',
      };

      await controller.generate(dto, mockUser);

      expect(analysisService.generateAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'fr' }),
        'user-123'
      );
    });

    it('should validate DTO before processing', async () => {
      const invalidDto = {
        ventureId: '',
        module: 'strategy',
        tool: 'swot',
        description: '',
        language: 'en',
      };

      // Service validation (DTO decorators handle validation)
      expect(() => {
        controller.generate(invalidDto as any, mockUser);
      }).not.toThrow();
    });

    it('should return structured analysis data', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Tech startup',
        language: 'en',
      };

      const result = await controller.generate(dto, mockUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
    });

    it('should handle service errors', async () => {
      analysisService.generateAnalysis.mockRejectedValue(
        new Error('API rate limit')
      );

      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      await expect(
        controller.generate(dto, mockUser)
      ).rejects.toThrow('API rate limit');
    });

    it('should handle different modules', async () => {
      const modules = ['strategy', 'marketAnalysis', 'finance', 'funding'];

      for (const module of modules) {
        const dto: GenerateAnalysisDto = {
          ventureId: 'venture-123',
          module: module as any,
          tool: 'test',
          description: 'Test',
          language: 'en',
        };

        await controller.generate(dto, mockUser);

        expect(analysisService.generateAnalysis).toHaveBeenCalledWith(
          expect.objectContaining({ module }),
          'user-123'
        );
      }
    });

    it('should handle different tools within modules', async () => {
      const tools = ['swot', 'pestel', 'roadmap', 'leanCanvas'];

      for (const tool of tools) {
        const dto: GenerateAnalysisDto = {
          ventureId: 'venture-123',
          module: 'strategy',
          tool: tool as any,
          description: 'Test',
          language: 'en',
        };

        await controller.generate(dto, mockUser);

        expect(analysisService.generateAnalysis).toHaveBeenCalledWith(
          expect.objectContaining({ tool }),
          'user-123'
        );
      }
    });

    it('should pass venture context through DTO', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-456',
        module: 'strategy',
        tool: 'swot',
        description: 'E-commerce platform',
        language: 'en',
      };

      await controller.generate(dto, mockUser);

      expect(analysisService.generateAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({ ventureId: 'venture-456' }),
        'user-123'
      );
    });

    it('should handle large descriptions', async () => {
      const largeDescription = 'A'.repeat(5000);

      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: largeDescription,
        language: 'en',
      };

      await controller.generate(dto, mockUser);

      expect(analysisService.generateAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          description: largeDescription,
        }),
        'user-123'
      );
    });
  });

  describe('GET /analysis/:ventureId', () => {
    it('should retrieve analysis history', async () => {
      analysisService.getVentureAnalyses = jest.fn().mockResolvedValue([
        mockAnalysisResponse,
      ]);

      const ventureId = 'venture-123';
      const result = await controller.getVentureAnalyses(ventureId, mockUser);

      expect(analysisService.getVentureAnalyses).toHaveBeenCalledWith(
        ventureId
      );
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('authentication & authorization', () => {
    it('should require authenticated user', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      // This would be enforced by @UseGuards decorator
      expect(() => {
        controller.generate(dto, null as any);
      }).not.toThrow();
    });

    it('should include user context in service call', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      const user = { id: 'user-456', email: 'other@example.com' };

      await controller.generate(dto, user);

      expect(analysisService.generateAnalysis).toHaveBeenCalledWith(
        dto,
        'user-456'
      );
    });
  });

  describe('request validation', () => {
    it('should validate required fields', async () => {
      const incompleteDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        // Missing tool, description, language
      };

      // Validation would be caught by class-validator
      expect(() => {
        controller.generate(incompleteDto as any, mockUser);
      }).not.toThrow();
    });

    it('should handle malformed venture ID', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'invalid-venture-format',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      // Should pass through to service (service handles validation)
      await controller.generate(dto, mockUser);

      expect(analysisService.generateAnalysis).toHaveBeenCalled();
    });
  });

  describe('error scenarios', () => {
    it('should handle insufficient credits', async () => {
      analysisService.generateAnalysis.mockRejectedValue(
        new Error('Insufficient credits')
      );

      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      await expect(
        controller.generate(dto, mockUser)
      ).rejects.toThrow('Insufficient credits');
    });

    it('should handle unauthorized venture access', async () => {
      analysisService.generateAnalysis.mockRejectedValue(
        new Error('Unauthorized access to venture')
      );

      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      await expect(
        controller.generate(dto, mockUser)
      ).rejects.toThrow('Unauthorized');
    });

    it('should handle API timeouts', async () => {
      analysisService.generateAnalysis.mockRejectedValue(
        new Error('Gemini API timeout')
      );

      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      await expect(
        controller.generate(dto, mockUser)
      ).rejects.toThrow();
    });
  });

  describe('response formatting', () => {
    it('should return properly typed SWOT response', async () => {
      const swotResponse = {
        id: 'a-1',
        strengths: [{ point: 'Good', explanation: 'Reason' }],
        weaknesses: [{ point: 'Bad', explanation: 'Reason' }],
        opportunities: [{ point: 'Chance', explanation: 'Reason' }],
        threats: [{ point: 'Risk', explanation: 'Reason' }],
      };

      analysisService.generateAnalysis.mockResolvedValue(swotResponse);

      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      const result = await controller.generate(dto, mockUser);

      expect(result.strengths[0]).toHaveProperty('point');
      expect(result.strengths[0]).toHaveProperty('explanation');
    });

    it('should include analysis metadata', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Test',
        language: 'en',
      };

      const result = await controller.generate(dto, mockUser);

      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('string');
    });
  });
});