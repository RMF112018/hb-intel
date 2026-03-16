import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const OPPORTUNITIES_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Opportunities',
    description: 'Opportunity management will be available in a future release.',
    coachingTip: 'Opportunity tracking and pipeline management features are planned for a future wave.',
  }),
};

const OPPORTUNITIES_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'business-development',
  view: 'opportunities',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function OpportunitiesPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Opportunities">
      <HbcSmartEmptyState
        config={OPPORTUNITIES_EMPTY_CONFIG}
        context={OPPORTUNITIES_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
