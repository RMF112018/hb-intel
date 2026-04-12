/**
 * Phase-16 — hosted/runtime: SharePoint chrome overlap (H1/H2/H3).
 *
 * Validates that primary controls on the public + companion surfaces
 * remain reachable and unobscured when rendered under a SharePoint-
 * style suite/command bar at standard and reduced-width viewports.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion, gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { captureProof } from '../helpers/kudosArtifacts';
import { applyHostedChrome, removeHostedChrome } from '../helpers/kudosHostedChrome';
import { governanceBaseline, workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

async function assertNotHiddenUnderChrome(
  page: import('@playwright/test').Page,
  locator: string,
) {
  const el = page.locator(locator).first();
  await expect(el).toBeVisible();
  const box = await el.boundingBox();
  const chrome = await page.locator(tid('sp-hosted-chrome')).boundingBox();
  expect(box, 'locator has no bounding box').not.toBeNull();
  expect(chrome, 'chrome has no bounding box').not.toBeNull();
  if (box && chrome) {
    expect(box.y, `${locator} overlaps chrome`).toBeGreaterThanOrEqual(chrome.y + chrome.height);
  }
}

test.describe('kudos.hosted.chrome-overlap', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test.afterEach(async ({ page }) => {
    await removeHostedChrome(page).catch(() => {});
  });

  test(`standard viewport: Give Kudos + View All not under chrome ${matrixTag('H1', 'H3', 'P0')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoKudosPublic(page, workflowBaseline());
    await applyHostedChrome(page);
    await assertNotHiddenUnderChrome(page, tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger));
    await assertNotHiddenUnderChrome(page, tid(KUDOS_TESTIDS.viewAllTrigger));
    await captureProof(page, {
      group: 'hosted',
      spec: 'chrome-overlap',
      caseName: 'public-1440',
      matrixParts: ['H1', 'H3', 'P0'],
    });
  });

  test(`reduced-width viewport: primary CTAs remain reachable ${matrixTag('H2', 'H3', 'P1')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoKudosPublic(page, workflowBaseline());
    await applyHostedChrome(page);
    await assertNotHiddenUnderChrome(page, tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger));
  });

  test(`companion queue tabs remain clickable under chrome ${matrixTag('H3', 'P0')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoKudosCompanion(page, governanceBaseline());
    await applyHostedChrome(page);
    await page.locator(tid(KUDOS_TESTIDS.queueTab('approved'))).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.queueRow))).not.toHaveCount(0);
  });
});
