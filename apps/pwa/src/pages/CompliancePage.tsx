import type { ReactNode } from 'react';
import { WorkspacePageShell } from '../components/WorkspacePageShell.js';
import { HbcEmptyState } from '@hbc/ui-kit';

export function CompliancePage(): ReactNode {
  return (
    <WorkspacePageShell title="Compliance" description="Regulatory compliance tracking">
      <HbcEmptyState
        title="Compliance"
        description="Regulatory compliance tracking will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
