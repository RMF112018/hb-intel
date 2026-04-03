import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

/**
 * P5-04: SharePoint Control lane scaffold.
 *
 * Purpose: SharePoint site lifecycle, app catalog, and ALM operations.
 * Future ownership: Site provisioning control, app catalog management,
 *   ALM package deployment, API permission approvals, and site repair.
 * Currently available: Provisioning oversight (which includes SharePoint
 *   site creation steps) is on the Runs lane.
 * Delivers in: Phase 7+.
 */

const SHAREPOINT_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'SharePoint Control',
    description:
      'This lane will provide SharePoint site lifecycle and app catalog operations — ' +
      'including site provisioning control, app catalog management, ALM package deployment, ' +
      'API permission approvals, and site repair.',
    primaryAction: {
      label: 'View Runs & History',
      href: '/runs',
    },
    coachingTip:
      'SharePoint Control will be delivered in Phase 7. ' +
      'Provisioning runs that include SharePoint site creation are visible on the Runs lane.',
  }),
};

const SHAREPOINT_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'sharepoint',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

export function SharePointLanePage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="SharePoint Control">
      <HbcSmartEmptyState
        config={SHAREPOINT_EMPTY_CONFIG}
        context={SHAREPOINT_CONTEXT}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
