import { describe, it, expect } from 'vitest';
import { createTanStackTableMapper } from './createTanStackTableMapper.js';
import { mockSchemaV1, mockPersonalView } from '../../testing/mockSavedViewFixtures.js';

describe('createTanStackTableMapper', () => {
  const mapper = createTanStackTableMapper('financial', 'default', mockSchemaV1);

  it('serializes TanStack state to view shape', () => {
    const result = mapper.serialize({
      columnVisibility: { name: true, status: true, amount: false },
      sorting: [{ id: 'name', desc: false }],
      grouping: ['status'],
      columnFilters: [{ id: 'status', value: 'active' }],
      columnOrder: ['name', 'status'],
      density: 'compact',
    });
    expect(result.moduleKey).toBe('financial');
    expect(result.sortBy).toEqual([{ field: 'name', direction: 'asc' }]);
    expect(result.groupBy).toEqual([{ field: 'status' }]);
    expect(result.presentation.visibleColumnKeys).toEqual(['name', 'status']);
    expect(result.presentation.density).toBe('compact');
  });

  it('deserializes view to TanStack state', () => {
    const state = mapper.deserialize(mockPersonalView);
    expect(state.columnVisibility.name).toBe(true);
    expect(state.density).toBe('standard');
  });

  it('returns current schema version', () => {
    expect(mapper.currentSchemaVersion()).toBe(1);
  });

  it('returns current schema', () => {
    expect(mapper.currentSchema().moduleKey).toBe('financial');
  });

  it('handles desc sorting', () => {
    const result = mapper.serialize({
      columnVisibility: {}, sorting: [{ id: 'amount', desc: true }],
      grouping: [], columnFilters: [], columnOrder: [], density: 'standard',
    });
    expect(result.sortBy).toEqual([{ field: 'amount', direction: 'desc' }]);
  });

  it('deserializes view without optional presentation fields', () => {
    const view = { ...mockPersonalView, presentation: {} };
    const state = mapper.deserialize(view);
    expect(state.columnOrder).toEqual([]);
    expect(state.density).toBe('standard');
  });

  it('serializes empty filter state', () => {
    const result = mapper.serialize({
      columnVisibility: {}, sorting: [], grouping: [], columnFilters: [],
      columnOrder: [], density: 'comfortable',
    });
    expect(result.filterClauses).toEqual([]);
    expect(result.presentation.density).toBe('comfortable');
  });

  it('serializes column filters to filter clauses', () => {
    const result = mapper.serialize({
      columnVisibility: {}, sorting: [], grouping: [],
      columnFilters: [{ id: 'status', value: 'active' }, { id: 'name', value: 'test' }],
      columnOrder: [], density: 'standard',
    });
    expect(result.filterClauses).toHaveLength(2);
    expect(result.filterClauses[0].field).toBe('status');
  });
});
