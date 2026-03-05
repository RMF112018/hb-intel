import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function RiskManagementPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Risk Management">
      <HbcEmptyState
        title="Risk Management"
        description="Risk register and mitigation planning tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
