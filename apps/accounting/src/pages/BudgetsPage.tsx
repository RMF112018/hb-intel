import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function BudgetsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Budgets">
      <HbcEmptyState title="Budgets" description="Detailed budget management will be available in a future release." />
    </WorkspacePageShell>
  );
}
