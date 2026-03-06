import { test, expect } from '@playwright/test';

const isDevHarnessProject = (baseURL?: string) => baseURL?.includes('localhost:3000') ?? false;

test.describe('Shell integration coverage', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(!isDevHarnessProject(baseURL), 'Shell integration checks execute on the dev-harness project.');
    await page.goto('/');
  });

  test('shell frame renders and tab navigation highlights current workspace', async ({ page }) => {
    // D-01 / D-04 smoke: shell frame mounted and selected navigation state updates on tab changes.
    await expect(page.locator('.harness-content')).not.toBeEmpty();

    const accountingTab = page.getByRole('tab', { name: 'Accounting' });
    await accountingTab.click();
    await expect(accountingTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Accounting' })).toBeVisible();
  });

  test('mode switching toggle is operational inside shell host', async ({ page }) => {
    // D-09 integration touchpoint: mode/theme switch path remains wired in host shell controls.
    const toggle = page.getByRole('switch', { name: /light|dark/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });
});
