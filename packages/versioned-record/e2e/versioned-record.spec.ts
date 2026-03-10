// @ts-nocheck
// Playwright E2E scenarios for @hbc/versioned-record
// Requires @playwright/test (not installed) and dev-harness running on port 3000
import { test, expect } from '@playwright/test';

test.describe('SF06 — Versioned Record E2E', () => {
  test('E2E-01: Version history panel opens from badge click', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await expect(page.getByText('Version History')).toBeVisible();
  });

  test('E2E-02: Version list shows correct tags and authors', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await expect(page.getByText('Approved')).toBeVisible();
    await expect(page.getByText('Alice Chen')).toBeVisible();
  });

  test('E2E-03: Clicking a version entry opens the diff viewer', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await page.getByRole('button', { name: /View version \d+/ }).first().click();
    await expect(page.getByLabelText('Side by side diff')).toBeVisible();
  });

  test('E2E-04: Diff viewer shows numeric delta for changed numeric fields', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record/diff');
    await expect(page.getByText(/\+\d+/)).toBeVisible();
  });

  test('E2E-05: Diff viewer toggles to unified mode', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record/diff');
    await page.getByRole('button', { name: 'Unified' }).click();
    await expect(page.getByLabelText('Unified diff')).toBeVisible();
  });

  test('E2E-06: Rollback CTA opens confirmation modal', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?role=director');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await page.getByRole('button', { name: /Restore to v/ }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/This will create a new version/)).toBeVisible();
  });

  test('E2E-07: Rollback cancel closes modal without restoring', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?role=director');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await page.getByRole('button', { name: /Restore to v/ }).first().click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('E2E-08: Rollback confirm creates new version and tags superseded', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?role=director');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    const restoreButtons = page.getByRole('button', { name: /Restore to v/ });
    const targetVersionText = await restoreButtons.last().textContent();
    await restoreButtons.last().click();
    await page.getByRole('button', { name: /Restore to v/ }).last().click();
    // Version list should refresh with new version at top
    await expect(page.getByText('Restored from')).toBeVisible();
  });

  test('E2E-09: "Show archived versions" toggle reveals superseded entries', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?state=with-superseded');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    const toggle = page.getByText('Show archived versions');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByText('Superseded')).toBeVisible();
  });

  test('E2E-10: Version badge renders correct tag color for approved state', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?tag=approved');
    const badge = page.getByLabel(/Version \d+, Approved/);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveCSS('color', /success/);
  });
});
