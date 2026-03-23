/** SF27-T04 — Selection state hook. */
import { useState, useCallback, useMemo } from 'react';
import type { BulkSelectionScope, IBulkSelectionSnapshot, IBulkSelectionAdapter } from '../types/index.js';
import { createSelectionSnapshot, escalateScope, validateScopeIntegrity } from '../selection/selectionManager.js';

export interface UseBulkSelectionOptions { adapter: IBulkSelectionAdapter; }
export interface UseBulkSelectionResult {
  snapshot: IBulkSelectionSnapshot | null; selectedCount: number; hasSelection: boolean;
  select: (scope: BulkSelectionScope) => void; escalate: (newScope: BulkSelectionScope) => void;
  clear: () => void; validate: () => { valid: boolean; reasonCode: string | null };
}

export function useBulkSelection(options: UseBulkSelectionOptions): UseBulkSelectionResult {
  const { adapter } = options;
  const [snapshot, setSnapshot] = useState<IBulkSelectionSnapshot | null>(null);

  const select = useCallback((scope: BulkSelectionScope) => setSnapshot(createSelectionSnapshot(adapter, scope)), [adapter]);
  const escalate = useCallback((newScope: BulkSelectionScope) => { if (snapshot) setSnapshot(escalateScope(snapshot, newScope, adapter)); }, [snapshot, adapter]);
  const clear = useCallback(() => setSnapshot(null), []);
  const validate = useCallback(() => snapshot ? validateScopeIntegrity(snapshot, adapter) : { valid: false, reasonCode: 'selection-stale' as const }, [snapshot, adapter]);

  const selectedCount = useMemo(() => snapshot?.exactCount ?? 0, [snapshot]);
  const hasSelection = selectedCount > 0;

  return { snapshot, selectedCount, hasSelection, select, escalate, clear, validate };
}
