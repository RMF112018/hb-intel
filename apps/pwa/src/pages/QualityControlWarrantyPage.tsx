import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function QualityControlWarrantyPage(): ReactNode {
  return (
    <WorkspacePageShell title="Quality Control & Warranty" description="Quality checks and warranty tracking">
      <HbcEmptyState
        title="Quality Control & Warranty"
        description="Quality control checks and warranty tracking will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
