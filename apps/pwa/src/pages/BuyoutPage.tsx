import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const BUYOUT_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Buyout',
    description: 'Procurement and buyout schedule management will be available in a future release.',
    coachingTip: 'Procurement and buyout features are planned for a future wave.',
  }),
};

const BUYOUT_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'buyout',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function BuyoutPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Buyout">
      <HbcSmartEmptyState config={BUYOUT_EMPTY_CONFIG} context={BUYOUT_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
