import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSwotAnalysis } from './geminiService';
import { API_CONFIG, ERROR_CODES } from '../utils/constants';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Gemini Service Error Handling (TC008)', () => {
  const mockToken = 'mock-jwt-token';
  const mockVentureId = 'test-venture-123';
  const mockDescription = 'Test business description';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => mockToken),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle API timeout errors gracefully', async () => {
    // Mock timeout scenario
    fetchMock.mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AbortError')), 100);
      });
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow(ERROR_CODES.TIMEOUT);
  });

  it('should handle network connectivity errors', async () => {
    fetchMock.mockRejectedValue(new Error('Failed to fetch'));

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow(ERROR_CODES.NETWORK_ERROR);
  });

  it('should handle 401 authentication errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow('Authentication Required. Please sign in.');
  });

  it('should handle 429 rate limit errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ message: 'Rate limit exceeded' }),
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow(ERROR_CODES.RATE_LIMIT);
  });

  it('should handle 500 server errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal server error' }),
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow(ERROR_CODES.SERVER_ERROR);
  });

  it('should handle job failure during polling', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/analysis/generate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ jobId: 'test-job-123' }),
        });
      }
      if (url.includes('/jobs/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'failed',
            error: 'AI processing failed'
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow('AI processing failed');
  });

  it('should handle job polling timeout', async () => {
    // Mock job that never completes
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/analysis/generate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ jobId: 'test-job-123' }),
        });
      }
      if (url.includes('/jobs/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'processing' }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow('Job timeout after 5 minutes');
  });

  it('should retry on 5xx errors with exponential backoff', async () => {
    let callCount = 0;
    fetchMock.mockImplementation((url: string) => {
      callCount++;
      if (url.includes('/analysis/generate')) {
        if (callCount <= 2) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ jobId: 'test-job-123' }),
        });
      }
      if (url.includes('/jobs/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'completed',
            result: {
              strengths: [{ point: 'Test', explanation: 'Test' }],
              weaknesses: [], opportunities: [], threats: []
            }
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const result = await generateSwotAnalysis(mockDescription, 'en', mockVentureId);

    // Should have retried (3 calls for generate endpoint)
    expect(callCount).toBeGreaterThan(1);
    expect(result).toHaveProperty('strengths');
  });

  it('should not retry on 4xx client errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow(ERROR_CODES.GENERIC);
  });

  it('should handle missing authentication token', async () => {
    // Mock localStorage without token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow('Authentication Required. Please sign in.');
  });

  it('should capture and log API error details', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Detailed server error message'),
    });

    await expect(generateSwotAnalysis(mockDescription, 'en', mockVentureId))
      .rejects.toThrow(ERROR_CODES.SERVER_ERROR);

    expect(consoleSpy).toHaveBeenCalledWith('Backend Error Response:', 'Detailed server error message');

    consoleSpy.mockRestore();
  });
});