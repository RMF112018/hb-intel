import { expect, test } from '@playwright/test';

const ESTIMATING_APP_URL = process.env.ESTIMATING_APP_URL;
const ACCOUNTING_APP_URL = process.env.ACCOUNTING_APP_URL;

/**
 * D-PH6-15 Layer 3 provisioning journey coverage.
 * Scenarios run against staging URLs provided through workflow secrets.
 */
test.describe('D-PH6-15 provisioning E2E', () => {
  test.beforeEach(async () => {
    test.skip(!ESTIMATING_APP_URL || !ACCOUNTING_APP_URL, 'Requires ESTIMATING_APP_URL and ACCOUNTING_APP_URL');
  });

  test('Estimating coordinator submits a project setup request', async ({ page }) => {
    await page.goto(`${ESTIMATING_APP_URL}/project-setup/new`);

    // Form entry mirrors production submit path used by estimating coordinators.
    await page.getByTestId('project-name').fill('E2E Provisioning Project');
    await page.getByTestId('project-location').fill('Austin, TX');
    await page.getByTestId('project-type').fill('Commercial');
    await page.getByTestId('submit-request').click();

    await expect(page.getByTestId('request-status')).toContainText('Submitted');
  });

  test('Controller advances a request to ReadyToProvision using valid project number', async ({ page }) => {
    await page.goto(`${ACCOUNTING_APP_URL}/project-setup-requests`);

    await page.locator('[data-testid="request-row"]').first().locator('[data-testid="review-link"]').click();
    await page.getByTestId('mark-under-review').click();
    await page.getByTestId('begin-external-setup').click();
    await page.getByTestId('project-number').fill('25-001-01');

    await expect(page.getByTestId('complete-setup-btn')).toBeEnabled();
  });

  test('Invalid project number disables ReadyToProvision action', async ({ page }) => {
    await page.goto(`${ACCOUNTING_APP_URL}/project-setup-requests`);

    await page.locator('[data-testid="request-row"]').first().locator('[data-testid="review-link"]').click();
    await page.getByTestId('project-number').fill('INVALID');

    await expect(page.getByTestId('complete-setup-btn')).toBeDisabled();
    await expect(page.getByTestId('project-number-error')).toBeVisible();
  });
});
