import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const HR_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Human Resources',
    description: 'Staffing and certification management tools will be available in a future release.',
    coachingTip: 'Human resources features are planned for a future wave.',
  }),
};

const HR_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'human-resources',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function HumanResourcesPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Human Resources">
      <HbcSmartEmptyState config={HR_EMPTY_CONFIG} context={HR_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
