import { expect, vi, describe, it, beforeEach } from 'vitest';
import {
  generateSwotAnalysis,
  fetchVentureHistory,
  deleteAnalysisRecord
} from './geminiService';
import { STORAGE_KEYS } from '../utils/constants';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock API_CONFIG to reduce retry delays for tests
vi.mock('../utils/constants', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    API_CONFIG: {
      ...actual.API_CONFIG,
      RETRY_DELAY: 1, // 1ms delay instead of 2000ms
    }
  };
});


describe('geminiService', () => {
  vi.setConfig({ testTimeout: 10000 }); // Increase timeout for potentially long-running tests

  beforeEach(() => {
    mockFetch.mockClear();
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');
  });

  it('should verify localStorage works in test environment', () => {
    localStorage.setItem('test-key', 'test-value');
    expect(localStorage.getItem('test-key')).toBe('test-value');
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('test-token');
    expect(STORAGE_KEYS.AUTH_TOKEN).toBe('atlas_auth_token');
  });

  it('should spy on localStorage usage in service', async () => {
    const getItemSpy = vi.spyOn(localStorage, 'getItem');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await fetchVentureHistory('v1');

    // Check if the service is calling our localStorage
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    getItemSpy.mockRestore();
  });



  describe('generateSwotAnalysis', () => {
    it('should call the backend and handle completion', async () => {
      // Mock job submission
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ jobId: 'job-123' }),
      });
      // Mock polling completion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'completed', result: { id: 'analysis-123' } }),
      });

      const result = await generateSwotAnalysis('test business', 'en', 'venture-123');

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/analysis/generate'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/jobs/job-123'),
        expect.any(Object)
      );

    });

    it('should handle 401 Authentication error during generation', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(generateSwotAnalysis('test', 'en', 'v1'))
        .rejects.toThrow(/Authentication Required/i);
    });

    it('should handle 429 Rate limit error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(generateSwotAnalysis('test', 'en', 'v1'))
        .rejects.toThrow('errorRateLimit');
    });

    it('should handle 500 Server error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(generateSwotAnalysis('test', 'en', 'v1'))
        .rejects.toThrow('errorApiServerError');
    });

  });

  describe('fetchVentureHistory', () => {
    it('should return empty array when no token', async () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      const history = await fetchVentureHistory('v1');
      expect(history).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return parsed history data on success', async () => {
      const mockData = [{
        id: '1',
        module: 'strategy',
        tool: 'swot',
        createdAt: new Date().toISOString(),
        inputContext: 'test input',
        resultData: JSON.stringify({ strengths: [] })
      }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const history = await fetchVentureHistory('v1');
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/history/v1'),
        expect.any(Object)
      );
    });
  });

  describe('deleteAnalysisRecord', () => {
    it('should throw error when no token', async () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await expect(deleteAnalysisRecord('123')).rejects.toThrow(/Authentication required/i);
    });

    it('should delete record successfully', async () => {
      // Ensure token is set right before call
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');

      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
      await deleteAnalysisRecord('123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/history/123'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
  });

});


