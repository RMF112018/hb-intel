import type { ReactNode } from 'react';
import {
  HbcBanner,
  HbcButton,
  HbcEmptyState,
  HbcTypography,
} from '@hbc/ui-kit';

/**
 * SafetyStatusPanel — Phase-04 audit G-07 (partial) in-page status primitive.
 *
 * Ownership contract (locked):
 *   - This primitive is limited to IN-PAGE, NON-FATAL states.
 *   - Allowed intents:
 *       blocked            — action dependency not satisfied, in-page advisory
 *       partial-failure    — subordinate failure inside an otherwise-valid page
 *       advisory           — informational / redirect / orientation messaging
 *       success            — in-section success outcome
 *       empty              — secondary empty within a section or card
 *   - This primitive MUST NOT own or replace:
 *       - page-level loading                (owned by WorkspacePageShell)
 *       - page-level fatal error            (owned by WorkspacePageShell)
 *       - true page-level empty / not-found (owned by WorkspacePageShell)
 *       - any other state currently owned by the page shell
 *
 *   Consolidation is about reducing duplicated in-page advisory markup,
 *   not about absorbing semantic distinctions the page shell rightly owns.
 */

export type SafetyStatusIntent =
  | 'blocked'
  | 'partial-failure'
  | 'advisory'
  | 'success'
  | 'empty';

export interface SafetyStatusPanelAction {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly pendingLabel?: string;
  readonly isPending?: boolean;
  readonly variant?: 'primary' | 'secondary';
}

export interface SafetyStatusPanelProps {
  readonly intent: SafetyStatusIntent;
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  /** Additional detail text — rendered below description (e.g. adapter error). */
  readonly detail?: ReactNode;
  readonly action?: SafetyStatusPanelAction;
  readonly onDismiss?: () => void;
  /** Optional extra content (chips, inline lists) composed below detail. */
  readonly children?: ReactNode;
  readonly 'data-safety-ui'?: string;
  readonly role?: 'status' | 'alert';
  readonly ariaLive?: 'polite' | 'assertive' | 'off';
  readonly ariaAtomic?: boolean;
}

function bannerVariantFor(intent: SafetyStatusIntent): 'info' | 'success' | 'warning' | 'error' {
  switch (intent) {
    case 'partial-failure':
      return 'error';
    case 'success':
      return 'success';
    case 'advisory':
      return 'info';
    case 'blocked':
    default:
      return 'warning';
  }
}

export function SafetyStatusPanel({
  intent,
  title,
  description,
  detail,
  action,
  onDismiss,
  children,
  'data-safety-ui': dataSafetyUi,
  role,
  ariaLive,
  ariaAtomic,
}: SafetyStatusPanelProps): ReactNode {
  if (intent === 'empty') {
    const emptyTitle = typeof title === 'string' ? title : 'No records available';
    const emptyDescription = typeof description === 'string' ? description : undefined;
    return (
      <div data-safety-ui={dataSafetyUi ?? 'status-panel-empty'}>
        <HbcEmptyState title={emptyTitle} description={emptyDescription} />
        {children}
      </div>
    );
  }

  const variant = bannerVariantFor(intent);
  const actionLabel = action?.isPending
    ? (action.pendingLabel ?? action.label)
    : action?.label;

  return (
    <HbcBanner
      variant={variant}
      onDismiss={onDismiss}
      data-safety-ui={dataSafetyUi ?? `status-panel-${intent}`}
    >
      <div
        className="safety-section"
        role={role}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
      >
        {title && <HbcTypography intent="body">{title}</HbcTypography>}
        {description && <HbcTypography intent="body">{description}</HbcTypography>}
        {detail && (
          <HbcTypography intent="bodySmall">
            <strong>Detail:</strong> {detail}
          </HbcTypography>
        )}
        {children}
        {action && (
          <div>
            <HbcButton
              variant={action.variant ?? 'secondary'}
              onClick={action.onClick}
              disabled={action.disabled || action.isPending}
            >
              {actionLabel}
            </HbcButton>
          </div>
        )}
      </div>
    </HbcBanner>
  );
}
