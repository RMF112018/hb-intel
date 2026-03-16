import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const METRICS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Metrics',
    description: 'Operational metrics and KPI dashboards will be available in a future release.',
    coachingTip: 'Operational metrics features are planned for a future wave.',
  }),
};

const METRICS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'operational-excellence',
  view: 'metrics',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function MetricsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Metrics">
      <HbcSmartEmptyState config={METRICS_EMPTY_CONFIG} context={METRICS_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
