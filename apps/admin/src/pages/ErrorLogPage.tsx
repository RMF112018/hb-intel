import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

/**
 * Error Log page — intentionally deferred to SF17-T05.
 *
 * Renders a clear empty state so the route never appears blank.
 *
 * @design G6-T01
 */

const ERROR_LOG_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Error Log',
    description:
      'Detailed error logging and audit trail will be available in a future release (SF17-T05).',
    primaryAction: {
      label: 'Go to Provisioning Oversight',
      href: '/provisioning-failures',
    },
    coachingTip:
      'This page is intentionally deferred. All admin alerts and monitors are fully functional in the Provisioning Oversight dashboard.',
  }),
};

const ERROR_LOG_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'error-log',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

export function ErrorLogPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Error Log">
      <HbcSmartEmptyState
        config={ERROR_LOG_EMPTY_CONFIG}
        context={ERROR_LOG_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
