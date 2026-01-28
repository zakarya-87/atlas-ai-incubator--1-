import { Injectable } from '@nestjs/common';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { setJob, getJob } from './job-store';

export interface JobStatusResponse {
  jobId: string;
  status: 'queued' | 'active' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  createdAt?: number;
  finishedAt?: number;
}

@Injectable()
export class JobsService {
  constructor() {}

  async queueAnalysis(
    jobId: string,
    dto: GenerateAnalysisDto,
    userId: string
  ): Promise<void> {
    setJob(jobId, {
      jobId,
      status: 'queued',
      createdAt: Date.now(),
    });
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const job = getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }
}
