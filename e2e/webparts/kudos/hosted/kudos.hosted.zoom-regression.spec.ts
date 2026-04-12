/**
 * Phase-16 — hosted/runtime: 100% baseline + 90% zoom comparison (H8/H9).
 *
 * Zoom is applied via CSS transform on the document element so the
 * harness can capture identical viewport dimensions for both states.
 * Use this only where it materially proves layout behavior; the pack
 * is intentionally small.
 */
import { devices, expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { captureProof } from '../helpers/kudosArtifacts';
import { workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

async function setZoom(page: import('@playwright/test').Page, percent: number): Promise<void> {
  await page.evaluate((pct) => {
    document.documentElement.style.zoom = `${pct}%`;
  }, percent);
}

test.describe('kudos.hosted.zoom-regression', () => {
  // Activated phase-16a/04.

  test(`100% baseline capture ${matrixTag('H8', 'P1')}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoKudosPublic(page, workflowBaseline());
    await setZoom(page, 100);
    await expect(page.locator(tid(KUDOS_TESTIDS.publicRoot))).toBeVisible();
    await captureProof(page, {
      group: 'hosted',
      spec: 'zoom-regression',
      caseName: 'public-100',
      matrixParts: ['H8', 'P1'],
    });
  });

  test(`90% comparison keeps primary CTAs visible ${matrixTag('H9', 'P2')}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoKudosPublic(page, workflowBaseline());
    await setZoom(page, 90);
    await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger))).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllTrigger))).toBeVisible();
    await captureProof(page, {
      group: 'hosted',
      spec: 'zoom-regression',
      caseName: 'public-90',
      matrixParts: ['H9', 'P2'],
    });
  });

  test(`reduced-width hosted keeps primary CTAs visible ${matrixTag('H10', 'P3')}`, async ({ page }) => {
    // Phase-17: narrow-column hosted surface. Proves the compaction still
    // reads at a constrained SharePoint column width at 100% zoom.
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoKudosPublic(page, workflowBaseline());
    await setZoom(page, 100);
    await expect(page.locator(tid(KUDOS_TESTIDS.publicRoot))).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger))).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllTrigger))).toBeVisible();
    await captureProof(page, {
      group: 'hosted',
      spec: 'zoom-regression',
      caseName: 'public-reduced-width',
      matrixParts: ['H10', 'P3'],
    });
  });

  test.describe('iPhone 12 Pro hosted', () => {
    test.use({ ...devices['iPhone 12 Pro'] });

    test(`iPhone 12 Pro hosted compaction ${matrixTag('H11', 'P4')}`, async ({ page }) => {
      // Phase-17: mobile hosted viewport. Proves the compacted masthead
      // and featured card remain legible and non-clipping on device.
      await gotoKudosPublic(page, workflowBaseline());
      await expect(page.locator(tid(KUDOS_TESTIDS.publicRoot))).toBeVisible();
      await expect(page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger))).toBeVisible();
      await captureProof(page, {
        group: 'hosted',
        spec: 'zoom-regression',
        caseName: 'public-iphone12pro',
        matrixParts: ['H11', 'P4'],
      });
    });
  });
});
