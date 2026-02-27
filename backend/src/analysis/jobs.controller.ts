import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { getJob } from './job-store';
import { JobStatusResponse } from './jobs.service';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  @Get(':id')
  @ApiOperation({ summary: 'Get status of an analysis job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  getJobStatus(@Param('id') id: string): JobStatusResponse {
    const job = getJob(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
}
