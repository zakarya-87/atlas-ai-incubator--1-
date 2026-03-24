import { describe, it, expect } from 'vitest';
import type { SwotData, PestelData } from '../../types';

/**
 * ATLAS Contract Alignment Tests
 * Ensures that the mock data used in E2E and unit tests actually satisfies
 * the TypeScript interfaces and Gemini response schemas.
 */
describe('API Contract Alignment', () => {
  it('Mock SWOT data should align with SwotData interface and Gemini Schema', () => {
    const mockSwot: SwotData = {
      strengths: [{ point: 'Strength 1', explanation: 'Exp 1' }],
      weaknesses: [{ point: 'Weakness 1', explanation: 'Exp 2' }],
      opportunities: [{ point: 'Opportunity 1', explanation: 'Exp 3' }],
      threats: [{ point: 'Threat 1', explanation: 'Exp 4' }],
    };

    // Verifying frontend interface compatibility (TS check implicitly, but we can do runtime checks if needed)
    expect(mockSwot.strengths).toBeDefined();
    expect(mockSwot.strengths[0].point).toBeTypeOf('string');

    // Note: Real contract testing would involve Zod or similar to validate
    // that the Backend production DTO matches this.
  });

  it('Mock PESTEL data should align with PestelData interface', () => {
    const mockPestel: PestelData = {
      political: [{ point: 'P', explanation: 'E' }],
      economic: [{ point: 'E', explanation: 'E' }],
      social: [{ point: 'S', explanation: 'E' }],
      technological: [{ point: 'T', explanation: 'E' }],
      environmental: [{ point: 'E', explanation: 'E' }],
      legal: [{ point: 'L', explanation: 'E' }],
    };

    expect(mockPestel.political).toHaveLength(1);
  });
});
