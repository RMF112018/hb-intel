import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function WarrantyTrackingPage(): ReactNode {
  return (
    <WorkspacePageShell title="Warranty Tracking" description="Warranty claim management and tracking">
      <HbcEmptyState title="Warranty Tracking" description="Warranty tracking tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
