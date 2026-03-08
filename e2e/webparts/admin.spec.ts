// D-PH7-BW-10: E2E spec for admin webpart
// NOTE: Admin tab has a pre-existing render issue (route guard requires admin:access-control:view
// which the default persona may not provide). Tests marked fixme until the admin domain feature
// plan addresses the permission bootstrapping. The existing dev-harness.spec.ts also fails for admin.
import { test, expect } from '@playwright/test';

test.describe('Admin Webpart', () => {
  test('renders without error boundary', async ({ page }) => {
    await page.goto('/?tab=admin');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
    await expect(content.locator('[data-error-boundary]')).toHaveCount(0);
  });

  test('shows simplified shell content', async ({ page }) => {
    await page.goto('/?tab=admin');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
  });
});
