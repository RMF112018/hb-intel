import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const INSPECTIONS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Inspections',
    description: 'Safety inspection management tools will be available in a future release.',
    coachingTip: 'Safety inspection features are planned for a future wave.',
  }),
};

const INSPECTIONS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'safety',
  view: 'inspections',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function InspectionsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Inspections">
      <HbcSmartEmptyState config={INSPECTIONS_EMPTY_CONFIG} context={INSPECTIONS_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
