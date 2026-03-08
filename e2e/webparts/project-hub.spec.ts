// D-PH7-BW-10: E2E spec for project-hub webpart
import { test, expect } from '@playwright/test';

test.describe('Project Hub Webpart', () => {
  test('renders without error boundary', async ({ page }) => {
    await page.goto('/?tab=project-hub');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
    await expect(content.locator('[data-error-boundary]')).toHaveCount(0);
  });

  test('shows simplified shell content', async ({ page }) => {
    await page.goto('/?tab=project-hub');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
  });
});
