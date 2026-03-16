import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const SAFETY_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Safety',
    description: 'Safety incident tracking and inspection tools will be available in a future release.',
    coachingTip: 'Safety management features are planned for a future wave.',
  }),
};

const SAFETY_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'safety',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function SafetyPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Safety">
      <HbcSmartEmptyState config={SAFETY_EMPTY_CONFIG} context={SAFETY_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
