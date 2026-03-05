import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function DocumentsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Documents">
      <HbcEmptyState
        title="Documents"
        description="Document management will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
