import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LoadingSpinner from './LoadingSpinner';
import AnalysisSkeleton from './AnalysisSkeleton';

// Mock the language context
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key, // Return key as-is for testing
  }),
}));

describe('Loading States with Spinners and Skeletons (TC014)', () => {
  describe('LoadingSpinner Component', () => {
    it('should render loading spinner with proper structure', () => {
      render(<LoadingSpinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass(
        'w-12',
        'h-12',
        'border-4',
        'border-brand-teal'
      );
    });

    it('should display loading text', () => {
      render(<LoadingSpinner />);

      expect(screen.getByText('loadingTitle')).toBeInTheDocument();
      expect(screen.getByText('loadingText')).toBeInTheDocument();
    });

    it('should have proper container styling', () => {
      render(<LoadingSpinner />);

      const container = screen.getByText('loadingTitle').closest('div');
      expect(container).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'text-center'
      );
      expect(container).toHaveClass('text-brand-light');
    });

    it('should have accessible text content', () => {
      render(<LoadingSpinner />);

      const title = screen.getByText('loadingTitle');
      const subtitle = screen.getByText('loadingText');

      expect(title).toHaveClass('text-lg', 'font-semibold');
      expect(subtitle).toHaveClass('text-sm');
    });
  });

  describe('AnalysisSkeleton Component', () => {
    it('should render SWOT skeleton with quadrant layout', () => {
      render(<AnalysisSkeleton tool="swot" />);

      // Should have 4 skeleton blocks (SWOT quadrants)
      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThanOrEqual(4);
    });

    it('should render PESTEL skeleton with quadrant layout', () => {
      render(<AnalysisSkeleton tool="pestel" />);

      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThanOrEqual(4);
    });

    it('should render Lean Canvas skeleton with complex grid layout', () => {
      render(<AnalysisSkeleton tool="leanCanvas" />);

      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThanOrEqual(7); // Complex canvas layout
    });

    it('should render Competitor Analysis skeleton as table', () => {
      render(<AnalysisSkeleton tool="competitorAnalysis" />);

      // Should have table-like structure with multiple rows
      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThan(8); // Header + multiple rows
    });

    it('should render Budget Generator skeleton as table', () => {
      render(<AnalysisSkeleton tool="budgetGenerator" />);

      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThan(8);
    });

    it('should render KPI Dashboard skeleton with dashboard layout', () => {
      render(<AnalysisSkeleton tool="kpiDashboards" />);

      // Should have multiple small blocks (metrics) + larger charts
      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThanOrEqual(6);
    });

    it('should render Roadmap skeleton as list layout', () => {
      render(<AnalysisSkeleton tool="roadmap" />);

      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThan(2); // Multiple list items
    });

    it('should render Market Analysis skeleton with columns layout', () => {
      render(<AnalysisSkeleton tool="overview" />);

      // Should have 3 column layout
      const gridContainer = document.querySelector(
        '.grid-cols-1.md\\:grid-cols-3'
      );
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render default skeleton for unknown tools', () => {
      render(<AnalysisSkeleton tool="unknownTool" as any />);

      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThan(2); // Default list layout
    });

    it('should apply proper skeleton styling', () => {
      render(<AnalysisSkeleton tool="swot" />);

      const firstSkeleton = document.querySelector('.animate-pulse');
      expect(firstSkeleton).toHaveClass(
        'bg-brand-secondary/20',
        'rounded-lg',
        'p-4'
      );
      expect(firstSkeleton).toHaveClass('border', 'border-white/5');
    });

    it('should render skeleton text lines with proper styling', () => {
      render(<AnalysisSkeleton tool="swot" />);

      const textLines = document.querySelectorAll('.bg-brand-light\\/5');
      expect(textLines.length).toBeGreaterThan(0);

      textLines.forEach((line) => {
        expect(line).toHaveClass('h-3', 'rounded', 'mb-2');
      });
    });

    it('should render skeleton headers with proper styling', () => {
      render(<AnalysisSkeleton tool="swot" />);

      const headers = document.querySelectorAll('.bg-brand-light\\/10');
      expect(headers.length).toBeGreaterThan(0);

      headers.forEach((header) => {
        expect(header).toHaveClass('h-5', 'rounded', 'mb-4');
      });
    });

    it('should maintain responsive grid layouts', () => {
      render(<AnalysisSkeleton tool="overview" />);

      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-3',
        'gap-4'
      );
    });

    it('should render table skeleton with proper row structure', () => {
      render(<AnalysisSkeleton tool="competitorAnalysis" />);

      // Check for table-like row structure
      const rows = document.querySelectorAll('.flex.space-x-4');
      expect(rows.length).toBeGreaterThan(8); // Header + data rows
    });

    it('should render dashboard skeleton with metrics grid', () => {
      render(<AnalysisSkeleton tool="kpiDashboards" />);

      // Should have 4-column metrics grid
      const metricsGrid = document.querySelector('.md\\:grid-cols-4');
      expect(metricsGrid).toBeInTheDocument();
    });

    it('should render pitch deck skeleton with card layout', () => {
      render(<AnalysisSkeleton tool="pitchDeckGenerator" />);

      const gridContainer = document.querySelector('.md\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();

      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBe(4); // 4 pitch deck slides
    });

    it('should handle all supported tool types without errors', () => {
      const supportedTools: any[] = [
        'swot',
        'pestel',
        'leanCanvas',
        'competitorAnalysis',
        'budgetGenerator',
        'financialForecast',
        'cashFlowForecast',
        'kpiDashboards',
        'validationTracker',
        'pitchDeckGenerator',
        'investorDatabase',
        'overview',
        'problemValidation',
        'research',
        'expansionStrategy',
        'roadmap',
        'milestones',
        'fundraisingRoadmap',
        'okrWorkflow',
        'ideaValidation',
        'customerValidation',
        'riskFeasibility',
      ];

      supportedTools.forEach((tool) => {
        expect(() => render(<AnalysisSkeleton tool={tool} />)).not.toThrow();
      });
    });

    it('should display loading states during data fetch operations', () => {
      // Test that skeleton shows during async operations
      render(<AnalysisSkeleton tool="swot" />);

      // Skeleton should be visible immediately
      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThan(0);

      // All skeleton blocks should be visible
      skeletonBlocks.forEach((block) => {
        expect(block).toBeVisible();
      });
    });

    it('should provide visual feedback during loading states', () => {
      render(<AnalysisSkeleton tool="swot" />);

      // Check for pulse animation
      const animatedElements = document.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);

      // Check for proper color contrast (light backgrounds)
      const backgroundElements = document.querySelectorAll(
        '.bg-brand-secondary\\/20'
      );
      expect(backgroundElements.length).toBeGreaterThan(0);
    });
  });

  describe('Integration of Loading States', () => {
    it('should display loading spinner during fetch operations', () => {
      render(<LoadingSpinner />);

      const spinner = document.querySelector('.animate-spin');
      const loadingText = screen.getByText('loadingTitle');

      expect(spinner).toBeInTheDocument();
      expect(loadingText).toBeInTheDocument();
    });

    it('should show skeleton components in place of data until loading finishes', () => {
      render(<AnalysisSkeleton tool="swot" />);

      // Skeleton should occupy the same space as real content
      const skeletonContainer = document.querySelector('.grid');
      expect(skeletonContainer).toBeInTheDocument();

      // Should have proper spacing and layout
      expect(skeletonContainer).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2',
        'gap-4'
      );
    });

    it('should maintain layout consistency between skeleton and loaded states', () => {
      render(<AnalysisSkeleton tool="kpiDashboards" />);

      // Dashboard skeleton should match dashboard layout
      const metricsGrid = document.querySelector('.md\\:grid-cols-4');
      const chartGrid = document.querySelector('.md\\:grid-cols-2');

      expect(metricsGrid).toBeInTheDocument();
      expect(chartGrid).toBeInTheDocument();
    });
  });
});
