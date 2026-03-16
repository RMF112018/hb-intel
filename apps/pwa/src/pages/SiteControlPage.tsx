import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const SITE_CONTROL_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Site Control',
    description: 'Site Control is a separate application in production. This placeholder enables development integration.',
    coachingTip: 'Site Control is a separate application in production. This placeholder enables development integration.',
  }),
};

const SITE_CONTROL_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'pwa',
  view: 'site-control',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function SiteControlPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Site Control">
      <HbcSmartEmptyState config={SITE_CONTROL_EMPTY_CONFIG} context={SITE_CONTROL_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
