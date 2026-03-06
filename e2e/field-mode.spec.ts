import { test, expect } from '@playwright/test';

const isDevHarnessProject = (baseURL?: string) => baseURL?.includes('localhost:3000') ?? false;

test.describe('Field-mode coverage', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(!isDevHarnessProject(baseURL), 'Field-mode checks execute on the dev-harness project.');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
  });

  test('site-control tab renders in mobile viewport shell container', async ({ page }) => {
    // D-09: confirms field/mobile rendering path at 375px viewport via site-control harness mode.
    await page.getByRole('tab', { name: 'HB Site Control' }).click();
    await expect(page.locator('.harness-mobile-viewport')).toBeVisible();
    await expect(page.locator('.harness-content')).not.toBeEmpty();
  });
});
