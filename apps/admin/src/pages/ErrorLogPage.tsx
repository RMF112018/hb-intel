import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ErrorLogPage(): ReactNode {
  return (
    <WorkspacePageShell title="Error Log" description="System error tracking and diagnostics">
      <HbcEmptyState title="Error Log" description="Error log viewer will be available in a future release." />
    </WorkspacePageShell>
  );
}
