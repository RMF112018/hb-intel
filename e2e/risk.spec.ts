import { test, expect } from '@playwright/test';

const isPwaProject = (baseURL?: string) => baseURL?.includes('localhost:4000') ?? false;

test.describe('Risk workflow coverage', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Risk workflow checks execute on the PWA project.');
    await page.goto('/risk');
  });

  test('risk route resolves with shell framing and risk context', async ({ page }) => {
    // 4b.12.2 critical-path placeholder coverage until CRUD risk workflows are promoted to PWA.
    await expect(page.getByRole('heading', { name: 'Risk' }).first()).toBeVisible();
    await expect(page.locator('main')).toContainText('Risk assessment and mitigation tools will be available in a future release.');

    // Validate cross-route continuity expected by risk detail/edit path hand-offs.
    await page.goto('/risk-management');
    await expect(page.getByRole('heading', { name: 'Risk Management' }).first()).toBeVisible();
    await page.goto('/risk');
    await expect(page.getByRole('heading', { name: 'Risk' }).first()).toBeVisible();
  });
});
