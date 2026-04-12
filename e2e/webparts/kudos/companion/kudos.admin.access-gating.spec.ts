/**
 * Phase-16 — companion webpart: access + role gating.
 *
 * Proves the companion surface refuses unauthorized viewers and that
 * reviewer vs admin capability gates scope the visible action set.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { governanceBaseline, reviewerPerspectiveBaseline, USERS } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.admin.access-gating', () => {
  test.fixme(true, 'Requires dev-harness kudos-companion tab + seed hook (prompt 04 prerequisite).');

  test(`unauthorized public viewer blocked ${matrixTag('ROLE', 'P0')}`, async ({ page }) => {
    await gotoKudosCompanion(page, {
      items: [],
      audits: [],
      currentUserId: USERS.unrelated.id,
      currentUserRole: 'public',
    });
    await expect(page.getByText(/not authorized|unauthorized|permission/i)).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.queueRow))).toHaveCount(0);
  });

  test(`reviewer sees permitted actions only ${matrixTag('ROLE', 'P1')}`, async ({ page }) => {
    await gotoKudosCompanion(page, reviewerPerspectiveBaseline());
    await expect(page.locator(tid(KUDOS_TESTIDS.companionRoot))).toBeVisible();
    await expect(page.locator(tid(KUDOS_TESTIDS.bulkApproveButton))).toHaveCount(0);
  });

  test(`admin sees admin-only actions ${matrixTag('ROLE', 'P0')}`, async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
    await expect(page.locator(tid(KUDOS_TESTIDS.bulkApproveButton))).toBeVisible();
  });

  test(`unresolved role falls back safely ${matrixTag('ROLE', 'P2')}`, async ({ page }) => {
    await gotoKudosCompanion(page, {
      items: [],
      audits: [],
      currentUserId: 'user-unknown',
      // @ts-expect-error intentional unresolved role
      currentUserRole: 'unresolved',
    });
    await expect(page.locator('[data-error-boundary]')).toHaveCount(0);
  });
});
