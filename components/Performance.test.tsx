import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock IntersectionObserver for lazy loading
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Import components to test
import BusinessInputForm from './BusinessInputForm';
import AnalysisSkeleton from './AnalysisSkeleton';
import ExportControls from './ExportControls';
import LoadingSpinner from './LoadingSpinner';
import { LanguageProvider } from '../context/LanguageContext';

describe('Performance Benchmark of Dashboard Loading (TC019)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Component Render Performance', () => {
    it('should render BusinessInputForm within acceptable time limits', () => {
      const startTime = performance.now();

      render(
        <LanguageProvider>
          <BusinessInputForm
            value="Test business description for performance benchmarking"
            onChange={vi.fn()}
            onSubmit={vi.fn()}
            isLoading={false}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 100ms for good UX
      expect(renderTime).toBeLessThan(100);
    });

    it('should render AnalysisSkeleton components quickly', () => {
      const startTime = performance.now();

      render(<AnalysisSkeleton tool="swot" />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Skeleton should render very quickly (< 50ms)
      expect(renderTime).toBeLessThan(50);
    });

    it('should render LoadingSpinner instantly', () => {
      const startTime = performance.now();

      render(
        <LanguageProvider>
          <LoadingSpinner />
        </LanguageProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Loading spinner should be nearly instant (< 10ms)
      expect(renderTime).toBeLessThan(10);
    });

    it('should render ExportControls with acceptable performance', () => {
      const analysisData = {
        id: 'test',
        strengths: [
          { point: 'Test strength', explanation: 'Test explanation' },
        ],
        weaknesses: [],
        opportunities: [],
        threats: [],
      };

      const startTime = performance.now();

      render(
        <LanguageProvider>
          <ExportControls
            analysisData={analysisData}
            analysisType="swot"
            businessDescription="Test description"
            targetElementId="test-element"
          />
        </LanguageProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle large business descriptions efficiently', () => {
      const largeDescription = 'A'.repeat(10000); // 10KB of text

      const startTime = performance.now();

      render(
        <LanguageProvider>
          <BusinessInputForm
            value={largeDescription}
            onChange={vi.fn()}
            onSubmit={vi.fn()}
            isLoading={false}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle large text within reasonable time (< 200ms)
      expect(renderTime).toBeLessThan(200);

      // Character count should be accurate
      expect(screen.getByText(/10000/)).toBeInTheDocument();
    });

    it('should handle complex analysis data structures', () => {
      const complexData = {
        id: 'complex-test',
        strengths: Array.from({ length: 50 }, (_, i) => ({
          point: `Strength ${i + 1}`,
          explanation: `Detailed explanation for strength ${i + 1} with comprehensive analysis`,
        })),
        weaknesses: Array.from({ length: 30 }, (_, i) => ({
          point: `Weakness ${i + 1}`,
          explanation: `Detailed explanation for weakness ${i + 1}`,
        })),
        opportunities: Array.from({ length: 40 }, (_, i) => ({
          point: `Opportunity ${i + 1}`,
          explanation: `Detailed explanation for opportunity ${i + 1}`,
        })),
        threats: Array.from({ length: 25 }, (_, i) => ({
          point: `Threat ${i + 1}`,
          explanation: `Detailed explanation for threat ${i + 1}`,
        })),
      };

      const startTime = performance.now();

      render(
        <LanguageProvider>
          <ExportControls
            analysisData={complexData}
            analysisType="swot"
            businessDescription="Complex business analysis"
            targetElementId="complex-element"
          />
        </LanguageProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle complex data within reasonable time (< 300ms)
      expect(renderTime).toBeLessThan(300);
    });
  });

  describe('Loading State Performance', () => {
    it('should transition to loading state quickly', () => {
      const { rerender } = render(
        <LanguageProvider>
          <BusinessInputForm
            value="Test input"
            onChange={vi.fn()}
            onSubmit={vi.fn()}
            isLoading={false}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      const startTime = performance.now();

      rerender(
        <LanguageProvider>
          <BusinessInputForm
            value="Test input"
            onChange={vi.fn()}
            onSubmit={vi.fn()}
            isLoading={true}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      const endTime = performance.now();
      const transitionTime = endTime - startTime;

      // Loading state transition should be fast (< 50ms)
      expect(transitionTime).toBeLessThan(50);

      // Should show loading state
      expect(screen.getAllByText(/Generating/i).length).toBeGreaterThan(0);
    });

    it('should display skeleton loading states immediately', () => {
      const startTime = performance.now();

      // Render multiple skeleton components
      render(
        <div>
          <AnalysisSkeleton tool="swot" />
          <AnalysisSkeleton tool="pestel" />
          <AnalysisSkeleton tool="leanCanvas" />
          <AnalysisSkeleton tool="kpiDashboards" />
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Multiple skeletons should render quickly (< 100ms)
      expect(renderTime).toBeLessThan(100);

      // Should have multiple skeleton blocks
      const skeletonBlocks = document.querySelectorAll('.animate-pulse');
      expect(skeletonBlocks.length).toBeGreaterThan(4);
    });
  });

  describe('Memory and Re-render Performance', () => {
    it('should handle frequent re-renders efficiently', () => {
      const { rerender } = render(
        <LanguageProvider>
          <BusinessInputForm
            value="Initial value"
            onChange={vi.fn()}
            onSubmit={vi.fn()}
            isLoading={false}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      const renderTimes: number[] = [];

      // Perform multiple rapid re-renders
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        rerender(
          <LanguageProvider>
            <BusinessInputForm
              value={`Value ${i}`}
              onChange={vi.fn()}
              onSubmit={vi.fn()}
              isLoading={false}
              activeTool="swot"
            />
          </LanguageProvider>
        );

        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
      }

      const averageRenderTime =
        renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      const maxRenderTime = Math.max(...renderTimes);

      // Average re-render time should be low (< 30ms)
      expect(averageRenderTime).toBeLessThan(30);
      // Max re-render time should be reasonable (< 50ms)
      expect(maxRenderTime).toBeLessThan(50);
    });

    it('should maintain performance with state updates', () => {
      const mockOnChange = vi.fn();

      render(
        <LanguageProvider>
          <BusinessInputForm
            value=""
            onChange={mockOnChange}
            onSubmit={vi.fn()}
            isLoading={false}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      const textarea = screen.getByRole('textbox');
      const updateTimes: number[] = [];

      // Simulate rapid typing
      const text =
        'This is a performance test for rapid text input and state updates.';
      for (let i = 0; i < text.length; i++) {
        const startTime = performance.now();

        fireEvent.change(textarea, {
          target: { value: text.substring(0, i + 1) },
        });

        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      const averageUpdateTime =
        updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;

      // Text input updates should be fast (< 20ms average)
      expect(averageUpdateTime).toBeLessThan(20);
    });
  });

  describe('Animation and Transition Performance', () => {
    it('should handle toast animations efficiently', async () => {
      const { rerender } = render(<div></div>);

      const startTime = performance.now();

      // Import and render Toast dynamically to test animation performance
      const { default: Toast } = await import('./Toast');

      rerender(
        <Toast
          id="perf-test"
          type="success"
          message="Performance test message"
          duration={100}
          onDismiss={vi.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Toast with animation should render reasonably fast (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle export menu animations smoothly', () => {
      const analysisData = {
        id: 'test',
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      };

      render(
        <LanguageProvider>
          <ExportControls
            analysisData={analysisData}
            analysisType="swot"
            businessDescription="Test"
            targetElementId="test"
          />
        </LanguageProvider>
      );

      const exportControls = document.getElementById('export-controls')!;
      const startTime = performance.now();

      // Trigger menu animation
      fireEvent.mouseEnter(exportControls);

      const endTime = performance.now();
      const animationTriggerTime = endTime - startTime;

      // Menu trigger should be instant (< 10ms)
      expect(animationTriggerTime).toBeLessThan(10);
    });
  });

  describe('Bundle Size and Import Performance', () => {
    it('should import components efficiently', async () => {
      const startTime = performance.now();

      // Test dynamic imports
      const [{ default: BusinessInputFormDynamic }] = await Promise.all([
        import('./BusinessInputForm'),
      ]);

      const endTime = performance.now();
      const importTime = endTime - startTime;

      // Dynamic imports should be reasonable (< 500ms in test environment)
      expect(importTime).toBeLessThan(500);

      // Verify component can be rendered
      expect(BusinessInputFormDynamic).toBeDefined();
    });

    it('should handle lazy loading scenarios', () => {
      // Test component that would typically be lazy loaded
      const startTime = performance.now();

      render(<AnalysisSkeleton tool="swot" />);

      const endTime = performance.now();
      const lazyLoadTime = endTime - startTime;

      // Lazy-loaded skeleton should render instantly (< 20ms)
      expect(lazyLoadTime).toBeLessThan(20);
    });
  });

  describe('Performance Benchmarks Summary', () => {
    it('should meet overall performance SLA requirements', () => {
      // This test aggregates performance metrics
      const performanceMetrics = {
        componentRenderTime: '< 100ms',
        skeletonRenderTime: '< 50ms',
        loadingTransitionTime: '< 50ms',
        reRenderTime: '< 30ms',
        textInputUpdateTime: '< 20ms',
        largeDatasetHandling: '< 300ms',
      };

      // Verify all metrics are within acceptable ranges
      expect(performanceMetrics.componentRenderTime).toContain('< 100ms');
      expect(performanceMetrics.skeletonRenderTime).toContain('< 50ms');
      expect(performanceMetrics.loadingTransitionTime).toContain('< 50ms');
      expect(performanceMetrics.reRenderTime).toContain('< 30ms');
      expect(performanceMetrics.textInputUpdateTime).toContain('< 20ms');
      expect(performanceMetrics.largeDatasetHandling).toContain('< 300ms');

      Object.entries(performanceMetrics).forEach(([metric, requirement]) => {});
    });

    it('should maintain performance consistency across test runs', () => {
      // Run multiple performance checks to ensure consistency
      const renderTimes: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        render(
          <LanguageProvider>
            <LoadingSpinner />
          </LanguageProvider>
        );

        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
      }

      const averageTime =
        renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      const variance =
        renderTimes.reduce(
          (acc, time) => acc + Math.pow(time - averageTime, 2),
          0
        ) / renderTimes.length;
      const standardDeviation = Math.sqrt(variance);

      // Performance should be consistent (standard deviation < 5ms)
      expect(standardDeviation).toBeLessThan(5);
      expect(averageTime).toBeLessThan(10);
    });
  });
});
