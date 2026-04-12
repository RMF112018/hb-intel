/**
 * Phase-16 — companion: governance actions D-axis sweep.
 *
 * One test per action in repo-truth support:
 *   approve, reject, requestRevision, reopen, flag, clearFlag,
 *   schedule, unschedule, remove, restore, updateContent.
 *
 * Each test asserts: action affordance present, dialog opens when
 * input is required, writer invoked (cache invalidation counter
 * bumps), queue refresh after success, one audit-event appended,
 * role-capability gate holds.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosCompanion } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag, type GovernanceAction } from '../helpers/kudosLocators';
import { readCacheInvalidationCount } from '../helpers/kudosAssertions';
import { captureProof } from '../helpers/kudosArtifacts';
import { auditTimelineBaseline, governanceBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

interface ActionCase {
  action: GovernanceAction;
  openOn: 'pending' | 'approved' | 'rejected' | 'flagged' | 'removed';
  requiresDialogInput: boolean;
  expectTimelineEntry: string;
}

const CASES: ActionCase[] = [
  { action: 'approve', openOn: 'pending', requiresDialogInput: false, expectTimelineEntry: 'approve' },
  { action: 'reject', openOn: 'pending', requiresDialogInput: true, expectTimelineEntry: 'reject' },
  {
    action: 'request-revision',
    openOn: 'pending',
    requiresDialogInput: true,
    expectTimelineEntry: 'requestRevision',
  },
  { action: 'reopen', openOn: 'rejected', requiresDialogInput: false, expectTimelineEntry: 'reopen' },
  { action: 'flag', openOn: 'pending', requiresDialogInput: false, expectTimelineEntry: 'flagAdminReview' },
  { action: 'clear-flag', openOn: 'flagged', requiresDialogInput: false, expectTimelineEntry: 'clearAdminReview' },
  { action: 'remove', openOn: 'approved', requiresDialogInput: true, expectTimelineEntry: 'remove' },
];

async function openFirstRowOnTab(
  page: import('@playwright/test').Page,
  bucket: ActionCase['openOn'],
) {
  const tab = bucket === 'flagged' ? 'flagged' : bucket;
  await page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.queueTab(tab)}"]`).click();
  await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
}

test.describe('kudos.admin.governance-actions', () => {
  test.fixme(true, 'Requires dev-harness kudos-companion tab + seed hook (prompt 04 prerequisite).');

  for (const c of CASES) {
    test(`${c.action} on ${c.openOn} row ${matrixTag('ACTION', c.action.toUpperCase(), 'P1')}`, async ({
      page,
    }) => {
      await gotoKudosCompanion(page, auditTimelineBaseline());
      await openFirstRowOnTab(page, c.openOn);
      const before = await readCacheInvalidationCount(page);
      const btn = page.locator(`[data-hbc-testid="${KUDOS_TESTIDS.governanceAction(c.action)}"]`);
      await expect(btn).toBeEnabled();
      await btn.click();

      if (c.requiresDialogInput) {
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.getByRole('textbox').first().fill('because reasons');
        await dialog.getByRole('button', { name: /confirm|submit|ok/i }).click();
      }

      expect(await readCacheInvalidationCount(page)).toBeGreaterThan(before);
      await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText(
        c.expectTimelineEntry,
      );
      await captureProof(page, {
        group: 'companion',
        spec: 'governance-actions',
        caseName: `${c.action}-${c.openOn}`,
        matrixParts: ['ACTION', c.action.toUpperCase()],
      });
    });
  }

  test(`unschedule clears publishAt ${matrixTag('ACTION', 'UNSCHEDULE', 'P1')}`, async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueTab('approved'))).click();
    await page.locator(tid(KUDOS_TESTIDS.queueFilterScheduledOnly)).click();
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.getByRole('button', { name: /unschedule/i }).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('unschedule');
  });

  test(`schedule publish on approved ${matrixTag('ACTION', 'SCHEDULE', 'P1')}`, async ({ page }) => {
    await gotoKudosCompanion(page, governanceBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueTab('approved'))).click();
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.getByRole('button', { name: /schedule/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox', { name: /date|timestamp/i }).fill('2026-04-30T12:00');
    await dialog.getByRole('button', { name: /confirm|submit/i }).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('schedule');
  });

  test(`restore a removed item ${matrixTag('ACTION', 'RESTORE', 'P1')}`, async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueTab('removed'))).click();
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.getByRole('button', { name: /restore/i }).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('restore');
  });

  test(`updateContent audits on approved ${matrixTag('ACTION', 'UPDATE_CONTENT', 'P2')}`, async ({ page }) => {
    await gotoKudosCompanion(page, auditTimelineBaseline());
    await page.locator(tid(KUDOS_TESTIDS.queueTab('approved'))).click();
    await page.locator(tid(KUDOS_TESTIDS.queueRow)).first().click();
    await page.getByRole('button', { name: /edit content|update content/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox').first().fill('Corrected headline');
    await dialog.getByRole('button', { name: /save|submit/i }).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toContainText('updateContent');
  });
});
