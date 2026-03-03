import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function MetricsPage(): ReactNode {
  return (
    <WorkspacePageShell title="Metrics" description="Operational performance metrics and KPIs">
      <HbcEmptyState title="Metrics" description="Operational metrics and KPI dashboards will be available in a future release." />
    </WorkspacePageShell>
  );
}
