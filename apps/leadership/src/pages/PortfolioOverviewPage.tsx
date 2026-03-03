import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function PortfolioOverviewPage(): ReactNode {
  return (
    <WorkspacePageShell title="Portfolio Overview" description="Cross-project portfolio analysis">
      <HbcEmptyState title="Portfolio Overview" description="Portfolio overview and analysis will be available in a future release." />
    </WorkspacePageShell>
  );
}
