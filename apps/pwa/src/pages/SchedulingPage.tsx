import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const SCHEDULING_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Scheduling',
    description: 'Project scheduling and timeline management will be available in a future release.',
    coachingTip: 'Scheduling features are planned for a future wave.',
  }),
};

const SCHEDULING_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'scheduling',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function SchedulingPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Scheduling">
      <HbcSmartEmptyState config={SCHEDULING_EMPTY_CONFIG} context={SCHEDULING_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
