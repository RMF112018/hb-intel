import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const OPEX_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Operational Excellence',
    description: 'Process improvement and operational metrics will be available in a future release.',
    coachingTip: 'Operational excellence features are planned for a future wave.',
  }),
};

const OPEX_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'operational-excellence',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function OperationalExcellencePage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Operational Excellence">
      <HbcSmartEmptyState config={OPEX_EMPTY_CONFIG} context={OPEX_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
