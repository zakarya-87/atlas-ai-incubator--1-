import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import ErrorMessage from './ErrorMessage';

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        errorTitle: 'Something went wrong',
        buttonGenerating: 'Generating...',
        buttonRetry: 'Try Again',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ErrorMessage Component', () => {
  const defaultProps = {
    code: 'errorApiGeneric',
    message: 'An error occurred',
  };

  it('should render with proper container structure', () => {
    render(<ErrorMessage {...defaultProps} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should display title and description', () => {
    render(<ErrorMessage {...defaultProps} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('should show retry button for retryable errors', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage {...defaultProps} onRetry={onRetry} />);
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
  });

  it('should call onRetry when clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage {...defaultProps} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should disable button when retrying', () => {
    render(
      <ErrorMessage {...defaultProps} isRetrying={true} onRetry={() => {}} />
    );
    expect(
      screen.getByRole('button', { name: /generating.../i })
    ).toBeDisabled();
  });

  it('should not show retry for empty description error', () => {
    render(<ErrorMessage code="errorEmptyDescription" message="Empty" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => render(<ErrorMessage {...defaultProps} />)).not.toThrow();
  });
});
