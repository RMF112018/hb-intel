import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function PmpPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="PMP">
      <HbcEmptyState
        title="PMP"
        description="Project management planning tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
