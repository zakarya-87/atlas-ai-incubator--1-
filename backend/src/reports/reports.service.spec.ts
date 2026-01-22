
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';

jest.mock('puppeteer');

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: any;

  const mockAnalysis = {
    id: 'analysis-123',
    tool: 'swot',
    resultData: {
      strengths: [{ point: 'Strong brand', explanation: 'Well known' }],
      weaknesses: [{ point: 'High costs', explanation: 'Expensive' }],
      opportunities: [],
      threats: [],
    },
    inputDescription: 'Coffee shop for remote workers',
    createdAt: new Date(),
    venture: { userId: 'user-123' },
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

    (puppeteer.launch as jest.Mock).mockResolvedValue({
      newPage: async () => ({
        setContent: async () => {},
        pdf: async () => Buffer.from('mock-pdf-content'),
      }),
      close: async () => {},
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePDFReport', () => {
    it('should generate PDF from analysis data', async () => {
      const result = await service.generatePDFReport('analysis-123', 'user-123');
      expect(result).toBeDefined();
      expect(result.toString()).toBe('mock-pdf-content');
    });

    it('should throw NotFoundException if analysis not found', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(null);

      await expect(service.generatePDFReport('non-existent', 'user-123'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the analysis', async () => {
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysis,
        venture: { userId: 'other-user' },
      });

      await expect(service.generatePDFReport('analysis-123', 'user-123'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('generateHTMLReport', () => {
    it('should include properly formatted SWOT sections', async () => {
      const result = await service.generateHTMLReport('analysis-123', 'user-123');
      expect(result).toContain('<h2>STRENGTHS</h2>');
      expect(result).toContain('<h2>WEAKNESSES</h2>');
    });

    it('should throw NotFoundException if analysis not found', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(null);

      await expect(service.generateHTMLReport('non-existent', 'user-123'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if unauthorized', async () => {
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysis,
        venture: { userId: 'other-user' },
      });

      await expect(service.generateHTMLReport('analysis-123', 'user-123'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('exportAsJSON', () => {
    it('should export analysis data as JSON', async () => {
      const result = await service.exportAsJSON('analysis-123', 'user-123');

      expect(result).toHaveProperty('id', 'analysis-123');
      expect(result).toHaveProperty('tool', 'swot');
      expect(result).toHaveProperty('resultData');
      expect(result).not.toHaveProperty('venture');
    });

    it('should throw NotFoundException if analysis not found', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(null);

      await expect(service.exportAsJSON('non-existent', 'user-123'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if unauthorized', async () => {
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysis,
        venture: { userId: 'other-user' },
      });

      await expect(service.exportAsJSON('analysis-123', 'user-123'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('generateCustomReport', () => {
    it('should generate custom HTML report from template', async () => {
      const template = {
        title: 'Custom Report',
        sections: ['strengths', 'weaknesses'],
        style: { fontFamily: 'Arial', primaryColor: '#000' },
      };

      const result = await service.generateCustomReport('analysis-123', template, 'user-123');

      expect(result).toContain('<h1>Custom Report</h1>');
      expect(result).toContain('<h2>STRENGTHS</h2>');
      expect(result).toContain('font-family: Arial');
    });

    it('should throw NotFoundException if analysis not found', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(null);

      await expect(
        service.generateCustomReport('non-existent', { title: 'Test' }, 'user-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if unauthorized', async () => {
      prismaService.analysis.findUnique.mockResolvedValue({
        ...mockAnalysis,
        venture: { userId: 'other-user' },
      });

      await expect(
        service.generateCustomReport('analysis-123', { title: 'Test' }, 'user-123')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('batchGeneratePDFs', () => {
    it('should handle errors in batch generation gracefully', async () => {
      prismaService.analysis.findUnique
        .mockResolvedValueOnce(mockAnalysis)
        .mockRejectedValueOnce(new Error('Not found'));
      const results = await service.batchGeneratePDFs(['analysis-1', 'analysis-2'], 'user-123');
      expect(results).toEqual([
        { id: 'analysis-1', success: true },
        { id: 'analysis-2', success: false, error: 'Not found' },
      ]);
    });

    it('should generate PDFs for multiple analyses', async () => {
      prismaService.analysis.findUnique.mockResolvedValue(mockAnalysis);

      const results = await service.batchGeneratePDFs(
        ['analysis-1', 'analysis-2', 'analysis-3'],
        'user-123'
      );

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
    });
  });
});
