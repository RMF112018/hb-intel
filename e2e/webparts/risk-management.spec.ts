// D-PH7-BW-10: E2E spec for risk-management webpart
import { test, expect } from '@playwright/test';

test.describe('Risk Management Webpart', () => {
  test('renders without error boundary', async ({ page }) => {
    await page.goto('/?tab=risk-management');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
    await expect(content.locator('[data-error-boundary]')).toHaveCount(0);
  });

  test('shows simplified shell content', async ({ page }) => {
    await page.goto('/?tab=risk-management');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
  });

  test('shows back-to-project-hub link', async ({ page }) => {
    await page.goto('/?tab=risk-management');
    await expect(page.getByText(/Back to the Project Hub/)).toBeVisible();
  });
});
