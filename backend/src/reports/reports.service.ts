import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Buffer } from 'node:buffer';
import { Analysis, Venture } from '@prisma/client';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(private prisma: PrismaService) {}

  private reportCache = new Map<string, Analysis & { pdf?: Buffer; html?: string }>();

  async generatePDFReport(
    analysisId: string,
    userId?: string
  ): Promise<Buffer> {
    if (this.reportCache.has(analysisId) && !userId) {
      // Simple cache for testing
      const cached = this.reportCache.get(analysisId);
      if (cached?.pdf) return cached.pdf;
    }

    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { venture: true },
    }) as (Analysis & { venture: Venture }) | null;

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (userId && analysis.venture.userId !== userId) {
      throw new ForbiddenException('Access denied to this analysis');
    }

    const data = JSON.parse(analysis.resultData) as Record<string, unknown>;
    const htmlContent = this.buildHtml(
      analysis.tool,
      data,
      analysis.inputContext || ''
    );

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
      });

      await browser.close();

      // Cache for testing purposes
      this.reportCache.set(analysisId, {
        ...analysis,
        pdf: Buffer.from(pdfBuffer),
      });

      return Buffer.from(pdfBuffer);
    } catch (error: unknown) {
      if (browser) await browser.close();
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('PDF Generation Error:', errorMessage);
      throw new InternalServerErrorException('Failed to generate PDF report');
    }
  }

  async generateHTMLReport(
    analysisId: string,
    userId?: string
  ): Promise<string> {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { venture: true },
    }) as (Analysis & { venture: Venture }) | null;

    if (!analysis) throw new NotFoundException('Analysis not found');
    if (userId && analysis.venture.userId !== userId)
      throw new ForbiddenException('Access denied');

    const data = JSON.parse(analysis.resultData) as Record<string, unknown>;
    const content = this.buildHtml(
      analysis.tool,
      data,
      analysis.inputContext || ''
    );
    this.reportCache.set(analysisId, { ...analysis, html: content });
    return content;
  }

  async exportAsJSON(analysisId: string, userId?: string): Promise<Record<string, unknown>> {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { venture: true },
    }) as (Analysis & { venture: Venture }) | null;

    if (!analysis) throw new NotFoundException('Analysis not found');
    if (userId && analysis.venture.userId !== userId)
      throw new ForbiddenException('Access denied');

    // Exclude user-sensitive data if necessary
    const exportData = { ...analysis };
    delete (exportData as { venture?: Venture }).venture;
    return exportData as unknown as Record<string, unknown>;
  }

  async generateCustomReport(
    analysisId: string,
    template: { title: string; sections?: string[]; style?: { fontFamily?: string; primaryColor?: string } },
    userId?: string
  ): Promise<string> {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { venture: true },
    }) as (Analysis & { venture: Venture }) | null;

    if (!analysis) throw new NotFoundException('Analysis not found');
    if (userId && analysis.venture.userId !== userId)
      throw new ForbiddenException('Access denied');

    // Dummy implementation for custom report based on a template
    const { title, sections, style } = template;
    let customHtml = `<h1>${title}</h1>`;

    const resultData = JSON.parse(analysis.resultData) as Record<string, unknown>;

    if (sections) {
      sections.forEach((section: string) => {
        if (resultData[section]) {
          customHtml += `<h2>${section.toUpperCase()}</h2><p>${JSON.stringify(resultData[section])}</p>`;
        }
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: ${style?.fontFamily || 'Arial'}; color: ${style?.primaryColor || '#000'}; }
          </style>
      </head>
      <body>
          ${customHtml}
      </body>
      </html>
    `;
  }

  async batchGeneratePDFs(
    analysisIds: string[],
    userId?: string
  ): Promise<Array<{ id: string; success: boolean; error?: string }>> {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    for (const id of analysisIds) {
      try {
        await this.generatePDFReport(id, userId);
        results.push({ id, success: true });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ id, success: false, error: errorMessage });
      }
    }
    return results;
  }

  private buildHtml(tool: string, data: Record<string, unknown>, description: string): string {
    const title = tool
      .toUpperCase()
      .replace(/([A-Z])/g, ' $1')
      .trim();
    if (!data) return `<h1>${title} Report</h1><p>No data available.</p>`;

    let contentHtml = '';
    Object.entries(data).forEach(([key, value]) => {
      if (key === '_sources' || key === 'id') return;
      const formattedKey: string = key.replace(/([A-Z])/g, ' $1').toUpperCase();
      contentHtml += `<div class="section"><h2>${formattedKey}</h2>`;
      if (Array.isArray(value)) {
        contentHtml += `<ul>`;
        value.forEach((item: unknown) => {
          if (typeof item === 'object' && item !== null && 'point' in item) {
            const pointItem = item as { point: string; explanation?: string };
            contentHtml += `<li><strong>${pointItem.point}</strong><p>${pointItem.explanation || ''}</p></li>`;
          } else if (typeof item === 'object' && item !== null && 'name' in item) {
            const nameItem = item as { name: string };
            contentHtml += `<li><strong>${nameItem.name}</strong><p>${JSON.stringify(item).replace(/"/g, '')}</p></li>`;
          } else {
            contentHtml += `<li>${JSON.stringify(item)}</li>`;
          }
        });
        contentHtml += `</ul>`;
      } else if (typeof value === 'object' && value !== null) {
        contentHtml += `<pre>${JSON.stringify(value, null, 2)}</pre>`;
      } else {
        contentHtml += `<p>${String(value)}</p>`;
      }
      contentHtml += `</div>`;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; }
              h1 { color: #0D1B2A; border-bottom: 2px solid #00A896; padding-bottom: 10px; }
              h2 { color: #1B263B; margin-top: 20px; background: #f0f4f8; padding: 8px; border-radius: 4px; font-size: 16px; }
              p.desc { color: #666; font-style: italic; margin-bottom: 30px; }
              .section { margin-bottom: 20px; page-break-inside: avoid; }
              ul { list-style-type: none; padding: 0; }
              li { background: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px; }
              li strong { display: block; color: #00A896; margin-bottom: 4px; }
              .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; }
              @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
      </head>
      <body>
          <h1>ATLAS AI: ${title} Report</h1>
          <p class="desc">Context: ${description}</p>
          ${contentHtml}
          <div class="footer">Generated by ATLAS AI Incubator</div>
      </body>
      </html>
    `;
  }
}
