import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('jobService', () => {
  let mockFetch: any;
  let mockLocalStorage: { getItem: any; setItem: any; removeItem: any };

  beforeEach(() => {
    mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ jobId: 'test-job-123', status: 'queued' }),
      })
    );

    mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    vi.spyOn(window.localStorage, 'getItem').mockImplementation(
      mockLocalStorage.getItem
    );
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(
      mockLocalStorage.setItem
    );
    vi.spyOn(window.localStorage, 'removeItem').mockImplementation(
      mockLocalStorage.removeItem
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('submitAnalysisJob', () => {
    it('should be defined as a function', async () => {
      const { submitAnalysisJob } = await import('./jobService');

      expect(typeof submitAnalysisJob).toBe('function');
    });

    it('should call fetch with POST method', async () => {
      const { submitAnalysisJob } = await import('./jobService');

      const payload = {
        ventureId: 'venture-123',
        module: 'analysis',
        tool: 'swot',
        description: 'Test analysis',
        prompt: 'Analyze this',
        responseSchema: {},
      };

      await submitAnalysisJob(payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[1].method).toBe('POST');
      expect(call[1].headers['Content-Type']).toBe('application/json');
    });

    it('should include authorization header', async () => {
      const { submitAnalysisJob } = await import('./jobService');

      const payload = {
        ventureId: 'venture-123',
        module: 'analysis',
        tool: 'swot',
        description: 'Test analysis',
        prompt: 'Analyze this',
        responseSchema: {},
      };

      await submitAnalysisJob(payload);

      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['Authorization']).toContain('Bearer');
    });

    it('should throw error on 401 response', async () => {
      const { submitAnalysisJob } = await import('./jobService');

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
        })
      );

      const payload = {
        ventureId: 'venture-123',
        module: 'analysis',
        tool: 'swot',
        description: 'Test analysis',
        prompt: 'Analyze this',
        responseSchema: {},
      };

      await expect(submitAnalysisJob(payload)).rejects.toThrow(
        'Authentication Required'
      );
    });

    it('should throw error on 429 response', async () => {
      const { submitAnalysisJob } = await import('./jobService');

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 429,
        })
      );

      const payload = {
        ventureId: 'venture-123',
        module: 'analysis',
        tool: 'swot',
        description: 'Test analysis',
        prompt: 'Analyze this',
        responseSchema: {},
      };

      await expect(submitAnalysisJob(payload)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });

  describe('exports', () => {
    it('should export submitAnalysisJob function', async () => {
      const module = await import('./jobService');

      expect(typeof module.submitAnalysisJob).toBe('function');
    });

    it('should export required functions', async () => {
      const module = await import('./jobService');

      // Check that module exports are functions
      const exports = Object.keys(module);
      expect(exports.length).toBeGreaterThan(0);
    });
  });
});
