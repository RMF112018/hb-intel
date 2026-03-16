import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const PORTFOLIO_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Portfolio Overview',
    description: 'Portfolio overview and analysis will be available in a future release.',
    coachingTip: 'Portfolio analysis features are planned for a future wave.',
  }),
};

const PORTFOLIO_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'leadership',
  view: 'portfolio-overview',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function PortfolioOverviewPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Portfolio Overview">
      <HbcSmartEmptyState config={PORTFOLIO_EMPTY_CONFIG} context={PORTFOLIO_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
