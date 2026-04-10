/**
 * People & Culture comprehensive workflow suite — Phase-14 testing Prompt-03.
 *
 * Covers announcements, celebrations/milestones, audience targeting,
 * homepage governance fields, and lifecycle transitions for the
 * refactored People & Culture public surface and its SharePoint lists.
 */
import type { SuiteModule, RunContext, StepResult } from '../shared/types.js';
import { recordResult } from '../shared/assertions.js';
import { ensureCurrentUserId } from '../shared/spClient.js';

import { runAnnouncementWorkflow } from './announcements.js';
import { runCelebrationWorkflow } from './celebrations.js';
import { runGovernanceWorkflow } from './governance.js';

export const peopleCultureSuite: SuiteModule = {
  name: 'people-culture',
  async run(ctx: RunContext): Promise<StepResult[]> {
    let userId = 0;
    if (!ctx.dryRun) {
      try {
        userId = await ensureCurrentUserId(ctx);
        recordResult(ctx, { step: 'pc.ensureCurrentUser', status: 'pass', detail: `userId=${userId}` });
      } catch (err) {
        recordResult(ctx, { step: 'pc.ensureCurrentUser', status: 'fail', detail: (err as Error).message });
        return ctx.results;
      }
    } else {
      recordResult(ctx, { step: 'pc.ensureCurrentUser', status: 'dry', detail: 'userId=0 (dry-run)' });
    }

    await runAnnouncementWorkflow(ctx, userId);
    await runCelebrationWorkflow(ctx, userId);
    await runGovernanceWorkflow(ctx, userId);

    return ctx.results;
  },
};
