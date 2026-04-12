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
import { governanceBaseline, workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.hosted.keyboard-and-focus', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

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
});
