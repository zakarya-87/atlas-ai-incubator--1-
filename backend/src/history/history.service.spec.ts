import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { HistoryService } from './history.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HistoryService', () => {
  let service: HistoryService;
  let prismaService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    fullName: 'Test User',
    password: 'hashed-password',
    credits: 100,
    subscriptionStatus: 'free',
    subscriptionPlan: 'free',
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@atlas.com',
    role: 'ADMIN',
    fullName: 'Atlas Admin',
    password: 'hashed-password',
    credits: 100,
    subscriptionStatus: 'free',
    subscriptionPlan: 'free',
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVenture = {
    id: 'venture-123',
    userId: 'user-123',
    name: 'Test Venture',
  };

  const mockAnalysis = {
    id: 'analysis-123',
    ventureId: 'venture-123',
    userId: 'user-123',
    tool: 'swot',
    resultData: { strengths: [], weaknesses: [] },
  };

  beforeEach(async () => {
    prismaService = {
      venture: {
        findUnique: jest.fn(),
      },
      analysis: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
  });

  describe('getVentureHistory', () => {
    it('should return analysis history for authorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.analysis.findMany.mockResolvedValue([mockAnalysis]);

      const result = await service.getVentureHistory('venture-123', 'user-123');

      expect(prismaService.venture.findUnique).toHaveBeenCalledWith({
        where: { id: 'venture-123' },
      });
      expect(prismaService.analysis.findMany).toHaveBeenCalledWith({
        where: { ventureId: 'venture-123' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockAnalysis]);
    });

    it('should return empty array for unauthorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);

      const result = await service.getVentureHistory(
        'venture-123',
        'other-user'
      );

      expect(result).toEqual([]);
    });

    it('should return empty array for non-existent venture', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null);

      const result = await service.getVentureHistory(
        'non-existent',
        'user-123'
      );

      expect(result).toEqual([]);
    });
  });

  describe('getRecentAnalysesForContext', () => {
    it('should return recent analyses excluding specified tool', async () => {
      const mockAnalyses = [
        { tool: 'porter', resultData: {} },
        { tool: 'blueocean', resultData: {} },
      ];
      prismaService.analysis.findMany.mockResolvedValue(mockAnalyses);

      const result = await service.getRecentAnalysesForContext(
        'venture-123',
        'swot'
      );

      expect(prismaService.analysis.findMany).toHaveBeenCalledWith({
        where: {
          ventureId: 'venture-123',
          tool: { not: 'swot' },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          tool: true,
          resultData: true,
          inputContext: true,
        },
      });
      expect(result).toEqual(mockAnalyses);
    });
  });

  describe('deleteAnalysis', () => {
    it('should delete analysis for owner', async () => {
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysis,
        venture: mockVenture,
      });
      prismaService.analysis.delete.mockResolvedValue(mockAnalysis);

      const result = await service.deleteAnalysis('analysis-123', mockUser);

      expect(prismaService.analysis.delete).toHaveBeenCalledWith({
        where: { id: 'analysis-123' },
      });
      expect(result).toEqual(mockAnalysis);
    });

    it('should delete analysis for admin', async () => {
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysis,
        venture: { ...mockVenture, userId: 'other-user' },
      });
      prismaService.analysis.delete.mockResolvedValue(mockAnalysis);

      const result = await service.deleteAnalysis(
        'analysis-123',
        mockAdminUser
      );

      expect(prismaService.analysis.delete).toHaveBeenCalledWith({
        where: { id: 'analysis-123' },
      });
      expect(result).toEqual(mockAnalysis);
    });

    it('should throw NotFoundException for non-existent analysis', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteAnalysis('non-existent', mockUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner non-admin', async () => {
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysis,
        venture: { ...mockVenture, userId: 'other-user' },
      });

      await expect(
        service.deleteAnalysis('analysis-123', mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createManualVersion', () => {
    it('should create manual version for authorized user', async () => {
      const dto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'manual',
        description: 'Manual entry',
        data: { content: 'test' },
      };
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.analysis.create.mockResolvedValue({
        id: 'new-analysis',
        ...dto,
        inputContext: dto.description,
      });

      const result = await service.createManualVersion(dto, 'user-123');

      expect(prismaService.venture.findUnique).toHaveBeenCalledWith({
        where: { id: 'venture-123' },
      });
      expect(result).toHaveProperty('id', 'new-analysis');
    });

    it('should throw NotFoundException for non-existent venture', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null);

      const dto = {
        ventureId: 'non-existent',
        module: 'strategy',
        tool: 'manual',
        description: 'Test',
        data: {},
      };

      await expect(
        service.createManualVersion(dto, 'user-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);

      const dto = {
        ventureId: 'venture-123',
        module: 'strategy',
        tool: 'manual',
        description: 'Test',
        data: {},
      };

      await expect(
        service.createManualVersion(dto, 'other-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
