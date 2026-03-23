import { describe, it, expect } from 'vitest';
import { evaluateEligibility, filterEligible } from './eligibility.js';
import type { IBulkActionItemRef, IBulkEligibilityResult, IBulkActionDefinition } from '../types/index.js';

const mockAction: IBulkActionDefinition<void> = {
  actionId: 'test', label: 'Test', kind: 'immediate', destructive: false,
  destructiveMetadata: null, requiresConfirmation: false, requiresInput: false,
  inputSchema: null, permissionGate: null, transactional: false,
};

const refs: IBulkActionItemRef[] = [{ id: '1', moduleKey: 'test' }, { id: '2', moduleKey: 'test' }];

describe('evaluateEligibility', () => {
  it('evaluates all items', () => {
    const evaluator = (ref: IBulkActionItemRef) => ({ itemRef: ref, eligible: true, reasonCode: null, warningCode: null, message: null } as IBulkEligibilityResult);
    const results = evaluateEligibility(refs, mockAction, evaluator);
    expect(results).toHaveLength(2); expect(results[0].eligible).toBe(true);
  });
  it('marks ineligible', () => {
    const evaluator = (ref: IBulkActionItemRef) => ({ itemRef: ref, eligible: ref.id !== '2', reasonCode: ref.id === '2' ? 'status-incompatible' as const : null, warningCode: null, message: null } as IBulkEligibilityResult);
    const results = evaluateEligibility(refs, mockAction, evaluator);
    expect(results.filter(r => !r.eligible)).toHaveLength(1);
  });
});

describe('filterEligible', () => {
  it('partitions eligible and ineligible', () => {
    const results: IBulkEligibilityResult[] = [
      { itemRef: refs[0], eligible: true, reasonCode: null, warningCode: null, message: null },
      { itemRef: refs[1], eligible: false, reasonCode: 'permission-denied', warningCode: null, message: 'No access' },
    ];
    const { eligible, ineligible } = filterEligible(results);
    expect(eligible).toHaveLength(1); expect(ineligible).toHaveLength(1);
  });
});
