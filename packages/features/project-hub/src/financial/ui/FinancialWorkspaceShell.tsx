/**
 * FinancialWorkspaceShell — governed outer wrapper for all Financial surfaces.
 *
 * Provides the page-level WorkspacePageShell with Financial-specific
 * breadcrumbs, command actions, and state banners. Every Financial tool
 * page renders inside this shell.
 *
 * Uses @hbc/ui-kit WorkspacePageShell (D-01 mandatory wrapper).
 */

import type { ReactNode } from 'react';
import { WorkspacePageShell, HbcStatusBadge } from '@hbc/ui-kit';
import type { CommandBarAction } from '@hbc/ui-kit';
import type { BreadcrumbItem } from '@hbc/models';

// ── Types ──────────────────────────────────────────────────────────────

export type FinancialWorkspaceState =
  | 'working'
  | 'confirmed'
  | 'published'
  | 'stale'
  | 'blocked'
  | 'loading'
  | 'error'
  | 'empty';

export interface FinancialWorkspaceShellProps {
  /** Page title (e.g., "Financial", "Budget Import", "Forecast Summary"). */
  readonly title: string;
  /** Active project name for breadcrumb context. */
  readonly projectName?: string;
  /** Active project ID for breadcrumb links. */
  readonly projectId: string;
  /** Active tool slug for breadcrumb depth (null = Financial home). */
  readonly activeTool?: string | null;
  /** Active tool label for breadcrumb display. */
  readonly activeToolLabel?: string;
  /** Version state for the state ribbon. */
  readonly versionState?: FinancialWorkspaceState;
  /** Reporting period display (e.g., "March 2026"). */
  readonly reportingPeriod?: string;
  /** Number of unresolved blockers (reconciliation conditions, gate failures). */
  readonly blockerCount?: number;
  /** Whether data is stale (e.g., stale budget lines). */
  readonly isStale?: boolean;
  /** Primary command actions for the command bar. */
  readonly actions?: CommandBarAction[];
  /** Overflow command actions. */
  readonly overflowActions?: CommandBarAction[];
  /** Banner message for page-level alerts. */
  readonly bannerMessage?: ReactNode;
  /** Banner variant. */
  readonly bannerVariant?: 'info' | 'warning' | 'error' | 'success';
  /** Loading state. */
  readonly isLoading?: boolean;
  /** Error state. */
  readonly isError?: boolean;
  /** Error message. */
  readonly errorMessage?: string;
  /** Retry handler for error state. */
  readonly onRetry?: () => void;
  /** Page content. */
  readonly children: ReactNode;
}

// ── State labels ───────────────────────────────────────────────────────

const STATE_LABELS: Record<FinancialWorkspaceState, string> = {
  working: 'Working Draft',
  confirmed: 'Confirmed Internal',
  published: 'Published',
  stale: 'Stale — Action Required',
  blocked: 'Blocked',
  loading: 'Loading',
  error: 'Error',
  empty: 'No Data',
};

const STATE_BADGE_VARIANT: Record<FinancialWorkspaceState, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  working: 'info',
  confirmed: 'success',
  published: 'success',
  stale: 'warning',
  blocked: 'error',
  loading: 'neutral',
  error: 'error',
  empty: 'neutral',
};

// ── Component ──────────────────────────────────────────────────────────

export function FinancialWorkspaceShell({
  title,
  projectName,
  projectId,
  activeTool,
  activeToolLabel,
  versionState,
  reportingPeriod,
  blockerCount,
  isStale,
  actions,
  overflowActions,
  bannerMessage,
  bannerVariant,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  children,
}: FinancialWorkspaceShellProps): ReactNode {
  // Build breadcrumbs: Portfolio → Project → Financial → [Tool]
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Portfolio', href: '/project-hub' },
    { label: projectName ?? 'Project', href: `/project-hub/${projectId}` },
    { label: 'Financial', href: `/project-hub/${projectId}/financial` },
  ];

  if (activeTool && activeToolLabel) {
    breadcrumbs.push({
      label: activeToolLabel,
      href: `/project-hub/${projectId}/financial/${activeTool}`,
    });
  }

  // Build banner from state
  const banner = bannerMessage
    ? { variant: bannerVariant ?? ('info' as const), message: bannerMessage, dismissible: true }
    : isStale
      ? { variant: 'warning' as const, message: 'Financial data has stale items requiring attention.', dismissible: false }
      : blockerCount && blockerCount > 0
        ? { variant: 'warning' as const, message: `${blockerCount} unresolved blocker${blockerCount > 1 ? 's' : ''} — confirmation is blocked until resolved.`, dismissible: false }
        : undefined;

  // Build header slot with state ribbon
  const headerSlot = (versionState || reportingPeriod) ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {reportingPeriod && (
        <HbcStatusBadge variant="neutral" label={reportingPeriod} size="small" />
      )}
      {versionState && (
        <HbcStatusBadge
          variant={STATE_BADGE_VARIANT[versionState]}
          label={STATE_LABELS[versionState]}
          size="small"
        />
      )}
    </div>
  ) : undefined;

  return (
    <WorkspacePageShell
      layout="detail"
      title={title}
      breadcrumbs={breadcrumbs}
      actions={actions}
      overflowActions={overflowActions}
      showDensityControl
      stickyHeader
      headerSlot={headerSlot}
      banner={banner}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      onRetry={onRetry}
    >
      {children}
    </WorkspacePageShell>
  );
}
