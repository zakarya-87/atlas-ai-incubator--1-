/**
 * Analysis Results Display Edge Cases Tests
 * 
 * Tests for:
 * - Job ID synchronization (originalJobId vs BullMQ internal ID)
 * - WebSocket event emission (analysisResult event)
 * - Frontend state updates when results are received
 * - Handling of malformed responses
 * - Timeout scenarios for job completion
 * - Concurrent analysis requests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { AnalysisJobData, AnalysisProcessor } from '../analysis/analysis.processor';
import { AnalysisService } from '../analysis/analysis.service';
import { JobStatusResponse } from '../analysis/jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { getJob, hasJob, setJob } from '../analysis/job-store';

describe('Analysis Results Display Edge Cases', () => {
    let processor: AnalysisProcessor;
    let mockAnalysisService: jest.Mocked<AnalysisService>;
    let mockPrismaService: any;
    let mockEventsGateway: jest.Mocked<EventsGateway>;

    beforeEach(async () => {
        jest.clearAllMocks();

        // Reset job store
        setJob('test-job-1', { jobId: 'test-job-1', status: 'queued', progress: 0, createdAt: Date.now() });
        setJob('test-job-2', { jobId: 'test-job-2', status: 'queued', progress: 0, createdAt: Date.now() });

        // Create mock instances
        mockPrismaService = {
            job: {
                update: jest.fn().mockResolvedValue({}),
            },
        };

        mockAnalysisService = {
            generateAnalysis: jest.fn(),
        } as unknown as jest.Mocked<AnalysisService>;

        mockEventsGateway = {
            emitLog: jest.fn(),
            emitAnalysisResult: jest.fn(),
        } as unknown as jest.Mocked<EventsGateway>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnalysisProcessor,
                {
                    provide: AnalysisService,
                    useValue: mockAnalysisService,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: EventsGateway,
                    useValue: mockEventsGateway,
                },
            ],
        }).compile();

        processor = module.get<AnalysisProcessor>(AnalysisProcessor);
    });

    afterEach(() => {
        // Clean up job store
        setJob('test-job-1', undefined as unknown as JobStatusResponse);
        setJob('test-job-2', undefined as unknown as JobStatusResponse);
    });

    describe('Job ID Synchronization', () => {
        it('should use originalJobId for job store lookups (TC-AR-001)', async () => {
            const originalJobId = 'user-friendly-job-id-123';
            const bullmqInternalId = 456;

            const mockJob = {
                id: bullmqInternalId,
                data: {
                    dto: { ventureId: 'venture-1', prompt: 'test' },
                    userId: 'user-1',
                    originalJobId: originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ result: 'test result' });

            await processor.process(mockJob);

            // Verify the job was stored with originalJobId
            expect(hasJob(originalJobId)).toBe(true);
            const storedJob = getJob(originalJobId);
            expect(storedJob?.jobId).toBe(originalJobId);
            expect(storedJob?.status).toBe('completed');
        });

        it('should correctly map originalJobId to BullMQ internal ID in database (TC-AR-002)', async () => {
            const originalJobId = 'mapping-test-job';
            const bullmqInternalId = 789;

            const mockJob = {
                id: bullmqInternalId,
                data: {
                    dto: { ventureId: 'venture-2' },
                    userId: 'user-2',
                    originalJobId: originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ data: 'test' });

            await processor.process(mockJob);

            // Verify DB update uses BullMQ internal ID (called at least once)
            expect(mockPrismaService.job.update).toHaveBeenCalled();
            const calls = mockPrismaService.job.update.mock.calls;
            // Check that at least one call uses the correct ID
            const hasCorrectId = calls.some((call: any[]) => call[0]?.where?.id === bullmqInternalId.toString());
            expect(hasCorrectId).toBe(true);
        });

        it('should handle concurrent jobs with different originalJobIds (TC-AR-003)', async () => {
            const jobs = [
                { originalJobId: 'concurrent-job-1', bullmqId: 1001 },
                { originalJobId: 'concurrent-job-2', bullmqId: 1002 },
                { originalJobId: 'concurrent-job-3', bullmqId: 1003 },
            ];

            for (const job of jobs) {
                const mockJob = {
                    id: job.bullmqId,
                    data: {
                        dto: { ventureId: 'venture-concurrent' },
                        userId: 'user-concurrent',
                        originalJobId: job.originalJobId,
                    },
                } as unknown as Job<AnalysisJobData>;

                mockAnalysisService.generateAnalysis.mockResolvedValue({ concurrent: true });

                await processor.process(mockJob);
                expect(hasJob(job.originalJobId)).toBe(true);
            }

            // Verify all jobs are stored correctly
            for (const job of jobs) {
                const storedJob = getJob(job.originalJobId);
                expect(storedJob?.jobId).toBe(job.originalJobId);
                expect(storedJob?.status).toBe('completed');
            }
        });
    });

    describe('WebSocket Event Emission', () => {
        it('should emit analysisResult event with correct jobId (TC-AR-004)', async () => {
            const originalJobId = 'websocket-test-job';
            const ventureId = 'venture-ws';

            const mockJob = {
                id: 999,
                data: {
                    dto: { ventureId },
                    userId: 'user-ws',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            const expectedResult = { analysis: 'data' };
            mockAnalysisService.generateAnalysis.mockResolvedValue(expectedResult);

            await processor.process(mockJob);

            // Verify emitAnalysisResult was called with correct parameters
            expect(mockEventsGateway.emitAnalysisResult).toHaveBeenCalledWith(ventureId, {
                jobId: originalJobId,
                result: expectedResult,
            });
        });

        it('should emit log events throughout job lifecycle (TC-AR-005)', async () => {
            const originalJobId = 'lifecycle-test-job';
            const ventureId = 'venture-lifecycle';

            const mockJob = {
                id: 888,
                data: {
                    dto: { ventureId },
                    userId: 'user-lifecycle',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ result: 'lifecycle' });

            await processor.process(mockJob);

            // Verify log events were emitted (processing and completion)
            expect(mockEventsGateway.emitLog).toHaveBeenCalled();

            // Check that processing event was emitted
            const emitLogCalls = (mockEventsGateway.emitLog as jest.Mock).mock.calls;
            const hasProcessing = emitLogCalls.some((call: any[]) => call[1]?.messageKey === 'agentLogProcessing');
            expect(hasProcessing).toBe(true);
        });

        it('should emit completion log event (TC-AR-006)', async () => {
            const originalJobId = 'completion-test-job';
            const ventureId = 'venture-completion';

            const mockJob = {
                id: 777,
                data: {
                    dto: { ventureId },
                    userId: 'user-completion',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ result: 'test' });

            await processor.process(mockJob);

            // Verify completion log event was emitted
            const emitLogCalls = (mockEventsGateway.emitLog as jest.Mock).mock.calls;
            const hasCompleted = emitLogCalls.some((call: any[]) => call[1]?.messageKey === 'agentLogCompleted');
            expect(hasCompleted).toBe(true);
        });
    });

    describe('Frontend State Updates', () => {
        it('should update job store with correct status transitions (TC-AR-007)', async () => {
            const originalJobId = 'state-test-job';

            const mockJob = {
                id: 666,
                data: {
                    dto: { ventureId: 'state-venture' },
                    userId: 'user-state',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ state: 'updated' });

            // Initial state - job should be created by processor
            await processor.process(mockJob);

            // After processing, should be completed with 100% progress
            const storedJob = getJob(originalJobId);
            expect(storedJob?.status).toBe('completed');
            expect(storedJob?.progress).toBe(100);
        });

        it('should include result data in completed job (TC-AR-008)', async () => {
            const originalJobId = 'result-test-job';
            const expectedResult = { analysis: 'data', score: 95, recommendations: [] };

            const mockJob = {
                id: 555,
                data: {
                    dto: { ventureId: 'result-venture' },
                    userId: 'user-result',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue(expectedResult);

            await processor.process(mockJob);

            const storedJob = getJob(originalJobId);
            expect(storedJob?.result).toEqual(expectedResult);
            expect(storedJob?.finishedAt).toBeDefined();
        });

        it('should handle failed jobs with error information (TC-AR-009)', async () => {
            const originalJobId = 'failed-test-job';
            const errorMessage = 'AI generation failed';

            const mockJob = {
                id: 444,
                data: {
                    dto: { ventureId: 'failed-venture' },
                    userId: 'user-failed',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockRejectedValue(new Error(errorMessage));

            // Process throws when job fails
            await expect(processor.process(mockJob)).rejects.toThrow(errorMessage);

            const storedJob = getJob(originalJobId);
            expect(storedJob?.status).toBe('failed');
            expect(storedJob?.error).toBe(errorMessage);
        });
    });

    describe('Timeout Scenarios', () => {
        it('should handle long-running jobs gracefully (TC-AR-010)', async () => {
            const originalJobId = 'timeout-test-job';
            // Simulate slow analysis
            mockAnalysisService.generateAnalysis.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ slow: true }), 50))
            );
            const mockJob = {
                id: 333,
                data: {
                    dto: { ventureId: 'timeout-venture' },
                    userId: 'user-timeout',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;
            const startTime = Date.now();
            await processor.process(mockJob);
            const duration = Date.now() - startTime;
            // Should complete successfully even if slow
            expect(duration).toBeGreaterThanOrEqual(50);
            const storedJob = getJob(originalJobId);
            expect(storedJob?.status).toBe('completed');
        }, 30000);

        it('should handle immediate job completion (TC-AR-011)', async () => {
            const originalJobId = 'immediate-test-job';

            mockAnalysisService.generateAnalysis.mockResolvedValue({ immediate: true });

            const mockJob = {
                id: 222,
                data: {
                    dto: { ventureId: 'immediate-venture' },
                    userId: 'user-immediate',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            await processor.process(mockJob);

            const storedJob = getJob(originalJobId);
            expect(storedJob?.status).toBe('completed');
            expect(storedJob?.progress).toBe(100);
        });
    });

    describe('Concurrent Analysis Requests', () => {
        it('should handle multiple concurrent job submissions (TC-AR-012)', async () => {
            const concurrentJobs = Array.from({ length: 5 }, (_, i) => ({
                originalJobId: `concurrent-${i}`,
                bullmqId: 2000 + i,
            }));

            mockAnalysisService.generateAnalysis.mockResolvedValue({ concurrent: true });

            // Process all jobs concurrently
            const processPromises = concurrentJobs.map((job) => {
                const mockJob = {
                    id: job.bullmqId,
                    data: {
                        dto: { ventureId: 'concurrent-venture', prompt: `job-${job.originalJobId}` },
                        userId: 'user-concurrent',
                        originalJobId: job.originalJobId,
                    },
                } as unknown as Job<AnalysisJobData>;
                return processor.process(mockJob);
            });

            await Promise.all(processPromises);

            // Verify all jobs completed
            for (const job of concurrentJobs) {
                const storedJob = getJob(job.originalJobId);
                expect(storedJob?.status).toBe('completed');
            }
        });

        it('should isolate job stores between requests (TC-AR-013)', async () => {
            const job1Id = 'isolation-job-1';
            const job2Id = 'isolation-job-2';

            const mockJob1 = {
                id: 3001,
                data: {
                    dto: { ventureId: 'isolation-1' },
                    userId: 'user-isolation',
                    originalJobId: job1Id,
                },
            } as unknown as Job<AnalysisJobData>;

            const mockJob2 = {
                id: 3002,
                data: {
                    dto: { ventureId: 'isolation-2' },
                    userId: 'user-isolation',
                    originalJobId: job2Id,
                },
            } as unknown as Job<AnalysisJobData>;

            // Job 1 succeeds first
            mockAnalysisService.generateAnalysis.mockResolvedValueOnce({ job1: 'success' });
            await processor.process(mockJob1);

            // Then job 2 succeeds
            mockAnalysisService.generateAnalysis.mockResolvedValueOnce({ job2: 'success' });
            await processor.process(mockJob2);

            // Verify both completed with correct results
            const job1Result = getJob(job1Id);
            const job2Result = getJob(job2Id);

            expect(job1Result?.status).toBe('completed');
            expect(job2Result?.status).toBe('completed');
        });
    });

    describe('Edge Cases', () => {
        it('should handle jobs with missing ventureId (TC-AR-014)', async () => {
            const originalJobId = 'no-venture-job';

            const mockJob = {
                id: 111,
                data: {
                    dto: { prompt: 'test' }, // No ventureId
                    userId: 'user-no-venture',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ no: 'venture' });

            // Should not throw
            await expect(processor.process(mockJob)).resolves.not.toThrow();
        });

        it('should handle empty result from analysis service (TC-AR-015)', async () => {
            const originalJobId = 'empty-result-job';

            const mockJob = {
                id: 110,
                data: {
                    dto: { ventureId: 'empty-venture' },
                    userId: 'user-empty',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({});

            await processor.process(mockJob);

            const storedJob = getJob(originalJobId);
            expect(storedJob?.status).toBe('completed');
            expect(storedJob?.result).toEqual({});
        });

        it('should handle special characters in job IDs (TC-AR-016)', async () => {
            const originalJobId = 'job-with-special-chars_123!@#';

            const mockJob = {
                id: 109,
                data: {
                    dto: { ventureId: 'special-venture' },
                    userId: 'user-special',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ special: true });

            await processor.process(mockJob);

            expect(hasJob(originalJobId)).toBe(true);
            const storedJob = getJob(originalJobId);
            expect(storedJob?.jobId).toBe(originalJobId);
        });

        it('should handle very long job IDs (TC-AR-017)', async () => {
            const originalJobId = 'a'.repeat(500);

            const mockJob = {
                id: 108,
                data: {
                    dto: { ventureId: 'long-venture' },
                    userId: 'user-long',
                    originalJobId,
                },
            } as unknown as Job<AnalysisJobData>;

            mockAnalysisService.generateAnalysis.mockResolvedValue({ long: true });

            await processor.process(mockJob);

            expect(hasJob(originalJobId)).toBe(true);
        });
    });
});
