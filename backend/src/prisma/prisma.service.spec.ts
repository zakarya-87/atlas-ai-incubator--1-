import { Test, TestingModule } from '@nestjs/testing';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    user = { findUnique: jest.fn() };
    venture = { findUnique: jest.fn() };
    analysis = { findUnique: jest.fn() };
    integration = { findMany: jest.fn() };
  }
  return {
    PrismaClient: MockPrismaClient,
  };
});

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      const connectSpy = jest.spyOn(service as any, '$connect');
      await service.onModuleInit();
      expect(connectSpy).toHaveBeenCalled();
    });

    it('should log error but NOT throw when $connect fails', async () => {
      jest.spyOn(service as any, '$connect').mockRejectedValue(new Error('ECONNREFUSED'));
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => { });

      // Should resolve (not reject) so the process doesn't crash
      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('PostgreSQL'),
        expect.any(Error)
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      const disconnectSpy = jest.spyOn(service as any, '$disconnect');
      await service.onModuleDestroy();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('database properties', () => {
    it('should have models defined', () => {
      expect(service.user).toBeDefined();
      expect(service.venture).toBeDefined();
      expect(service.analysis).toBeDefined();
      expect(service.integration).toBeDefined();
    });
  });
});


