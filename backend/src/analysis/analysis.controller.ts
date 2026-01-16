import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisService } from './analysis.service';
import { setJob } from './job-store';
import { JobStatusResponse } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  async generateAnalysis(@Body() body: any) {
    // Create a simple job id and immediately process the analysis synchronously
    const jobId = uuidv4();

    try {
      // Ensure we have a valid userId that exists in DB. If not provided, create/find a dev user.
      let userId = body.userId;
      if (!userId) {
        // Try to find any existing user, or create a dev user
        const existing = await this.prisma.user.findFirst();
        if (existing) {
          userId = existing.id;
        } else {
          const created = await this.prisma.user.create({
            data: {
              email: `dev+${Date.now()}@local`,
              password: 'dev-password',
              fullName: 'Dev User'
            }
          });
          userId = created.id;
        }
      }

      // Call the AnalysisService to perform generation (synchronous flow)
      const result = await this.analysisService.generateAnalysis(body, userId);

      const jobResp: JobStatusResponse = {
        jobId,
        status: 'completed',
        result,
        createdAt: Date.now(),
        finishedAt: Date.now(),
      };

      // Store the completed job in the in-memory job store for polling
      setJob(jobId, jobResp);

      // Return the job id so the frontend can poll /jobs/:id
      return { jobId };
    } catch (error: any) {
      const jobResp: JobStatusResponse = {
        jobId,
        status: 'failed',
        error: error.message || 'Generation failed',
        createdAt: Date.now(),
        finishedAt: Date.now(),
      };
      setJob(jobId, jobResp);
      return { jobId };
    }
  }
}