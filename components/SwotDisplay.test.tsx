import { render, screen } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach } from 'vitest';
import React from 'react';
import SwotDisplay from './SwotDisplay';
import type { SwotData } from '../types';
import { LanguageProvider } from '../context/LanguageContext';

const mockSwotData: SwotData = {
  strengths: [
    { point: "Strong technical expertise", explanation: "Experienced development team with AI/ML background", completed: false },
    { point: "Innovative product design", explanation: "Unique value proposition in the market", completed: false },
  ],
  weaknesses: [
    { point: "Limited market presence", explanation: "New entrant in competitive market", completed: false },
    { point: "Resource constraints", explanation: "Startup funding limitations", completed: false },
  ],
  opportunities: [
    { point: "Growing AI market", explanation: "Industry expansion and increasing demand", completed: false },
    { point: "Strategic partnerships", explanation: "Potential collaboration opportunities", completed: false },
  ],
  threats: [
    { point: "Competitive landscape", explanation: "Established competitors in the space", completed: false },
    { point: "Regulatory changes", explanation: "Evolving AI regulations and policies", completed: false },
  ],
};

const renderSwotDisplay = (data: SwotData | undefined = mockSwotData, onUpdate = vi.fn()) => {
  return render(
    <LanguageProvider>
      <SwotDisplay data={data} onUpdate={onUpdate} />
    </LanguageProvider>
  );
};

describe('SwotDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    const { container } = renderSwotDisplay();
    expect(container).toBeTruthy();
  });

  it('should render all four SWOT quadrant headings', () => {
    renderSwotDisplay();
    
    // Use getAllByRole and check for h3 elements with the quadrant titles
    const headings = screen.getAllByRole('heading', { level: 3 });
    const quadrantTitles = headings.map(h => h.textContent);
    
    expect(quadrantTitles).toContain('Strengths');
    expect(quadrantTitles).toContain('Weaknesses');
    expect(quadrantTitles).toContain('Opportunities');
    expect(quadrantTitles).toContain('Threats');
  });

  it('should render all data fields in each quadrant', () => {
    renderSwotDisplay();
    
    // Check strengths
    expect(screen.getByText(/Strong technical expertise/i)).toBeInTheDocument();
    expect(screen.getByText(/Experienced development team/i)).toBeInTheDocument();
    
    // Check weaknesses
    expect(screen.getByText(/Limited market presence/i)).toBeInTheDocument();
    expect(screen.getByText(/New entrant in competitive market/i)).toBeInTheDocument();
    
    // Check opportunities
    expect(screen.getByText(/Growing AI market/i)).toBeInTheDocument();
    expect(screen.getByText(/Industry expansion/i)).toBeInTheDocument();
    
    // Check threats
    expect(screen.getByText(/Competitive landscape/i)).toBeInTheDocument();
    expect(screen.getByText(/Established competitors/i)).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    const emptyData: SwotData = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };
    
    const { container } = renderSwotDisplay(emptyData);
    expect(container).toBeTruthy();
    
    // Quadrants should still be present but empty
    const headings = screen.getAllByRole('heading', { level: 3 });
    const quadrantTitles = headings.map(h => h.textContent);
    expect(quadrantTitles).toContain('Strengths');
    expect(quadrantTitles).toContain('Weaknesses');
    expect(quadrantTitles).toContain('Opportunities');
    expect(quadrantTitles).toContain('Threats');
  });

  it('should handle undefined data gracefully', () => {
    // This tests the component's robustness when LLM returns undefined
    const onUpdate = vi.fn();
    expect(() => {
      render(
        <LanguageProvider>
          <SwotDisplay data={undefined as any} onUpdate={onUpdate} />
        </LanguageProvider>
      );
    }).not.toThrow();
    
    // Should show a helpful message
    expect(screen.getByText(/No analysis data available/i)).toBeInTheDocument();
  });

  it('should handle null data gracefully', () => {
    const onUpdate = vi.fn();
    expect(() => {
      render(
        <LanguageProvider>
          <SwotDisplay data={null as any} onUpdate={onUpdate} />
        </LanguageProvider>
      );
    }).not.toThrow();
    
    expect(screen.getByText(/No analysis data available/i)).toBeInTheDocument();
  });

  it('should handle partial data (some quadrants missing)', () => {
    const partialData: SwotData = {
      strengths: [{ point: "Only strengths", explanation: "Just one", completed: false }],
      weaknesses: undefined as any,
      opportunities: [],
      threats: undefined as any,
    };
    
    renderSwotDisplay(partialData);
    expect(screen.getByText(/Only strengths/i)).toBeInTheDocument();
    
    // All quadrant headings should still be present
    const headings = screen.getAllByRole('heading', { level: 3 });
    const quadrantTitles = headings.map(h => h.textContent);
    expect(quadrantTitles).toContain('Strengths');
    expect(quadrantTitles).toContain('Weaknesses');
    expect(quadrantTitles).toContain('Opportunities');
    expect(quadrantTitles).toContain('Threats');
  });

  it('should render long text content properly', () => {
    const longTextData: SwotData = {
      ...mockSwotData,
      strengths: [
        { 
          point: "Very long point description".repeat(10), 
          explanation: "Very long explanation that spans multiple lines and should still be rendered properly without breaking the UI".repeat(5),
          completed: false 
        },
      ],
    };
    
    const { container } = renderSwotDisplay(longTextData);
    expect(container).toBeTruthy();
    expect(screen.getByText(/Very long point description/i)).toBeInTheDocument();
  });

  it('should render with special characters and emojis in data', () => {
    const specialCharData: SwotData = {
      ...mockSwotData,
      strengths: [
        { point: "Point with émojis 🎉 and symbols @#$%", explanation: "Special chars: àéïõü & markdown **bold**", completed: false },
      ],
    };
    
    renderSwotDisplay(specialCharData);
    expect(screen.getByText(/Point with émojis/i)).toBeInTheDocument();
  });

  it('should handle data with missing point or explanation fields', () => {
    const incompleteData: SwotData = {
      strengths: [
        { point: "Only point", explanation: "", completed: false },
        { point: "", explanation: "Only explanation", completed: false },
        { completed: false }, // Missing both
      ],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };
    
    const { container } = renderSwotDisplay(incompleteData);
    expect(container).toBeTruthy();
    expect(screen.getByText(/Only point/i)).toBeInTheDocument();
  });

  it('should handle LLM response with unexpected structure', () => {
    // This simulates when LLM returns data that doesn't match the expected schema
    const unexpectedData = {
      strength: [{ point: "Wrong key name", explanation: "LLM used wrong key" }], // singular instead of plural
      weaknesses: [],
      opportunities: [],
      threats: [],
    } as any;
    
    const { container } = renderSwotDisplay(unexpectedData);
    expect(container).toBeTruthy();
    // Since data.strengths is undefined, it will show "No analysis data available"
    expect(screen.getByText(/No analysis data available/i)).toBeInTheDocument();
  });

  it('should handle array instead of object from LLM', () => {
    // This simulates when LLM returns an array instead of an object
    const arrayData = [] as any;
    
    const { container } = renderSwotDisplay(arrayData);
    expect(container).toBeTruthy();
    // Arrays don't have 'strengths' property, so it will show "No analysis data available"
    expect(screen.getByText(/No analysis data available/i)).toBeInTheDocument();
  });

  it('should handle string instead of object from LLM', () => {
    // This simulates when LLM returns a string instead of an object
    const stringData = "LLM returned a string" as any;
    
    const { container } = renderSwotDisplay(stringData);
    expect(container).toBeTruthy();
    expect(screen.getByText(/No analysis data available/i)).toBeInTheDocument();
  });

  it('should handle data with nested structures', () => {
    const nestedData: SwotData = {
      strengths: [
        { 
          point: "Nested structure", 
          explanation: "Should handle nested objects gracefully",
          completed: false,
          metadata: { source: "LLM", confidence: 0.95 }
        },
      ],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };
    
    const { container } = renderSwotDisplay(nestedData);
    expect(container).toBeTruthy();
    expect(screen.getByText(/Nested structure/i)).toBeInTheDocument();
  });
});
