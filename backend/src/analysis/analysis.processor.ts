import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
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
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private analysisService: AnalysisService,
    private eventsGateway: EventsGateway
  ) {
    super();
  }

  async process(job: Job<AnalysisJobData>): Promise<Record<string, unknown>> {
    const { dto, userId } = job.data;
    if (!job.id) {
      throw new Error('Job ID is missing');
    }
    const jobId = job.data.originalJobId;

    try {
      // Update in-memory job store → active
      setJob(jobId, {
        jobId,
        status: 'active',
        progress: 10,
        createdAt: Date.now(),
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

      // Run the actual analysis (persists to Analysis table internally)
      const result = await this.analysisService.generateAnalysis(dto, userId);

      // Update in-memory job store → completed
      setJob(jobId, {
        jobId,
        status: 'completed',
        progress: 100,
        result,
        createdAt: Date.now(),
        finishedAt: Date.now(),
      });

      // Emit analysis result event via WebSocket
      if (dto.ventureId) {
        this.eventsGateway.emitAnalysisResult(dto.ventureId, {
          jobId,
          result,
        });
        this.eventsGateway.emitLog(dto.ventureId, {
          id: `job-${jobId}-completed`,
          agent: 'Systems Architect',
          messageKey: 'agentLogCompleted',
          timestamp: Date.now(),
        });
      }

      this.logger.log(`Job ${jobId} completed successfully`);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Job ${jobId} failed: ${errorMessage}`);

      // Update in-memory job store → failed
      setJob(jobId, {
        jobId,
        status: 'failed',
        error: errorMessage,
        createdAt: Date.now(),
        finishedAt: Date.now(),
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
