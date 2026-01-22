
import { Controller, Get, Param, Res, UseGuards, Post, Body } from '@nestjs/common';
import { Response } from 'express';

import { ReportsService } from './reports.service';
import { GetUser } from '../auth/get-user.decorator';
import type { User } from '@prisma/client';


@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generatePDFReport(id, user.id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=atlas-report-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get(':id/html')
  async getHtmlReport(@Param('id') id: string, @GetUser() user: User) {
    return this.reportsService.generateHTMLReport(id, user.id);
  }

  @Get(':id/json')
  async getJsonReport(@Param('id') id: string, @GetUser() user: User) {
    return this.reportsService.exportAsJSON(id, user.id);
  }

  @Post('custom')
  async createCustomReport(@Body() body: { analysisId: string, template: any }, @GetUser() user: User) {
    const { analysisId, template } = body;
    return this.reportsService.generateCustomReport(analysisId, template, user.id);
  }

  @Post('batch/pdf')
  async batchGeneratePdfs(@Body() body: { analysisIds: string[] }, @GetUser() user: User) {
    return this.reportsService.batchGeneratePDFs(body.analysisIds, user.id);
  }
}
