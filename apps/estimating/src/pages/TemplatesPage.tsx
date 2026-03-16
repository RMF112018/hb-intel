import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const TEMPLATES_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Templates',
    description: 'Estimating templates will be available in a future release.',
    coachingTip: 'Template-based estimating workflows are planned for a future wave.',
  }),
};

const TEMPLATES_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'estimating',
  view: 'templates',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'estimator',
  isLoadError: false,
};

export function TemplatesPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Templates">
      <HbcSmartEmptyState
        config={TEMPLATES_EMPTY_CONFIG}
        context={TEMPLATES_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
