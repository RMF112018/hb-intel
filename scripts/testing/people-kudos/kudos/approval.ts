/**
 * Kudos approval, rejection, revision, and withdraw workflows.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult } from '../shared/assertions.js';
import { spCreateItem } from '../shared/spClient.js';
import { buildKudosDraftFields, buildKudosApprovalPatch, buildKudosRejectPatch, buildKudosRevisionRequestedPatch, buildKudosWithdrawPatch } from '../shared/fixtures.js';
import { safeTransition } from './helpers.js';

export async function runApprovalWorkflow(ctx: RunContext, userId: number): Promise<void> {
  const kudosList = ctx.config.lists.peopleCultureKudos;

  // --- Item A: happy path (revision → resubmit → approve) ---
  const seqA = 4;
  try {
    const draftA = buildKudosDraftFields(ctx.runId, seqA, { submittedByUserId: userId });
    const itemA = await spCreateItem(ctx, kudosList, draftA as unknown as Record<string, unknown>);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(itemA.Id);
    recordResult(ctx, { step: 'kudos.approval.submit', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${itemA.Id}` });

    // Revision requested
    await safeTransition(ctx, 'kudos.approval.revisionRequested', kudosList, itemA.Id,
      buildKudosRevisionRequestedPatch(userId, 'Please clarify recipient list.'), 'WorkflowStatus', 'revisionRequested');

    // Resubmit (back to pending)
    await safeTransition(ctx, 'kudos.approval.resubmit', kudosList, itemA.Id,
      { WorkflowStatus: 'pending' }, 'WorkflowStatus', 'pending');

    // Approve
    await safeTransition(ctx, 'kudos.approval.approve', kudosList, itemA.Id,
      buildKudosApprovalPatch(userId), 'WorkflowStatus', 'approved');
  } catch (err) {
    recordResult(ctx, { step: 'kudos.approval.happyPath', status: 'fail', detail: (err as Error).message });
  }

  // --- Item B: rejection path ---
  const seqB = 5;
  try {
    const draftB = buildKudosDraftFields(ctx.runId, seqB, { submittedByUserId: userId });
    const itemB = await spCreateItem(ctx, kudosList, draftB as unknown as Record<string, unknown>);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(itemB.Id);
    recordResult(ctx, { step: 'kudos.rejection.submit', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${itemB.Id}` });

    await safeTransition(ctx, 'kudos.rejection.reject', kudosList, itemB.Id,
      buildKudosRejectPatch(userId, 'Synthetic reject for harness verification.'), 'WorkflowStatus', 'rejected');
  } catch (err) {
    recordResult(ctx, { step: 'kudos.rejection', status: 'fail', detail: (err as Error).message });
  }

  // --- Item C: withdraw path ---
  const seqC = 6;
  try {
    const draftC = buildKudosDraftFields(ctx.runId, seqC, { submittedByUserId: userId });
    const itemC = await spCreateItem(ctx, kudosList, draftC as unknown as Record<string, unknown>);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(itemC.Id);
    recordResult(ctx, { step: 'kudos.withdraw.submit', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${itemC.Id}` });

    await safeTransition(ctx, 'kudos.withdraw.withdraw', kudosList, itemC.Id,
      buildKudosWithdrawPatch(userId), 'WorkflowStatus', 'withdrawn');
  } catch (err) {
    recordResult(ctx, { step: 'kudos.withdraw', status: 'fail', detail: (err as Error).message });
  }
}
