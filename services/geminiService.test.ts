import { expect, vi, describe, it, beforeEach, afterEach } from 'vitest';
import {
  generateSwotAnalysis,
  fetchVentureHistory,
  deleteAnalysisRecord,
  cancelAllRequests,
} from './geminiService';
import { STORAGE_KEYS, ERROR_CODES } from '../utils/constants';

describe('geminiService', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = { [STORAGE_KEYS.AUTH_TOKEN]: 'test-token' };
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
    });
  });

  afterEach(() => {
    cancelAllRequests();
    vi.restoreAllMocks();
  });

  it('should verify localStorage works in test environment', () => {
    localStorage.setItem('test-key', 'test-value');
    expect(localStorage.getItem('test-key')).toBe('test-value');
  });

  describe('generateSwotAnalysis', () => {
    it('should call the backend and handle completion', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ jobId: 'job-123' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            status: 'completed',
            result: { id: 'analysis-123' },
          }),
        } as Response);

      const result = await generateSwotAnalysis(
        'test business',
        'en',
        'venture-123',
        { pollInterval: 1, retryDelay: 1 }
      );

      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle 401 Authentication error during generation', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Unauthorized'),
      } as Response);

      await expect(
        generateSwotAnalysis('test', 'en', 'v1', { retryDelay: 1 })
      ).rejects.toThrow(ERROR_CODES.AUTH_REQUIRED);
    });

    it('should handle 429 Rate limit error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: () => Promise.resolve('Rate Limit'),
      } as Response);

      await expect(
        generateSwotAnalysis('test', 'en', 'v1', { retryDelay: 1 })
      ).rejects.toThrow(ERROR_CODES.RATE_LIMIT);
    });

    it('should handle 500 Server error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server Error'),
      } as Response);

      await expect(
        generateSwotAnalysis('test', 'en', 'v1', { retryDelay: 1 })
      ).rejects.toThrow(ERROR_CODES.SERVER_ERROR);
    });
  });

  describe('fetchVentureHistory', () => {
    it('should return empty array when no token', async () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      const history = await fetchVentureHistory('v1');
      expect(history).toEqual([]);
    });

    it('should return parsed history data on success', async () => {
      const mockData = [
        {
          id: '1',
          module: 'strategy',
          tool: 'swot',
          createdAt: new Date().toISOString(),
          inputContext: 'test input',
          resultData: JSON.stringify({ strengths: [] }),
        },
      ];
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      const history = await fetchVentureHistory('v1');
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('1');
    });
  });

  describe('deleteAnalysisRecord', () => {
    it('should throw error when no token', async () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await expect(deleteAnalysisRecord('123')).rejects.toThrow(
        ERROR_CODES.AUTH_REQUIRED
      );
    });

    it('should delete record successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true, status: 200 } as Response);
      await deleteAnalysisRecord('123');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/history/123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
