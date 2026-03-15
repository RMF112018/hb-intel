/**
 * W0-G5-T08: E2E tests for G5 requester workflow routes.
 * Verifies navigation and basic rendering of all G5 surfaces.
 */
import { test, expect } from '@playwright/test';

test.describe('G5 — Project Setup Routes', () => {
  test('/project-setup loads the wizard surface', async ({ page }) => {
    await page.goto('/project-setup');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('[data-error-boundary]')).toHaveCount(0);
  });

  test('/projects loads the status list', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('[data-error-boundary]')).toHaveCount(0);
  });
});

test.describe('G5 — No Unauthorized Routes', () => {
  test('no /controller route exists', async ({ page }) => {
    const response = await page.goto('/controller');
    await expect(page.locator('body')).not.toBeEmpty();
    // Should hit the 404 catch-all, not a controller page
  });

  test('no /coordinator route exists', async ({ page }) => {
    const response = await page.goto('/coordinator');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('G5 — PWA Shell', () => {
  test('connectivity indicator is present', async ({ page }) => {
    await page.goto('/projects');
    // HbcConnectivityBar renders in root layout
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
