import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const QC_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Quality Checks',
    description: 'Quality control inspection tools will be available in a future release.',
    coachingTip: 'Quality control features are planned for a future wave.',
  }),
};

const QC_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'quality-control-warranty',
  view: 'quality-checks',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function QualityChecksPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Quality Checks">
      <HbcSmartEmptyState config={QC_EMPTY_CONFIG} context={QC_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
