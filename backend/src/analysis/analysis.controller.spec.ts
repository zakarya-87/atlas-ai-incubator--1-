
import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalysisController', () => {
  let controller: AnalysisController;
  let analysisService: any;
  let jobsService: any;
  let prismaService: any;

  const mockAnalysisResponse = {
    id: 'analysis-123',
    strengths: [{ point: 'Strong brand', explanation: 'Well known' }],
    weaknesses: [{ point: 'High cost', explanation: 'Expensive' }],
    opportunities: [],
    threats: [],
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    fullName: 'Test User',
    role: 'USER',
    credits: 100,
    subscriptionStatus: 'active',
    subscriptionPlan: 'premium',
    stripeCustomerId: 'cus_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    analysisService = {
      generateAnalysis: jest.fn().mockResolvedValue(mockAnalysisResponse),
      getVentureAnalyses: jest.fn().mockResolvedValue([mockAnalysisResponse]),
    };

    jobsService = {
      queueAnalysis: jest.fn(),
    };

    prismaService = {
      venture: {
        findUnique: jest.fn().mockResolvedValue({ id: 'venture-123', userId: 'user-123' }),
      },
      analysis: {
        findMany: jest.fn().mockResolvedValue([mockAnalysisResponse]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        { provide: AnalysisService, useValue: analysisService },
        { provide: JobsService, useValue: jobsService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<AnalysisController>(AnalysisController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /analysis/generate', () => {
    it('should queue analysis successfully', async () => {
      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Coffee shop',
        language: 'en',
      };

      const result = await controller.generate(dto, mockUser);

      expect(result).toHaveProperty('jobId');
      expect(jobsService.queueAnalysis).toHaveBeenCalledWith(result.jobId, dto, mockUser.id);
    });
  });

  describe('GET /analysis/venture/:ventureId', () => {
    it('should retrieve analysis history for a venture', async () => {
      const ventureId = 'venture-123';
      const result = await controller.getVentureAnalyses(ventureId, mockUser);

      expect(prismaService.venture.findUnique).toHaveBeenCalledWith({ where: { id: ventureId } });
      expect(prismaService.analysis.findMany).toHaveBeenCalledWith({
        where: { ventureId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockAnalysisResponse]);
    });

    it('should throw an error if venture is not found or user is not authorized', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null);
      const ventureId = 'not-found-venture';

      await expect(controller.getVentureAnalyses(ventureId, mockUser)).rejects.toThrow('Unauthorized or venture not found');
    });
  });
});
