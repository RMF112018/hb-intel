/** SF27-T05 — BulkSelectionBar shell wiring useBulkSelection. */
import React from 'react';
import { BulkSelectionBar } from '@hbc/ui-kit';
import type { IBulkSelectionAdapter } from '../types/index.js';
import { useBulkSelection } from '../hooks/useBulkSelection.js';

export interface BulkSelectionBarShellProps { adapter: IBulkSelectionAdapter; onSelectAll?: () => void; }

export function BulkSelectionBarShell({ adapter, onSelectAll }: BulkSelectionBarShellProps): React.ReactElement | null {
  const { snapshot, selectedCount, hasSelection, clear } = useBulkSelection({ adapter });
  if (!hasSelection) return null;
  return <BulkSelectionBar selectedCount={selectedCount} scope={snapshot?.scope ?? 'page'} onClear={clear} onSelectAll={onSelectAll} />;
}
