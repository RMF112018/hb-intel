/**
 * Phase-23 Prompt 09 — hosted companion workflow coverage.
 *
 * Proves companion governance actions dispatch end-to-end. The prior
 * suite only asserted the queue / detail panels existed; these tests
 * assert the queue state actually changes after an Approve or
 * Request-revision action.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { governanceBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.hosted.workflow', () => {
  test(`companion approve action removes row from pending bucket ${matrixTag('H7', 'P1')}`, async ({
    page,
  }) => {
    await gotoKudosCompanion(page, governanceBaseline());

    const rows = page.locator(tid(KUDOS_TESTIDS.queueRow));
    const before = await rows.count();
    expect(before).toBeGreaterThan(0);

    // Open detail on the first pending row.
    await rows.first().click();
    const detail = page.locator(tid(KUDOS_TESTIDS.companionDetailPanel));
    await expect(detail).toBeVisible();

    // Dispatch Approve.
    await page.getByRole('button', { name: 'Approve' }).click();

    // Detail panel closes and the row count in the current bucket
    // decreases by one (the approved entry moves out of pending).
    await expect(detail).toHaveCount(0);
    await expect.poll(async () => rows.count(), { timeout: 5_000 }).toBe(before - 1);
  });

  test(`companion request-revision moves entry out of pending ${matrixTag('H7', 'P2')}`, async ({
    page,
  }) => {
    await gotoKudosCompanion(page, governanceBaseline());

    const rows = page.locator(tid(KUDOS_TESTIDS.queueRow));
    const before = await rows.count();
    expect(before).toBeGreaterThan(0);

    await rows.first().click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionDetailPanel))).toBeVisible();

    // "Request revision" opens the governance input dialog (for the
    // revision note). Click the action, then confirm with an empty
    // placeholder note if the dialog appears.
    await page.getByRole('button', { name: 'Request revision' }).click();
    const dialogConfirm = page.getByRole('button', { name: /confirm/i });
    if (await dialogConfirm.isVisible().catch(() => false)) {
      // Fill the reason input if present, then confirm.
      const reasonInput = page.getByRole('textbox').last();
      if (await reasonInput.isVisible().catch(() => false)) {
        await reasonInput.fill('Needs more context on the recognition.');
      }
      await dialogConfirm.click();
    }

    await expect.poll(async () => rows.count(), { timeout: 5_000 }).toBe(before - 1);
  });
});
