import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ErrorLogPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Error Log">
      <HbcEmptyState title="Error Log" description="Error log viewer will be available in a future release." />
    </WorkspacePageShell>
  );
}
