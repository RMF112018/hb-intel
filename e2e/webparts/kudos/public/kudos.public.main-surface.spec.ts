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
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test(`surface loads with workflow baseline ${matrixTag('A3', 'C1', 'H1', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await expect(page.locator(tid(KUDOS_TESTIDS.publicRoot))).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger))).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllTrigger))).toBeVisible();
  });

  test(`spotlight surfaces pinned/featured items ${matrixTag('D2', 'D3', 'P1')}`, async ({ page }) => {
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
    await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger))).toBeVisible();
  });

  test(`no dead CTA on main + detail ${matrixTag('H7', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await assertNoDeadCta(page);
    await page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first().click();
    await assertNoDeadCta(page);
  });

  test(`keyboard reaches primary controls + focus-visible ${matrixTag('H4', 'H5', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.keyboard.press('Tab');
    const trigger = page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger));
    await expect(trigger).toBeFocused();
    // focus-visible is a product contract; assert the outline style exists.
    const outline = await trigger.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });
});
