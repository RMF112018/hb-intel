/**
 * Phase-16 — companion: adversarial / failure drift paths.
 *
 * Covers item lookup miss, patch rejection, audit write failure after
 * patch success, role denial, stale-after-action cache leakage.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { readCacheInvalidationCount } from '../helpers/kudosAssertions';
import { governanceBaseline, setHostedFault, clearHostedFault } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.admin.failure-paths', () => {
  test.fixme(true, 'Requires dev-harness kudos-companion tab + seed hook (prompt 04 prerequisite).');

  test.beforeEach(async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
  });

  test.afterEach(async ({ page }) => {
    await clearHostedFault(page).catch(() => {});
  });

  test(`item lookup miss (404) surfaces error ${matrixTag('FAULT', 'P1')}`, async ({ page }) => {
    await setHostedFault(page, 'list-item-not-found');
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('approve')}"]`).click();
    await expect(page.getByRole('alert')).toContainText(/not found|missing|404/i);
  });

  test(`patch rejection (etag) ${matrixTag('FAULT', 'P1')}`, async ({ page }) => {
    await setHostedFault(page, 'patch-rejected-etag');
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('approve')}"]`).click();
    await expect(page.getByRole('alert')).toContainText(/conflict|stale|refresh|412/i);
  });

  test(`audit write failure after patch success ${matrixTag('FAULT', 'P1')}`, async ({ page }) => {
    await setHostedFault(page, 'audit-write-failure');
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('approve')}"]`).click();
    await expect(page.getByRole('alert')).toContainText(/audit/i);
  });

  test(`role-capability denied surfaces cleanly ${matrixTag('FAULT', 'ROLE', 'P1')}`, async ({ page }) => {
    await setHostedFault(page, 'role-capability-denied');
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('approve')}"]`).click();
    await expect(page.getByRole('alert')).toContainText(/permission|denied|capability/i);
  });

  test(`stale-after-action leakage caught by invalidation probe ${matrixTag('FAULT', 'CACHE', 'P0')}`, async ({ page }) => {
    await setHostedFault(page, 'stale-after-action');
    const before = await readCacheInvalidationCount(page);
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction('approve')}"]`).click();
    // invariant: invalidation counter MUST bump on every success path;
    // this fault scenario proves the probe catches the regression.
    expect(await readCacheInvalidationCount(page)).toBe(before);
  });
});
