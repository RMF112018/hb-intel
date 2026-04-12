/**
 * Phase-16 stress suite — companion webpart group smoke spec.
 * Detailed per-matrix specs land in prompt 06.
 */
import { test, expect } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { governanceBaseline } from '../fixtures/baseline';
import { matrixTag, KUDOS_TESTIDS } from '../helpers/kudosLocators';
import { assertAdminDetailBoundary } from '../helpers/kudosAssertions';

test.describe('kudos.companion.smoke', () => {
  test.fixme(true, 'Requires dev-harness kudos-companion tab + seed hook (prompt 04 dependency).');

  test(`renders queue tabs ${matrixTag('A1', 'A3', 'A5', 'P0')}`, async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
    for (const bucket of ['pending', 'approved', 'rejected'] as const) {
      await expect(
        page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.queueTab(bucket)}"]`),
      ).toBeVisible();
    }
  });

  test(`admin detail includes audit timeline ${matrixTag('A1', 'P0')}`, async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.queueRow}"]`).first().click();
    await assertAdminDetailBoundary(page);
  });
});
