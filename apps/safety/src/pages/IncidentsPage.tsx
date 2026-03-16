import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const INCIDENTS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Incidents',
    description: 'Safety incident tracking and reporting tools will be available in a future release.',
    coachingTip: 'Safety incident management features are planned for a future wave.',
  }),
};

const INCIDENTS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'safety',
  view: 'incidents',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function IncidentsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Incidents">
      <HbcSmartEmptyState config={INCIDENTS_EMPTY_CONFIG} context={INCIDENTS_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
