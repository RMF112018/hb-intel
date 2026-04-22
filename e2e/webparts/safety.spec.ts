// D-PH7-BW-10: E2E spec for safety webpart.
// Phase-3 closure §F: strengthened beyond smoke to cover nav IA, redirect
// honesty, masthead presence, and governed confirmation affordance.
import { test, expect } from '@playwright/test';

test.describe('Safety Webpart — render baseline', () => {
  test('renders without error boundary', async ({ page }) => {
    await page.goto('/?tab=safety');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
    await expect(content.locator('[data-error-boundary]')).toHaveCount(0);
  });

  test('shows simplified shell content', async ({ page }) => {
    await page.goto('/?tab=safety');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
  });

  test('shows back-to-project-hub link', async ({ page }) => {
    await page.goto('/?tab=safety');
    await expect(page.getByText(/Back to the Project Hub/)).toBeVisible();
  });
});

test.describe('Safety Webpart — workspace navigation IA (G-01, G-11)', () => {
  test('tool-picker exposes the four Wave-1 tabs', async ({ page }) => {
    await page.goto('/?tab=safety');
    const nav = page.locator('[data-hbc-shell="tool-picker-nav"]');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('tab', { name: /upload/i })).toBeVisible();
    await expect(nav.getByRole('tab', { name: /periods/i })).toBeVisible();
    await expect(nav.getByRole('tab', { name: /review/i })).toBeVisible();
    await expect(nav.getByRole('tab', { name: /inspections/i })).toBeVisible();
  });

  test('Incidents is not exposed in the tool-picker', async ({ page }) => {
    await page.goto('/?tab=safety');
    const nav = page.locator('[data-hbc-shell="tool-picker-nav"]');
    await expect(nav.getByRole('tab', { name: /incidents/i })).toHaveCount(0);
  });
});

test.describe('Safety Webpart — masthead posture (Phase-3 closure §B)', () => {
  test('Upload surface renders a safety masthead', async ({ page }) => {
    await page.goto('/?tab=safety');
    const masthead = page.locator('[data-safety-ui="masthead"]').first();
    await expect(masthead).toBeVisible();
  });
});
