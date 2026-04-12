/**
 * Phase-16 — public webpart: workflow × visibility (A × C).
 *
 * Proves that the public feed respects the 7-state workflow union and
 * visibility predicates: only A3 non-scheduled, non-aged-off items are
 * visible to an unrelated public viewer; submitter and recipient
 * perspectives see their associated items per C5/C6; scheduled (A4)
 * items remain hidden until publishAt.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { assertNoDeadCta } from '../helpers/kudosAssertions';
import { captureProof } from '../helpers/kudosArtifacts';
import {
  workflowBaseline,
  submitterPerspectiveBaseline,
  recipientPerspectiveBaseline,
} from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.public.workflow-visibility', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test(`unrelated viewer sees only approvedLive ${matrixTag('A3', 'C1', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    const items = page.locator(tid(KUDOS_TESTIDS.publicFeedItem));
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Approved and live');
    await assertNoDeadCta(page);
    await captureProof(page, {
      group: 'public',
      spec: 'workflow-visibility',
      caseName: 'unrelated-feed',
      matrixParts: ['A3', 'C1', 'P0'],
    });
  });

  test(`scheduled (A4) item hidden before publishAt ${matrixTag('A4', 'C2', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await expect(page.locator(tid(KUDOS_TESTIDS.publicFeed))).not.toContainText(
      'Approved and scheduled',
    );
  });

  test(`submitter sees own non-public items ${matrixTag('A1', 'A2', 'A5', 'C5', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, submitterPerspectiveBaseline());
    const feed = page.locator(tid(KUDOS_TESTIDS.publicFeed));
    await expect(feed).toContainText('Pending entry');
    await expect(feed).toContainText('Revision requested');
    await expect(feed).toContainText('Rejected');
  });

  test(`recipient sees approved-live ${matrixTag('A3', 'C6', 'P1')}`, async ({ page }) => {
    await gotoKudosPublic(page, recipientPerspectiveBaseline());
    await expect(page.locator(tid(KUDOS_TESTIDS.publicFeedItem))).toHaveCount(1);
  });

  test(`withdrawn / removed / rejected never leak to public ${matrixTag('A5', 'A6', 'A7', 'C2', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    const feed = page.locator(tid(KUDOS_TESTIDS.publicFeed));
    await expect(feed).not.toContainText('Withdrawn by submitter');
    await expect(feed).not.toContainText('Rejected');
    await expect(feed).not.toContainText('Removed / unpublished');
  });
});
