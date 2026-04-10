import type { SuiteModule, RunContext, StepResult } from '../shared/types.js';
import { recordResult } from '../shared/assertions.js';

export const companionsSuite: SuiteModule = {
  name: 'companions',
  async run(ctx: RunContext): Promise<StepResult[]> {
    return [recordResult(ctx, { step: 'companions.placeholder', status: 'skip', detail: 'Companion/role-aware suite — deferred to Prompt-04' })];
  },
};
