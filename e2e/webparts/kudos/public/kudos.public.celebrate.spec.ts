/**
 * Phase-16 — public webpart: celebrate / reaction (E1–E5).
 *
 * Celebrate from main surface and from detail panel hit the same
 * mutation seam and produce idempotent repeat behavior.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { readCacheInvalidationCount } from '../helpers/kudosAssertions';
import { interactionBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.public.celebrate', () => {
  // Activated phase-16a/04.

  test(`celebrate count zero renders (E1) ${matrixTag('E1', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, interactionBaseline());
    const zero = page
      .locator(tid(KUDOS_TESTIDS.publicFeedItem))
      .filter({ hasText: 'Zero celebrates' });
    await expect(zero.locator(tid(KUDOS_TESTIDS.celebrateCount))).toHaveText('0');
  });

  test(`celebrate from main surface increments + invalidates cache (E3) ${matrixTag('E3', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, interactionBaseline());
    const before = await readCacheInvalidationCount(page);
    const row = page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first();
    const count = row.locator(tid(KUDOS_TESTIDS.celebrateCount));
    const initial = Number(await count.innerText());
    await row.locator(tid(KUDOS_TESTIDS.celebrateButton)).click();
    await expect(count).toHaveText(String(initial + 1));
    expect(await readCacheInvalidationCount(page)).toBeGreaterThan(before);
  });

  test(`celebrate from detail panel (E4) ${matrixTag('E4', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, interactionBaseline());
    await page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first().click();
    const panel = page.locator(tid(KUDOS_TESTIDS.publicDetailPanel));
    await expect(panel).toBeVisible();
    const count = panel.locator(tid(KUDOS_TESTIDS.celebrateCount));
    const initial = Number(await count.innerText());
    await panel.locator(tid(KUDOS_TESTIDS.celebrateButton)).click();
    await expect(count).toHaveText(String(initial + 1));
  });

  test(`repeat celebrate is idempotent (E5) ${matrixTag('E5', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, interactionBaseline());
    const row = page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first();
    const btn = row.locator(tid(KUDOS_TESTIDS.celebrateButton));
    const count = row.locator(tid(KUDOS_TESTIDS.celebrateCount));
    const initial = Number(await count.innerText());
    await btn.click();
    await btn.click();
    await btn.click();
    // idempotent by user: one increment regardless of repeated clicks from
    // the same actor in the same session
    await expect(count).toHaveText(String(initial + 1));
  });
});
