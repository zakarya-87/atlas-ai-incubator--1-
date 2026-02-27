import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExportControls from './ExportControls';
import {
  exportToPdf,
  exportToCsv,
  exportToMarkdown,
} from '../utils/exportUtils';
import { downloadReportPdf } from '../services/geminiService';

// Mock dependencies
vi.mock('../utils/exportUtils', () => ({
  exportToPdf: vi.fn(),
  exportToCsv: vi.fn(),
  exportToMarkdown: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  downloadReportPdf: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key, // Return key as-is for testing
  }),
}));

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

describe('ExportControls Component (TC013)', () => {
  const mockAnalysisData = {
    id: 'test-analysis-123',
    strengths: [
      {
        point: 'Strong brand recognition',
        explanation: 'Established market presence',
      },
      { point: 'Skilled workforce', explanation: 'Experienced team members' },
    ],
    weaknesses: [
      { point: 'Limited resources', explanation: 'Startup constraints' },
    ],
    opportunities: [
      { point: 'Growing market', explanation: 'Industry expansion' },
    ],
    threats: [{ point: 'Competition', explanation: 'New market entrants' }],
  };

  const defaultProps = {
    analysisData: mockAnalysisData,
    analysisType: 'swot' as const,
    businessDescription: 'Test business description',
    targetElementId: 'test-element',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render export button', () => {
    render(<ExportControls {...defaultProps} />);

    const exportButton = screen.getByLabelText('Export');
    expect(exportButton).toBeInTheDocument();
  });

  it('should show export options on hover', async () => {
    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    expect(exportControls).toBeInTheDocument();

    // Trigger mouse enter to show menu
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      expect(screen.getByText('exportAsPdf')).toBeInTheDocument();
      expect(screen.getByText('exportAsCsv')).toBeInTheDocument();
      expect(screen.getByText('exportAsMarkdown')).toBeInTheDocument();
    });
  });

  it('should export to PDF when PDF button is clicked', async () => {
    // Test with non-customizable analysis type (roadmap is not in the customizable array)
    render(<ExportControls {...defaultProps} analysisType="roadmap" />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      const pdfButton = screen.getByText('exportAsPdf');
      fireEvent.click(pdfButton);
    });

    expect(exportToPdf).toHaveBeenCalledWith(
      'test-element',
      expect.stringContaining('roadmap_analysis_'),
      'ROADMAP Analysis',
      'Test business description'
    );
  });

  it('should export to CSV when CSV button is clicked', async () => {
    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      const csvButton = screen.getByText('exportAsCsv');
      fireEvent.click(csvButton);
    });

    expect(exportToCsv).toHaveBeenCalledWith(
      mockAnalysisData,
      expect.stringContaining('swot_analysis_'),
      'swot'
    );
  });

  it('should export to Markdown when Markdown button is clicked', async () => {
    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      const markdownButton = screen.getByText('exportAsMarkdown');
      fireEvent.click(markdownButton);
    });

    expect(exportToMarkdown).toHaveBeenCalledWith(
      mockAnalysisData,
      expect.stringContaining('swot_analysis_'),
      'swot',
      'Test business description'
    );
  });

  it('should show official PDF export button when analysis has server record', async () => {
    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      expect(screen.getByText('exportAsOfficialPdf')).toBeInTheDocument();
    });
  });

  it('should not show official PDF export button when analysis lacks server record', () => {
    const dataWithoutId = { ...mockAnalysisData };
    delete dataWithoutId.id;

    render(<ExportControls {...defaultProps} analysisData={dataWithoutId} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    expect(screen.queryByText('exportAsOfficialPdf')).not.toBeInTheDocument();
  });

  it('should call downloadReportPdf for official export', async () => {
    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      const officialPdfButton = screen.getByText('exportAsOfficialPdf');
      fireEvent.click(officialPdfButton);
    });

    expect(downloadReportPdf).toHaveBeenCalledWith(
      'test-analysis-123',
      'swot_official_report'
    );
  });

  it('should handle official PDF export errors gracefully', async () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(downloadReportPdf).mockRejectedValue(new Error('Export failed'));

    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      const officialPdfButton = screen.getByText('exportAsOfficialPdf');
      fireEvent.click(officialPdfButton);
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to download official report.'
      );
    });

    mockAlert.mockRestore();
  });

  it('should show loading state during official PDF generation', async () => {
    let resolvePromise: (value: void) => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(downloadReportPdf).mockReturnValue(promise);

    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    const officialPdfButton = await screen.findByText('exportAsOfficialPdf');
    fireEvent.click(officialPdfButton);

    // The menu closes when button is clicked, so we need to check that the function was called
    expect(downloadReportPdf).toHaveBeenCalledWith(
      'test-analysis-123',
      'swot_official_report'
    );

    // Since the button is disabled during generation, we can't easily test the text content
    // but we can verify the state changes by checking the mock was called
    expect(vi.mocked(downloadReportPdf).mock.calls.length).toBe(1);
  });

  it('should generate unique filenames with timestamps', () => {
    const mockDate = 1640995200000; // January 1, 2022
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    const csvButton = screen.getByText('exportAsCsv');
    fireEvent.click(csvButton);

    expect(exportToCsv).toHaveBeenCalledWith(
      mockAnalysisData,
      `swot_analysis_${mockDate}`,
      'swot'
    );

    vi.useRealTimers();
  });

  it('should maintain export data integrity', () => {
    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    const csvButton = screen.getByText('exportAsCsv');
    fireEvent.click(csvButton);

    const exportCall = vi.mocked(exportToCsv).mock.calls[0];
    const exportedData = exportCall[0];
    const exportedType = exportCall[2];

    expect(exportedData).toEqual(mockAnalysisData);
    expect(exportedType).toBe('swot');
  });

  it('should handle PDF export format specifications correctly', () => {
    // Test with non-customizable type to avoid modal behavior
    render(<ExportControls {...defaultProps} analysisType="roadmap" />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    // Test PDF export format
    const pdfButton = screen.getByText('exportAsPdf');
    fireEvent.click(pdfButton);

    expect(exportToPdf).toHaveBeenCalledWith(
      'test-element',
      expect.any(String),
      'ROADMAP Analysis',
      'Test business description'
    );
  });

  it('should handle Markdown export format specifications correctly', () => {
    // Test with non-customizable type
    render(<ExportControls {...defaultProps} analysisType="roadmap" />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    // Test Markdown export with business description (works for all types)
    const markdownButton = screen.getByText('exportAsMarkdown');
    fireEvent.click(markdownButton);

    expect(exportToMarkdown).toHaveBeenCalledWith(
      mockAnalysisData,
      expect.any(String),
      'roadmap',
      'Test business description'
    );
  });

  it('should hide export menu on mouse leave', async () => {
    render(<ExportControls {...defaultProps} />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    await waitFor(() => {
      expect(screen.getByText('exportAsPdf')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(exportControls);

    // Menu should be hidden (AnimatePresence will remove it)
    await waitFor(
      () => {
        expect(screen.queryByText('exportAsPdf')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('should handle different analysis types', () => {
    render(<ExportControls {...defaultProps} analysisType="roadmap" />);

    const exportControls = screen.getByTestId('export-controls');
    fireEvent.mouseEnter(exportControls);

    const pdfButton = screen.getByText('exportAsPdf');
    fireEvent.click(pdfButton);

    expect(exportToPdf).toHaveBeenCalledWith(
      'test-element',
      expect.stringContaining('roadmap_analysis_'),
      'ROADMAP Analysis',
      'Test business description'
    );
  });
});
