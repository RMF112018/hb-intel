import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const QCW_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Quality Control & Warranty',
    description: 'Quality control checks and warranty tracking will be available in a future release.',
    coachingTip: 'Quality control and warranty features are planned for a future wave.',
  }),
};

const QCW_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'quality-control-warranty',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function QualityControlWarrantyPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Quality Control & Warranty">
      <HbcSmartEmptyState config={QCW_EMPTY_CONFIG} context={QCW_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
