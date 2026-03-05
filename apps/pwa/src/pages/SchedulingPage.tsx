import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function SchedulingPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Scheduling">
      <HbcEmptyState
        title="Scheduling"
        description="Project scheduling and timeline management will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
