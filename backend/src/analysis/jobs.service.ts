
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';

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
    constructor(
        @InjectQueue('analysis') private analysisQueue: Queue,
    ) { }

    async queueAnalysis(jobId: string, dto: GenerateAnalysisDto, userId: string): Promise<void> {
        await this.analysisQueue.add('generate', { dto, userId }, { jobId });
    }

    async getJobStatus(jobId: string): Promise<JobStatusResponse> {
        const job = await this.analysisQueue.getJob(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        const state = await job.getState();
        const progress = job.progress as number;

        const response: JobStatusResponse = {
            jobId: job.id as string,
            status: this.mapState(state),
            createdAt: job.timestamp,
        };

        if (progress) {
            response.progress = progress;
        }

        if (state === 'completed') {
            response.result = job.returnvalue;
            response.finishedAt = job.finishedOn;
        }

        if (state === 'failed') {
            response.error = job.failedReason;
            response.finishedAt = job.finishedOn;
        }

        return response;
    }

    private mapState(state: string): 'queued' | 'active' | 'completed' | 'failed' {
        switch (state) {
            case 'waiting':
            case 'delayed':
                return 'queued';
            case 'active':
                return 'active';
            case 'completed':
                return 'completed';
            case 'failed':
                return 'failed';
            default:
                return 'queued';
        }
    }
}
