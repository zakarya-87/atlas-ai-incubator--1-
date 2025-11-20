
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(
    @InjectQueue('analysis') private analysisQueue: Queue,
  ) { }

  // HTTP Endpoint (REST) - Now returns job ID immediately
  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Queue a new AI analysis generation job for a venture' })
  async generate(
    @Body() dto: GenerateAnalysisDto,
    @GetUser() user: User,
  ) {
    const job = await this.analysisQueue.add('generate', {
      dto,
      userId: user.id,
    });

    return {
      jobId: job.id,
      status: 'queued',
    };
  }
}