import { test, expect } from '@playwright/test';

test('Simple page load test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('ATLAS AI Incubator')).toBeVisible({ timeout: 30000 });
});