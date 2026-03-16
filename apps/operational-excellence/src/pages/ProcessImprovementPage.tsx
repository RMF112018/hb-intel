import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const PROCESS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Process Improvement',
    description: 'Process improvement tracking tools will be available in a future release.',
    coachingTip: 'Process improvement features are planned for a future wave.',
  }),
};

const PROCESS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'operational-excellence',
  view: 'process-improvement',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function ProcessImprovementPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Process Improvement">
      <HbcSmartEmptyState config={PROCESS_EMPTY_CONFIG} context={PROCESS_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
