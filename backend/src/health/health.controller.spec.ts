import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: 'BullQueue_analysis-queue',
          useValue: {
            client: Promise.resolve({
              ping: jest.fn().mockResolvedValue('PONG'),
              info: jest.fn().mockResolvedValue('used_memory_human:10MB\nuptime_in_seconds:3600'),
            }),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            getMetrics: jest.fn().mockResolvedValue({ cacheHits: 10, cacheMisses: 5 }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const result = await controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('message', 'ATLAS AI Backend is running');
      expect(result).toHaveProperty('database', 'up');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should return valid ISO timestamp', async () => {
      const result = await controller.check();
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should return error status if database is unhealthy', async () => {
      jest.spyOn(prismaService, 'isHealthy').mockResolvedValueOnce(false);
      const result = await controller.check();

      expect(result).toHaveProperty('status', 'error');
      expect(result).toHaveProperty('database', 'down');
    });
  });
});
