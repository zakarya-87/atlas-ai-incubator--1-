import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import * as jobStore from './job-store';

// Spy on the job store
jest.mock('./job-store', () => ({
  getJob: jest.fn(),
  setJob: jest.fn(),
}));

describe('JobsService', () => {
  let service: JobsService;
  let mockQueue: { add: jest.Mock };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'bull-job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getQueueToken('analysis-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jest.clearAllMocks();
  });

  // ── queueAnalysis() ───────────────────────────────────────────────────────

  describe('queueAnalysis', () => {
    const jobId = 'job-uuid-001';
    const dto = { ventureId: 'v-1', description: 'Test', tool: 'swot', module: 'strategy' } as any;
    const userId = 'user-abc';

    it('should set job store to queued status before adding to queue', async () => {
      await service.queueAnalysis(jobId, dto, userId);

      expect(jobStore.setJob).toHaveBeenCalledWith(jobId, expect.objectContaining({
        jobId,
        status: 'queued',
      }));
    });

    it('should add a job to the analysis-queue with correct name and data', async () => {
      await service.queueAnalysis(jobId, dto, userId);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'generate-analysis',
        { dto, userId, originalJobId: jobId },
        expect.objectContaining({
          jobId,
          removeOnComplete: true,
          removeOnFail: false,
        })
      );
    });

    it('should propagate queue errors', async () => {
      mockQueue.add.mockRejectedValue(new Error('Redis connection refused'));
      await expect(service.queueAnalysis(jobId, dto, userId)).rejects.toThrow('Redis connection refused');
    });
  });

  // ── getJobStatus() ────────────────────────────────────────────────────────

  describe('getJobStatus', () => {
    it('should return the stored job status', () => {
      const storedJob = { jobId: 'j1', status: 'completed', progress: 100, createdAt: 1000 };
      (jobStore.getJob as jest.Mock).mockReturnValue(storedJob);

      const result = service.getJobStatus('j1');

      expect(jobStore.getJob).toHaveBeenCalledWith('j1');
      expect(result).toEqual(storedJob);
    });

    it('should throw when job is not found in store', () => {
      (jobStore.getJob as jest.Mock).mockReturnValue(undefined);

      expect(() => service.getJobStatus('missing-id')).toThrow('Job not found');
    });
  });
});
