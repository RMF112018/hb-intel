import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

/**
 * P5-04: Validation lane scaffold.
 *
 * Purpose: Pre-execution validation and environment readiness checks.
 * Future ownership: Preflight validation engine, environment probes,
 *   prerequisite verification, and dry-run previews.
 * Currently available: Provisioning run preflight is available via the Runs lane.
 * Delivers in: Phase 7+.
 */

const VALIDATION_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Validation',
    description:
      'This lane will provide pre-execution validation and environment readiness checks — ' +
      'including preflight validation, environment probes, prerequisite verification, ' +
      'and dry-run previews before executing admin operations.',
    primaryAction: {
      label: 'View Runs & History',
      href: '/runs',
    },
    coachingTip:
      'Validation will be delivered in Phase 7. ' +
      'Run-level preflight checks are currently available through the Runs lane.',
  }),
};

const VALIDATION_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'validation',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

export function ValidationLanePage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Validation">
      <HbcSmartEmptyState
        config={VALIDATION_EMPTY_CONFIG}
        context={VALIDATION_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
