import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const INVOICES_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Invoices',
    description: 'Invoice processing and tracking will be available in a future release.',
    coachingTip: 'Invoice management features are planned for a future wave.',
  }),
};

const INVOICES_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'accounting',
  view: 'invoices',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function InvoicesPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Invoices">
      <HbcSmartEmptyState
        config={INVOICES_EMPTY_CONFIG}
        context={INVOICES_EMPTY_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
