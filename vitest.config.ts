import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Simulates browser (localStorage, window, etc.)
    setupFiles: ['./test-setup.ts'],
    // Only include frontend tests (hooks, components, context, utils, services)
    include: [
      'hooks/**/*.{test,spec}.{ts,tsx}',
      'components/**/*.{test,spec}.{ts,tsx}',
      'context/**/*.{test,spec}.{ts,tsx}',
      'utils/**/*.{test,spec}.{ts,tsx}',
      'services/**/*.{test,spec}.{ts,tsx}',
      'test/**/*.{test,spec}.{ts,tsx}',
    ],
    // Exclude backend tests (they use Jest) and E2E tests (use Playwright)
    exclude: ['backend/**', 'e2e/**', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      exclude: [
        'node_modules/**',
        'dist/**',
        'backend/**',
        'e2e/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.config.*',
        'test-setup.ts',
        'vite.config.ts',
        'playwright.config.ts',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80,
        },
        // Specific thresholds for high-coverage components
        './services/geminiService.ts': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90,
        },
        './components/Layout.tsx': {
          statements: 85,
          branches: 70,
          functions: 80,
          lines: 85,
        },
        './components/AuthModal.tsx': {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80,
        },
        './hooks/useUndoRedo.ts': {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
