import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await (this.prisma as any).$queryRaw`SELECT 1`;
      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error: any) {
      throw new HealthCheckError('Prisma check failed', {
        [key]: {
          status: 'down',
          message: error.message,
        },
      });
    }
  }
}
