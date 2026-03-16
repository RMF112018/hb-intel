import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const RISK_MGMT_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Risk Management',
    description: 'Risk register and mitigation planning tools will be available in a future release.',
    coachingTip: 'Risk management features are planned for a future wave.',
  }),
};

const RISK_MGMT_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'risk-management',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function RiskManagementPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Risk Management">
      <HbcSmartEmptyState config={RISK_MGMT_EMPTY_CONFIG} context={RISK_MGMT_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
