import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const DOCUMENTS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Documents',
    description: 'Document management will be available in a future release.',
    coachingTip: 'Document storage and sharing features are planned for a future wave.',
  }),
};

const DOCUMENTS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'project-hub',
  view: 'documents',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function DocumentsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Documents">
      <HbcSmartEmptyState
        config={DOCUMENTS_EMPTY_CONFIG}
        context={DOCUMENTS_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
