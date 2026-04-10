/**
 * Companion surfaces and role-based workflow suite — Phase-14 testing Prompt-04.
 *
 * Covers role-aware governance behavior for both the HB Kudos companion
 * and the People & Culture HR operating companion. Tests the capability
 * model, claim/reassign workflow, homepage governance overrides,
 * notification-driving state changes, and audit traceability — all
 * exercised at the SharePoint list field level via the shared harness.
 */
import type { SuiteModule, RunContext, StepResult } from '../shared/types.js';
import { recordResult } from '../shared/assertions.js';
import { ensureCurrentUserId } from '../shared/spClient.js';

import { runKudosRoleWorkflow } from './kudosRoles.js';
import { runKudosClaimWorkflow } from './kudosClaim.js';
import { runKudosGovernanceOverrides } from './kudosGovernance.js';
import { runPcCompanionWorkflow } from './pcCompanion.js';

export const companionsSuite: SuiteModule = {
  name: 'companions',
  async run(ctx: RunContext): Promise<StepResult[]> {
    let userId = 0;
    if (!ctx.dryRun) {
      try {
        userId = await ensureCurrentUserId(ctx);
        recordResult(ctx, { step: 'comp.ensureCurrentUser', status: 'pass', detail: `userId=${userId}` });
      } catch (err) {
        recordResult(ctx, { step: 'comp.ensureCurrentUser', status: 'fail', detail: (err as Error).message });
        return ctx.results;
      }
    } else {
      recordResult(ctx, { step: 'comp.ensureCurrentUser', status: 'dry', detail: 'userId=0 (dry-run)' });
    }

    await runKudosRoleWorkflow(ctx, userId);
    await runKudosClaimWorkflow(ctx, userId);
    await runKudosGovernanceOverrides(ctx, userId);
    await runPcCompanionWorkflow(ctx, userId);

    return ctx.results;
  },
};
