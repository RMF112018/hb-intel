import { describe, it, expect } from 'vitest';
import { reconcile } from './compatibility.js';
import { mockDegradedView, mockIncompatibleView, mockPersonalView, mockSchemaV1, mockSchemaV2 } from '../../testing/mockSavedViewFixtures.js';

describe('reconcile', () => {
  it('returns compatible for matching schema', () => {
    const result = reconcile(mockPersonalView, mockSchemaV1);
    expect(result.status).toBe('compatible');
    expect(result.removedColumns).toHaveLength(0);
  });

  it('returns degraded-compatible for removed columns', () => {
    const result = reconcile(mockDegradedView, mockSchemaV2);
    expect(result.status).toBe('degraded-compatible');
    expect(result.removedColumns).toContain('removed-col');
    expect(result.fallbackApplied).toBe(true);
    expect(result.userExplanation).toContain('removed-col');
  });

  it('returns incompatible when all columns removed', () => {
    const result = reconcile(mockIncompatibleView, mockSchemaV2);
    expect(result.status).toBe('incompatible');
    expect(result.userExplanation).toContain('no longer exist');
  });

  it('detects removed filter fields', () => {
    const view = { ...mockPersonalView, filterClauses: [{ field: 'removed-field', operator: 'equals' as const, value: 'x' }] };
    const result = reconcile(view, mockSchemaV2);
    expect(result.removedFilterFields).toContain('removed-field');
  });

  it('detects removed group fields', () => {
    const view = { ...mockPersonalView, groupBy: [{ field: 'removed-group' }] };
    const result = reconcile(view, mockSchemaV2);
    expect(result.removedGroupFields).toContain('removed-group');
  });

  it('includes all removed items in explanation', () => {
    const view = { ...mockPersonalView, filterClauses: [{ field: 'bad-filter', operator: 'equals' as const, value: 'x' }], groupBy: [{ field: 'bad-group' }] };
    const result = reconcile(view, mockSchemaV2);
    expect(result.userExplanation).toContain('bad-filter');
    expect(result.userExplanation).toContain('bad-group');
  });

  it('returns compatible when no visibleColumnKeys set', () => {
    const view = { ...mockPersonalView, presentation: {} };
    const result = reconcile(view, mockSchemaV2);
    expect(result.status).toBe('compatible');
  });

  it('returns degraded when only some columns removed', () => {
    const view = { ...mockPersonalView, presentation: { visibleColumnKeys: ['name', 'removed-col'] } };
    const result = reconcile(view, mockSchemaV2);
    expect(result.status).toBe('degraded-compatible');
    expect(result.removedColumns).toContain('removed-col');
  });

  it('returns compatible when all fields valid against V1 schema', () => {
    const view = { ...mockPersonalView, filterClauses: [{ field: 'name', operator: 'equals' as const, value: 'x' }], groupBy: [{ field: 'status' }] };
    const result = reconcile(view, mockSchemaV1);
    expect(result.status).toBe('compatible');
  });
});
