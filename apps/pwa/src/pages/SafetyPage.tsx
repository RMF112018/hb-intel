import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function SafetyPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Safety">
      <HbcEmptyState
        title="Safety"
        description="Safety incident tracking and inspection tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
