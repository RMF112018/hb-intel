import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function OperationalExcellencePage(): ReactNode {
  return (
    <WorkspacePageShell title="Operational Excellence" description="Process improvement and metrics">
      <HbcEmptyState
        title="Operational Excellence"
        description="Process improvement and operational metrics will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
