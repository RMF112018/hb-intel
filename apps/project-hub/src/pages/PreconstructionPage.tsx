import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function PreconstructionPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Preconstruction">
      <HbcEmptyState
        title="Preconstruction"
        description="Preconstruction planning tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
