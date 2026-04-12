/**
 * Phase-16 — public webpart: View All feed flyout (E family).
 *
 * Proves that View All opens a slide-out feed, renders full excerpt
 * content, supports search, and that clicking an item routes into
 * detail while the feed flyout closes.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { captureProof } from '../helpers/kudosArtifacts';
import { workflowBaseline, recipientPerspectiveBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.public.view-all-feed', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test(`View All opens feed flyout ${matrixTag('VIEW_ALL', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, recipientPerspectiveBaseline());
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    const panel = page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel));
    await expect(panel).toBeVisible();
    await captureProof(page, {
      group: 'public',
      spec: 'view-all-feed',
      caseName: 'feed-open',
      matrixParts: ['VIEW_ALL', 'P0'],
    });
  });

  test(`feed supports search ${matrixTag('VIEW_ALL', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    const panel = page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel));
    await panel.getByRole('searchbox').fill('approved');
    await expect(panel).toContainText('Approved and live');
  });

  test(`full excerpt preserved (no truncation) ${matrixTag('VIEW_ALL', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, recipientPerspectiveBaseline());
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel))).toContainText('Seeded body.');
  });

  test(`clicking item closes feed + opens detail ${matrixTag('VIEW_ALL', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, recipientPerspectiveBaseline());
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    await page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel)).getByText('Approved and live').click();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel))).toHaveCount(0);
    await expect(page.locator(tid(KUDOS_TESTIDS.publicDetailPanel))).toBeVisible();
  });
});
