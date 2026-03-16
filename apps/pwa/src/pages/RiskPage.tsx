import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const RISK_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Risk',
    description: 'Risk assessment and mitigation tools will be available in a future release.',
    coachingTip: 'Risk assessment features are planned for a future wave.',
  }),
};

const RISK_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'risk',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function RiskPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Risk">
      <HbcSmartEmptyState config={RISK_EMPTY_CONFIG} context={RISK_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
