import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

/**
 * P5-04: Setup / Install lane scaffold.
 *
 * Purpose: In-app backend install and bootstrap for HB Intel infrastructure.
 * Future ownership: Azure deployment, Function App provisioning, app registration,
 *   SharePoint ALM package installation, and API permission consent.
 * Currently available: Infrastructure health probes on the Health lane.
 * Delivers in: Phase 6.
 */

const SETUP_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Setup & Install',
    description:
      'This lane will provide in-app backend install and bootstrap for the HB Intel infrastructure — ' +
      'including Azure deployment, Function App provisioning, Entra app registration, ' +
      'SharePoint ALM package installation, and API permission consent.',
    primaryAction: {
      label: 'View Infrastructure Health',
      href: '/health',
    },
    coachingTip:
      'Setup & Install will be delivered in Phase 6. ' +
      'Infrastructure health probes are already available on the Health lane.',
  }),
};

const SETUP_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'setup',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

export function SetupLanePage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Setup & Install">
      <HbcSmartEmptyState
        config={SETUP_EMPTY_CONFIG}
        context={SETUP_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
