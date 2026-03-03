import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function SiteControlPage(): ReactNode {
  return (
    <WorkspacePageShell title="Site Control" description="Field operations management">
      <HbcEmptyState
        title="Site Control"
        description="Site Control is a separate application in production. This placeholder enables development integration."
      />
    </WorkspacePageShell>
  );
}
