import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const WARRANTY_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Warranty Tracking',
    description: 'Warranty tracking tools will be available in a future release.',
    coachingTip: 'Warranty tracking features are planned for a future wave.',
  }),
};

const WARRANTY_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'quality-control-warranty',
  view: 'warranty-tracking',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function WarrantyTrackingPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Warranty Tracking">
      <HbcSmartEmptyState config={WARRANTY_EMPTY_CONFIG} context={WARRANTY_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
