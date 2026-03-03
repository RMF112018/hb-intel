import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function OpportunitiesPage(): ReactNode {
  return (
    <WorkspacePageShell title="Opportunities" description="Opportunity management and tracking">
      <HbcEmptyState title="Opportunities" description="Opportunity management will be available in a future release." />
    </WorkspacePageShell>
  );
}
