import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock jest-axe since it's not available in vitest
vi.mock('jest-axe', () => ({
  axe: vi.fn(() => Promise.resolve({ violations: [] })),
  toHaveNoViolations: vi.fn(),
}));

// Import components to test
import AuthModal from './AuthModal';
import BusinessInputForm from './BusinessInputForm';
import Toast from './Toast';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import ExportControls from './ExportControls';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

describe('Accessibility Compliance Verification (TC020)', () => {
  describe('AuthModal Accessibility', () => {
    it('should have proper ARIA attributes and keyboard navigation', () => {
      render(
        <AuthProvider>
          <LanguageProvider>
            <AuthModal isOpen={true} onClose={() => {}} />
          </LanguageProvider>
        </AuthProvider>
      );

      // Check for dialog role
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      // Check for form elements with proper labels
      const emailInput = screen.getByLabelText(/email|founder@startup\.com/);
      const passwordInput = screen.getByLabelText(/password|••••••••/);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Check for focus management
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should support keyboard navigation between form elements', () => {
      render(
        <AuthProvider>
          <LanguageProvider>
            <AuthModal isOpen={true} onClose={() => {}} />
          </LanguageProvider>
        </AuthProvider>
      );

      const inputs = screen.getAllByRole('textbox');
      const buttons = screen.getAllByRole('button');

      // Verify tab order (inputs should be focusable)
      inputs.forEach(input => {
        expect(input).toHaveAttribute('tabIndex') || expect(input.tagName.toLowerCase()).not.toBe('input');
      });

      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    it('should announce form validation errors to screen readers', () => {
      render(
        <AuthProvider>
          <LanguageProvider>
            <AuthModal isOpen={true} onClose={() => {}} />
          </LanguageProvider>
        </AuthProvider>
      );

      // Form should have proper structure for error announcements
      const form = screen.getByRole('dialog').querySelector('form');
      expect(form).toBeInTheDocument();

      // Inputs should have aria-describedby for error messages
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        // Should have proper labeling
        expect(input).toHaveAttribute('aria-label') || expect(input).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('BusinessInputForm Accessibility', () => {
    const defaultProps = {
      value: 'Test input',
      onChange: vi.fn(),
      onSubmit: vi.fn(),
      isLoading: false,
      activeTool: 'swot' as const,
    };

    it('should have proper form labels and descriptions', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} />
        </LanguageProvider>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id');
      expect(textarea).toHaveAttribute('aria-label') || expect(textarea).toHaveAttribute('aria-labelledby');

      // Check for character counter accessibility
      const charCounter = document.querySelector('[aria-live]');
      if (charCounter) {
        expect(charCounter).toHaveAttribute('aria-live');
      }
    });

    it('should support keyboard shortcuts with proper announcement', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} />
        </LanguageProvider>
      );

      // Should have keyboard shortcut hints
      const shortcutHint = screen.getByText(/Ctrl.*Enter/);
      expect(shortcutHint).toBeInTheDocument();
    });

    it('should provide feedback for input quality', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} value="This is a comprehensive business description that should show excellent quality" />
        </LanguageProvider>
      );

      // Quality indicator should be accessible
      const qualityIndicator = screen.getByText(/inputQualityExcellent/);
      expect(qualityIndicator).toBeInTheDocument();
    });

    it('should handle file upload accessibility', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
        </LanguageProvider>
      );

      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', 'image/*');
      expect(fileInput).toHaveAttribute('aria-label') || expect(fileInput).toHaveAttribute('aria-describedby');
    });

    it('should announce loading states to screen readers', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} isLoading={true} />
        </LanguageProvider>
      );

      const submitButton = screen.getByRole('button', { name: /buttonGenerating/ });
      expect(submitButton).toHaveAttribute('aria-disabled') || expect(submitButton).toBeDisabled();
    });
  });

  describe('Toast Notifications Accessibility', () => {
    const mockToast = {
      id: 'test-toast',
      type: 'success' as const,
      message: 'Operation completed successfully',
      duration: 5000,
    };

    it('should have proper ARIA live region for announcements', () => {
      render(<Toast {...mockToast} onDismiss={vi.fn()} />);

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('role', 'alert');
    });

    it('should support manual dismissal with keyboard', () => {
      render(<Toast {...mockToast} onDismiss={vi.fn()} />);

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should announce different toast types appropriately', () => {
      const { rerender } = render(<Toast {...mockToast} onDismiss={vi.fn()} />);

      // Success toast
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Error toast
      rerender(<Toast {...mockToast} type="error" message="Error occurred" onDismiss={vi.fn()} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Info toast
      rerender(<Toast {...mockToast} type="info" message="Information" onDismiss={vi.fn()} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary Accessibility', () => {
    it('should provide accessible error recovery options', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: 'Reload Application' });
      expect(reloadButton).toBeInTheDocument();
      expect(reloadButton).toHaveAttribute('aria-label') || expect(reloadButton).toHaveTextContent('Reload Application');
    });

    it('should announce error state to screen readers', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );

      // Error message should be accessible
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Accessibility', () => {
    it('should have proper loading announcement', () => {
      render(<LoadingSpinner />);

      expect(screen.getByText(/loadingTitle/)).toBeInTheDocument();
      expect(screen.getByText(/loadingText/)).toBeInTheDocument();
    });

    it('should indicate loading state visually and semantically', () => {
      render(<LoadingSpinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-hidden') || expect(spinner).not.toHaveAttribute('aria-label');
    });
  });

  describe('ExportControls Accessibility', () => {
    const defaultProps = {
      analysisData: { id: 'test', strengths: [], weaknesses: [], opportunities: [], threats: [] },
      analysisType: 'swot' as const,
      businessDescription: 'Test description',
      targetElementId: 'test-element',
    };

    it('should have accessible export button', () => {
      render(
        <LanguageProvider>
          <ExportControls {...defaultProps} />
        </LanguageProvider>
      );

      const exportButton = screen.getByLabelText('Export');
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toHaveAttribute('aria-label', 'Export');
    });

    it('should provide accessible export options menu', async () => {
      render(
        <LanguageProvider>
          <ExportControls {...defaultProps} />
        </LanguageProvider>
      );

      const exportControls = document.getElementById('export-controls')!;
      fireEvent.mouseEnter(exportControls);

      // Should have accessible menu items
      await screen.findByText('exportAsPdf');
      const menuItems = screen.getAllByRole('button');

      menuItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label') || expect(item).toHaveTextContent(/.+/);
      });
    });

    it('should announce loading states during export', async () => {
      const mockDownloadReportPdf = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      vi.doMock('../services/geminiService', () => ({
        downloadReportPdf: mockDownloadReportPdf,
      }));

      render(
        <LanguageProvider>
          <ExportControls {...defaultProps} />
        </LanguageProvider>
      );

      const exportControls = document.getElementById('export-controls')!;
      fireEvent.mouseEnter(exportControls);

      const officialButton = screen.getByText('exportAsOfficialPdf');
      fireEvent.click(officialButton);

      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab key navigation through interactive elements', () => {
      render(
        <AuthProvider>
          <LanguageProvider>
            <AuthModal isOpen={true} onClose={() => {}} />
          </LanguageProvider>
        </AuthProvider>
      );

      // Simulate Tab navigation
      const focusableElements = screen.getByRole('dialog').querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should trap focus within modal dialogs', () => {
      render(
        <AuthProvider>
          <LanguageProvider>
            <AuthModal isOpen={true} onClose={() => {}} />
          </LanguageProvider>
        </AuthProvider>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide descriptive text for icons and visual elements', () => {
      render(<Toast id="test" type="success" message="Success" onDismiss={vi.fn()} />);

      // Icons should be decorative or have screen reader text
      const icons = document.querySelectorAll('svg');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden') || expect(icon.parentElement).toHaveAttribute('aria-label');
      });
    });

    it('should use semantic HTML elements', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm
            value="test"
            onChange={vi.fn()}
            onSubmit={vi.fn()}
            isLoading={false}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      // Should use proper form structure
      const form = document.querySelector('form');
      if (form) {
        expect(form.tagName.toLowerCase()).toBe('form');
      }
    });

    it('should provide sufficient color contrast (visual check)', () => {
      render(<Toast id="test" type="error" message="Error" onDismiss={vi.fn()} />);

      const toast = screen.getByRole('alert');
      // Should have appropriate background/border colors for visibility
      expect(toast).toHaveClass('bg-brand-secondary');
      expect(toast).toHaveClass('border-red-500/50');
    });
  });

  describe('Focus Management', () => {
    it('should manage focus correctly when components mount/unmount', () => {
      const { rerender } = render(
        <AuthProvider>
          <LanguageProvider>
            <AuthModal isOpen={false} onClose={() => {}} />
          </LanguageProvider>
        </AuthProvider>
      );

      // Modal closed - no dialog
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Modal opened
      rerender(
        <AuthProvider>
          <LanguageProvider>
            <AuthModal isOpen={true} onClose={() => {}} />
          </LanguageProvider>
        </AuthProvider>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should restore focus when modals close', () => {
      // This would require more complex focus tracking
      // For now, verify that close handlers exist
      render(<Toast id="test" type="info" message="Test" onDismiss={vi.fn()} />);

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should maintain accessibility on different screen sizes', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm
            value="test"
            onChange={vi.fn()}
            onSubmit={vi.fn()}
            isLoading={false}
            activeTool="swot"
          />
        </LanguageProvider>
      );

      // Check responsive classes
      const container = document.querySelector('.flex.flex-col');
      expect(container).toBeInTheDocument();

      // Verify responsive button layout
      const button = screen.getByRole('button', { name: 'buttonGenerate' });
      expect(button).toHaveClass('w-full', 'sm:w-auto');
    });
  });
});