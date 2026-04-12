/**
 * Phase-16 — public webpart: detail panel privacy boundary (G).
 *
 * Public detail panel renders recognition content but MUST NOT render
 * audit timeline or governance internals (C5/C6/C7 access rules
 * enforced).
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { assertPublicDetailBoundary } from '../helpers/kudosAssertions';
import { captureProof } from '../helpers/kudosArtifacts';
import {
  workflowBaseline,
  submitterPerspectiveBaseline,
  recipientPerspectiveBaseline,
} from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.public.detail-boundary', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test(`public detail excludes audit timeline ${matrixTag('BOUNDARY', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first().click();
    await assertPublicDetailBoundary(page);
    await captureProof(page, {
      group: 'public',
      spec: 'detail-boundary',
      caseName: 'no-audit-timeline',
      matrixParts: ['BOUNDARY', 'P0'],
    });
  });

  test(`withdraw available to submitter on A1/A2 only ${matrixTag('A1', 'A2', 'C5', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, submitterPerspectiveBaseline());
    await page
      .locator(tid(KUDOS_TESTIDS.publicFeedItem))
      .filter({ hasText: 'Pending entry' })
      .click();
    await expect(page.getByRole('button', { name: /withdraw/i })).toBeVisible();
  });

  test(`resubmit available on revisionRequested only ${matrixTag('A2', 'C5', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, submitterPerspectiveBaseline());
    await page
      .locator(tid(KUDOS_TESTIDS.publicFeedItem))
      .filter({ hasText: 'Revision requested' })
      .click();
    await expect(page.getByRole('button', { name: /resubmit/i })).toBeVisible();
  });

  test(`recipient can celebrate but not withdraw ${matrixTag('C6', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, recipientPerspectiveBaseline());
    await page.locator(tid(KUDOS_TESTIDS.publicFeedItem)).first().click();
    await expect(page.locator(tid(KUDOS_TESTIDS.celebrateButton))).toBeVisible();
    await expect(page.getByRole('button', { name: /withdraw/i })).toHaveCount(0);
  });
});
