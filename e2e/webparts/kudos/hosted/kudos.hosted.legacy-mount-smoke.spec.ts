/**
 * Phase-16 — hosted/runtime: legacy PeopleCultureMerged mount smoke.
 *
 * Proves the backward-compat merged mount path still renders without
 * error boundary activation. Intentionally a single case — the merged
 * path is legacy and not under active investment.
 */
import { expect, test } from '@playwright/test';
import { matrixTag } from '../helpers/kudosLocators';

test.describe('kudos.hosted.legacy-mount-smoke', () => {
  test.fixme(true, 'Requires dev-harness legacy-merged mount exposure (prompt 04 prerequisite).');

  test(`legacy merged mount renders without error boundary ${matrixTag('LEGACY', 'P2')}`, async ({
    page,
  }) => {
    await page.goto('/?tab=people-culture-merged');
    await expect(page.locator('[data-error-boundary]')).toHaveCount(0);
    await expect(page.locator('main')).toBeVisible();
  });
});
