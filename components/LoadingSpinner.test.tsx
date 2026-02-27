import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        loadingTitle: 'Generating Analysis',
        loadingText: 'Please wait while we analyze your input...',
      };
      return translations[key] || key;
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('LoadingSpinner Component', () => {
  it('should render loading spinner with proper structure', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading content');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('should display loading title text', () => {
    render(<LoadingSpinner />);

    const title = screen.getByText('Generating Analysis');
    expect(title).toBeInTheDocument();
    expect(title.tagName.toLowerCase()).toBe('p');
    expect(title).toHaveClass('mt-4 text-lg font-semibold');
  });

  it('should display loading description text', () => {
    render(<LoadingSpinner />);

    const description = screen.getByText(
      'Please wait while we analyze your input...'
    );
    expect(description).toBeInTheDocument();
    expect(description.tagName.toLowerCase()).toBe('p');
    expect(description).toHaveClass('text-sm');
  });

  it('should have spinning animation element', () => {
    render(<LoadingSpinner />);

    const spinnerElement = screen.getByText((content, element) => {
      return element?.classList.contains('animate-spin') ?? false;
    });
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const container = screen.getByRole('status');
    expect(container).toHaveClass(
      'flex flex-col items-center justify-center text-center text-brand-light'
    );
  });

  it('should render without crashing', () => {
    expect(() => {
      render(<LoadingSpinner />);
    }).not.toThrow();
  });
});
