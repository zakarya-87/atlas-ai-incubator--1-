
import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Buffer } from 'node:buffer';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generatePdf(analysisId: string, userId: string): Promise<Buffer> {
    // 1. Fetch Data
    const analysis = await (this.prisma as any).analysis.findUnique({
        where: { id: analysisId },
        include: { venture: true }
    });

    if (!analysis) {
        throw new NotFoundException('Analysis not found');
    }

    if (analysis.venture.userId !== userId) {
        throw new ForbiddenException('Access denied to this analysis');
    }

    const data = analysis.resultData; // Already JSON due to Prisma JSON type (or parsed if SQLite)

    // 2. Generate HTML
    const htmlContent = this.buildHtml(analysis.tool, data, analysis.inputContext);

    // 3. Print PDF with Puppeteer
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for some container environments
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '40px',
                bottom: '40px',
                left: '40px',
                right: '40px'
            }
        });

        await browser.close();
        return Buffer.from(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error("PDF Generation Error:", error);
        throw new InternalServerErrorException("Failed to generate PDF report");
    }
  }

  private buildHtml(tool: string, data: any, description: string): string {
      const title = tool.toUpperCase().replace(/([A-Z])/g, ' $1').trim();
      
      let contentHtml = '';
      
      // Generic renderer for key-value pairs or arrays
      // Specific renderers can be added for complex tools like Finance
      
      Object.entries(data).forEach(([key, value]) => {
          if (key === '_sources' || key === 'id') return;

          contentHtml += `<div class="section">`;
          contentHtml += `<h2>${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h2>`;
          
          if (Array.isArray(value)) {
              contentHtml += `<ul>`;
              value.forEach((item: any) => {
                  if (typeof item === 'object' && item.point) {
                      contentHtml += `
                        <li>
                            <strong>${item.point}</strong>
                            <p>${item.explanation}</p>
                        </li>`;
                  } else if (typeof item === 'object' && item.name) {
                       // Handle things like competitors or budget items
                       contentHtml += `
                        <li>
                            <strong>${item.name}</strong>
                            <p>${JSON.stringify(item).replace(/"/g, '')}</p>
                        </li>`;
                  } else {
                      contentHtml += `<li>${JSON.stringify(item)}</li>`;
                  }
              });
              contentHtml += `</ul>`;
          } else if (typeof value === 'object' && value !== null) {
              // Recursive or simplified dump for nested objects
              contentHtml += `<pre>${JSON.stringify(value, null, 2)}</pre>`;
          } else {
              contentHtml += `<p>${value}</p>`;
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
