
import { Controller, Get, Delete, Param, UseGuards, Post, Body } from '@nestjs/common';

import { HistoryService } from './history.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CreateVersionDto } from './dto/create-version.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('History')
@ApiBearerAuth()
@Controller('history')

export class HistoryController {
  constructor(private readonly historyService: HistoryService) { }

  @Get(':ventureId')
  @ApiOperation({ summary: 'Get analysis history for a specific venture' })
  async getHistory(
    @Param('ventureId') ventureId: string,
    @GetUser() user: User,
  ) {
    return this.historyService.getVentureHistory(ventureId, user.id);
  }

  @Post('version')
  @ApiOperation({ summary: 'Manually save a new version of an analysis' })
  async createVersion(
    @Body() dto: CreateVersionDto,
    @GetUser() user: User,
  ) {
    return this.historyService.createManualVersion(dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific analysis record' })
  async deleteAnalysis(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.historyService.deleteAnalysis(id, user);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all analyses (Admin only)' })
  async getAllAnalysesAdmin() {
    return this.historyService.getAllAnalysesAdmin();
  }
}