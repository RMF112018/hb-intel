/** SF27-T06 — SelectAllFilteredBanner shell. */
import React from 'react';
import { SelectAllFilteredBanner } from '@hbc/ui-kit';
import type { IBulkSelectionAdapter } from '../types/index.js';
import { useBulkSelection } from '../hooks/useBulkSelection.js';

export interface SelectAllFilteredBannerShellProps { adapter: IBulkSelectionAdapter; onSelectAllFiltered: () => void; }

export function SelectAllFilteredBannerShell({ adapter, onSelectAllFiltered }: SelectAllFilteredBannerShellProps): React.ReactElement | null {
  const { selectedCount } = useBulkSelection({ adapter });
  const filteredCount = adapter.getFilteredSetIds().length;
  return <SelectAllFilteredBanner filteredCount={filteredCount} selectedCount={selectedCount} onSelectAllFiltered={onSelectAllFiltered} />;
}
