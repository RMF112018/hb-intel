import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const COMPLIANCE_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Compliance',
    description: 'Regulatory compliance tracking will be available in a future release.',
    coachingTip: 'Compliance tracking features are planned for a future wave.',
  }),
};

const COMPLIANCE_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'compliance',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function CompliancePage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Compliance">
      <HbcSmartEmptyState config={COMPLIANCE_EMPTY_CONFIG} context={COMPLIANCE_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
