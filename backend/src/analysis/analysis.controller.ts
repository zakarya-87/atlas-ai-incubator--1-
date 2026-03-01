import { Body, Controller, Get, Logger, Param, Post, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { AnalysisService } from './analysis.service';
import { setJob } from './job-store';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { GetUser } from '../auth/get-user.decorator';
import type { Analysis, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('analysis')
@Controller('analysis')
  @UseGuards(JwtAuthGuard)
export class AnalysisController {
  private readonly logger = new Logger(AnalysisController.name);

  constructor(
    private readonly analysisService: AnalysisService,
    private readonly jobsService: JobsService,
    private readonly prisma: PrismaService
  ) {}

  @Post('generate')
  async generate(
    @Body() generateAnalysisDto: GenerateAnalysisDto,
    @GetUser() user: User
  ): Promise<{ jobId: string } | { error: string }> {
    const jobId = uuidv4();
    try {
      // Check if Redis is configured (via REDIS_HOST env var)
      const hasRedis = !!process.env.REDIS_HOST || !!process.env.REDIS_URL;

      if (hasRedis) {
        // Use BullMQ queue for production with Redis
        await this.jobsService.queueAnalysis(
          jobId,
          generateAnalysisDto,
          user.id
        );
        return { jobId };
      } else {
        // Fallback: Run synchronously for development without Redis
        this.logger.log(
          `[Dev Mode] Running analysis synchronously for job ${jobId}`
        );

        setJob(jobId, {
          jobId,
          status: 'active',
          progress: 0,
          createdAt: Date.now(),
        });

        // Run in background to allow polling
        setTimeout(() => {
          void (async () => {
            try {
              await new Promise(resolve => setTimeout(resolve, 10)); // Just an await to make it async
              setJob(jobId, {
                jobId,
                status: 'active',
                progress: 30,
                createdAt: Date.now(),
              });
              const result = await this.analysisService.generateAnalysis(
                generateAnalysisDto,
                user.id
              );
              setJob(jobId, {
                jobId,
                status: 'completed',
                progress: 100,
                result,
                createdAt: Date.now(),
                finishedAt: Date.now(),
              });
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
              this.logger.error(`[Dev Mode] Job ${jobId} failed:`, error);
              setJob(jobId, {
                jobId,
                status: 'failed',
                error: errorMessage,
                createdAt: Date.now(),
                finishedAt: Date.now(),
              });
            }
          })();
        }, 0);

        return { jobId };
      }
    } catch (error: unknown) {
      this.logger.error('Error starting analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start analysis job.';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  @Get('venture/:ventureId')
  async getVentureAnalyses(
    @Param('ventureId') ventureId: string,
    @GetUser() user: User
  ): Promise<Analysis[]> {
    // Basic authorization check
    const venture = await this.prisma.venture.findUnique({
      where: { id: ventureId },
    });

    if (!venture || venture.userId !== user.id) {
      throw new Error('Unauthorized or venture not found');
    }

    return this.prisma.analysis.findMany({
      where: { ventureId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async getAnalysisById(@Param('id') id: string, @GetUser() _user: User): Promise<Analysis | null> {
    const analysis = await this.prisma.analysis.findUnique({ where: { id } });
    // Add authorization if needed
    return analysis;
  }
}
