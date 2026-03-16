import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const PRECON_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Preconstruction',
    description: 'Preconstruction planning tools will be available in a future release.',
    coachingTip: 'Preconstruction workflows and planning features are planned for a future wave.',
  }),
};

const PRECON_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'project-hub',
  view: 'preconstruction',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function PreconstructionPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Preconstruction">
      <HbcSmartEmptyState
        config={PRECON_EMPTY_CONFIG}
        context={PRECON_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
