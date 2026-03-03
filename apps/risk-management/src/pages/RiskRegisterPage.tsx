import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function RiskRegisterPage(): ReactNode {
  return (
    <WorkspacePageShell title="Risk Register" description="Project risk identification and assessment">
      <HbcEmptyState title="Risk Register" description="Risk register and assessment tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
