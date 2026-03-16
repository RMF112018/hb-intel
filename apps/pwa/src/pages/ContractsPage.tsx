import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const CONTRACTS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Contracts',
    description: 'Contract management and administration will be available in a future release.',
    coachingTip: 'Contract management features are planned for a future wave.',
  }),
};

const CONTRACTS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'contracts',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function ContractsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Contracts">
      <HbcSmartEmptyState config={CONTRACTS_EMPTY_CONFIG} context={CONTRACTS_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
