import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
  let prismaService: any;

  const mockVenture = {
    id: 'venture-123',
    userId: 'user-123',
    name: 'Test Venture',
  };

  const mockIntegration = {
    id: 'integration-123',
    ventureId: 'venture-123',
    provider: 'slack',
    status: 'connected',
    config: JSON.stringify({ accessToken: 'mock_token' }),
  };

  beforeEach(async () => {
    prismaService = {
      venture: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      integration: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
  });

  describe('getIntegrations', () => {
    it('should return integrations for authorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.integration.findMany.mockResolvedValue([mockIntegration]);

      const result = await service.getIntegrations('venture-123', 'user-123');

      expect(prismaService.integration.findMany).toHaveBeenCalledWith({
        where: { ventureId: 'venture-123' },
      });
      expect(result).toEqual([mockIntegration]);
    });

    it('should create venture if not found and return empty array', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null);
      prismaService.venture.create.mockResolvedValue(mockVenture);
      prismaService.integration.findMany.mockResolvedValue([]);

      const result = await service.getIntegrations('venture-123', 'user-123');

      expect(prismaService.venture.create).toHaveBeenCalledWith({
        data: { 
          id: 'venture-123', 
          userId: 'user-123', 
          name: 'Venture venture-',
          description: 'Auto-created venture',
          industry: 'Technology',
          stage: 'idea'
        },
      });
      expect(result).toEqual([]);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);

      await expect(
        service.getIntegrations('venture-123', 'other-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleIntegration', () => {
    it('should connect integration for authorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.integration.upsert.mockResolvedValue(mockIntegration);

      const result = await service.toggleIntegration(
        'venture-123',
        'user-123',
        'slack',
        true
      );

      expect(prismaService.integration.upsert).toHaveBeenCalled();
      expect(result).toEqual(mockIntegration);
    });

    it('should disconnect integration for authorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.integration.update.mockResolvedValue({
        ...mockIntegration,
        status: 'disconnected',
        config: null,
      });

      const result = await service.toggleIntegration(
        'venture-123',
        'user-123',
        'slack',
        false
      );

      expect(prismaService.integration.update).toHaveBeenCalledWith({
        where: {
          ventureId_provider: {
            ventureId: 'venture-123',
            provider: 'slack',
          },
        },
        data: {
          status: 'disconnected',
          config: null,
        },
      });
      expect(result.status).toBe('disconnected');
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);

      await expect(
        service.toggleIntegration('venture-123', 'other-user', 'slack', true)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
