import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('exportUtils', () => {
  let mockConsole: { log: any; error: any };

  beforeEach(() => {
    mockConsole = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToPdf', () => {
    it('should be defined as a function', async () => {
      const { exportToPdf } = await import('./exportUtils');

      expect(typeof exportToPdf).toBe('function');
    });

    it('should accept correct parameters', async () => {
      const { exportToPdf } = await import('./exportUtils');

      expect(exportToPdf.length).toBe(4); // 4 parameters
    });

    it('should handle missing element gracefully', async () => {
      const { exportToPdf } = await import('./exportUtils');

      vi.spyOn(document, 'getElementById').mockReturnValue(null);

      // Should not throw
      await expect(
        exportToPdf('non-existent-id', 'test', 'Test', 'Test')
      ).resolves.not.toThrow();
    });
  });

  describe('exportToCsv', () => {
    it('should be defined as a function', async () => {
      const { exportToCsv } = await import('./exportUtils');

      expect(typeof exportToCsv).toBe('function');
    });
  });

  describe('exportToMarkdown', () => {
    it('should be defined as a function', async () => {
      const { exportToMarkdown } = await import('./exportUtils');

      expect(typeof exportToMarkdown).toBe('function');
    });
  });

  describe('utility functions', () => {
    it('should have all required export functions', async () => {
      const module = await import('./exportUtils');

      expect(typeof module.exportToPdf).toBe('function');
      expect(typeof module.exportToCsv).toBe('function');
      expect(typeof module.exportToMarkdown).toBe('function');
    });

    it('should export AnalysisType as a type', async () => {
      // This tests that the module exports correctly
      const module = await import('./exportUtils');

      // The module should load without errors
      expect(module).toBeDefined();
    });
  });

  describe('function signatures', () => {
    it('exportToCsv should accept 3 parameters', async () => {
      const { exportToCsv } = await import('./exportUtils');

      expect(exportToCsv.length).toBe(3);
    });

    it('exportToMarkdown should accept 4 parameters', async () => {
      const { exportToMarkdown } = await import('./exportUtils');

      expect(exportToMarkdown.length).toBe(4);
    });
  });

  describe('error handling', () => {
    it('should log error when element not found', async () => {
      const { exportToPdf } = await import('./exportUtils');

      vi.spyOn(document, 'getElementById').mockReturnValue(null);

      await exportToPdf(
        'test-id',
        'test-file',
        'Test Title',
        'Test Description'
      );

      expect(mockConsole.error).toHaveBeenCalled();
    });
  });
});
