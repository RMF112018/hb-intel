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
import { visibilityBaseline, workflowBaseline } from '../fixtures';
import { captureProof } from '../helpers/kudosArtifacts';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

interface ResponsiveCase {
  readonly label: string;
  readonly viewport: { width: number; height: number };
  readonly matrix: string[];
}

const RESPONSIVE_CASES: readonly ResponsiveCase[] = [
  {
    label: 'phone-portrait',
    viewport: { width: 440, height: 956 },
    matrix: ['H11', 'P2'],
  },
  {
    label: 'tablet-portrait',
    viewport: { width: 834, height: 1210 },
    matrix: ['H11', 'P2'],
  },
  {
    label: 'standard-laptop',
    viewport: { width: 1366, height: 768 },
    matrix: ['H11', 'P2'],
  },
  {
    label: 'large-desktop',
    viewport: { width: 1920, height: 1080 },
    matrix: ['H11', 'P2'],
  },
];

async function assertNoHorizontalOverflow(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<void> {
  const metrics = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return { found: false, scrollWidth: 0, clientWidth: 0, overflows: false };
    return {
      found: true,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflows: el.scrollWidth > el.clientWidth,
    };
  }, selector);
  expect(metrics.found, `Expected ${selector} to exist`).toBe(true);
  expect(
    metrics.overflows,
    `${selector} overflows (scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth})`,
  ).toBe(false);
}

test.describe('kudos.hosted.responsive', () => {
  for (const viewportCase of RESPONSIVE_CASES) {
    test(`public responsive contract: ${viewportCase.label} ${matrixTag(...viewportCase.matrix)}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewportCase.viewport);
      await gotoKudosPublic(page, visibilityBaseline());

      const root = page.locator(tid(KUDOS_TESTIDS.publicRoot));
      const featured = page.locator(tid(KUDOS_TESTIDS.featuredCard));
      const recent = page.locator(tid(KUDOS_TESTIDS.recentSection));
      const archive = page.locator(tid(KUDOS_TESTIDS.archiveSection));

      await expect(root).toBeVisible();
      await expect(archive).toBeVisible();
      await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger))).toBeVisible();
      await expect(page.locator(tid(KUDOS_TESTIDS.viewAllTrigger))).toBeVisible();
      const featuredCount = await featured.count();
      if (featuredCount > 0) await expect(featured).toBeVisible();

      await assertNoHorizontalOverflow(page, tid(KUDOS_TESTIDS.publicRoot));
      await assertNoHorizontalOverflow(page, tid(KUDOS_TESTIDS.archiveSection));
      await assertNoHorizontalOverflow(page, '[data-hbc-testid="hb-kudos-hero-zone"]');
      if ((await recent.count()) > 0) {
        await assertNoHorizontalOverflow(page, tid(KUDOS_TESTIDS.recentSection));
      }

      const proofPath = await captureProof(page, {
        group: 'hosted',
        spec: 'kudos.hosted.responsive',
        caseName: `public-responsive-${viewportCase.label}`,
        matrixParts: viewportCase.matrix,
      });
      await testInfo.attach(`kudos-responsive-${viewportCase.label}`, {
        body: Buffer.from(proofPath, 'utf-8'),
        contentType: 'text/plain',
      });
    });
  }

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
    await page.getByRole('button', { name: /open archive/i }).click({ force: true });
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click({ force: true });
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
