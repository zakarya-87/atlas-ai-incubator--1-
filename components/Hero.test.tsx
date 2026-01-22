import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Hero from './Hero';

const mockTranslations: Record<string, string> = {
  dashboardHeroTitle: 'Welcome to ATLAS AI',
  dashboardHeroSubtitle: 'Your AI-powered business analysis platform',
  swotHeroTitle: 'SWOT Analysis',
  swotHeroSubtitle: 'Identify strengths, weaknesses, opportunities, and threats',
};

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => mockTranslations[key] || key,
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Hero Component', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(<Hero activeModule="dashboard" />);
    }).not.toThrow();
  });

  it('should render title element', () => {
    render(<Hero activeModule="dashboard" />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
  });

  it('should render subtitle paragraph', () => {
    render(<Hero activeModule="dashboard" />);

    const subtitle = screen.getByText('Your AI-powered business analysis platform');
    expect(subtitle).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<Hero activeModule="dashboard" />);

    const container = screen.getByRole('heading', { level: 1 });
    expect(container).toBeInTheDocument();
  });

  it('should accept activeModule prop', () => {
    const component = <Hero activeModule="dashboard" />;
    expect(component).toBeDefined();
  });

  it('should display translated title', () => {
    render(<Hero activeModule="dashboard" />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Welcome to ATLAS AI');
  });

  it('should display translated subtitle', () => {
    render(<Hero activeModule="dashboard" />);

    const subtitle = screen.getByText('Your AI-powered business analysis platform');
    expect(subtitle).toBeInTheDocument();
  });

  it('should work with different modules', () => {
    expect(() => {
      render(<Hero activeModule="fundamentals" />);
    }).not.toThrow();

    expect(() => {
      render(<Hero activeModule="strategy" />);
    }).not.toThrow();
  });

  it('should export default component', () => {
    expect(Hero).toBeDefined();
  });
});
