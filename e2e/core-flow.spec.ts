import { test, expect } from '@playwright/test';

const MOCK_AUTH_STATE = {
    atlas_auth_token: 'mock-e2e-token',
    atlas_user_email: 'e2e-test@atlas.com',
    atlas_venture_id: 'e2e-venture-123'
};

test.describe('ATLAS Core Workflow', () => {
    
    test.beforeEach(async ({ page }) => {
        // Mock Backend API calls to avoid hitting real Gemini API/Database during E2E
        // unless we want a true integration test. ideally we mock the expensive parts.
        
        await page.route('**/analysis/generate', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    strengths: [{ point: "Strong Brand", explanation: "Well recognized." }],
                    weaknesses: [{ point: "High Cost", explanation: "Expensive to run." }],
                    opportunities: [],
                    threats: []
                })
            });
        });

        // Simulate logged-in state
        await page.addInitScript((state) => {
            window.localStorage.setItem('atlas_auth_token', state.atlas_auth_token);
            window.localStorage.setItem('atlas_user_email', state.atlas_user_email);
            window.localStorage.setItem('atlas_venture_id', state.atlas_venture_id);
        }, MOCK_AUTH_STATE);
    });

    test('Golden Path: Generate SWOT Analysis', async ({ page }) => {
        // 1. Go to home
        await page.goto('/');

        // 2. Verify landing (Hero)
        await expect(page.getByText('AI-Powered Strategic Planning')).toBeVisible();

        // 3. Enter Description
        const input = page.locator('textarea#business-description-input');
        await input.fill('A coffee shop for remote workers.');

        // 4. Click Generate
        await page.getByRole('button', { name: 'Generate Analysis' }).click();

        // 5. Verify Loading State (Agent Orchestrator)
        // We expect the skeleton or agent log to appear
        await expect(page.locator('text=Agent Boardroom Status')).toBeVisible();

        // 6. Wait for Result (SWOT Display)
        await expect(page.getByText('Strong Brand')).toBeVisible(); // From our mock response
        await expect(page.getByText('Well recognized.')).toBeVisible();

        // 7. Verify Export Button appears
        await expect(page.locator('#export-controls')).toBeVisible();
    });

    test('Navigation: Switch Modules', async ({ page }) => {
        await page.goto('/');
        
        // Hover sidebar to see tooltip/text if needed, or just click icon
        // Assuming the sidebar icons have accessible names or we click by testId/selector
        // For now, we click the Finance module (4th item)
        
        // Find the finance icon or button
        const financeBtn = page.locator('button').filter({ hasText: 'Finance' }).first();
        await financeBtn.click();

        // Verify Hero Change
        await expect(page.getByText('AI-Powered Financial Planning')).toBeVisible();
        
        // Verify Subnav
        await expect(page.getByRole('button', { name: 'Budget Generator' })).toBeVisible();
    });
});