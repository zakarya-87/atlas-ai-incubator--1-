import React, { ReactNode } from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { LanguageProvider, useLanguage } from './LanguageContext';

describe('LanguageContext', () => {
  const TestComponent: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    return (
      <div>
        <span data-testid="current-language">{language}</span>
        <button onClick={() => setLanguage('ar')}>Set Arabic</button>
        <button onClick={() => setLanguage('fr')}>Set French</button>
        <span data-testid="translation">{t('signIn')}</span>
      </div>
    );
  };

  it('should provide default English language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
  });

  it('should allow language switching', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const arabicButton = screen.getByText('Set Arabic');
    act(() => {
      arabicButton.click();
    });

    expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
  });

  it('should update document attributes when language changes', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const arabicButton = screen.getByText('Set Arabic');
    act(() => {
      arabicButton.click();
    });

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('should update document attributes for French (ltr)', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const frenchButton = screen.getByText('Set French');
    act(() => {
      frenchButton.click();
    });

    expect(document.documentElement.lang).toBe('fr');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('should provide translation function', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const translation = screen.getByTestId('translation');
    expect(translation).toBeInTheDocument();
  });

  it('should throw error when useLanguage is used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const TestOutsideProvider = () => {
      expect(() => useLanguage()).toThrow(
        'useLanguage must be used within a LanguageProvider'
      );
      return null;
    };

    render(<TestOutsideProvider />);
  });

  it('should render children correctly', () => {
    render(
      <LanguageProvider>
        <div data-testid="child-element">Child Content</div>
      </LanguageProvider>
    );

    expect(screen.getByTestId('child-element')).toHaveTextContent(
      'Child Content'
    );
  });
});
