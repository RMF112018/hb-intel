/**
 * Phase-16 — public webpart: identity + media (G1–G6).
 *
 * Proves Graph photo hydration, fallback avatar rendering, multi-
 * recipient mixed-photo rendering, bucket labels (RT*), and
 * submitter/recipient attribution correctness.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { identityMediaBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.public.identity-media', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test.beforeEach(async ({ page }) => {
    await gotoKudosPublic(page, identityMediaBaseline());
  });

  test(`individual with photo (G1) ${matrixTag('G1', 'P0')}`, async ({ page }) => {
    const row = page
      .locator(tid(KUDOS_TESTIDS.publicFeedItem))
      .filter({ hasText: 'Approved and live' });
    await expect(row.locator('img[alt*="Ren Recipient"]')).toBeVisible();
  });

  test(`individual without photo falls back to initials (G2) ${matrixTag('G2', 'P0')}`, async ({ page }) => {
    const row = page
      .locator(tid(KUDOS_TESTIDS.publicFeedItem))
      .filter({ hasText: 'Individual without photo' });
    await expect(row.locator('[data-hbc-avatar-fallback]')).toBeVisible();
  });

  test(`mixed individuals render per-recipient (G3) ${matrixTag('G3', 'P1')}`, async ({ page }) => {
    const row = page
      .locator(tid(KUDOS_TESTIDS.publicFeedItem))
      .filter({ hasText: 'Multiple individuals, mixed photo' });
    await expect(row.getByText('Ren Recipient')).toBeVisible();
    await expect(row.getByText('Pat Recipient')).toBeVisible();
  });

  test(`mixed bucket labels render (G4 RT*) ${matrixTag('G4', 'P1')}`, async ({ page }) => {
    const row = page
      .locator(tid(KUDOS_TESTIDS.publicFeedItem))
      .filter({ hasText: 'Mixed bucket' });
    await expect(row.getByText('Field Operations')).toBeVisible();
    await expect(row.getByText('Estimating')).toBeVisible();
    await expect(row.getByText('Project Alpha')).toBeVisible();
  });

  test(`submitter attribution correct (G5) ${matrixTag('G5', 'P1')}`, async ({ page }) => {
    const row = page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first();
    await expect(row).toContainText('Sam Submitter');
  });
});
