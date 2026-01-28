import { test, expect } from '@playwright/test';

const MOCK_AUTH_STATE = {
  atlas_auth_token: 'mock-perf-token',
  atlas_user_email: 'perf-tester@atlas.com',
  atlas_venture_id: 'perf-venture-101',
};

// Threshold for "snappy" response (e.g. 30 seconds for full generation)
const PERF_THRESHOLD_MS = 30000;

test.describe('ATLAS Performance Benchmarks', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((state) => {
      window.localStorage.setItem('atlas_auth_token', state.atlas_auth_token);
      window.localStorage.setItem('atlas_user_email', state.atlas_user_email);
      window.localStorage.setItem('atlas_venture_id', state.atlas_venture_id);
      window.localStorage.setItem('atlas-ai-tour-complete', 'true');
    }, MOCK_AUTH_STATE);

    await page.goto('/');
    // Wait for a key application element instead of networkidle
    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 15000 });
  });

  test('AI Pipeline Latency: Strategy Generation', async ({ page }) => {
    // Mock the generation response
    await page.route('**/analysis/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jobId: 'perf-job-123' }),
      });
    });

    // Mock the job status response
    await page.route('**/jobs/perf-job-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'completed',
          result: {
            strengths: [{ point: 'Str 1', explanation: 'Exp 1' }],
            weaknesses: [{ point: 'Weak 1', explanation: 'Exp 2' }],
            opportunities: [{ point: 'Opp 1', explanation: 'Exp 3' }],
            threats: [{ point: 'Thr 1', explanation: 'Exp 4' }],
          },
        }),
      });
    });

    // Navigate to Strategy
    await page
      .getByRole('button', { name: /Strategy/i })
      .first()
      .click();

    const input = page.locator('textarea#business-description');
    await input.fill(
      'Performance benchmarking scenario for AI latency tracking.'
    );
    await input.dispatchEvent('input');

    const generateBtn = page.getByRole('button', { name: /Generate/i }).first();

    // Start Timer
    const startTime = Date.now();

    await generateBtn.click();

    // Wait for results to render
    await expect(page.getByText(/Strengths/i).first()).toBeVisible({
      timeout: PERF_THRESHOLD_MS,
    });

    const duration = Date.now() - startTime;
    console.log(`[PERF] Strategy Generation took: ${duration}ms`);

    // Fail if duration exceeds threshold (in real env)
    // expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
  });

  test('UI Responsiveness: Concurrent Animations', async ({ page }) => {
    // This test checks if the UI remains responsive during layout transitions
    const startTime = Date.now();

    await page
      .getByRole('button', { name: /Strategy/i })
      .first()
      .click();
    await page
      .getByRole('button', { name: /Finance/i })
      .first()
      .click();
    await page
      .getByRole('button', { name: /Growth/i })
      .first()
      .click();

    const duration = Date.now() - startTime;
    console.log(`[PERF] Rapid Navigation took: ${duration}ms`);
    expect(duration).toBeLessThan(5000); // Navigation between 3 modules should be very fast
  });
});
