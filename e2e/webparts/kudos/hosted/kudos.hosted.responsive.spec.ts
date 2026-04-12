/**
 * Phase-23 Prompt 09 — hosted responsive-breakpoint coverage.
 *
 * The shared `HbcKudosComposerFlyout` switches between a right-side
 * desktop sheet (480px wide, anchored to the viewport right edge) and
 * a full-width mobile bottom-sheet at `(max-width: 767px)`. Prior to
 * this spec no hosted test proved either branch renders correctly
 * inside SPFx. Also guards the hosted safe-zone at reduced viewport.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.hosted.responsive', () => {
  test(`composer flyout renders as right-sheet at desktop width ${matrixTag('H11', 'P2')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).click();
    const form = page.locator(tid(KUDOS_TESTIDS.composerForm));
    await expect(form).toBeVisible();

    // Flyout panel: aria-modal dialog with title "Give Kudos".
    const panel = page.getByRole('dialog', { name: 'Give Kudos' });
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    // Desktop right-sheet contract: panel is 480px wide and hugs the
    // viewport right edge (within a few pixels for safe-area padding).
    expect(box!.width).toBeCloseTo(480, -1);
    expect(box!.x + box!.width).toBeGreaterThanOrEqual(1440 - 4);
  });

  test(`composer flyout renders as bottom-sheet at mobile width ${matrixTag('H11', 'P2')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.composerForm))).toBeVisible();

    const panel = page.getByRole('dialog', { name: 'Give Kudos' });
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    // Mobile bottom-sheet contract: panel fills viewport width and
    // bottom-anchors (its bottom edge aligns with the viewport bottom).
    expect(box!.width).toBeGreaterThanOrEqual(480 - 4);
    expect(box!.y + box!.height).toBeGreaterThanOrEqual(800 - 4);
  });

  test(`feed flyout body does not overlap hosted safe-zone at reduced width ${matrixTag('H12', 'H6', 'P2')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 720 });
    await gotoKudosPublic(page, workflowBaseline());

    // Expand archive first to reach the "View all recognition" control.
    await page.getByRole('button', { name: /view archive/i }).click();
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    const feedPanel = page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel));
    await expect(feedPanel).toBeVisible();

    // Safe-zone sentinel renders only when the webpart detects it is
    // running inside a host iframe. Skip gracefully in harness-only runs.
    const sentinel = page.locator(tid(KUDOS_TESTIDS.assistantSafeZone));
    const hasSafeZone = (await sentinel.count()) > 0;
    test.skip(!hasSafeZone, 'safe-zone sentinel only present in hosted iframe');

    const feedBox = await feedPanel.boundingBox();
    const zoneBox = await sentinel.boundingBox();
    expect(feedBox).not.toBeNull();
    expect(zoneBox).not.toBeNull();
    // Rectangles must not intersect.
    const intersects =
      feedBox!.x < zoneBox!.x + zoneBox!.width &&
      feedBox!.x + feedBox!.width > zoneBox!.x &&
      feedBox!.y < zoneBox!.y + zoneBox!.height &&
      feedBox!.y + feedBox!.height > zoneBox!.y;
    expect(intersects).toBe(false);
  });
});
