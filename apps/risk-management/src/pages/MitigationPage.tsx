import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function MitigationPage(): ReactNode {
  return (
    <WorkspacePageShell title="Mitigation" description="Risk mitigation planning and tracking">
      <HbcEmptyState title="Mitigation" description="Risk mitigation planning tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
