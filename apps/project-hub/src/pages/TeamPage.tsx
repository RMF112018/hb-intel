import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const TEAM_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Team',
    description: 'Team management tools will be available in a future release.',
    coachingTip: 'Team roster and role management features are planned for a future wave.',
  }),
};

const TEAM_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'project-hub',
  view: 'team',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function TeamPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Team">
      <HbcSmartEmptyState
        config={TEAM_EMPTY_CONFIG}
        context={TEAM_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
