import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

/**
 * P5-04: Entra Control lane scaffold.
 *
 * Purpose: Entra ID (Azure AD) app registration and permission management.
 * Future ownership: App registration lifecycle, service principal management,
 *   app role assignments, API scope configuration, and permission consent.
 * Currently available: Provisioning oversight (which includes Entra group
 *   creation steps) is on the Runs lane.
 * Delivers in: Phase 9+.
 */

const ENTRA_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Entra Control',
    description:
      'This lane will provide Entra ID app registration and permission management — ' +
      'including app registration lifecycle, service principal management, ' +
      'app role assignments, API scope configuration, and permission consent.',
    primaryAction: {
      label: 'View Runs & History',
      href: '/runs',
    },
    coachingTip:
      'Entra Control will be delivered in Phase 9. ' +
      'Provisioning runs that include Entra group creation are visible on the Runs lane.',
  }),
};

const ENTRA_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'entra',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

export function EntraLanePage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Entra Control">
      <HbcSmartEmptyState
        config={ENTRA_EMPTY_CONFIG}
        context={ENTRA_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
