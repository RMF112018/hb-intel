import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function PortfolioOverviewPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Portfolio Overview">
      <HbcEmptyState title="Portfolio Overview" description="Portfolio overview and analysis will be available in a future release." />
    </WorkspacePageShell>
  );
}
