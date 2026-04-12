/**
 * Phase-16 — companion: queue tabs + filter model.
 *
 * Tabs: pending, revisionRequested, flagged, approved, rejected,
 * removed. Filters: search, ownership, admin-review-only,
 * scheduled-only, aging buckets.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag, type QueueBucket } from '../helpers/kudosLocators';
import { captureProof } from '../helpers/kudosArtifacts';
import { auditTimelineBaseline, governanceBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

const BUCKETS: QueueBucket[] = [
  'pending',
  'revision-requested',
  'flagged',
  'approved',
  'rejected',
  'removed',
];

test.describe('kudos.admin.queue-tabs-and-filters', () => {
  test.fixme(true, 'Requires dev-harness kudos-companion tab + seed hook (prompt 04 prerequisite).');

  test.beforeEach(async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
  });

  for (const bucket of BUCKETS) {
    test(`tab "${bucket}" scopes correctly ${matrixTag('QUEUE', bucket, 'P1')}`, async ({ page }) => {
      await page.locator(tid(KUDOS_TESTIDS.queueTab(bucket))).click();
      await expect(page.locator(tid(KUDOS_TESTIDS.queueRow))).not.toHaveCount(0);
      await captureProof(page, {
        group: 'companion',
        spec: 'queue-tabs',
        caseName: `tab-${bucket}`,
        matrixParts: ['QUEUE', bucket, 'P1'],
      });
    });
  }

  test(`search filter narrows rows ${matrixTag('QUEUE_FILTER', 'P1')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueFilterSearch)).fill('pending');
    await expect(page.locator(tid(KUDOS_TESTIDS.queueRow))).not.toHaveCount(0);
  });

  test(`admin-review-only toggle ${matrixTag('B1', 'QUEUE_FILTER', 'P0')}`, async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueFilterAdminReviewOnly)).click();
    const rows = page.locator(tid(KUDOS_TESTIDS.queueRow));
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Flagged for admin review');
  });

  test(`scheduled-only toggle ${matrixTag('A4', 'QUEUE_FILTER', 'P1')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueTab('approved'))).click();
    await page.locator(tid(KUDOS_TESTIDS.queueFilterScheduledOnly)).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.queueRow))).toContainText('scheduled', {
      ignoreCase: true,
    });
  });

  test(`ownership filter scopes to current admin ${matrixTag('B3', 'B4', 'QUEUE_FILTER', 'P1')}`, async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueFilterOwnership)).selectOption('mine');
    const rows = page.locator(tid(KUDOS_TESTIDS.queueRow));
    await expect(rows).toContainText('Claimed by admin');
  });

  test(`aging bucket filter renders ${matrixTag('QUEUE_FILTER', 'P2')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueFilterAging)).selectOption({ index: 1 });
    await expect(page.locator(tid(KUDOS_TESTIDS.queueRow))).not.toHaveCount(0);
  });
});
