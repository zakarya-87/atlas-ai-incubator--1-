import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

export interface AnalysisJobData {
  dto: any;
  userId: string;
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

  async process(job: Job<AnalysisJobData>) {
    const { dto, userId } = job.data;

    try {
      // Update job status to processing
      await this.prisma.job.update({
        where: { id: job.id.toString() },
        data: { status: 'processing', startedAt: new Date() },
      });

      // Emit WebSocket event for progress
      if (dto.ventureId) {
        this.eventsGateway.emitLog(dto.ventureId, {
          id: `job-${job.id}`,
          agent: 'Systems Architect',
          messageKey: 'agentLogProcessing',
          timestamp: Date.now(),
        });
      }

      // Call the actual analysis service
      const result = await this.analysisService.generateAnalysis(dto, userId);

      // Update job status to completed
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
          id: `job-${job.id}-completed`,
          agent: 'Systems Architect',
          messageKey: 'agentLogCompleted',
          timestamp: Date.now(),
        });
      }

      return result;
    } catch (error) {
      // Update job status to failed
      await this.prisma.job.update({
        where: { id: job.id.toString() },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        },
      });

      if (dto.ventureId) {
        this.eventsGateway.emitLog(dto.ventureId, {
          id: `job-${job.id}-failed`,
          agent: 'Systems Architect',
          messageKey: 'agentLogFailed',
          timestamp: Date.now(),
        });
      }

      throw error;
    }
  }
}
