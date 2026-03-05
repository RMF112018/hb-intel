import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function RiskPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Risk">
      <HbcEmptyState
        title="Risk"
        description="Risk assessment and mitigation tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
