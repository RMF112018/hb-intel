/**
 * HB Kudos comprehensive workflow suite — Phase-14 testing Prompt-02.
 *
 * Covers the full HB Kudos lifecycle from submission through every
 * workflow transition, prominence/scheduling behavior, celebrate,
 * visibility mode transitions, remove/restore, and audit-event
 * linkage. Extracted from the proven preliminary harness and
 * restructured against the shared foundation.
 */
import type { SuiteModule, RunContext, StepResult } from '../shared/types.js';
import { recordResult, assertFieldEquals, assertTruthy, assertDefined } from '../shared/assertions.js';
import {
  spCreateItem,
  spPatchItem,
  spGetItem,
  spQueryItems,
  ensureCurrentUserId,
} from '../shared/spClient.js';
import {
  buildKudosDraftFields,
  buildKudosApprovalPatch,
  buildKudosRejectPatch,
  buildKudosWithdrawPatch,
  buildKudosRevisionRequestedPatch,
  buildKudosSchedulePatch,
  buildKudosPinPatch,
  buildKudosFeaturePatch,
  buildKudosRemovePatch,
  buildKudosRestorePatch,
  buildKudosCelebratePatch,
  buildKudosVisibilityPatch,
} from '../shared/fixtures.js';
import { buildSyntheticKudosId } from '../shared/context.js';

import { runSubmissionWorkflow } from './submission.js';
import { runApprovalWorkflow } from './approval.js';
import { runProminenceWorkflow } from './prominence.js';
import { runLifecycleWorkflow } from './lifecycle.js';
import { runAuditParityWorkflow } from './auditParity.js';

export const kudosSuite: SuiteModule = {
  name: 'kudos',
  async run(ctx: RunContext): Promise<StepResult[]> {
    // Resolve current user once for all sub-workflows.
    let userId = 0;
    if (!ctx.dryRun) {
      try {
        userId = await ensureCurrentUserId(ctx);
        recordResult(ctx, { step: 'kudos.ensureCurrentUser', status: 'pass', detail: `userId=${userId}` });
      } catch (err) {
        recordResult(ctx, { step: 'kudos.ensureCurrentUser', status: 'fail', detail: (err as Error).message });
        return ctx.results;
      }
    } else {
      recordResult(ctx, { step: 'kudos.ensureCurrentUser', status: 'dry', detail: 'userId=0 (dry-run)' });
    }

    await runSubmissionWorkflow(ctx, userId);
    await runApprovalWorkflow(ctx, userId);
    await runProminenceWorkflow(ctx, userId);
    await runLifecycleWorkflow(ctx, userId);
    await runAuditParityWorkflow(ctx, userId);

    return ctx.results;
  },
};

// Re-export helpers used by sub-modules so they don't import from shared directly.
export {
  recordResult,
  assertFieldEquals,
  assertTruthy,
  assertDefined,
  spCreateItem,
  spPatchItem,
  spGetItem,
  spQueryItems,
  buildKudosDraftFields,
  buildKudosApprovalPatch,
  buildKudosRejectPatch,
  buildKudosWithdrawPatch,
  buildKudosRevisionRequestedPatch,
  buildKudosSchedulePatch,
  buildKudosPinPatch,
  buildKudosFeaturePatch,
  buildKudosRemovePatch,
  buildKudosRestorePatch,
  buildKudosCelebratePatch,
  buildKudosVisibilityPatch,
  buildSyntheticKudosId,
};
