import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { getJob } from './job-store';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  @Get(':id')
  @ApiOperation({ summary: 'Get status of an analysis job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async getJobStatus(@Param('id') id: string) {
    const job = getJob(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
}
