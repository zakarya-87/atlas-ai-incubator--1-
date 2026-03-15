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
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'venture-123', userId: 'user-123' }),
      },
      analysis: {
        findUnique: jest.fn(),
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

    process.env.REDIS_HOST = 'localhost'; // Ensure Redis mode for tests
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
      expect(jobsService.queueAnalysis).toHaveBeenCalledWith(
        (result as any).jobId,
        dto,
        mockUser.id
      );
    });
  });

  describe('GET /analysis/venture/:ventureId', () => {
    it('should retrieve analysis history for a venture', async () => {
      const ventureId = 'venture-123';
      const result = await controller.getVentureAnalyses(ventureId, mockUser);

      expect(prismaService.venture.findUnique).toHaveBeenCalledWith({
        where: { id: ventureId },
      });
      expect(prismaService.analysis.findMany).toHaveBeenCalledWith({
        where: { ventureId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockAnalysisResponse]);
    });

    it('should throw an error if venture is not found or user is not authorized', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null);
      const ventureId = 'not-found-venture';

      await expect(
        controller.getVentureAnalyses(ventureId, mockUser)
      ).rejects.toThrow('Unauthorized or venture not found');
    });
  });

  describe('GET /analysis/:id', () => {
    it('should retrieve an analysis by ID', async () => {
      const id = 'analysis-123';
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysisResponse,
        userId: mockUser.id,
      });

      const result = await controller.getAnalysisById(id, mockUser);

      expect(prismaService.analysis.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual({
        ...mockAnalysisResponse,
        userId: mockUser.id,
      });
    });

    it('should return null if analysis is not found', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(null);
      const result = await controller.getAnalysisById('non-existent', mockUser);
      expect(result).toBeNull();
    });

    it('should throw ForbiddenException if user is not the owner and not an admin', async () => {
      const otherUser = { ...mockUser, id: 'other-user' } as any;
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysisResponse,
        userId: 'owner-id',
      });

      await expect(
        controller.getAnalysisById('analysis-123', otherUser)
      ).rejects.toThrow('You do not have permission to access this analysis');
    });

    it('should allow access if user is an admin even if not owner', async () => {
      const adminUser = { ...mockUser, id: 'admin-id', role: 'ADMIN' } as any;
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysisResponse,
        userId: 'owner-id',
      });

      const result = await controller.getAnalysisById('analysis-123', adminUser);
      expect(result).toBeDefined();
    });
  });

  describe('POST /analysis/generate (Dev Mode)', () => {
    it('should run synchronously when Redis is not available', async () => {
      delete process.env.REDIS_HOST;
      delete process.env.REDIS_URL;

      const dto: GenerateAnalysisDto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'swot',
        description: 'Coffee shop',
        language: 'en',
      };

      const result = await controller.generate(dto, mockUser as any);

      expect(result).toHaveProperty('jobId');
      expect(jobsService.queueAnalysis).not.toHaveBeenCalled();
    });
  });
});
