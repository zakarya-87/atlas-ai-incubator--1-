
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { AnalysisService } from './analysis.service';
import { setJob } from './job-store';
import { JobStatusResponse, JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly jobsService: JobsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  async generate(
    @Body() generateAnalysisDto: GenerateAnalysisDto,
    @GetUser() user: User,
  ) {
    const jobId = uuidv4();
    try {
      // Use the injected JobsService to queue the analysis
      this.jobsService.queueAnalysis(jobId, generateAnalysisDto, user.id);
      return { jobId };
    } catch (error: any) {
      console.error('Error queueing analysis:', error);
      return { error: 'Failed to start analysis job.' };
    }
  }

  @Get('venture/:ventureId')
  async getVentureAnalyses(
    @Param('ventureId') ventureId: string,
    @GetUser() user: User,
  ) {
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
  async getAnalysisById(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    const analysis = await this.prisma.analysis.findUnique({ where: { id } });
    // Add authorization if needed
    return analysis;
  }

}
