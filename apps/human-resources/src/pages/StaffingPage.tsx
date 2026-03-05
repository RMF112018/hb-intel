import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function StaffingPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Staffing">
      <HbcEmptyState title="Staffing" description="Staffing and resource allocation tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
