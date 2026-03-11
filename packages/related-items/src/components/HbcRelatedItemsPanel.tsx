/**
 * HbcRelatedItemsPanel — D-SF14-T01, D-01, D-07
 *
 * Role-aware sidebar relationship panel with priority-based sorting,
 * collapsible groups, version chips, and smart empty state.
 *
 * TODO: SF14-T05 — Implement full panel with priority sorting, role-aware collapse,
 * version chips, smart empty state, and AI suggestion group.
 */
import type { FC } from 'react';

export interface HbcRelatedItemsPanelProps {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  showBicState?: boolean;
}

/** Collapsible sidebar panel displaying related items for a source record. */
export const HbcRelatedItemsPanel: FC<HbcRelatedItemsPanelProps> = () => {
  // TODO: SF14-T05
  return null;
};

HbcRelatedItemsPanel.displayName = 'HbcRelatedItemsPanel';
