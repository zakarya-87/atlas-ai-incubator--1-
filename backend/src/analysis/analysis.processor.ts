import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { setJob } from './job-store';

import { GenerateAnalysisDto } from './dto/generate-analysis.dto';

export interface AnalysisJobData {
  dto: GenerateAnalysisDto;
  userId: string;
  originalJobId: string;
}

@Processor('analysis-queue')
export class AnalysisProcessor extends WorkerHost {
  constructor(
    private analysisService: AnalysisService,
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {
    super();
  }

  async process(job: Job<AnalysisJobData>): Promise<Record<string, unknown>> {
    const { dto, userId } = job.data;
    if (!job.id) {
      throw new Error('Job ID is missing');
    }
    const jobId = job.id.toString();

    try {
      // Update local job store
      setJob(job.data.originalJobId, {
        jobId: job.data.originalJobId,
        status: 'active',
        progress: 10,
        createdAt: Date.now(),
      });

      // Update job status in DB
      await this.prisma.job.update({
        where: { id: jobId },
        data: { status: 'processing', startedAt: new Date() },
      });

      // Emit WebSocket event for progress
      if (dto.ventureId) {
        this.eventsGateway.emitLog(dto.ventureId, {
          id: `job-${jobId}`,
          agent: 'Systems Architect',
          messageKey: 'agentLogProcessing',
          timestamp: Date.now(),
        });
      }

      // Call the actual analysis service
      const result = await this.analysisService.generateAnalysis(dto, userId);

      // Update local job store to completed
      setJob(job.data.originalJobId, {
        jobId: job.data.originalJobId,
        status: 'completed',
        progress: 100,
        result,
        createdAt: Date.now(),
        finishedAt: Date.now(),
      });

      // Emit analysis result event
      if (dto.ventureId) {
        this.eventsGateway.emitAnalysisResult(dto.ventureId, {
          jobId: job.data.originalJobId,
          result,
        });
      }

      // Update job status in DB
      await this.prisma.job.update({
        where: { id: job.id.toString() },
        data: {
          status: 'completed',
          result: JSON.stringify(result),
          completedAt: new Date(),
        },
      });

      // Emit completion event
      if (dto.ventureId) {
        this.eventsGateway.emitLog(dto.ventureId, {
          id: `job-${jobId}-completed`,
          agent: 'Systems Architect',
          messageKey: 'agentLogCompleted',
          timestamp: Date.now(),
        });
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Update local job store to failed
      setJob(job.data.originalJobId, {
        jobId: job.data.originalJobId,
        status: 'failed',
        error: errorMessage,
        createdAt: Date.now(),
        finishedAt: Date.now(),
      });

      // Update job status in DB
      await this.prisma.job.update({
        where: { id: job.id.toString() },
        data: {
          status: 'failed',
          error: errorMessage,
          completedAt: new Date(),
        },
      });

      if (dto.ventureId) {
        this.eventsGateway.emitLog(dto.ventureId, {
          id: `job-${jobId}-failed`,
          agent: 'Systems Architect',
          messageKey: 'agentLogFailed',
          timestamp: Date.now(),
        });
      }

      throw error;
    }
  }
}
