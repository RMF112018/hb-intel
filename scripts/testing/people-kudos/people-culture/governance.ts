/**
 * People & Culture homepage governance + milestone workflow.
 *
 * Tests the homepage-governance-driving fields on announcements
 * and the milestone-candidate review flow where supported.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult, assertFieldEquals, assertDefined } from '../shared/assertions.js';
import { spCreateItem, spGetItem } from '../shared/spClient.js';
import { buildAnnouncementFields } from '../shared/fixtures.js';
import { safeTransition } from './helpers.js';

export async function runGovernanceWorkflow(ctx: RunContext, _userId: number): Promise<void> {
  const annList = ctx.config.lists.peopleCultureAnnouncements;

  // === Homepage governance fields on announcements ===
  const seq = 18;
  try {
    const now = new Date();
    const fields = {
      ...buildAnnouncementFields(ctx.runId, seq, 'governance-test'),
      HomepageEnabled: true,
      IsPinned: true,
      PriorityOverride: 1,
      StartDisplayDate: new Date(now.getTime() - 60_000).toISOString(),
      EndDisplayDate: new Date(now.getTime() + 7 * 24 * 3_600_000).toISOString(),
    };
    const item = await spCreateItem(ctx, annList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.gov.homepage.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, annList, item.Id, [
      'Id', 'HomepageEnabled', 'IsPinned', 'PriorityOverride', 'StartDisplayDate', 'EndDisplayDate',
    ]);
    assertFieldEquals(ctx, 'pc.gov.homepage.enabled', 'HomepageEnabled', fetched.HomepageEnabled, true);
    assertFieldEquals(ctx, 'pc.gov.homepage.pinned', 'IsPinned', fetched.IsPinned, true);
    assertFieldEquals(ctx, 'pc.gov.homepage.priority', 'PriorityOverride', fetched.PriorityOverride, 1);
    assertDefined(ctx, 'pc.gov.homepage.startDate', 'StartDisplayDate', fetched.StartDisplayDate);
    assertDefined(ctx, 'pc.gov.homepage.endDate', 'EndDisplayDate', fetched.EndDisplayDate);

    // Suppress (homepage governance override)
    await safeTransition(ctx, 'pc.gov.homepage.suppress', annList, item.Id,
      { HomepageEnabled: false, IsPinned: false }, 'HomepageEnabled', false);

    // Re-enable
    await safeTransition(ctx, 'pc.gov.homepage.reenable', annList, item.Id,
      { HomepageEnabled: true }, 'HomepageEnabled', true);

    // Expire by setting EndDisplayDate to the past
    await safeTransition(ctx, 'pc.gov.homepage.expire', annList, item.Id,
      { EndDisplayDate: new Date(now.getTime() - 3_600_000).toISOString() }, 'EndDisplayDate',
      new Date(now.getTime() - 3_600_000).toISOString());
  } catch (err) {
    recordResult(ctx, { step: 'pc.gov.homepage', status: 'fail', detail: (err as Error).message });
  }

  // === InternalNotes field (moderator notes for PC content) ===
  const seqNotes = 19;
  try {
    const fields = {
      ...buildAnnouncementFields(ctx.runId, seqNotes, 'notes-test'),
      InternalNotes: `Test internal note for runId=${ctx.runId}`,
    };
    const item = await spCreateItem(ctx, annList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.gov.notes.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, annList, item.Id, ['Id', 'InternalNotes']);
    assertDefined(ctx, 'pc.gov.notes.persist', 'InternalNotes', fetched.InternalNotes);
  } catch (err) {
    recordResult(ctx, { step: 'pc.gov.notes', status: 'fail', detail: (err as Error).message });
  }

  // === Lifecycle state transitions (contract-level) ===
  recordResult(ctx, {
    step: 'pc.gov.lifecycle.states',
    status: 'warn',
    detail: 'Lifecycle states (draft, needsApproval, scheduled, live, expiringSoon, expired, archived, suppressed) are typed in peopleCultureSplitContracts.ts and tested via vitest (peopleCultureSplitModel.test.ts deriveLifecycleState). The live SharePoint lists do not have a dedicated LifecycleState choice column — state is derived from field combinations (HomepageEnabled + StartDisplayDate + EndDisplayDate). Field-level governance transitions are covered above.',
  });

  // === Milestone candidate review flow ===
  recordResult(ctx, {
    step: 'pc.gov.milestoneReview',
    status: 'warn',
    detail: 'Milestone candidate review (PeopleCultureMilestoneCandidateReviewState) is contract-typed and unit-tested. The harness cannot exercise this live because milestone generation depends on the companion webpart runtime logic, not a SharePoint list field.',
  });

  // === Draft / approval transitions ===
  recordResult(ctx, {
    step: 'pc.gov.draftApproval',
    status: 'warn',
    detail: 'Draft → needsApproval → approved transitions are derived states, not separate list fields. The P&C lists use HomepageEnabled as the primary publish gate. Approval-flow behavior is tested via the companion runtime vitest suite (peopleCulturePermissionsAndIntake.test.tsx).',
  });
}
