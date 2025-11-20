
import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generatePdf(id, user.id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=atlas-report-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
