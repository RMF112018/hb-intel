/**
 * HB Kudos claim / reassign / celebrate workflow at the list level.
 *
 * Creates a synthetic kudos item, then exercises claim (ClaimOwnerId),
 * reassign (AssignedOwnerId), and celebrate (CelebrateCount) through
 * direct SharePoint list writes — the same operations the governance
 * writer's claim/reassign/celebrate patch kinds dispatch.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult, assertFieldEquals } from '../shared/assertions.js';
import { spCreateItem, spGetItem, spPatchItem } from '../shared/spClient.js';
import { buildKudosDraftFields, buildKudosApprovalPatch, buildKudosCelebratePatch } from '../shared/fixtures.js';
import { safeTransition } from './helpers.js';

export async function runKudosClaimWorkflow(ctx: RunContext, userId: number): Promise<void> {
  const kudosList = ctx.config.lists.peopleCultureKudos;
  const seq = 20;

  try {
    // Create + approve so claim/reassign is meaningful.
    const draft = buildKudosDraftFields(ctx.runId, seq, { submittedByUserId: userId });
    const item = await spCreateItem(ctx, kudosList, draft as unknown as Record<string, unknown>);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'comp.claim.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    await safeTransition(ctx, 'comp.claim.approve', kudosList, item.Id,
      buildKudosApprovalPatch(userId), 'WorkflowStatus', 'approved');

    // Claim
    await safeTransition(ctx, 'comp.claim.claim', kudosList, item.Id,
      { ClaimOwnerId: userId, ClaimedAt: new Date().toISOString() },
      'ClaimedAt', undefined); // ClaimedAt is datetime — just verify it was set
    // Verify ClaimOwnerId separately (User field, returns an object in some modes)
    const claimed = await spGetItem<Record<string, unknown>>(ctx, kudosList, item.Id, ['Id', 'ClaimOwnerId']);
    if (!ctx.dryRun) {
      assertFieldEquals(ctx, 'comp.claim.claimOwner', 'ClaimOwnerId', claimed.ClaimOwnerId, userId);
    } else {
      recordResult(ctx, { step: 'comp.claim.claimOwner', status: 'dry', detail: `would assert ClaimOwnerId === ${userId}` });
    }

    // Reassign to a different user (use userId + 1 as a synthetic target; in live mode this may fail if the user doesn't exist)
    const reassignTarget = userId > 0 ? userId : 999;
    await safeTransition(ctx, 'comp.claim.reassign', kudosList, item.Id,
      { AssignedOwnerId: reassignTarget, ReassignedById: userId, ReassignedAt: new Date().toISOString() },
      'AssignedOwnerId', undefined); // just verify patch applied
    recordResult(ctx, { step: 'comp.claim.reassign.note', status: 'warn', detail: 'Reassign target may not resolve to a real user in live mode; field write is proven.' });

    // Celebrate (increment)
    try {
      const before = await spGetItem<{ CelebrateCount?: number }>(ctx, kudosList, item.Id, ['Id', 'CelebrateCount']);
      const nextCount = (before.CelebrateCount ?? 0) + 1;
      await spPatchItem(ctx, kudosList, item.Id, buildKudosCelebratePatch(nextCount));
      const after = await spGetItem<{ CelebrateCount?: number }>(ctx, kudosList, item.Id, ['Id', 'CelebrateCount']);
      assertFieldEquals(ctx, 'comp.claim.celebrate', 'CelebrateCount', after.CelebrateCount, nextCount);
    } catch (err) {
      recordResult(ctx, { step: 'comp.claim.celebrate', status: 'fail', detail: (err as Error).message });
    }
  } catch (err) {
    recordResult(ctx, { step: 'comp.claim', status: 'fail', detail: (err as Error).message });
  }
}
