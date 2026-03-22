/**
 * HubPageLevelEmptyState — P2-A1 §4, §6 governed hub empty state.
 *
 * Intercepts loading-failed and permission-empty at the page level.
 * For all other states the zone layout renders normally — the feed
 * owns its own truly-empty, filter-empty, and first-use empty states.
 *
 * P2-A1 mandate: hub MUST NOT redirect when the work queue is empty.
 */
import type { ReactNode } from 'react';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import { useMyWork } from '@hbc/my-work-feed';

export interface HubPageLevelEmptyStateProps {
  /** Override feed error detection. When omitted, derived from useMyWork() context. */
  isLoadError?: boolean;
  hasPermission: boolean;
  children: ReactNode;
}

const HUB_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => {
    if (context.isLoadError) {
      return {
        module: context.module,
        view: context.view,
        classification: 'loading-failed',
        heading: 'Unable to load My Work',
        description:
          'We could not load your personal work hub. Check your connection and try again.',
        primaryAction: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
        coachingTip:
          'If this persists, contact your administrator for assistance.',
      };
    }

    if (!context.hasPermission) {
      return {
        module: context.module,
        view: context.view,
        classification: 'permission-empty',
        heading: 'Access Required',
        description:
          'You do not have permission to access the Personal Work Hub. Contact your administrator if you believe this is an error.',
        coachingTip:
          'Your administrator can grant access to My Work through the admin panel.',
      };
    }

    // Default: not empty at hub level. Feed handles its own states.
    return {
      module: context.module,
      view: context.view,
      classification: 'truly-empty',
      heading: 'My Work',
      description: 'Your personal work hub.',
    };
  },
};

export function HubPageLevelEmptyState({
  isLoadError,
  hasPermission,
  children,
}: HubPageLevelEmptyStateProps): ReactNode {
  // UX-F2: Derive error state from feed context when prop is not explicitly provided.
  const { isError } = useMyWork({ enabled: false });
  const effectiveLoadError = isLoadError ?? isError;

  // Only show page-level empty state for error/permission scenarios
  if (effectiveLoadError || !hasPermission) {
    const context: IEmptyStateContext = {
      module: 'pwa',
      view: 'my-work',
      hasActiveFilters: false,
      hasPermission,
      isFirstVisit: false,
      currentUserRole: 'user',
      isLoadError: effectiveLoadError,
    };

    return (
      <HbcSmartEmptyState
        config={HUB_EMPTY_CONFIG}
        context={context}
        variant="full-page"
      />
    );
  }

  // Normal state: render zone layout — never redirect on empty queue
  return <>{children}</>;
}
