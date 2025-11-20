import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get status of an analysis job' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    async getJobStatus(@Param('id') id: string) {
        try {
            return await this.jobsService.getJobStatus(id);
        } catch (error) {
            throw new NotFoundException('Job not found');
        }
    }
}
