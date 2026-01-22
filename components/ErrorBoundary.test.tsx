import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error occurred');
};

// Component that doesn't throw an error
const SafeComponent = () => <div>Safe component content</div>;

describe('ErrorBoundary Component (TC009)', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe component content')).toBeInTheDocument();
  });

  it('should catch runtime errors and display error message', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error occurred')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Application' })).toBeInTheDocument();
  });

  it('should prevent app crash when child component throws error', () => {
    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();
  });

  it('should display user-friendly error message', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error occurred')).toBeInTheDocument();
  });

  it('should log errors to console with error info', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Uncaught error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should handle generic error without message', () => {
    const GenericErrorComponent = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary>
        <GenericErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('should handle non-Error objects thrown', () => {
    const StringErrorComponent = () => {
      throw 'String error';
    };

    render(
      <ErrorBoundary>
        <StringErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should allow error recovery with reload button', () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;
    
    // Replace window.location with a mock object
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadMock },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: 'Reload Application' });
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalled();

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should display error boundary styling', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByText('Something went wrong').closest('div');
    expect(errorContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    expect(errorContainer).toHaveClass('p-8', 'text-center');
    expect(errorContainer).toHaveClass('bg-brand-secondary/30', 'rounded-xl');
    expect(errorContainer).toHaveClass('border', 'border-red-500/30');
  });

  it('should display warning icon in error state', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const warningIcon = document.querySelector('svg');
    expect(warningIcon).toBeInTheDocument();
    expect(warningIcon).toHaveClass('h-12', 'w-12', 'text-red-400');
  });
});