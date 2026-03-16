import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const RISK_REG_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Risk Register',
    description: 'Risk register and assessment tools will be available in a future release.',
    coachingTip: 'Risk register features are planned for a future wave.',
  }),
};

const RISK_REG_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'risk-management',
  view: 'risk-register',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function RiskRegisterPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Risk Register">
      <HbcSmartEmptyState config={RISK_REG_EMPTY_CONFIG} context={RISK_REG_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
