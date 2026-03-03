import { test, expect } from '@playwright/test';

test.describe('PWA — Navigation', () => {
  test('root loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/HB Intel/);
  });

  const MVP_ROUTES = [
    '/project-hub',
    '/accounting',
    '/estimating',
    '/leadership',
    '/business-development',
  ];

  for (const route of MVP_ROUTES) {
    test(`route "${route}" loads without error`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(page.locator('[data-error-boundary]')).toHaveCount(0);
    });
  }
});

test.describe('PWA — Shell Components', () => {
  test('header bar is visible', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header, [data-testid="header-bar"], .shell-header');
    await expect(header.first()).toBeVisible();
  });
});
