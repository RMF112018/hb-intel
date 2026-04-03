import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';

/**
 * P5-04: Generic placeholder page for scaffold lanes.
 *
 * Renders a clear empty state indicating which phase delivers the content.
 * Used by Setup, Validation, SharePoint, and Entra lanes.
 */

interface LanePlaceholderPageProps {
  readonly title: string;
  readonly laneId: string;
  readonly description: string;
  readonly deliversIn: string;
}

export function LanePlaceholderPage({
  title,
  laneId,
  description,
  deliversIn,
}: LanePlaceholderPageProps): ReactNode {
  const config: ISmartEmptyStateConfig = {
    resolve: (context) => ({
      module: context.module,
      view: context.view,
      classification: 'truly-empty',
      heading: title,
      description,
      coachingTip: `This lane will be delivered in ${deliversIn}.`,
    }),
  };

  const context: IEmptyStateContext = {
    module: 'admin',
    view: laneId,
    hasActiveFilters: false,
    hasPermission: true,
    isFirstVisit: false,
    currentUserRole: 'admin',
    isLoadError: false,
  };

  return (
    <WorkspacePageShell layout="list" title={title}>
      <HbcSmartEmptyState
        config={config}
        context={context}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}
