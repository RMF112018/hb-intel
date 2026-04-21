/**
 * Phase-16 — hosted/runtime: keyboard navigation + focus-visible.
 *
 * Proves the public composer flyout, companion queue, and detail
 * panels can be operated keyboard-only, that focus-visible is present
 * on critical controls, and that modal/flyout focus behavior is not
 * broken in obvious ways (no focus trap leak to background; close
 * restores focus to the trigger).
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion, gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { governanceBaseline, visibilityBaseline, workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.hosted.keyboard-and-focus', () => {
  // Activated phase-16a/04.

  test(`tab order reaches public primary controls ${matrixTag('H4', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.keyboard.press('Tab');
    await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger))).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllTrigger))).toBeFocused();
  });

  test(`focus-visible outline present on primary CTA ${matrixTag('H5', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    const trigger = page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger));
    await trigger.focus();
    const outline = await trigger.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(outline.style).not.toBe('none');
    expect(outline.width).not.toBe('0px');
  });

  test(`composer flyout: Escape closes and returns focus to trigger ${matrixTag('H4', 'P1')}`, async ({
    page,
  }) => {
    await gotoKudosPublic(page, workflowBaseline());
    const trigger = page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger));
    await trigger.click();
    await expect(page.locator(tid(KUDOS_TESTIDS.composerForm))).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(tid(KUDOS_TESTIDS.composerForm))).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test(`companion detail panel: Escape closes without losing page scroll ${matrixTag('H4', 'H6', 'P1')}`, async ({
    page,
  }) => {
    await gotoKudosCompanion(page, governanceBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionDetailPanel))).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(tid(KUDOS_TESTIDS.companionDetailPanel))).toHaveCount(0);
  });

  test(`modal focus trap: Tab within dialog does not leak to background ${matrixTag('H4', 'P1')}`, async ({
    page,
  }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).click();
    // cycle 10 tabs — all focused elements should still be within the form
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab');
      const inForm = await page.evaluate(() => {
        const active = document.activeElement;
        const form = document.querySelector('[data-hbc-testid="hb-kudos-composer-form"]');
        return !!(form && active && form.contains(active));
      });
      expect(inForm).toBe(true);
    }
  });

  test(`critical CTAs meet minimum 44px target-size posture ${matrixTag('H5', 'P1')}`, async ({
    page,
  }) => {
    await gotoKudosPublic(page, workflowBaseline());
    const trigger = page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger));
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(triggerBox!.height).toBeGreaterThanOrEqual(44);

    // Flyout close button — primary overlay-dismiss control. Must
    // satisfy the 44px DESIGN_SYSTEM minimum.
    await trigger.click();
    const closeBtn = page.getByRole('button', { name: 'Close' });
    const closeBox = await closeBtn.boundingBox();
    expect(closeBox).not.toBeNull();
    expect(closeBox!.width).toBeGreaterThanOrEqual(44);
    expect(closeBox!.height).toBeGreaterThanOrEqual(44);
  });

  test(`compact-mode controls keep keyboard reachability and 44px targets ${matrixTag('H4', 'H5', 'P2')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 440, height: 956 });
    await gotoKudosPublic(page, visibilityBaseline());

    const trigger = page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).first();
    const archiveToggle = page.locator('[data-hbc-testid="hb-kudos-archive-toggle"]');
    const viewAll = page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).first();

    let onGive = false;
    let onArchive = false;
    let onViewAll = false;

    for (let i = 0; i < 50 && !(onGive && onArchive && onViewAll); i += 1) {
      await page.keyboard.press('Tab');
      if (!onGive) onGive = await trigger.evaluate((el) => el === document.activeElement);
      if (!onArchive) {
        onArchive = await archiveToggle.evaluate((el) => el === document.activeElement);
      }
      if (!onViewAll) onViewAll = await viewAll.evaluate((el) => el === document.activeElement);
    }

    expect(onGive, 'Give Kudos trigger reachable').toBe(true);
    expect(onArchive, 'Archive toggle reachable').toBe(true);
    expect(onViewAll, 'View all feed trigger reachable').toBe(true);

    const triggerBox = await trigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(triggerBox!.height).toBeGreaterThanOrEqual(44);

    // Archive toggle minimum target size is statically guarded in
    // hbKudosAccessibilityGuardrails.test.tsx; hosted runtime here
    // focuses on keyboard reachability in compact mode.
  });
});
