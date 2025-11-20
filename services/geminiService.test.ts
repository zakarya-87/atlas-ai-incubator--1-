
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSwotAnalysis } from './geminiService';

// Mock the entire module or specific exports if needed, 
// but for fetch, we mock the global fetch function.

describe('geminiService', () => {
  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);

  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  vi.stubGlobal('localStorage', mockLocalStorage);

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  it('should call the backend with correct headers and body', async () => {
    const mockResponse = {
      strengths: [{ point: 'S1', explanation: 'Exp 1' }],
      weaknesses: [],
      opportunities: [],
      threats: []
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await generateSwotAnalysis('Test Business', 'en', 'venture-123');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/analysis/generate'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: expect.any(String),
      })
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.ventureId).toBe('venture-123');
    expect(body.tool).toBe('swot');
    expect(body.module).toBe('strategy');
    expect(result).toEqual(mockResponse);
  });

  it('should handle 401 Authentication error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(generateSwotAnalysis('Test', 'en', 'v1'))
      .rejects
      .toThrow('Authentication Required. Please sign in.');
  });

  it('should handle 500 Server error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(generateSwotAnalysis('Test', 'en', 'v1'))
      .rejects
      .toThrow('errorApiServerError');
  });
});
