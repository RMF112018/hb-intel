import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ProvisioningFailuresPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Provisioning Failures">
      <HbcEmptyState title="Provisioning Failures" description="Provisioning failure tracking will be available in a future release." />
    </WorkspacePageShell>
  );
}
