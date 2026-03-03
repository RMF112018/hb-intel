import { test, expect } from '@playwright/test';

const TABS = [
  { id: 'pwa', label: 'PWA (Full Shell)' },
  { id: 'project-hub', label: 'Project Hub' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'estimating', label: 'Estimating' },
  { id: 'business-development', label: 'Business Development' },
  { id: 'safety', label: 'Safety' },
  { id: 'quality-control-warranty', label: 'Quality Control & Warranty' },
  { id: 'risk-management', label: 'Risk Management' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'operational-excellence', label: 'Operational Excellence' },
  { id: 'human-resources', label: 'Human Resources' },
  { id: 'admin', label: 'Admin' },
  { id: 'site-control', label: 'HB Site Control' },
];

test.describe('Dev Harness — Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  for (const tab of TABS) {
    test(`tab "${tab.label}" renders content without errors`, async ({ page }) => {
      await page.getByRole('tab', { name: tab.label }).click();
      const content = page.locator('.harness-content');
      await expect(content).not.toBeEmpty();
      await expect(content.locator('[data-error-boundary]')).toHaveCount(0);
    });
  }
});

test.describe('Dev Harness — DevControls', () => {
  test('theme toggle switches between light and dark', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('switch', { name: /light|dark/i });
    await expect(toggle).toBeVisible();

    // Toggle to dark
    await toggle.click();
    await expect(toggle).toBeChecked();

    // Toggle back to light
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });
});
