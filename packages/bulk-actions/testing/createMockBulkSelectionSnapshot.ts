/** SF27-T08 — Mock factory. */
import type { IBulkSelectionSnapshot } from '../src/types/index.js';
export function createMockBulkSelectionSnapshot(overrides?: Partial<IBulkSelectionSnapshot>): IBulkSelectionSnapshot {
  return { scope: 'page', selectedIds: ['item-1', 'item-2', 'item-3'], exactCount: 3, ...overrides };
}
