/**
 * Phase-16 — companion: bulk approve.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { readCacheInvalidationCount } from '../helpers/kudosAssertions';
import { captureProof } from '../helpers/kudosArtifacts';
import { auditTimelineBaseline, setHostedFault, clearHostedFault } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.admin.bulk-approve', () => {
  // Activated phase-16a/04.

  test.beforeEach(async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueTab('pending'))).click();
  });

  test(`bulk button visible only on pending/flagged tabs ${matrixTag('BULK', 'P1')}`, async ({ page }) => {
    await expect(page.locator(tid(KUDOS_TESTIDS.bulkApproveButton))).toBeVisible();
    await page.locator(tid(KUDOS_TESTIDS.queueTab('rejected'))).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.bulkApproveButton))).toHaveCount(0);
  });

  test(`approve selected mutates selection only ${matrixTag('BULK', 'P0')}`, async ({ page }) => {
    const rows = page.locator(tid(KUDOS_TESTIDS.queueRow));
    const total = await rows.count();
    await rows.nth(0).getByRole('checkbox').check();
    await rows.nth(1).getByRole('checkbox').check();
    const before = await readCacheInvalidationCount(page);
    await page.locator(tid(KUDOS_TESTIDS.bulkApproveButton)).click();
    await page.getByRole('button', { name: /confirm|approve/i }).click();
    expect(await readCacheInvalidationCount(page)).toBeGreaterThan(before);
    await expect(rows).toHaveCount(total - 2);
    await captureProof(page, {
      group: 'companion',
      spec: 'bulk-approve',
      caseName: 'bulk-approve-two',
      matrixParts: ['BULK', 'P0'],
    });
  });

  test(`selection clears after bulk completes ${matrixTag('BULK', 'P1')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().getByRole('checkbox').check();
    await page.locator(tid(KUDOS_TESTIDS.bulkApproveButton)).click();
    await page.getByRole('button', { name: /confirm|approve/i }).click();
    for (const cb of await page.locator(tid(KUDOS_TESTIDS.queueRow) + ' input[type=checkbox]').all()) {
      await expect(cb).not.toBeChecked();
    }
  });

  test(`partial failure surfaces per-row ${matrixTag('BULK', 'P1')}`, async ({ page }) => {
    await setHostedFault(page, 'patch-rejected-etag');
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).nth(0).getByRole('checkbox').check();
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).nth(1).getByRole('checkbox').check();
    await page.locator(tid(KUDOS_TESTIDS.bulkApproveButton)).click();
    await page.getByRole('button', { name: /confirm|approve/i }).click();
    await expect(page.getByRole('alert')).toContainText(/fail|error/i);
    await clearHostedFault(page);
  });
});
