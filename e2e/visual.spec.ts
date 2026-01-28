import { test, expect } from '@playwright/test';

const MOCK_AUTH_STATE = {
  atlas_auth_token: 'mock-visual-token',
  atlas_user_email: 'visual-tester@atlas.com',
  atlas_venture_id: 'visual-venture-789',
};

test.describe('ATLAS Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Simulate logged-in state and bypass tour
    await page.addInitScript((state) => {
      window.localStorage.setItem('atlas_auth_token', state.atlas_auth_token);
      window.localStorage.setItem('atlas_user_email', state.atlas_user_email);
      window.localStorage.setItem('atlas_venture_id', state.atlas_venture_id);
      window.localStorage.setItem('atlas-ai-tour-complete', 'true');
    }, MOCK_AUTH_STATE);

    await page.goto('/');
    // Wait for a key application element instead of networkidle
    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000); // Allow animations to settle
  });

  test('Dashboard Snapshot', async ({ page }) => {
    // Capture the full dashboard view
    await expect(page).toHaveScreenshot('dashboard-initial.png', {
      fullPage: true,
      mask: [page.locator('[data-testid="last-login"]')], // Mask dynamic data if present
    });
  });

  test('Strategy Module Snapshot', async ({ page }) => {
    // Navigate to Strategy
    await page
      .getByRole('button', { name: /Strategy/i })
      .first()
      .click();
    await expect(page.locator('textarea#business-description')).toBeVisible();

    await expect(page).toHaveScreenshot('strategy-empty-state.png', {
      fullPage: true,
    });
  });

  test('Mobile View Snapshot', async ({ page, viewport }) => {
    // Note: This test will only produce meaningful results if run with mobile viewport config
    // but it's good to have it structured for future extension
    if (viewport && viewport.width < 768) {
      await expect(page).toHaveScreenshot('mobile-dashboard.png');
    }
  });
});
