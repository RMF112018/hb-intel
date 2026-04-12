/**
 * Phase-16 — companion: prominence (pin/feature) + slot collisions.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { captureProof } from '../helpers/kudosArtifacts';
import { prominenceBaseline, setHostedFault, clearHostedFault } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.admin.prominence', () => {
  // Activated phase-16a/04.

  test.beforeEach(async ({ page }) => {
    await gotoKudosCompanion(page, prominenceBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueTab('approved'))).click();
  });

  test(`pin a standard item ${matrixTag('D2', 'P1')}`, async ({ page }) => {
    const row = page.locator(tid(KUDOS_TESTIDS.queueRow)).filter({ hasText: 'Approved and live' });
    await row.click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('pin')}"]`).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('pin');
  });

  test(`unpin a pinned item ${matrixTag('D4', 'P1')}`, async ({ page }) => {
    const row = page.locator(tid(KUDOS_TESTIDS.queueRow)).filter({ hasText: 'Pinned' });
    await row.click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('unpin')}"]`).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('unpin');
  });

  test(`feature a standard item ${matrixTag('D3', 'P1')}`, async ({ page }) => {
    const row = page.locator(tid(KUDOS_TESTIDS.queueRow)).filter({ hasText: 'Approved and live' });
    await row.click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('feature')}"]`).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('feature');
  });

  test(`pin slot collision surfaces intelligibly ${matrixTag('D6', 'P0')}`, async ({ page }) => {
    await setHostedFault(page, 'pin-slot-collision');
    const row = page.locator(tid(KUDOS_TESTIDS.queueRow)).filter({ hasText: 'Approved and live' });
    await row.click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('pin')}"]`).click();
    await expect(page.getByRole('alert')).toContainText(/slot|full|limit/i);
    await captureProof(page, {
      group: 'companion',
      spec: 'prominence',
      caseName: 'pin-collision',
      matrixParts: ['D6', 'P0'],
    });
    await clearHostedFault(page);
  });

  test(`feature slot collision surfaces intelligibly ${matrixTag('D6', 'P1')}`, async ({ page }) => {
    await setHostedFault(page, 'feature-slot-collision');
    const row = page.locator(tid(KUDOS_TESTIDS.queueRow)).filter({ hasText: 'Approved and live' });
    await row.click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('feature')}"]`).click();
    await expect(page.getByRole('alert')).toContainText(/slot|full|limit/i);
    await clearHostedFault(page);
  });
});
