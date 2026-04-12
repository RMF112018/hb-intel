/**
 * Phase-16 — companion: detail panel + audit timeline.
 *
 * Opens detail from queue rows, proves audit timeline is present on
 * admin side, and proves governance metadata matches the row state.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { assertAdminDetailBoundary } from '../helpers/kudosAssertions';
import { captureProof } from '../helpers/kudosArtifacts';
import { auditTimelineBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.admin.detail-and-audit', () => {
  // Activated phase-16a/04.

  test.beforeEach(async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
  });

  test(`detail opens from row ${matrixTag('DETAIL', 'P0')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionDetailPanel))).toBeVisible();
  });

  test(`audit timeline visible on admin detail ${matrixTag('AUDIT', 'P0')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await assertAdminDetailBoundary(page);
    await captureProof(page, {
      group: 'companion',
      spec: 'detail-and-audit',
      caseName: 'admin-audit-timeline',
      matrixParts: ['AUDIT', 'P0'],
    });
  });

  test(`row ↔ detail state agreement ${matrixTag('DETAIL', 'P1')}`, async ({ page }) => {
    const row = page.locator(tid(KUDOS_TESTIDS.queueRow)).first();
    const rowLabel = await row.innerText();
    await row.click();
    const panel = page.locator(tid(KUDOS_TESTIDS.companionDetailPanel));
    await expect(panel).toContainText(rowLabel.split('\n')[0]);
  });

  test(`audit timeline renders submit→approve sequence ${matrixTag('AUDIT', 'D1', 'P1')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    const timeline = page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline));
    await expect(timeline).toContainText('submit');
    await expect(timeline).toContainText('approve');
  });

  test(`audit timeline renders revision→resubmit→approve sequence ${matrixTag('AUDIT', 'D2', 'P1')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).nth(1).click();
    const timeline = page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline));
    await expect(timeline).toContainText('requestRevision');
    await expect(timeline).toContainText('resubmit');
  });
});
