/**
 * Phase-16 — public webpart: main surface + host-UX.
 *
 * Covers surface load, spotlight/featured rendering, no dead CTA,
 * keyboard reachability, and focus-visible state on the public
 * HbcPeopleCultureSurface.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { assertNoDeadCta } from '../helpers/kudosAssertions';
import { workflowBaseline, prominenceBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.public.main-surface', () => {
  // Activated phase-16a/04 — harness + test-id contract covers this file.

  test(`surface loads with workflow baseline ${matrixTag('A3', 'C1', 'H1', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await expect(page.locator(tid(KUDOS_TESTIDS.publicRoot))).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).first()).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).first()).toBeVisible();
  });

  test(`spotlight surfaces pinned/featured items ${matrixTag('D2', 'D3', 'P1')}`, async ({ page }) => {
    // publicFeed/publicFeedItem testids live inside HbcPeopleCultureSurface
    // and are tracked in 03a-Locator-Coverage-Note.md § Not yet instrumented.
    test.fixme(true, 'publicFeed testid not yet instrumented (03a follow-up).');
    await gotoKudosPublic(page, prominenceBaseline());
    await expect(page.locator(tid(KUDOS_TESTIDS.publicFeed))).toContainText('Pinned');
    await expect(page.locator(tid(KUDOS_TESTIDS.publicFeed))).toContainText('Featured');
  });

  test(`sparse state is acceptable when no items exist ${matrixTag('C2', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, {
      items: [],
      audits: [],
      currentUserId: 'user-unrelated',
      currentUserRole: 'public',
    });
    await expect(page.locator(tid(KUDOS_TESTIDS.publicRoot))).toBeVisible();
  });

  test(`no dead CTA on main ${matrixTag('H7', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await assertNoDeadCta(page);
  });

  test(`keyboard reaches primary controls + focus-visible ${matrixTag('H4', 'H5', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    const trigger = page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).first();
    // Walk Tab until focus lands on the Give Kudos trigger. The harness
    // preview shell renders theme and dev-controls tab stops ahead of
    // the webpart; the webpart order itself is not the target of this
    // assertion.
    let landed = false;
    for (let i = 0; i < 40 && !landed; i += 1) {
      await page.keyboard.press('Tab');
      landed = await trigger.evaluate((el) => el === document.activeElement);
    }
    expect(landed, 'Give Kudos trigger reachable via keyboard').toBe(true);
    const outline = await trigger.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });
});
