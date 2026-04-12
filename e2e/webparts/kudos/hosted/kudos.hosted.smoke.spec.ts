/**
 * Phase-16 stress suite — hosted/runtime group smoke spec.
 * Detailed chrome-overlap, keyboard/focus, panel-scroll, and zoom
 * regression specs land in prompt 08.
 */
import { test, expect } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { workflowBaseline } from '../fixtures/baseline';
import { matrixTag } from '../helpers/kudosLocators';

test.describe('kudos.hosted.smoke', () => {
  test.fixme(true, 'Requires hosted-chrome harness overlay (prompt 08 dependency).');

  test(`standard viewport renders without chrome overlap ${matrixTag('H1', 'H3', 'P0')}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoKudosPublic(page, workflowBaseline());
    await expect(page.locator('[data-hbc-testid="hb-kudos-public-root"]')).toBeVisible();
  });
});
