import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.hoisted(() => {
  vi.useFakeTimers();
});

vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import * as geminiService from './geminiService';
import { ERROR_CODES, API_CONFIG } from '../utils/constants';

describe('Gemini Service Error Handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options) => {
      return new Promise((resolve, reject) => {
        const onAbort = () => {
          options?.signal?.removeEventListener('abort', onAbort);
          reject(new DOMException('The user aborted a request.', 'AbortError'));
        };

        if (options?.signal?.aborted) {
          onAbort();
          return;
        }

        options?.signal?.addEventListener('abort', onAbort);
      });
    }));
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(async () => {
    // Run all pending timers first to let async operations complete
    try {
      await vi.runAllTimersAsync();
    } catch {
      // Ignore errors from timers
    }
    // Clear all timers
    vi.clearAllTimers();
    // Restore mocks
    vi.restoreAllMocks();
    // Switch back to real timers
    vi.useRealTimers();
  });

  it('should be defined', () => {
    expect(geminiService).toBeDefined();
  });

  it('should handle API timeout errors gracefully', async () => {
    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    // Start the fetch
    await vi.advanceTimersByTimeAsync(1);

    // Advance time past the timeout
    await vi.advanceTimersByTimeAsync(API_CONFIG.REQUEST_TIMEOUT + 100);

    // Run all pending timers to ensure everything settles
    await vi.runAllTimersAsync();

    // Properly await and assert the rejection
    await expect(promise).rejects.toThrow(ERROR_CODES.TIMEOUT);
  });

  it('should handle network connectivity errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'));

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    // Handle initial call and all retries
    for (let i = 0; i <= API_CONFIG.RETRY_ATTEMPTS; i++) {
      await vi.advanceTimersByTimeAsync(0); // Let fetch run
      await vi.advanceTimersByTimeAsync(API_CONFIG.RETRY_DELAY * Math.pow(2, i) + 100);
    }

    // Run all remaining timers
    await vi.runAllTimersAsync();

    // Properly await and assert the rejection
    await expect(promise).rejects.toThrow(ERROR_CODES.NETWORK_ERROR);
  });

  it('should handle 401 authentication errors and not retry', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    await vi.advanceTimersByTimeAsync(0);
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Authentication Required');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle 429 rate limit errors with retries', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limit exceeded'),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ jobId: 'job-123' }),
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'completed', result: { test: true } }),
      } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    // First attempt fails
    await vi.advanceTimersByTimeAsync(0);
    // Wait for retry
    await vi.advanceTimersByTimeAsync(API_CONFIG.RETRY_DELAY + 100);
    // Wait for submission success
    await vi.advanceTimersByTimeAsync(0);
    // Polling starts
    await vi.advanceTimersByTimeAsync(2000 + 100);
    // Run all remaining timers to clean up polling interval
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBeDefined();
    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle 500 server errors with retries', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server Error'),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ jobId: 'job-123' }),
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'completed', result: { test: true } }),
      } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(API_CONFIG.RETRY_DELAY + 100);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(2000 + 100);
    // Clean up any remaining polling intervals
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBeDefined();
  });

  it('should handle job failure during polling', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ jobId: 'job-123' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'failed', error: 'Internal AI Error' }),
      } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    // Submission
    await vi.advanceTimersByTimeAsync(0);
    // Polling failure
    await vi.advanceTimersByTimeAsync(2000 + 100);
    // Run all timers to clean up intervals
    await vi.runAllTimersAsync();

    // Properly await and assert the rejection
    await expect(promise).rejects.toThrow('Internal AI Error');
  });

  it('should handle job polling timeout', async () => {
    // Mock fetch to always succeed for polling after initial submission
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'processing' }),
    } as Response);

    const pollInterval = 100;
    const timeout = 1000;

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid', undefined, undefined, pollInterval, timeout);

    // Submission success
    await vi.advanceTimersByTimeAsync(0);

    // Advance multiple polling cycles until timeout
    for (let i = 0; i < 15; i++) {
      await vi.advanceTimersByTimeAsync(pollInterval);
    }

    // Advance past the timeout buffer
    await vi.advanceTimersByTimeAsync(timeout);

    // Run all remaining timers to clean up
    await vi.runAllTimersAsync();

    // Properly await and assert the rejection
    await expect(promise).rejects.toThrow(/timeout/i);
  }, 15000);

  it('should retry on 5xx errors with exponential backoff', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      text: () => Promise.resolve('Service Unavailable'),
    } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    // Move through all retries
    for (let i = 0; i < API_CONFIG.RETRY_ATTEMPTS; i++) {
      await vi.advanceTimersByTimeAsync(1); // Finish the fetch
      await vi.advanceTimersByTimeAsync(API_CONFIG.RETRY_DELAY * Math.pow(2, i) + 100); // Wait for retry delay
    }

    // Process the final attempt
    await vi.advanceTimersByTimeAsync(1);
    // Run all remaining timers
    await vi.runAllTimersAsync();

    // Properly await and assert the rejection
    await expect(promise).rejects.toThrow(ERROR_CODES.SERVER_ERROR);
    expect(fetch).toHaveBeenCalledTimes(API_CONFIG.RETRY_ATTEMPTS + 1);
  });

  it('should not retry on 4xx client errors (except 429)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    await vi.advanceTimersByTimeAsync(0);
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow(ERROR_CODES.GENERIC);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle missing authentication token', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ jobId: 'job-123' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'completed', result: { test: true } }),
      } as Response);

    const promise = geminiService.generateSwotAnalysis('test', 'en', 'vid');

    await vi.advanceTimersByTimeAsync(1);
    await vi.advanceTimersByTimeAsync(2000 + 100);
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBeDefined();
  });
});
