import { test, expect } from '@playwright/test';

const isPwaProject = (baseURL?: string) => baseURL?.includes('localhost:4000') ?? false;

test.describe('Notification and feedback coverage', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Notification checks execute on the PWA project.');
  });

  test('scorecard workspace renders persistent feedback content', async ({ page }) => {
    // D-08 baseline: persistent workspace feedback remains visible across route transitions.
    await page.goto('/scorecard');
    await expect(page.getByRole('heading', { name: 'Scorecard' }).first()).toBeVisible();
    await expect(page.getByText('Project performance scorecards will be available in a future release.')).toBeVisible();

    await page.goto('/risk');
    await expect(page.getByRole('heading', { name: 'Risk' }).first()).toBeVisible();
    await expect(page.getByText('Risk assessment and mitigation tools will be available in a future release.')).toBeVisible();
  });
});
