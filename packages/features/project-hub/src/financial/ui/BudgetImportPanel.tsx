/**
 * BudgetImportPanel — R5: import batch, reconciliation, audit events.
 */
import type { ReactNode } from 'react';
import { HbcContextRail } from '@hbc/ui-kit';
import type { ContextRailSection } from '@hbc/ui-kit';
import type { BudgetImportEvent, BudgetFreshnessState } from '../hooks/useBudgetSurface.js';

function buildSections(events: readonly BudgetImportEvent[], freshness: BudgetFreshnessState): ContextRailSection[] {
  return [
    ...(freshness.reconciliationIssues > 0 ? [{
      id: 'reconciliation',
      title: 'Reconciliation',
      items: [{ id: 'recon-1', title: freshness.reconciliationLabel, subtitle: `${freshness.reconciliationIssues} issue${freshness.reconciliationIssues > 1 ? 's' : ''}` }],
    }] : []),
    {
      id: 'import-activity',
      title: 'Import & Edit Activity',
      items: events.map((e) => ({ id: e.id, title: e.title, subtitle: `${e.actor ?? 'System'} · ${new Date(e.timestamp).toLocaleDateString()}` })),
      emptyMessage: 'No import activity',
    },
  ];
}

export interface BudgetImportPanelProps {
  readonly importEvents: readonly BudgetImportEvent[];
  readonly freshness: BudgetFreshnessState;
}

export function BudgetImportPanel({ importEvents, freshness }: BudgetImportPanelProps): ReactNode {
  return <HbcContextRail sections={buildSections(importEvents, freshness)} testId="budget-import-panel" />;
}
