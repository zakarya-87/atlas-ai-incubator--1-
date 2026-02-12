import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiService from './geminiService';
import { ERROR_CODES } from '../utils/constants';

describe('geminiService Error Handling', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = { 'atlas_auth_token': 'mock-token' };
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
    });
  });

  afterEach(async () => {
    geminiService.cancelAllRequests();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should be defined', () => {
    expect(geminiService.generateSwotAnalysis).toBeDefined();
    expect(geminiService.fetchVentureHistory).toBeDefined();
  });

  it('should handle API timeout errors gracefully', async () => {
    // Use fake timers to advance time deterministically
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(() => new Promise(() => { })); // Never resolves

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1, timeout: 50 });

    // Advance time to trigger the timeout
    await vi.advanceTimersByTimeAsync(100);

    try {
      await promise;
    } catch (e: any) {
      expect(e.message).toContain(ERROR_CODES.TIMEOUT);
    }
  });

  it('should handle network connectivity issues', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('TypeError: Failed to fetch'));
    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1 });
    } catch (e: any) {
      expect(e.message).toBe(ERROR_CODES.NETWORK_ERROR);
    }
  });

  it('should handle 401 Unauthorized errors', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    } as Response);
    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1 });
    } catch (e: any) {
      expect(e.message).toBe(ERROR_CODES.AUTH_REQUIRED);
    }
  });

  it('should handle 429 Rate Limit errors', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Too Many Requests'),
    } as Response);
    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1 });
    } catch (e: any) {
      expect(e.message).toBe(ERROR_CODES.RATE_LIMIT);
    }
  });

  it('should handle 500 Server errors after retries', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    } as Response);
    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1 });
    } catch (e: any) {
      expect(e.message).toBe(ERROR_CODES.SERVER_ERROR);
    }
  });

  it('should handle job failure status', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ jobId: 'job-123' }),
    } as Response);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'failed', error: 'AI generation failed' }),
    } as Response);

    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1, pollInterval: 1 });
    } catch (e: any) {
      expect(e.message).toBe('AI generation failed');
    }
  });

  it('should handle job polling timeout', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ jobId: 'job-123' }),
    } as Response);
    // Return processing for all subsequent calls
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'processing' }),
    } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid', {
      retryDelay: 1,
      pollInterval: 1,
      timeout: 50
    });

    await vi.advanceTimersByTimeAsync(100);

    try {
      await promise;
    } catch (e: any) {
      expect(e.message).toContain(ERROR_CODES.TIMEOUT);
    }
  });

  it('should retry on 5xx errors and eventually succeed', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 503, text: () => Promise.resolve('Error') } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ jobId: 'job-retry' }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: 'completed', result: { swot: {} } }) } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1, pollInterval: 1 });

    await vi.advanceTimersByTimeAsync(10);

    const result = await promise;
    expect(result).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('should not retry on 4xx client errors (except 429)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    } as Response);

    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid', { retryDelay: 1 });
    } catch (e: any) {
      expect(e.message).toBe(ERROR_CODES.GENERIC);
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
