import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const PMP_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'PMP',
    description: 'Project management planning tools will be available in a future release.',
    coachingTip: 'Project management planning features are planned for a future wave.',
  }),
};

const PMP_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'pmp',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function PmpPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="PMP">
      <HbcSmartEmptyState config={PMP_EMPTY_CONFIG} context={PMP_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
