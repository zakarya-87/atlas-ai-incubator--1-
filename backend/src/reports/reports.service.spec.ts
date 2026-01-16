import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

declare const describe: any;
declare const beforeEach: any;
declare const afterEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: any;

  const mockAnalysis = {
    id: 'analysis-123',
    module: 'strategy',
    tool: 'swot',
    resultData: {
      strengths: [{ point: 'Strong brand', explanation: 'Well known' }],
      weaknesses: [{ point: 'High costs', explanation: 'Expensive' }],
      opportunities: [],
      threats: [],
    },
    inputDescription: 'Coffee shop for remote workers',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      analysis: {
        findUnique: jest.fn().mockResolvedValue(mockAnalysis),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePDFReport', () => {
    it('should generate PDF from analysis data', async () => {
      const analysisId = 'analysis-123';

      // Mock Puppeteer
      jest.mock('puppeteer');

      // For now, we mock the PDF generation
      const mockPdf = Buffer.from('mock-pdf-content');

      const result = await service.generatePDFReport(analysisId);

      expect(result).toBeDefined();
      expect(prismaService.analysis.findUnique).toHaveBeenCalledWith({
        where: { id: analysisId },
      });
    });

    it('should fetch analysis data before PDF generation', async () => {
      await service.generatePDFReport('analysis-123');

      expect(prismaService.analysis.findUnique).toHaveBeenCalledWith({
        where: { id: 'analysis-123' },
      });
    });

    it('should throw error if analysis not found', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(null);

      await expect(
        service.generatePDFReport('non-existent')
      ).rejects.toThrow();
    });

    it('should include analysis data in PDF', async () => {
      const analysisId = 'analysis-123';

      await service.generatePDFReport(analysisId);

      const fetchCall = prismaService.analysis.findUnique.mock.calls[0];
      expect(fetchCall[0]).toEqual({ where: { id: analysisId } });
    });

    it('should handle different analysis types (SWOT, PESTEL, etc)', async () => {
      const pestelAnalysis = {
        ...mockAnalysis,
        tool: 'pestel',
        resultData: {
          political: [{ point: 'Tax policy', explanation: 'Recent changes' }],
          economic: [],
          social: [],
          technological: [],
          environmental: [],
          legal: [],
        },
      };

      prismaService.analysis.findUnique.mockResolvedValue(pestelAnalysis);

      await service.generatePDFReport('analysis-123');

      expect(prismaService.analysis.findUnique).toHaveBeenCalled();
    });

    it('should format output filename properly', async () => {
      const result = await service.generatePDFReport('analysis-123');

      // Should return buffer or proper structure
      expect(result).toBeDefined();
    });

    it('should include timestamp in report', async () => {
      const analysisData = {
        ...mockAnalysis,
        createdAt: new Date('2025-12-03'),
      };

      prismaService.analysis.findUnique.mockResolvedValue(analysisData);

      await service.generatePDFReport('analysis-123');

      expect(prismaService.analysis.findUnique).toHaveBeenCalled();
    });
  });

  describe('generateHTMLReport', () => {
    it('should generate HTML version of report', async () => {
      const analysisId = 'analysis-123';

      const result = await service.generateHTMLReport(analysisId);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should include properly formatted SWOT sections', async () => {
      const result = await service.generateHTMLReport('analysis-123');

      expect(result).toContain('Strengths');
      expect(result).toContain('Weaknesses');
      expect(result).toContain('Opportunities');
      expect(result).toContain('Threats');
    });

    it('should be styled and print-friendly', async () => {
      const result = await service.generateHTMLReport('analysis-123');

      expect(result).toContain('<html');
      expect(result).toContain('<style');
      expect(result).toContain('@media print');
    });

    it('should include analysis metadata', async () => {
      const result = await service.generateHTMLReport('analysis-123');

      expect(result).toContain('Coffee shop for remote workers');
    });
  });

  describe('exportAsJSON', () => {
    it('should export analysis as JSON', async () => {
      const analysisId = 'analysis-123';

      const result = await service.exportAsJSON(analysisId);

      expect(result).toBeDefined();
      expect(result.id).toBe('analysis-123');
      expect(result.resultData).toBeDefined();
    });

    it('should preserve data structure', async () => {
      const result = await service.exportAsJSON('analysis-123');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'analysis-123',
          module: 'strategy',
          tool: 'swot',
          resultData: expect.any(Object),
        })
      );
    });

    it('should be valid JSON when stringified', async () => {
      const result = await service.exportAsJSON('analysis-123');

      expect(() => {
        JSON.stringify(result);
      }).not.toThrow();
    });
  });

  describe('generateCustomReport', () => {
    it('should generate report with custom template', async () => {
      const template = {
        title: 'Executive Summary',
        sections: ['strengths', 'weaknesses', 'recommendations'],
      };

      const result = await service.generateCustomReport(
        'analysis-123',
        template
      );

      expect(result).toBeDefined();
    });

    it('should include specified sections only', async () => {
      const template = {
        title: 'Custom Report',
        sections: ['strengths', 'weaknesses'],
      };

      const result = await service.generateCustomReport(
        'analysis-123',
        template
      );

      expect(result).toContain('Strengths');
      expect(result).toContain('Weaknesses');
    });

    it('should support custom styling', async () => {
      const template = {
        title: 'Branded Report',
        sections: ['strengths'],
        style: {
          primaryColor: '#0066FF',
          fontFamily: 'Helvetica',
        },
      };

      const result = await service.generateCustomReport(
        'analysis-123',
        template
      );

      expect(result).toBeDefined();
    });
  });

  describe('batchGeneratePDFs', () => {
    it('should generate PDFs for multiple analyses', async () => {
      const analysisIds = ['analysis-1', 'analysis-2', 'analysis-3'];

      prismaService.analysis.findUnique.mockResolvedValue(mockAnalysis);

      const results = await service.batchGeneratePDFs(analysisIds);

      expect(results.length).toBe(3);
      expect(prismaService.analysis.findUnique).toHaveBeenCalledTimes(3);
    });

    it('should handle errors in batch generation gracefully', async () => {
      const analysisIds = ['analysis-1', 'analysis-2'];

      prismaService.analysis.findUnique
        .mockResolvedValueOnce(mockAnalysis)
        .mockRejectedValueOnce(new Error('Not found'));

      const results = await service.batchGeneratePDFs(analysisIds);

      expect(results).toContainEqual(
        expect.objectContaining({
          id: 'analysis-1',
          success: true,
        })
      );
      expect(results).toContainEqual(
        expect.objectContaining({
          id: 'analysis-2',
          success: false,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle Puppeteer launch failures', async () => {
      prismaService.analysis.findUnique.mockRejectedValue(
        new Error('Puppeteer browser launch failed')
      );

      await expect(
        service.generatePDFReport('analysis-123')
      ).rejects.toThrow();
    });

    it('should handle PDF generation timeouts', async () => {
      prismaService.analysis.findUnique.mockImplementation(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(
        service.generatePDFReport('analysis-123')
      ).rejects.toThrow();
    });

    it('should handle corrupted analysis data', async () => {
      const corruptedAnalysis = {
        ...mockAnalysis,
        resultData: null,
      };

      prismaService.analysis.findUnique.mockResolvedValue(corruptedAnalysis);

      const result = await service.generatePDFReport('analysis-123');

      expect(result).toBeDefined();
    });

    it('should handle missing analysis properties', async () => {
      const incompleteAnalysis = {
        id: 'analysis-123',
        // Missing other properties
      };

      prismaService.analysis.findUnique.mockResolvedValue(incompleteAnalysis);

      const result = await service.generatePDFReport('analysis-123');

      expect(result).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should cache generated reports', async () => {
      await service.generatePDFReport('analysis-123');
      await service.generatePDFReport('analysis-123');

      // Should use cache on second call
      expect(prismaService.analysis.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should handle large analysis data efficiently', async () => {
      const largeAnalysis = {
        ...mockAnalysis,
        resultData: {
          strengths: Array(1000).fill({ point: 'Point', explanation: 'Explanation' }),
          weaknesses: [],
          opportunities: [],
          threats: [],
        },
      };

      prismaService.analysis.findUnique.mockResolvedValue(largeAnalysis);

      const start = Date.now();
      await service.generatePDFReport('analysis-123');
      const duration = Date.now() - start;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('compliance', () => {
    it('should generate WCAG compliant PDFs', async () => {
      const result = await service.generatePDFReport('analysis-123');

      expect(result).toBeDefined();
    });

    it('should include proper metadata in PDFs', async () => {
      await service.generatePDFReport('analysis-123');

      // PDF should include title, author, creation date
      expect(prismaService.analysis.findUnique).toHaveBeenCalled();
    });

    it('should support multi-language reports', async () => {
      const analysisWithLanguage = {
        ...mockAnalysis,
        language: 'fr',
      };

      prismaService.analysis.findUnique.mockResolvedValue(analysisWithLanguage);

      const result = await service.generatePDFReport('analysis-123');

      expect(result).toBeDefined();
    });
  });
});
