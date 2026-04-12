/**
 * Phase-16 — hosted/runtime: panel scroll behavior (H6).
 *
 * Long content in the composer flyout, View All feed panel, and
 * companion detail panel must scroll the body while keeping
 * header/footer controls reachable.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion, gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { auditTimelineBaseline, workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

async function bodyScrolls(
  page: import('@playwright/test').Page,
  containerSelector: string,
): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return false;
    const initial = el.scrollTop;
    el.scrollTop = Math.max(200, el.scrollHeight - el.clientHeight);
    const moved = el.scrollTop !== initial;
    el.scrollTop = initial;
    return moved;
  }, containerSelector);
}

test.describe('kudos.hosted.panel-scroll', () => {
  // Activated phase-16a/04.

  test(`View All feed panel body scrolls ${matrixTag('H6', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    const panel = page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel));
    await expect(panel).toBeVisible();
    expect(await bodyScrolls(page, tid(KUDOS_TESTIDS.viewAllFeedPanel))).toBe(true);
    // close control still reachable after scroll
    await expect(panel.getByRole('button', { name: /close/i })).toBeVisible();
  });

  test(`companion detail panel scrolls long audit timeline ${matrixTag('H6', 'P1')}`, async ({
    page,
  }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    const panel = page.locator(tid(KUDOS_TESTIDS.companionDetailPanel));
    await expect(panel).toBeVisible();
    expect(await bodyScrolls(page, tid(KUDOS_TESTIDS.companionDetailPanel))).toBe(true);
  });

  test(`composer form scrolls without trapping submit ${matrixTag('H6', 'P2')}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 }); // short viewport
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).click();
    const form = page.locator(tid(KUDOS_TESTIDS.composerForm));
    await expect(form).toBeVisible();
    // submit button remains reachable after scroll
    await form.locator(tid(KUDOS_TESTIDS.composerSubmit)).scrollIntoViewIfNeeded();
    await expect(form.locator(tid(KUDOS_TESTIDS.composerSubmit))).toBeVisible();
  });
});
