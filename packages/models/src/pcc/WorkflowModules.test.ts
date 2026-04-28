import { describe, it, expect } from 'vitest';
import {
  PCC_WORKFLOW_MODULE_IDS,
  PCC_WORKFLOW_MODULES,
  type WorkflowModuleId,
} from './WorkflowModules.js';
import { PCC_WORK_CENTER_IDS } from './PccWorkCenters.js';

const PROMPT_03_NEW_MODULES: readonly WorkflowModuleId[] = [
  'constraints-log',
  'buyout-log',
  'estimating-kickoff',
  'post-bid-autopsy',
];

describe('PCC workflow modules', () => {
  it('Prompt 03 adds the four required workflow modules', () => {
    for (const id of PROMPT_03_NEW_MODULES) {
      expect(PCC_WORKFLOW_MODULE_IDS).toContain(id);
      const entry = PCC_WORKFLOW_MODULES[id];
      expect(entry).toBeDefined();
      expect(entry.id).toBe(id);
      expect(entry.displayName.length).toBeGreaterThan(0);
    }
  });

  it('every module references an existing contract work-center id', () => {
    for (const id of PCC_WORKFLOW_MODULE_IDS) {
      const entry = PCC_WORKFLOW_MODULES[id];
      expect(PCC_WORK_CENTER_IDS).toContain(entry.workCenterId);
    }
  });

  it('mvpTier values are restricted to the allowed literal set', () => {
    for (const id of PCC_WORKFLOW_MODULE_IDS) {
      expect(['MVP', 'Later']).toContain(PCC_WORKFLOW_MODULES[id].mvpTier);
    }
  });

  it('estimating-kickoff and post-bid-autopsy are Later-tier', () => {
    expect(PCC_WORKFLOW_MODULES['estimating-kickoff'].mvpTier).toBe('Later');
    expect(PCC_WORKFLOW_MODULES['post-bid-autopsy'].mvpTier).toBe('Later');
  });

  it('constraints-log and buyout-log are MVP-tier', () => {
    expect(PCC_WORKFLOW_MODULES['constraints-log'].mvpTier).toBe('MVP');
    expect(PCC_WORKFLOW_MODULES['buyout-log'].mvpTier).toBe('MVP');
  });
});
