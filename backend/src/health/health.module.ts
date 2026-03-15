import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { HealthController } from './health.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'analysis-queue' }),
  ],
  controllers: [HealthController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class HealthModule {}
