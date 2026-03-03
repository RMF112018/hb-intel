import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function BuyoutPage(): ReactNode {
  return (
    <WorkspacePageShell title="Buyout" description="Procurement and subcontractor management">
      <HbcEmptyState
        title="Buyout"
        description="Procurement and buyout schedule management will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
