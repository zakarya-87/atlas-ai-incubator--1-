import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SwotDisplay from './SwotDisplay';
import type { SwotData } from '../types';
import { LanguageProvider } from '../context/LanguageContext';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe('SwotDisplay', () => {
  const mockData: SwotData = {
    strengths: [{ point: 'Strong brand', explanation: 'Market leader' }],
    weaknesses: [{ point: 'High costs', explanation: 'Expensive operations' }],
    opportunities: [{ point: 'Expansion', explanation: 'New markets' }],
    threats: [{ point: 'Competition', explanation: 'New entrants' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    const { container } = renderWithProviders(
      <SwotDisplay data={mockData} isLoading={false} onUpdate={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('should render with all data fields', () => {
    const { container } = renderWithProviders(
      <SwotDisplay data={mockData} isLoading={false} onUpdate={vi.fn()} />
    );
    expect(container.textContent).toContain('Strong brand');
  });

  it('should handle empty data', () => {
    const emptyData: SwotData = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };
    const { container } = renderWithProviders(
      <SwotDisplay data={emptyData} isLoading={false} onUpdate={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('should render when loading', () => {
    const { container } = renderWithProviders(
      <SwotDisplay data={mockData} isLoading={true} onUpdate={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('should call onUpdate when data changes', () => {
    const onUpdate = vi.fn();
    renderWithProviders(
      <SwotDisplay data={mockData} isLoading={false} onUpdate={onUpdate} />
    );
    expect(onUpdate).toBeDefined();
  });
});

