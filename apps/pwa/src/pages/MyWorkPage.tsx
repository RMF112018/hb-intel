import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const MY_WORK_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'My Work',
    description:
      'Your personal work hub is coming soon. Items assigned to you will appear here.',
    coachingTip:
      'Your personal queue, delegated items, and team activity will be available in upcoming releases.',
  }),
};

const MY_WORK_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'my-work',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: true,
  currentUserRole: 'user',
  isLoadError: false,
};

export function MyWorkPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="My Work">
      <HbcSmartEmptyState
        config={MY_WORK_EMPTY_CONFIG}
        context={MY_WORK_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
