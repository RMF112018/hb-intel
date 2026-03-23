/**
 * SF27-T03 — Selection scope management.
 */
import type { BulkSelectionScope, IBulkSelectionSnapshot, IBulkSelectionAdapter, BulkScopeMismatchReasonCode } from '../types/index.js';

export function createSelectionSnapshot(adapter: IBulkSelectionAdapter, scope: BulkSelectionScope): IBulkSelectionSnapshot {
  const selectedIds = scope === 'filtered' ? adapter.getFilteredSetIds() : adapter.getSelectedIds();
  return {
    scope,
    selectedIds,
    exactCount: selectedIds.length,
    filterSnapshot: scope === 'filtered' ? {} : undefined,
    viewSnapshot: scope === 'filtered' ? {} : undefined,
  };
}

export function escalateScope(current: IBulkSelectionSnapshot, newScope: BulkSelectionScope, adapter: IBulkSelectionAdapter): IBulkSelectionSnapshot {
  return createSelectionSnapshot(adapter, newScope);
}

export function validateScopeIntegrity(snapshot: IBulkSelectionSnapshot, adapter: IBulkSelectionAdapter): { valid: boolean; reasonCode: BulkScopeMismatchReasonCode | null } {
  if (snapshot.scope === 'filtered') {
    const currentCount = adapter.getFilteredSetIds().length;
    if (currentCount !== snapshot.exactCount) return { valid: false, reasonCode: 'filter-changed' };
  }
  if (snapshot.selectedIds.length === 0) return { valid: false, reasonCode: 'selection-stale' };
  return { valid: true, reasonCode: null };
}
