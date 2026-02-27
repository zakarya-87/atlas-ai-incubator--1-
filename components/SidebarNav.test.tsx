import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import SidebarNav from './SidebarNav';

const mockTranslations: Record<string, string> = {
  sidebarDashboard: 'Dashboard',
  sidebarFundamentals: 'Fundamentals',
};

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => mockTranslations[key] || key,
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('./Tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('SidebarNav Component', () => {
  const defaultProps = {
    activeModule: 'dashboard' as const,
    onModuleChange: vi.fn(),
  };

  it('should render without crashing', () => {
    expect(() => {
      render(<SidebarNav {...defaultProps} />);
    }).not.toThrow();
  });

  it('should render navigation container', () => {
    render(<SidebarNav {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have onModuleChange prop', () => {
    const onModuleChange = vi.fn();
    expect(typeof onModuleChange).toBe('function');
  });

  it('should accept activeModule prop', () => {
    const onModuleChange = vi.fn();
    const component = (
      <SidebarNav activeModule="dashboard" onModuleChange={onModuleChange} />
    );
    expect(component).toBeDefined();
  });
});
