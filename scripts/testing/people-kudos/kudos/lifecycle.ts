/**
 * Kudos celebrate, visibility mode, remove/restore, and archive workflows.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult, assertFieldEquals } from '../shared/assertions.js';
import { spCreateItem, spPatchItem, spGetItem } from '../shared/spClient.js';
import {
  buildKudosDraftFields,
  buildKudosApprovalPatch,
  buildKudosCelebratePatch,
  buildKudosVisibilityPatch,
  buildKudosRemovePatch,
  buildKudosRestorePatch,
} from '../shared/fixtures.js';
import { safeTransition } from './helpers.js';

export async function runLifecycleWorkflow(ctx: RunContext, userId: number): Promise<void> {
  const kudosList = ctx.config.lists.peopleCultureKudos;
  const seq = 8;

  try {
    // Create + approve so lifecycle transitions are valid.
    const draft = buildKudosDraftFields(ctx.runId, seq, { submittedByUserId: userId });
    const item = await spCreateItem(ctx, kudosList, draft as unknown as Record<string, unknown>);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'kudos.lifecycle.submit', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    await safeTransition(ctx, 'kudos.lifecycle.approve', kudosList, item.Id,
      { ...buildKudosApprovalPatch(userId), HomepageEnabled: true, WasEverPublished: true },
      'WorkflowStatus', 'approved');

    // Celebrate count increment
    try {
      const before = await spGetItem<{ CelebrateCount?: number }>(ctx, kudosList, item.Id, ['Id', 'CelebrateCount']);
      const nextCount = (before.CelebrateCount ?? 0) + 1;
      await spPatchItem(ctx, kudosList, item.Id, buildKudosCelebratePatch(nextCount));
      const after = await spGetItem<{ CelebrateCount?: number }>(ctx, kudosList, item.Id, ['Id', 'CelebrateCount']);
      assertFieldEquals(ctx, 'kudos.lifecycle.celebrate', 'CelebrateCount', after.CelebrateCount, nextCount);
      recordResult(ctx, { step: 'kudos.lifecycle.celebrate.raceWarn', status: 'warn', detail: 'read-modify-write on CelebrateCount is racy without ETag.' });
    } catch (err) {
      recordResult(ctx, { step: 'kudos.lifecycle.celebrate', status: 'fail', detail: (err as Error).message });
    }

    // Visibility mode transitions
    for (const mode of ['public', 'associatedOnly', 'internalOnly', 'public'] as const) {
      await safeTransition(ctx, `kudos.lifecycle.visibility.${mode}`, kudosList, item.Id,
        buildKudosVisibilityPatch(mode), 'CurrentVisibilityMode', mode);
    }

    // Remove
    await safeTransition(ctx, 'kudos.lifecycle.remove', kudosList, item.Id,
      buildKudosRemovePatch(userId, 'Synthetic remove.'), 'WorkflowStatus', 'removedUnpublished');

    // Restore
    await safeTransition(ctx, 'kudos.lifecycle.restore', kudosList, item.Id,
      buildKudosRestorePatch(userId), 'WorkflowStatus', 'approved');

    // Archive eligibility — verify WasEverPublished is still true after restore
    const archived = await spGetItem<Record<string, unknown>>(ctx, kudosList, item.Id, ['Id', 'WasEverPublished', 'IsRemovedFromPublicView']);
    assertFieldEquals(ctx, 'kudos.lifecycle.archive.wasEverPublished', 'WasEverPublished', archived.WasEverPublished, true);
    assertFieldEquals(ctx, 'kudos.lifecycle.archive.notRemoved', 'IsRemovedFromPublicView', archived.IsRemovedFromPublicView, false);
  } catch (err) {
    recordResult(ctx, { step: 'kudos.lifecycle', status: 'fail', detail: (err as Error).message });
  }
}
