import { describe, it, expect } from 'vitest';
import { createSelectionSnapshot, escalateScope, validateScopeIntegrity } from './selectionManager.js';
import type { IBulkSelectionAdapter } from '../types/index.js';

const mockAdapter: IBulkSelectionAdapter = {
  sourceId: 'test', getSelectedIds: () => ['a', 'b'], getFilteredSetIds: () => ['a', 'b', 'c', 'd'],
  getTotalCount: () => 10, getItemRef: (id) => ({ id, moduleKey: 'test' }),
};

describe('createSelectionSnapshot', () => {
  it('creates page snapshot from selected ids', () => {
    const s = createSelectionSnapshot(mockAdapter, 'page');
    expect(s.scope).toBe('page'); expect(s.exactCount).toBe(2); expect(s.selectedIds).toEqual(['a', 'b']);
  });
  it('creates filtered snapshot from filtered set', () => {
    const s = createSelectionSnapshot(mockAdapter, 'filtered');
    expect(s.scope).toBe('filtered'); expect(s.exactCount).toBe(4);
  });
});

describe('escalateScope', () => {
  it('creates new snapshot with escalated scope', () => {
    const page = createSelectionSnapshot(mockAdapter, 'page');
    const filtered = escalateScope(page, 'filtered', mockAdapter);
    expect(filtered.scope).toBe('filtered'); expect(filtered.exactCount).toBe(4);
  });
});

describe('validateScopeIntegrity', () => {
  it('returns valid for matching filtered count', () => {
    const s = createSelectionSnapshot(mockAdapter, 'filtered');
    expect(validateScopeIntegrity(s, mockAdapter).valid).toBe(true);
  });
  it('returns invalid for changed filter count', () => {
    const s = createSelectionSnapshot(mockAdapter, 'filtered');
    const changedAdapter = { ...mockAdapter, getFilteredSetIds: () => ['a', 'b', 'c'] };
    expect(validateScopeIntegrity(s, changedAdapter).valid).toBe(false);
    expect(validateScopeIntegrity(s, changedAdapter).reasonCode).toBe('filter-changed');
  });
  it('returns invalid for empty selection', () => {
    const s = { scope: 'page' as const, selectedIds: [] as string[], exactCount: 0 };
    expect(validateScopeIntegrity(s, mockAdapter).valid).toBe(false);
  });
});
