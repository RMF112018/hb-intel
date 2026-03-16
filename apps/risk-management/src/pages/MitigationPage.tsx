import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const MITIGATION_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Mitigation',
    description: 'Risk mitigation planning tools will be available in a future release.',
    coachingTip: 'Risk mitigation features are planned for a future wave.',
  }),
};

const MITIGATION_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'risk-management',
  view: 'mitigation',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function MitigationPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Mitigation">
      <HbcSmartEmptyState config={MITIGATION_EMPTY_CONFIG} context={MITIGATION_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
