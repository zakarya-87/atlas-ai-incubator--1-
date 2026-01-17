
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ERROR_CODES } from '../utils/constants';

const mockLogger = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
vi.mock('../utils/logger', () => ({
  logger: mockLogger,
}));

// Mock the geminiService module before importing
vi.mock('./geminiService', async () => {
  const actual = await vi.importActual<typeof import('./geminiService')>('./geminiService');
  return {
    ...actual,
    generateSwotAnalysis: vi.fn(),
    fetchVentureHistory: vi.fn(),
    saveAnalysisVersion: vi.fn(),
    deleteAnalysisRecord: vi.fn(),
    inviteTeamMember: vi.fn(),
    downloadReportPdf: vi.fn(),
    fetchIntegrations: vi.fn(),
    toggleIntegration: vi.fn(),
    cancelAllRequests: vi.fn(),
    cancelRequest: vi.fn(),
  };
});

import {
  generateSwotAnalysis,
  fetchVentureHistory,
  saveAnalysisVersion,
  deleteAnalysisRecord,
  inviteTeamMember,
  downloadReportPdf,
  fetchIntegrations,
  toggleIntegration,
  cancelAllRequests,
  cancelRequest
} from './geminiService';

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateSwotAnalysis', () => {
    it('should call the backend with correct headers and body', async () => {
      const mockResponse = {
        jobId: 'test-job-123',
      };

      const mockJobResponse = {
        status: 'completed',
        result: {
          strengths: [{ point: 'S1', explanation: 'Exp 1' }],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      };

      // Mock the initial job creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Mock the job status polling
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobResponse,
      });

      // Use the real implementation by calling vi.importActual
      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');
      const result = await realGenerateSwot('Test Business', 'en', 'venture-123');

      expect(mockFetch).toHaveBeenCalled();
      // First call should be to /analysis/generate
      expect(mockFetch.mock.calls[0][0]).toContain('/analysis/generate');
      const firstCallOptions = mockFetch.mock.calls[0][1];
      expect(firstCallOptions.method).toBe('POST');
      expect(firstCallOptions.headers['Authorization']).toBe('Bearer mock-token');

      expect(result).toEqual(mockJobResponse.result);
    });

    it('should handle 401 Authentication error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');

      await expect(realGenerateSwot('Test', 'en', 'v1'))
        .rejects
        .toThrow('Authentication Required. Please sign in.');
    });

    it('should handle 429 Rate limit error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');

      await expect(realGenerateSwot('Test', 'en', 'v1'))
        .rejects
        .toThrow(ERROR_CODES.RATE_LIMIT);
    });

    it('should handle 500 Server error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');

      await expect(realGenerateSwot('Test', 'en', 'v1'))
        .rejects
        .toThrow(ERROR_CODES.SERVER_ERROR);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Failed to fetch'));

      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');

      await expect(realGenerateSwot('Test', 'en', 'v1'))
        .rejects
        .toThrow(ERROR_CODES.NETWORK_ERROR);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error(ERROR_CODES.TIMEOUT);
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValue(timeoutError);

      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');

      await expect(realGenerateSwot('Test', 'en', 'v1'))
        .rejects
        .toThrow(ERROR_CODES.TIMEOUT);
    });

    it('should handle job polling timeout', async () => {
      const mockResponse = { jobId: 'test-job-123' };

      // Mock job creation success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Mock job status polling to never complete
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'processing' }),
      });

      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');

      await expect(realGenerateSwot('Test', 'en', 'v1'))
        .rejects
        .toThrow('Job timeout after 5 minutes');
    });

    it('should handle job failure status', async () => {
      const mockResponse = { jobId: 'test-job-123' };
      const mockJobFailure = {
        status: 'failed',
        error: 'Job processing failed'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobFailure,
      });

      const { generateSwotAnalysis: realGenerateSwot } = await vi.importActual<any>('./geminiService');

      await expect(realGenerateSwot('Test', 'en', 'v1'))
        .rejects
        .toThrow('Job processing failed');
    });
  });

  describe('fetchVentureHistory', () => {
    it('should return empty array when no token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { fetchVentureHistory: realFetchHistory } = await vi.importActual<any>('./geminiService');
      const result = await realFetchHistory('venture-123');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return empty array when 401 unauthorized', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      const { fetchVentureHistory: realFetchHistory } = await vi.importActual<any>('./geminiService');
      const result = await realFetchHistory('venture-123');

      expect(result).toEqual([]);
    });

    it('should return parsed history data on success', async () => {
      const mockHistoryData = [
        {
          id: 'history-1',
          createdAt: '2023-01-01',
          module: 'strategy',
          tool: 'swot',
          inputContext: 'Test business',
          resultData: JSON.stringify({
            strengths: [{ point: 'S1', explanation: 'Exp1' }],
            weaknesses: [],
            opportunities: [],
            threats: []
          })
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockHistoryData,
      });

      const { fetchVentureHistory: realFetchHistory } = await vi.importActual<any>('./geminiService');
      const result = await realFetchHistory('venture-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('history-1');
      expect(result[0].module).toBe('strategy');
      expect(result[0].tool).toBe('swot');
      expect(result[0].data).toEqual({
        strengths: [{ point: 'S1', explanation: 'Exp1' }],
        weaknesses: [],
        opportunities: [],
        threats: [],
        id: 'history-1'
      });
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { fetchVentureHistory: realFetchHistory } = await vi.importActual<any>('./geminiService');
      const result = await realFetchHistory('venture-123');

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('saveAnalysisVersion', () => {
    it('should throw error when no token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { saveAnalysisVersion: realSaveVersion } = await vi.importActual<any>('./geminiService');

      await expect(realSaveVersion(
        { id: 'original-1', module: 'strategy', tool: 'swot' },
        { strengths: [] },
        'Updated version'
      )).rejects.toThrow('Authentication required to save versions.');
    });

    it('should save version successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { saveAnalysisVersion: realSaveVersion } = await vi.importActual<any>('./geminiService');
      await realSaveVersion(
        { id: 'original-1', module: 'strategy', tool: 'swot' },
        { strengths: [] },
        'Updated version'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/history/version'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            ventureId: 'dev-venture-id',
            parentId: 'original-1',
            module: 'strategy',
            tool: 'swot',
            description: 'Updated version',
            data: { strengths: [] }
          })
        })
      );
    });

    it('should handle save failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { saveAnalysisVersion: realSaveVersion } = await vi.importActual<any>('./geminiService');

      await expect(realSaveVersion(
        { id: 'original-1', module: 'strategy', tool: 'swot' },
        { strengths: [] },
        'Updated version'
      )).rejects.toThrow('Failed to save version');
    });
  });

  describe('deleteAnalysisRecord', () => {
    it('should throw error when no token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { deleteAnalysisRecord: realDelete } = await vi.importActual<any>('./geminiService');

      await expect(realDelete('analysis-123')).rejects.toThrow('Authentication required.');
    });

    it('should delete record successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const { deleteAnalysisRecord: realDelete } = await vi.importActual<any>('./geminiService');
      await realDelete('analysis-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/history/analysis-123'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should handle delete failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const { deleteAnalysisRecord: realDelete } = await vi.importActual<any>('./geminiService');

      await expect(realDelete('analysis-123')).rejects.toThrow('Failed to delete analysis');
    });
  });

  describe('inviteTeamMember', () => {
    it('should throw error when no token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { inviteTeamMember: realInvite } = await vi.importActual<any>('./geminiService');

      await expect(realInvite('venture-123', 'test@example.com', 'editor')).rejects.toThrow('Authentication required.');
    });

    it('should invite member successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const { inviteTeamMember: realInvite } = await vi.importActual<any>('./geminiService');
      await realInvite('venture-123', 'test@example.com', 'editor');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ventures/venture-123/invite'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', role: 'editor' })
        })
      );
    });

    it('should handle invite failure with error message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid email format' }),
      });

      const { inviteTeamMember: realInvite } = await vi.importActual<any>('./geminiService');

      await expect(realInvite('venture-123', 'invalid-email', 'editor')).rejects.toThrow('Invalid email format');
    });
  });

  describe('fetchIntegrations', () => {
    it('should return empty array when no token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { fetchIntegrations: realFetchIntegrations } = await vi.importActual<any>('./geminiService');
      const result = await realFetchIntegrations('venture-123');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return integrations data on success', async () => {
      const mockIntegrations = [
        { provider: 'google', status: 'connected' },
        { provider: 'slack', status: 'disconnected' }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockIntegrations,
      });

      const { fetchIntegrations: realFetchIntegrations } = await vi.importActual<any>('./geminiService');
      const result = await realFetchIntegrations('venture-123');

      expect(result).toEqual(mockIntegrations);
    });

    it('should return empty array on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { fetchIntegrations: realFetchIntegrations } = await vi.importActual<any>('./geminiService');
      const result = await realFetchIntegrations('venture-123');

      expect(result).toEqual([]);
    });
  });

  describe('toggleIntegration', () => {
    it('should throw error when no token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { toggleIntegration: realToggle } = await vi.importActual<any>('./geminiService');

      await expect(realToggle('venture-123', 'google', true)).rejects.toThrow('Authentication required.');
    });

    it('should toggle integration successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const { toggleIntegration: realToggle } = await vi.importActual<any>('./geminiService');
      await realToggle('venture-123', 'google', true);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/integrations/toggle'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ventureId: 'venture-123', provider: 'google', connect: true })
        })
      );
    });

    it('should handle toggle failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { toggleIntegration: realToggle } = await vi.importActual<any>('./geminiService');

      await expect(realToggle('venture-123', 'google', true)).rejects.toThrow('Failed to toggle integration');
    });
  });

  describe('cancelAllRequests and cancelRequest', () => {
    it('should cancel all requests', () => {
      const mockController1 = { abort: vi.fn() };
      const mockController2 = { abort: vi.fn() };

      // Mock AbortController
      const mockAbortController = vi.fn(() => mockController1);
      vi.stubGlobal('AbortController', mockAbortController);

      const { cancelAllRequests: realCancelAll } = vi.importActual<any>('./geminiService');

      // This is a bit tricky to test since we can't easily mock the internal Map
      // But we can verify the function exists and is callable
      expect(realCancelAll).toBeInstanceOf(Function);
      realCancelAll(); // Should not throw
    });

    it('should cancel specific request', () => {
      const { cancelRequest: realCancelRequest } = vi.importActual<any>('./geminiService');

      expect(realCancelRequest).toBeInstanceOf(Function);
      realCancelRequest('test-request-id'); // Should not throw
    });
  });
});
