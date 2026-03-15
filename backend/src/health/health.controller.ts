import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue('analysis-queue') private readonly analysisQueue: Queue,
    private readonly metricsService: MetricsService
  ) { }

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  async check(): Promise<{
    status: string;
    timestamp: string;
    message: string;
    database: string;
  }> {
    const isDbHealthy = await this.prismaService.isHealthy();
    return {
      status: isDbHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      message: 'ATLAS AI Backend is running',
      database: isDbHealthy ? 'up' : 'down',
    };
  }

  @Get('redis')
  @ApiOperation({ summary: 'Redis health check' })
  @ApiResponse({ status: 200, description: 'Redis is connected' })
  @ApiResponse({ status: 503, description: 'Redis is disconnected' })
  async checkRedis(): Promise<any> {
    try {
      const client = await this.analysisQueue.client;
      const start = Date.now();
      await client.ping();
      const latency = Date.now() - start;

      const info = await client.info('memory');
      const usedMemoryMatch = info.match(/used_memory_human:(\S+)/);
      const usedMemory = usedMemoryMatch ? usedMemoryMatch[1] : 'unknown';

      const serverInfo = await client.info('server');
      const uptimeMatch = serverInfo.match(/uptime_in_seconds:(\d+)/);
      const uptime = uptimeMatch ? parseInt(uptimeMatch[1]) : 0;

      const metrics = await this.metricsService.getMetrics();

      return {
        status: 'connected',
        latency,
        memoryUsage: usedMemory,
        uptime,
        ...metrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
