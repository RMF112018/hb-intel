import type { SuiteModule, RunContext, StepResult } from '../shared/types.js';
import { recordResult } from '../shared/assertions.js';

export const smokeSuite: SuiteModule = {
  name: 'smoke',
  async run(ctx: RunContext): Promise<StepResult[]> {
    return [recordResult(ctx, { step: 'smoke.placeholder', status: 'skip', detail: 'Packaging/deployment smoke suite — deferred to Prompt-05' })];
  },
};
