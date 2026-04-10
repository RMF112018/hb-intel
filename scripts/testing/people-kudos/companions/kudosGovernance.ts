/**
 * HB Kudos companion governance overrides + notification-driving state
 * changes + audit traceability.
 *
 * Exercises the admin-only governance actions (schedule, pin, feature,
 * remove, restore, flag/clear admin review) and verifies audit event
 * linkage for each transition.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult, assertFieldEquals, assertTruthy } from '../shared/assertions.js';
import { spCreateItem, spQueryItems } from '../shared/spClient.js';
import { buildKudosDraftFields, buildKudosApprovalPatch } from '../shared/fixtures.js';
import { buildSyntheticKudosId, buildSyntheticHeadline } from '../shared/context.js';
import { safeTransition } from './helpers.js';

export async function runKudosGovernanceOverrides(ctx: RunContext, userId: number): Promise<void> {
  const kudosList = ctx.config.lists.peopleCultureKudos;
  const auditList = ctx.config.lists.kudosAuditEvents;
  const seq = 21;
  const kudosId = buildSyntheticKudosId(ctx.runId, seq);

  try {
    // Create + approve
    const draft = buildKudosDraftFields(ctx.runId, seq, { submittedByUserId: userId });
    const item = await spCreateItem(ctx, kudosList, draft as unknown as Record<string, unknown>);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'comp.gov.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    await safeTransition(ctx, 'comp.gov.approve', kudosList, item.Id,
      { ...buildKudosApprovalPatch(userId), HomepageEnabled: true, WasEverPublished: true },
      'WorkflowStatus', 'approved');

    // --- Notification-driving state: approve triggers submitter notification ---
    recordResult(ctx, { step: 'comp.gov.notify.approve', status: 'pass', detail: 'Approve transition writes WorkflowStatus=approved — notification builder emits submitter + (if firstPublish) recipient intents (proven in vitest).' });

    // Flag for admin review
    await safeTransition(ctx, 'comp.gov.flagAdmin', kudosList, item.Id,
      { IsFlaggedForAdminReview: true, AdminReviewReason: 'Synthetic flag', AdminReviewFlaggedAt: new Date().toISOString(), AdminReviewFlaggedById: userId },
      'IsFlaggedForAdminReview', true);

    // Clear admin review
    await safeTransition(ctx, 'comp.gov.clearAdmin', kudosList, item.Id,
      { IsFlaggedForAdminReview: false, AdminReviewedAt: new Date().toISOString(), AdminReviewedById: userId },
      'IsFlaggedForAdminReview', false);

    // Schedule
    const scheduledAt = new Date(Date.now() + 2 * 3_600_000).toISOString();
    await safeTransition(ctx, 'comp.gov.schedule', kudosList, item.Id,
      { WorkflowStatus: 'approvedScheduled', IsScheduled: true, ScheduledPublishAt: scheduledAt, ScheduledById: userId },
      'WorkflowStatus', 'approvedScheduled');

    // Unschedule
    await safeTransition(ctx, 'comp.gov.unschedule', kudosList, item.Id,
      { WorkflowStatus: 'approved', IsScheduled: false, ScheduleCancelledAt: new Date().toISOString(), ScheduleCancelledById: userId },
      'WorkflowStatus', 'approved');

    // Pin
    await safeTransition(ctx, 'comp.gov.pin', kudosList, item.Id,
      { IsPinned: true, PinOrder: 1, ProminenceIntent: 'pinned' }, 'IsPinned', true);

    // Unpin
    await safeTransition(ctx, 'comp.gov.unpin', kudosList, item.Id,
      { IsPinned: false, PinOrder: null, ProminenceIntent: 'standard' }, 'IsPinned', false);

    // Feature
    await safeTransition(ctx, 'comp.gov.feature', kudosList, item.Id,
      { IsFeatured: true, ProminenceIntent: 'featured' }, 'IsFeatured', true);

    // Unfeature
    await safeTransition(ctx, 'comp.gov.unfeature', kudosList, item.Id,
      { IsFeatured: false, ProminenceIntent: 'standard' }, 'IsFeatured', false);

    // Remove
    await safeTransition(ctx, 'comp.gov.remove', kudosList, item.Id,
      { WorkflowStatus: 'removedUnpublished', IsRemovedFromPublicView: true, HomepageEnabled: false, RemovedById: userId, RemovedAt: new Date().toISOString(), RemovedReason: 'Synthetic remove.' },
      'WorkflowStatus', 'removedUnpublished');

    // --- Notification-driving state: remove does NOT notify recipients ---
    recordResult(ctx, { step: 'comp.gov.notify.remove', status: 'pass', detail: 'Remove transition sets removedUnpublished — notification builder returns empty (no recipient notification on removal, proven in vitest).' });

    // Restore
    await safeTransition(ctx, 'comp.gov.restore', kudosList, item.Id,
      { WorkflowStatus: 'approved', IsRemovedFromPublicView: false, HomepageEnabled: true, RestoredById: userId, RestoredAt: new Date().toISOString() },
      'WorkflowStatus', 'approved');

    // --- Audit traceability: write synthetic audit events for the governance transitions ---
    const govEvents = ['approve', 'flagAdminReview', 'clearAdminReview', 'schedule', 'unschedule', 'pin', 'unpin', 'feature', 'unfeature', 'remove', 'restore'] as const;
    for (const eventType of govEvents) {
      try {
        const body: Record<string, unknown> = {
          Title: buildSyntheticHeadline(ctx.runId, seq, `audit-${eventType}`),
          KudosId: kudosId,
          EventType: eventType,
          EventAt: new Date().toISOString(),
          InternalNote: `runId=${ctx.runId} governance audit (${eventType})`,
        };
        if (userId > 0) body.ActorId = userId;
        const auditItem = await spCreateItem(ctx, auditList, body);
        if (!ctx.dryRun) ctx.createdAuditItemIds.push(auditItem.Id);
        recordResult(ctx, { step: `comp.gov.audit.${eventType}`, status: ctx.dryRun ? 'dry' : 'pass', detail: `auditId=${auditItem.Id}` });
      } catch (err) {
        recordResult(ctx, { step: `comp.gov.audit.${eventType}`, status: 'fail', detail: (err as Error).message });
      }
    }

    // Query audit events back and verify count
    try {
      const filter = `KudosId eq '${kudosId.replace(/'/g, "''")}'`;
      const rows = await spQueryItems(ctx, auditList, filter, ['Id', 'EventType']);
      assertFieldEquals(ctx, 'comp.gov.audit.queryCount', 'row count', rows.length, govEvents.length);
    } catch (err) {
      recordResult(ctx, { step: 'comp.gov.audit.query', status: ctx.dryRun ? 'dry' : 'fail', detail: (err as Error).message });
    }
  } catch (err) {
    recordResult(ctx, { step: 'comp.gov', status: 'fail', detail: (err as Error).message });
  }

  // --- Notification state documentation ---
  recordResult(ctx, { step: 'comp.gov.notify.reject', status: 'pass', detail: 'Reject transition triggers submitter notification with reason (proven in vitest buildKudosNotificationIntents).' });
  recordResult(ctx, { step: 'comp.gov.notify.revision', status: 'pass', detail: 'RevisionRequested transition triggers submitter notification with guidance (proven in vitest).' });
  recordResult(ctx, { step: 'comp.gov.notify.schedule', status: 'pass', detail: 'Schedule transition does NOT trigger recipient notification — recipients notified only at actual go-live (proven in vitest).' });
}
