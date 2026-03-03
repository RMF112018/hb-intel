import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ProvisioningFailuresPage(): ReactNode {
  return (
    <WorkspacePageShell title="Provisioning Failures" description="Failed provisioning operations">
      <HbcEmptyState title="Provisioning Failures" description="Provisioning failure tracking will be available in a future release." />
    </WorkspacePageShell>
  );
}
