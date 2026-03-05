import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ContractsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Contracts">
      <HbcEmptyState
        title="Contracts"
        description="Contract management and administration will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
