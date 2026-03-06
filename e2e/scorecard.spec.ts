import { test, expect } from '@playwright/test';

const isPwaProject = (baseURL?: string) => baseURL?.includes('localhost:4000') ?? false;

test.describe('Scorecard workflow coverage', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Scorecard workflow checks execute on the PWA project.');
    await page.goto('/scorecard');
  });

  test('scorecard route resolves with shell framing and scorecard context', async ({ page }) => {
    // 4b.12.2 critical-path placeholder coverage until transactional scorecard UI lands.
    await expect(page.getByRole('heading', { name: 'Scorecard' }).first()).toBeVisible();
    await expect(page.locator('main')).toContainText('Project performance scorecards will be available in a future release.');

    // Confirm shell continuity by round-tripping through another workspace and returning.
    await page.goto('/project-hub');
    await expect(page.getByRole('heading', { name: 'Project Hub' })).toBeVisible();
    await page.goto('/scorecard');
    await expect(page.getByRole('heading', { name: 'Scorecard' }).first()).toBeVisible();
  });
});
