import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function PreconstructionPage(): ReactNode {
  return (
    <WorkspacePageShell title="Preconstruction" description="Preconstruction planning and coordination">
      <HbcEmptyState
        title="Preconstruction"
        description="Preconstruction planning tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
