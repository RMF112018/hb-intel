import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function AdminPage(): ReactNode {
  return (
    <WorkspacePageShell title="Admin" description="System administration and settings">
      <HbcEmptyState
        title="Administration"
        description="System administration and settings will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
