/**
 * Phase-16 — hosted/runtime: dead-control sweep (H7).
 *
 * Exhaustively walks the public main surface, View All feed, archive,
 * public detail, companion queue, and companion detail and asserts
 * every visible button/link either has a handler, an href, is
 * disabled, or is explicitly aria-hidden. Prevents the "looks clickable
 * but does nothing" class of regression.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion, gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { assertNoDeadCta } from '../helpers/kudosAssertions';
import { auditTimelineBaseline, visibilityBaseline, workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.hosted.dead-control-sweep', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test(`public main surface ${matrixTag('H7', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await assertNoDeadCta(page);
  });

  test(`View All feed panel ${matrixTag('H7', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel))).toBeVisible();
    await assertNoDeadCta(page);
  });

  test(`archive section ${matrixTag('H7', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, visibilityBaseline());
    await assertNoDeadCta(page);
  });

  test(`public detail panel ${matrixTag('H7', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first().click();
    await expect(page.locator(tid(KUDOS_TESTIDS.publicDetailPanel))).toBeVisible();
    await assertNoDeadCta(page);
  });

  test(`companion queue ${matrixTag('H7', 'P0')}`, async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
    await assertNoDeadCta(page);
  });

  test(`companion detail panel ${matrixTag('H7', 'P1')}`, async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionDetailPanel))).toBeVisible();
    await assertNoDeadCta(page);
  });
});
