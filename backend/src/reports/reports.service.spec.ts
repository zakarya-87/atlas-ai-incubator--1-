
import { Test, TestingModule } from '@nestjs/testing';
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
  });

  describe('generateHTMLReport', () => {
    it('should include properly formatted SWOT sections', async () => {
      const result = await service.generateHTMLReport('analysis-123', 'user-123');
      expect(result).toContain('<h2>STRENGTHS</h2>');
      expect(result).toContain('<h2>WEAKNESSES</h2>');
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
  });
});
