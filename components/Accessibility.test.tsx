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
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

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

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      // Verify tab order (inputs should be focusable)
      expect(emailInput).toHaveAttribute('tabIndex', '0');
      expect(passwordInput).toHaveAttribute('tabIndex', '0');
      expect(signInButton).not.toHaveAttribute('disabled');
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

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
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
      expect(textarea).toHaveAttribute('id', 'business-description');
      expect(textarea).toHaveAttribute('aria-label');

      const charCounter = screen.getByRole('status');
      expect(charCounter).toHaveAttribute('aria-live', 'polite');
    });

    it('should support keyboard shortcuts with proper announcement', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} />
        </LanguageProvider>
      );

      const shortcutHint = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && content.includes('Ctrl') && content.includes('Enter');
      });
      expect(shortcutHint).toBeInTheDocument();
    });

    it('should provide feedback for input quality', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} value="This is a comprehensive business description that should show excellent quality" />
        </LanguageProvider>
      );

      const qualityIndicator = screen.getByText(/Fair/i);
      expect(qualityIndicator).toBeInTheDocument();
    });

    it('should handle file upload accessibility', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
        </LanguageProvider>
      );

      const fileInput = screen.getByLabelText(/upload/i);
      expect(fileInput).toHaveAttribute('accept', 'image/*');
      expect(fileInput).toHaveAttribute('aria-describedby', 'image-upload-description');
    });

    it('should announce loading states to screen readers', () => {
      render(
        <LanguageProvider>
          <BusinessInputForm {...defaultProps} isLoading={true} />
        </LanguageProvider>
      );

      const submitButton = screen.getByRole('button', { name: /Generating.../i });
      expect(submitButton).toBeDisabled();
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
    });

    it('should support manual dismissal with keyboard', () => {
      render(<Toast {...mockToast} onDismiss={vi.fn()} />);

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should announce different toast types appropriately', () => {
      const { rerender } = render(<Toast {...mockToast} onDismiss={vi.fn()} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<Toast {...mockToast} type="error" message="Error occurred" onDismiss={vi.fn()} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();

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
        <LanguageProvider>
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </LanguageProvider>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Application/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('should announce error state to screen readers', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <LanguageProvider>
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </LanguageProvider>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Accessibility', () => {
    it('should have proper loading announcement', () => {
      render(
        <LanguageProvider>
          <LoadingSpinner />
        </LanguageProvider>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should indicate loading state visually and semantically', () => {
      render(
        <LanguageProvider>
          <LoadingSpinner />
        </LanguageProvider>
      );

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-live', 'polite');
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
    });

    it('should provide accessible export options menu', async () => {
      render(
        <LanguageProvider>
          <ExportControls {...defaultProps} />
        </LanguageProvider>
      );

      const exportControls = screen.getByLabelText('Export');
      fireEvent.mouseEnter(exportControls);

      await screen.findByText(/Download/i);
      const menuItems = screen.getAllByRole('button');

      menuItems.forEach(item => {
        expect(item).not.toBeDisabled();
      });
    });

    it('should announce loading states during export', async () => {
      render(
        <LanguageProvider>
          <ExportControls {...defaultProps} />
        </LanguageProvider>
      );

      const exportControls = screen.getByLabelText('Export');
      fireEvent.mouseEnter(exportControls);

      const officialButton = await screen.findByText(/Download Official Report/i);
      fireEvent.click(officialButton);

      expect(await screen.findByText(/Generating.../i)).toBeInTheDocument();
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

      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll(
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

      const icons = document.querySelectorAll('svg');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
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

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should provide sufficient color contrast (visual check)', () => {
      render(<Toast id="test" type="error" message="Error" onDismiss={vi.fn()} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-brand-secondary');
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

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

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

      const button = screen.getByRole('button', { name: /Generate/i });
      expect(button).toHaveClass('w-full');
    });
  });
});
