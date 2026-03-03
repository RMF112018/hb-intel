import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function DocumentsPage(): ReactNode {
  return (
    <WorkspacePageShell title="Documents" description="Project document management">
      <HbcEmptyState
        title="Documents"
        description="Document management will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
