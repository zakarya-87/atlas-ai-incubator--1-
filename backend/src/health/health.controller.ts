import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) { }

  @Get()
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
}
