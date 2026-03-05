import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function WarrantyTrackingPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Warranty Tracking">
      <HbcEmptyState title="Warranty Tracking" description="Warranty tracking tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
