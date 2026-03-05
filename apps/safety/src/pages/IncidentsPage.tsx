import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function IncidentsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Incidents">
      <HbcEmptyState title="Incidents" description="Safety incident tracking and reporting tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
