/**
 * @design SF18-T09
 * Narrow Playwright smoke coverage for bid-readiness Storybook assets.
 */
import { expect, test } from '@playwright/test';

test('storybook loads bid-readiness signal stories', async ({ page }) => {
  await page.goto('/?path=/story/features-estimating-bidreadinesssignal--ready-essential');
  await expect(page).toHaveTitle(/Storybook/i);
  await expect(
    page.frameLocator('#storybook-preview-iframe').getByTestId('signal-bid-readiness-score'),
  ).toBeVisible();
});

test('storybook loads bid-readiness dashboard stories', async ({ page }) => {
  await page.goto('/?path=/story/features-estimating-bidreadinessdashboard--ready-standard');
  await expect(page).toHaveTitle(/Storybook/i);
  await expect(
    page.frameLocator('#storybook-preview-iframe').getByTestId('dashboard-bid-readiness-score'),
  ).toBeVisible();
});
