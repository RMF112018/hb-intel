/**
 * E2E scenarios for @hbc/step-wizard — SF05-T08
 *
 * These tests run against the dev-harness and require a running dev server.
 * Each scenario maps to a locked decision (D-01 through D-08).
 *
 * Prerequisites:
 *   pnpm --filter dev-harness dev  (dev server running on http://localhost:5173)
 *
 * Run:
 *   npx playwright test e2e/step-wizard.spec.ts
 */
import { test, expect } from '@playwright/test';

const WIZARD_URL = '/step-wizard';

// E2E-01: Sequential flow completes all steps in order (D-01)
test('E2E-01: sequential flow completes all steps in order', async ({ page }) => {
  await page.goto(WIZARD_URL);
  await expect(page.getByRole('navigation', { name: 'Wizard steps' })).toBeVisible();

  // Step 1 active
  await expect(page.locator('[aria-current="step"]')).toContainText('First Step');

  // Mark Complete & Next
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await expect(page.locator('[aria-current="step"]')).toContainText('Second Step');

  // Complete step 2
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await expect(page.locator('[aria-current="step"]')).toContainText('Third Step');

  // Complete final step
  await page.getByRole('button', { name: 'Complete' }).click();
  await expect(page.getByText('All steps complete')).toBeVisible();
});

// E2E-02: Sequential-with-jumps respects unlock rules (D-01)
test('E2E-02: sequential-with-jumps respects unlock rules', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?mode=sequential-with-jumps`);

  // Third step should be locked
  const thirdStep = page.getByRole('button', { name: /Third Step/ });
  await expect(thirdStep).toBeDisabled();

  // Advance to step 2 — step 2 becomes unlocked
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();

  // Now step 1 should be clickable (visited)
  const firstStep = page.getByRole('button', { name: /First Step/ });
  await expect(firstStep).toBeEnabled();
});

// E2E-03: Parallel mode allows any step navigation (D-01)
test('E2E-03: parallel mode allows any step navigation', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?mode=parallel`);

  // All steps should be clickable
  const steps = page.locator('.hbc-wizard-step-row__btn');
  const count = await steps.count();
  for (let i = 0; i < count; i++) {
    await expect(steps.nth(i)).toBeEnabled();
  }

  // Click third step directly
  await steps.nth(2).click();
  await expect(page.locator('[aria-current="step"]')).toContainText('Third Step');
});

// E2E-04: Monotonic merge preserves progress on reload (D-02)
test('E2E-04: monotonic merge preserves progress on reload', async ({ page }) => {
  await page.goto(WIZARD_URL);

  // Complete step 1
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await expect(page.locator('[aria-current="step"]')).toContainText('Second Step');

  // Reload — step 1 should still be complete
  await page.reload();
  const firstStepIcon = page.locator('.hbc-wizard-step-row').first().locator('.hbc-step-icon');
  await expect(firstStepIcon).toHaveClass(/hbc-step-icon--success/);
});

// E2E-05: Validation blocks required step completion (D-03)
test('E2E-05: validation blocks required step completion', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?validation=true`);

  // Try to complete — should show validation error
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});

// E2E-06: Force-complete bypasses validation (D-03)
test('E2E-06: force-complete bypasses validation', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?validation=true&forceComplete=true`);

  // Try to complete — validation error appears
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await expect(page.getByText('Complete Anyway')).toBeVisible();

  // Force complete
  await page.getByRole('button', { name: 'Complete Anyway' }).click();
  // Step should now be complete
  const firstStepIcon = page.locator('.hbc-wizard-step-row').first().locator('.hbc-step-icon');
  await expect(firstStepIcon).toHaveClass(/hbc-step-icon--success/);
});

// E2E-07: Reopen step resets completion cycle (D-05, D-07)
test('E2E-07: reopen step resets completion cycle', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?allowReopen=true`);

  // Complete all steps
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await page.getByRole('button', { name: 'Complete' }).click();
  await expect(page.getByText('All steps complete')).toBeVisible();

  // Reopen first step
  const firstStep = page.getByRole('button', { name: /First Step/ });
  await firstStep.click();
  // Wizard should no longer show complete
  await expect(page.getByText('All steps complete')).not.toBeVisible();
});

// E2E-08: Essential tier shows coaching callout (D-06)
test('E2E-08: essential tier shows coaching callout', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?tier=essential`);

  await expect(page.getByTestId('coaching-callout')).toBeVisible();
});

// E2E-09: Expert tier shows timestamps and validation dots (D-06)
test('E2E-09: expert tier shows timestamps and validation dots', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?tier=expert`);

  // Complete first step — should show timestamp
  await page.getByRole('button', { name: 'Mark Complete & Next' }).click();
  await expect(page.locator('.hbc-wizard-step-row__completed-at')).toBeVisible();
});

// E2E-10: Overdue step shows badge and notification (D-08)
test('E2E-10: overdue step shows badge and notification', async ({ page }) => {
  await page.goto(`${WIZARD_URL}?overdue=true`);

  // Overdue badge should be visible
  await expect(page.getByLabel('Overdue')).toBeVisible();
  // Step row should have overdue class
  await expect(page.locator('.hbc-wizard-step-row--overdue')).toBeVisible();
});
