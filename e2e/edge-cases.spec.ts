import { test, expect } from '@playwright/test';

const MOCK_AUTH_STATE = {
    atlas_auth_token: 'mock-e2e-token',
    atlas_user_email: 'e2e-edge-cases@atlas.com',
    atlas_venture_id: 'e2e-venture-456'
};

test.describe('ATLAS Edge Case Flows', () => {

    test.beforeEach(async ({ page }) => {
        // Simulate logged-in state
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

    test('Error Handling: 429 Rate Limit', async ({ page }) => {
        // Setup mock for 429 error
        await page.route('**/analysis/generate', async route => {
            await route.fulfill({
                status: 429,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Too Many Requests', error: 'errorRateLimit' })
            });
        });

        // Navigate to strategy
        // Navigate to strategy via sidebar button
        await page.getByRole('button', { name: /Strategy/i }).first().click();

        // Fill input
        const input = page.locator('textarea#business-description');
        await input.fill('This scenario tests rate limiting behavior in the E2E environment.');
        await input.dispatchEvent('input');

        const generateBtn = page.getByRole('button', { name: /Generate/i }).first();
        await expect(generateBtn).toBeEnabled();
        await generateBtn.click();

        // Verify Rate Limit Error Message
        // The UI should show a specific error for rate limit
        await expect(page.getByText(/Rate Limit|Too Many Requests/i)).toBeVisible({ timeout: 20000 });

        // Verify Retry button is visible
        await expect(page.getByText(/retry/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('Error Handling: 500 Server Error', async ({ page }) => {
        // Setup mock for 500 error
        await page.route('**/analysis/generate', async route => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Internal Server Error' })
            });
        });

        // Navigate to strategy
        // Navigate to strategy via sidebar button
        await page.getByRole('button', { name: /Strategy/i }).first().click();

        // Fill input
        const input = page.locator('textarea#business-description');
        await input.fill('This scenario tests internal server error handling.');
        await input.dispatchEvent('input');

        const generateBtn = page.getByRole('button', { name: /Generate/i }).first();
        await generateBtn.click();

        // Verify Server Error Message (Title from en.ts for errorApiServerError)
        await expect(page.getByText(/Server Error/i)).toBeVisible({ timeout: 15000 });
    });

    test('Auth Flow: Session Expiry (401)', async ({ page }) => {
        // Setup mock for 401 error
        await page.route('**/analysis/generate', async route => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' })
            });
        });

        // Navigate to strategy
        // Navigate to strategy via sidebar button
        await page.getByRole('button', { name: /Strategy/i }).first().click();

        // Fill input
        const input = page.locator('textarea#business-description');
        await input.fill('This scenario tests session expiry handling.');
        await input.dispatchEvent('input');

        const generateBtn = page.getByRole('button', { name: /Generate/i }).first();
        await generateBtn.click();

        // Should likely show login modal or auth error
        // Current implementation shows "Authentication Required" toast or redirect
        await expect(page.getByRole('button', { name: 'Sign In' }).first()).toBeVisible();
    });

    test('UI Resilience: Empty Inputs and Bypass Attempts', async ({ page }) => {
        // Navigate to strategy via sidebar button
        await page.getByRole('button', { name: /Strategy/i }).first().click();

        const generateBtn = page.getByRole('button', { name: /Generate/i }).first();

        // Verify button is disabled initially
        await expect(generateBtn).toBeDisabled();

        // Try to force click by removing disabled attribute (security/bypass check)
        await page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (btn) btn.disabled = false;
        });

        await generateBtn.click();

        // Since native required is missing, verify the button stays in Generate state 
        // and doesn't crash or show a loading state if validation prevents submission.
        // Actually, without internal required, the click might call handleGenerate
        // which has if (!businessDescription.trim()) { setError(...) }

        // So we expect an error message
        await expect(page.getByText(/Please enter a business description/i)).toBeVisible();
    });
});
