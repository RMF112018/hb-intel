import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const STAFFING_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Staffing',
    description: 'Staffing and resource allocation tools will be available in a future release.',
    coachingTip: 'Staffing management features are planned for a future wave.',
  }),
};

const STAFFING_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'human-resources',
  view: 'staffing',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function StaffingPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Staffing">
      <HbcSmartEmptyState config={STAFFING_EMPTY_CONFIG} context={STAFFING_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
