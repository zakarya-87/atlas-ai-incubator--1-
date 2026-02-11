import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { getJob, setJob } from './job-store';

export interface JobStatusResponse {
  jobId: string;
  status: 'queued' | 'active' | 'completed' | 'failed';
  progress?: number;
  result?: Record<string, unknown>;
  error?: string;
  createdAt?: number;
  finishedAt?: number;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue('analysis') private analysisQueue: Queue
  ) { }

  async queueAnalysis(
    jobId: string,
    dto: GenerateAnalysisDto,
    userId: string
  ): Promise<void> {
    // Always update the internal job store for polling
    setJob(jobId, {
      jobId,
      status: 'queued',
      createdAt: Date.now(),
    });

    // If we have Redis (implied by the queue being available), add to BullMQ
    // The controller checks process.env.REDIS_HOST before calling this typically
    // but we can be defensive here.
    await this.analysisQueue.add('generate-analysis', {
      dto,
      userId,
      originalJobId: jobId,
    }, {
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  getJobStatus(jobId: string): JobStatusResponse {
    const job = getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }
}
