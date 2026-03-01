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

  it.skip('should handle API timeout errors gracefully', async () => {
    // Use fake timers to advance time deterministically
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(() => new Promise(() => { })); // Never resolves

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');
    const assertPromise = expect(promise).rejects.toThrow(ERROR_CODES.TIMEOUT);

    // Advance time to trigger the timeout (API_CONFIG.TIMEOUT is 30s usually, but poll timeout is 900000ms)
    // fetchWithTimeout uses AbortSignal which times out at API_CONFIG.TIMEOUT (30000ms typically).
    await vi.advanceTimersByTimeAsync(40000);
    await assertPromise;
  });

  it('should handle network connectivity issues', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockRejectedValue(new Error('TypeError: Failed to fetch'));
    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    // We catch it immediately with expect().rejects to avoid UnhandledPromiseRejection
    const assertPromise = expect(promise).rejects.toThrow(ERROR_CODES.NETWORK_ERROR);

    await vi.advanceTimersByTimeAsync(10000);
    await assertPromise;
  });

  it('should handle 401 Unauthorized errors', async () => {
    // 401 doesn't retry
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    } as Response);
    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid');
    } catch (e: any) {
      expect(e.message).toBe(ERROR_CODES.AUTH_REQUIRED);
    }
  });

  it('should handle 429 Rate Limit errors', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Too Many Requests'),
    } as Response);
    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    const assertPromise = expect(promise).rejects.toThrow(ERROR_CODES.RATE_LIMIT);

    await vi.advanceTimersByTimeAsync(10000);
    await assertPromise;
  });

  it('should handle 500 Server errors after retries', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    } as Response);
    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    const assertPromise = expect(promise).rejects.toThrow(ERROR_CODES.SERVER_ERROR);

    await vi.advanceTimersByTimeAsync(10000);
    await assertPromise;
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
      await geminiService.generateSwotAnalysis('test', 'en', 'vid');
    } catch (e: any) {
      expect(e.message).toBe('AI generation failed');
    }
  });

  it.skip('should handle job polling timeout', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 1, 1)); // Freeze time

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ jobId: 'job-123' }),
    } as Response);
    // Return processing for all subsequent calls
    vi.mocked(fetch).mockImplementation(async () => {
      return {
        ok: true,
        json: () => Promise.resolve({ status: 'processing' })
      } as Response;
    });

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    const assertPromise = expect(promise).rejects.toThrow(ERROR_CODES.TIMEOUT);

    // Instead of advancing 900 seconds right away, we jump time manually
    // Since Date.now() is faked, we must advance the clock 900 seconds.
    vi.setSystemTime(new Date(Date.now() + 900000 + 100)); // fast forward clock
    // just trigger one more tick so the poll picks up the new time
    await vi.advanceTimersByTimeAsync(2500);

    await assertPromise;
  });

  it('should retry on 5xx errors and eventually succeed', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 503, text: () => Promise.resolve('Error') } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ jobId: 'job-retry' }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: 'completed', result: { swot: {} } }) } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    await vi.advanceTimersByTimeAsync(50000); // give enough time for delay retries

    const result = await promise;
    expect(result).toBeDefined();
    // fetch is called: 1 (fail), 1 (success POST), 1 (success GET poll)
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('should not retry on 4xx client errors (except 429)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    } as Response);

    try {
      await geminiService.generateSwotAnalysis('test', 'en', 'vid');
    } catch (e: any) {
      expect(e.message).toBe(ERROR_CODES.GENERIC);
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
