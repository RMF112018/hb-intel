import type { ReactNode } from 'react';
import { WorkspacePageShell } from '../components/WorkspacePageShell.js';
import { HbcEmptyState } from '@hbc/ui-kit';

export function RiskPage(): ReactNode {
  return (
    <WorkspacePageShell title="Risk" description="Risk assessment and mitigation">
      <HbcEmptyState
        title="Risk"
        description="Risk assessment and mitigation tools will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
