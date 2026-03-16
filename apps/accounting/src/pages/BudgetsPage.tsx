import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const BUDGETS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Budgets',
    description: 'Detailed budget management will be available in a future release.',
    coachingTip: 'Budget tracking and cost management features are planned for a future wave.',
  }),
};

const BUDGETS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'accounting',
  view: 'budgets',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function BudgetsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Budgets">
      <HbcSmartEmptyState
        config={BUDGETS_EMPTY_CONFIG}
        context={BUDGETS_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
