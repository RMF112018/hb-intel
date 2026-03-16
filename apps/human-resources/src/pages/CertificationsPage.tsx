import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

const CERTS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Certifications',
    description: 'Certification tracking and management tools will be available in a future release.',
    coachingTip: 'Certification management features are planned for a future wave.',
  }),
};

const CERTS_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'human-resources',
  view: 'certifications',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

export function CertificationsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Certifications">
      <HbcSmartEmptyState config={CERTS_EMPTY_CONFIG} context={CERTS_EMPTY_CONTEXT} variant="full-page" />
    </WorkspacePageShell>
  );
}
