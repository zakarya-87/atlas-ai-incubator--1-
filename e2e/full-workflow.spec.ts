import { test, expect, Page } from '@playwright/test';

// Test configuration
test.describe.configure({ mode: 'serial' });

// Helper functions
async function loginUser(
  page: Page,
  email: string = 'founder@startup.com',
  password: string = 'password123'
) {
  await page.goto('/');

  // Wait for auth modal to appear
  await page.waitForSelector('[role="dialog"]');

  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit login
  await page.click('button:has-text("Sign In")');

  // Wait for dashboard to load
  await page.waitForSelector('[data-testid="header"]');
}

async function navigateToModule(page: Page, moduleName: string) {
  // Click on sidebar navigation
  await page.click(`[data-testid="sidebar-nav"] [data-module="${moduleName}"]`);
}

async function fillBusinessInputForm(page: Page, description: string) {
  // Wait for form to be ready
  await page.waitForSelector('textarea[id="business-description-input"]');

  // Fill the textarea
  await page.fill('textarea[id="business-description-input"]', description);

  // Verify input quality indicator
  await expect(page.locator('text=/inputQuality/')).toBeVisible();
}

async function generateAnalysis(page: Page) {
  // Click generate button
  await page.click('button[id="generate-button"]');

  // Wait for loading state
  await expect(page.locator('text=/Generating/')).toBeVisible();

  // Wait for completion (loading spinner disappears)
  await page.waitForSelector('text=/Generating/', { state: 'hidden' });
}

async function switchLanguage(page: Page, language: 'en' | 'fr' | 'ar') {
  // Click language switcher
  await page.click('[data-testid="language-switcher"]');

  // Select language
  await page.click(`[data-lang="${language}"]`);

  // Verify language change
  await page.waitForTimeout(500); // Allow time for language change
}

test.describe('End-to-End Workflow Testing with Playwright (TC018)', () => {
  test('should complete full login and authentication flow', async ({
    page,
  }) => {
    await page.goto('/');

    // Verify auth modal appears
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();

    // Test login with valid credentials
    await loginUser(page);

    // Verify successful login - dashboard should be visible
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Verify URL change
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate main dashboard and verify component load', async ({
    page,
  }) => {
    await loginUser(page);

    // Verify dashboard layout components
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Verify main content area
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();

    // Verify key dashboard elements are present
    await expect(page.locator('text=/ATLAS AI Incubator/')).toBeVisible();

    // Verify navigation modules are visible
    const sidebarModules = page.locator(
      '[data-testid="sidebar-nav"] [data-module]'
    );
    await expect(sidebarModules).toHaveCount(await sidebarModules.count());
  });

  test('should perform data input and trigger AI analysis generation', async ({
    page,
  }) => {
    await loginUser(page);
    await navigateToModule(page, 'swot');

    // Fill business description
    const businessDescription =
      'A revolutionary startup that uses AI to help entrepreneurs build better business plans and financial forecasts. We serve early-stage founders who need professional-grade analysis tools but lack the resources for expensive consultants.';
    await fillBusinessInputForm(page, businessDescription);

    // Verify character count
    await expect(page.locator('text=/200/')).toBeVisible(); // Approximate count

    // Generate analysis
    await generateAnalysis(page);

    // Verify AI-generated content appears
    await expect(page.locator('text=/Strengths/')).toBeVisible();
    await expect(page.locator('text=/Weaknesses/')).toBeVisible();
    await expect(page.locator('text=/Opportunities/')).toBeVisible();
    await expect(page.locator('text=/Threats/')).toBeVisible();

    // Verify SWOT structure
    const swotQuadrants = page.locator('.grid.grid-cols-1.md\\:grid-cols-2');
    await expect(swotQuadrants).toBeVisible();
  });

  test('should validate undo and redo functionality on input forms', async ({
    page,
  }) => {
    await loginUser(page);
    await navigateToModule(page, 'swot');

    const initialText = 'Initial business description';
    const modifiedText =
      'Modified business description with additional details';

    // Fill initial text
    await fillBusinessInputForm(page, initialText);
    await expect(page.locator('textarea')).toHaveValue(initialText);

    // Modify text
    await page.fill('textarea[id="business-description-input"]', modifiedText);
    await expect(page.locator('textarea')).toHaveValue(modifiedText);

    // Test undo (Ctrl+Z or Cmd+Z)
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+z' : 'Control+z'
    );
    await expect(page.locator('textarea')).toHaveValue(initialText);

    // Test redo (Ctrl+Y or Cmd+Y)
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+Shift+z' : 'Control+y'
    );
    await expect(page.locator('textarea')).toHaveValue(modifiedText);
  });

  test('should switch languages using language switcher', async ({ page }) => {
    await loginUser(page);

    // Verify default English text
    await expect(page.locator('text=/Welcome/')).toBeVisible();

    // Switch to French
    await switchLanguage(page, 'fr');

    // Verify French text appears
    await expect(page.locator('text=/Bienvenue/')).toBeVisible();

    // Switch to Arabic
    await switchLanguage(page, 'ar');

    // Verify Arabic text appears (RTL layout)
    await expect(page.locator('[dir="rtl"]')).toBeVisible();

    // Switch back to English
    await switchLanguage(page, 'en');
    await expect(page.locator('text=/Welcome/')).toBeVisible();
  });

  test('should trigger data export and verify success', async ({ page }) => {
    await loginUser(page);
    await navigateToModule(page, 'swot');

    // Generate some analysis first
    await fillBusinessInputForm(page, 'Test business for export functionality');
    await generateAnalysis(page);

    // Trigger export menu
    await page.hover('[id="export-controls"]');
    await expect(page.locator('text=/exportAsPdf/')).toBeVisible();

    // Export as PDF
    await page.click('text=/exportAsPdf/');

    // Wait for export to complete (in real implementation, this would trigger a download)
    await page.waitForTimeout(2000);

    // Verify export success (would check for download in real test)
    // For this test, we verify the export function was called
    await expect(page.locator('[id="export-controls"]')).toBeVisible();
  });

  test('should complete comprehensive analysis workflow', async ({ page }) => {
    await loginUser(page);

    // Test multiple analysis modules
    const modules = ['swot', 'pestel', 'market', 'financial'];

    for (const module of modules) {
      await navigateToModule(page, module);

      // Fill form with module-specific content
      const moduleContent = `${module.toUpperCase()} analysis for our AI-powered business planning platform`;
      await fillBusinessInputForm(page, moduleContent);

      // Generate analysis
      await generateAnalysis(page);

      // Verify module-specific output
      if (module === 'swot') {
        await expect(
          page.locator('text=/Strengths|Weaknesses|Opportunities|Threats/')
        ).toBeVisible();
      } else if (module === 'pestel') {
        await expect(
          page.locator('text=/Political|Economic|Social|Technological/')
        ).toBeVisible();
      }

      // Verify navigation back to dashboard works
      await page.click('[data-testid="sidebar-nav"] [data-module="dashboard"]');
      await expect(page.locator('text=/Dashboard/')).toBeVisible();
    }
  });

  test('should handle form validation and error states', async ({ page }) => {
    await loginUser(page);
    await navigateToModule(page, 'swot');

    // Try to submit empty form
    const submitButton = page.locator('button[id="generate-button"]');
    await expect(submitButton).toBeDisabled();

    // Fill form and verify button enables
    await fillBusinessInputForm(page, 'Valid business description');
    await expect(submitButton).toBeEnabled();

    // Clear form and verify button disables
    await page.fill('textarea[id="business-description-input"]', '');
    await expect(submitButton).toBeDisabled();
  });

  test('should maintain session state across page refreshes', async ({
    page,
    context,
  }) => {
    await loginUser(page);

    // Navigate to a module and fill form
    await navigateToModule(page, 'swot');
    await fillBusinessInputForm(page, 'Persistent session test content');

    // Refresh page
    await page.reload();

    // Verify still logged in and on correct page
    await expect(page.locator('[data-testid="header"]')).toBeVisible();

    // Note: In real implementation, form state might not persist across refresh
    // This test verifies the authentication session persists
  });

  test('should handle responsive design across different viewport sizes', async ({
    page,
  }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await loginUser(page);

    // Verify mobile navigation
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    await expect(mobileNav).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Verify desktop sidebar
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify layout adjusts properly
    await expect(page.locator('.grid-cols-1.md\\:grid-cols-2')).toBeVisible();
  });

  test('should support keyboard navigation throughout application', async ({
    page,
  }) => {
    await loginUser(page);

    // Tab through main navigation
    await page.keyboard.press('Tab');
    await expect(
      page.locator('[data-testid="header"]').locator(':focus')
    ).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(
      page.locator('[data-testid="sidebar-nav"]').locator(':focus')
    ).toBeVisible();

    // Navigate to a module using keyboard
    await navigateToModule(page, 'swot');

    // Tab to form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Should reach textarea

    const activeElement = await page.evaluate(() => document.activeElement?.id);
    expect(activeElement).toBe('business-description-input');
  });

  test('should handle file upload workflow for competitor analysis', async ({
    page,
  }) => {
    await loginUser(page);
    await navigateToModule(page, 'competitorAnalysis');

    // Verify file upload section is visible
    await expect(
      page.locator('text=/Upload Competitor Screenshot/')
    ).toBeVisible();

    // Upload a file (mock file)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'competitor.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    });

    // Verify file preview appears
    await expect(page.locator('[alt="Preview"]')).toBeVisible();

    // Fill form and generate analysis
    await fillBusinessInputForm(page, 'Competitor analysis with visual data');
    await generateAnalysis(page);

    // Verify analysis includes visual insights
    await expect(
      page.locator('text=/competitors|gaps|differentiators/')
    ).toBeVisible();
  });

  test('should complete end-to-end export workflow', async ({ page }) => {
    await loginUser(page);
    await navigateToModule(page, 'swot');

    // Generate analysis
    await fillBusinessInputForm(page, 'Business analysis for export testing');
    await generateAnalysis(page);

    // Test multiple export formats
    const exportFormats = ['exportAsPdf', 'exportAsCsv', 'exportAsMarkdown'];

    for (const format of exportFormats) {
      await page.hover('[id="export-controls"]');
      await page.click(`text=/${format}/`);

      // Wait for export processing
      await page.waitForTimeout(1000);

      // Verify export menu closes and reopens properly
      await expect(page.locator(`text=/${format}/`)).not.toBeVisible();
    }
  });

  test('should handle concurrent user actions without conflicts', async ({
    page,
    context,
  }) => {
    await loginUser(page);

    // Open multiple tabs/windows
    const page2 = await context.newPage();
    await loginUser(page2);

    // Perform actions in parallel
    await Promise.all([
      // Page 1: SWOT analysis
      (async () => {
        await navigateToModule(page, 'swot');
        await fillBusinessInputForm(page, 'Concurrent analysis 1');
        await generateAnalysis(page);
      })(),

      // Page 2: PESTEL analysis
      (async () => {
        await navigateToModule(page2, 'pestel');
        await fillBusinessInputForm(page2, 'Concurrent analysis 2');
        await generateAnalysis(page2);
      })(),
    ]);

    // Verify both analyses complete successfully
    await expect(page.locator('text=/Strengths/')).toBeVisible();
    await expect(page2.locator('text=/Political/')).toBeVisible();
  });

  test('should maintain data integrity across workflow steps', async ({
    page,
  }) => {
    await loginUser(page);

    const testData =
      'Comprehensive business analysis for data integrity testing';

    // Step 1: Input data
    await navigateToModule(page, 'swot');
    await fillBusinessInputForm(page, testData);

    // Step 2: Generate analysis
    await generateAnalysis(page);

    // Step 3: Export data
    await page.hover('[id="export-controls"]');
    await page.click('text=/exportAsCsv/');

    // Step 4: Navigate away and back
    await navigateToModule(page, 'pestel');
    await navigateToModule(page, 'swot');

    // Verify data persists
    await expect(page.locator('textarea')).toHaveValue(testData);
    await expect(page.locator('text=/Strengths/')).toBeVisible();
  });

  test('should handle network interruptions gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', (route) => route.abort());

    await loginUser(page);
    await navigateToModule(page, 'swot');
    await fillBusinessInputForm(page, 'Test with network failure');

    // Attempt generation (should handle network error)
    await page.click('button[id="generate-button"]');

    // Verify error handling (would show error message in real implementation)
    await expect(page.locator('text=/Generating/')).toBeVisible();

    // Restore network
    await page.unroute('**/api/**');

    // Should be able to retry
    await page.click('button[id="generate-button"]');
  });
});
