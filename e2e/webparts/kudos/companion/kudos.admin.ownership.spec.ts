/**
 * Phase-16 — companion: ownership + work management (B3/B4/B7/B8).
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { governanceBaseline, USERS } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.admin.ownership', () => {
  // Activated phase-16a/04.

  test.beforeEach(async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
  });

  test(`claim a pending item ${matrixTag('B3', 'P1')}`, async ({ page }) => {
    const row = page.locator(tid(KUDOS_TESTIDS.queueRow)).filter({ hasText: 'Pending entry' });
    await row.click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('claim')}"]`).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('claim');
  });

  test(`reassign to another admin ${matrixTag('B4', 'B7', 'P1')}`, async ({ page }) => {
    const row = page
      .locator(tid(KUDOS_TESTIDS.queueRow))
      .filter({ hasText: 'Claimed by admin' });
    await row.click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('assign')}"]`).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox').selectOption(USERS.otherAdmin.id);
    await dialog.getByRole('button', { name: /confirm|submit/i }).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('reassign');
  });

  test(`ownership filter refreshes after claim ${matrixTag('B3', 'QUEUE_FILTER', 'P1')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueFilterOwnership)).selectOption('unassigned');
    const countBefore = await page.locator(tid(KUDOS_TESTIDS.queueRow)).count();
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('claim')}"]`).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.queueRow))).toHaveCount(countBefore - 1);
  });

  test(`reassignment denied on terminal state ${matrixTag('B8', 'P2')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueTab('rejected'))).click();
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await expect(
      page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('assign')}"]`),
    ).toBeDisabled();
  });
});
