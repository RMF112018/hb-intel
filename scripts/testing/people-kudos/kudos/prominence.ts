/**
 * Kudos scheduling, pin, feature, and publish-window workflows.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult } from '../shared/assertions.js';
import { spCreateItem } from '../shared/spClient.js';
import { buildKudosDraftFields, buildKudosApprovalPatch, buildKudosSchedulePatch, buildKudosPinPatch, buildKudosFeaturePatch } from '../shared/fixtures.js';
import { safeTransition } from './helpers.js';

export async function runProminenceWorkflow(ctx: RunContext, userId: number): Promise<void> {
  const kudosList = ctx.config.lists.peopleCultureKudos;
  const seq = 7;

  try {
    // Create and approve an item so prominence transitions are valid.
    const draft = buildKudosDraftFields(ctx.runId, seq, { submittedByUserId: userId });
    const item = await spCreateItem(ctx, kudosList, draft as unknown as Record<string, unknown>);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'kudos.prominence.submit', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    await safeTransition(ctx, 'kudos.prominence.approve', kudosList, item.Id,
      buildKudosApprovalPatch(userId), 'WorkflowStatus', 'approved');

    // Schedule
    const scheduledAt = new Date(Date.now() + 2 * 3_600_000).toISOString();
    await safeTransition(ctx, 'kudos.prominence.schedule', kudosList, item.Id,
      buildKudosSchedulePatch(scheduledAt, userId), 'WorkflowStatus', 'approvedScheduled');

    // Unschedule
    await safeTransition(ctx, 'kudos.prominence.unschedule', kudosList, item.Id,
      { WorkflowStatus: 'approved', IsScheduled: false, ScheduleCancelledAt: new Date().toISOString(), ScheduleCancelledById: userId },
      'WorkflowStatus', 'approved');

    // Pin
    await safeTransition(ctx, 'kudos.prominence.pin', kudosList, item.Id,
      buildKudosPinPatch(1), 'IsPinned', true);

    // Unpin
    await safeTransition(ctx, 'kudos.prominence.unpin', kudosList, item.Id,
      { IsPinned: false, PinOrder: null, ProminenceIntent: 'standard' }, 'IsPinned', false);

    // Feature
    const featureExpires = new Date(Date.now() + 7 * 24 * 3_600_000).toISOString();
    await safeTransition(ctx, 'kudos.prominence.feature', kudosList, item.Id,
      buildKudosFeaturePatch(featureExpires), 'IsFeatured', true);

    // Unfeature
    await safeTransition(ctx, 'kudos.prominence.unfeature', kudosList, item.Id,
      { IsFeatured: false, FeaturedExpiresAt: null, ProminenceIntent: 'standard' }, 'IsFeatured', false);

    // Publish window + HomepageEnabled
    await safeTransition(ctx, 'kudos.prominence.publishWindow', kudosList, item.Id,
      {
        HomepageEnabled: true,
        WasEverPublished: true,
        PublishStartDate: new Date(Date.now() - 60_000).toISOString(),
        PublishEndDate: new Date(Date.now() + 14 * 24 * 3_600_000).toISOString(),
      },
      'HomepageEnabled', true);
  } catch (err) {
    recordResult(ctx, { step: 'kudos.prominence', status: 'fail', detail: (err as Error).message });
  }
}
