import React from 'react';
import { useComplexity } from '@hbc/ui-kit/app-shell'; // SPFx-safe import
import type { IBicNextMoveConfig, IBicNextMoveState, BicComplexityVariant } from '../types/IBicNextMove';
import { resolveFullBicState } from '../hooks/useBicNextMove';
import { urgencyClass, urgencyLabel, truncate, resolveVariant } from './_utils';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcBicBadgeProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  /**
   * Optional override for complexity tier (D-05).
   * Use 'essential' for narrow columns and SPFx contexts.
   * Use 'standard' for My Work Feed rows (regardless of user's global setting).
   * When absent, inherits from @hbc/complexity context.
   */
  forceVariant?: BicComplexityVariant;
  /** Additional CSS class names for the badge wrapper */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity tier rendering matrix (D-05)
//
// Essential: Avatar + name only
// Standard:  Avatar + name + urgency dot
// Expert:    Avatar + name + urgency dot + action text (truncated 40 chars)
// ─────────────────────────────────────────────────────────────────────────────

export function HbcBicBadge<T>({
  item,
  config,
  forceVariant,
  className = '',
}: HbcBicBadgeProps<T>): React.ReactElement {
  const { variant: contextVariant } = useComplexity();
  const variant = resolveVariant(forceVariant, contextVariant);

  // Resolve state synchronously — no additional API calls (spec requirement)
  const state: IBicNextMoveState = resolveFullBicState(item, config);

  // ── D-04: Unassigned state ───────────────────────────────────────────────
  if (state.currentOwner === null) {
    return (
      <span
        className={`hbc-bic-badge hbc-bic-badge--unassigned ${className}`}
        aria-label="Unassigned — this item may be stalled"
      >
        <span className="hbc-bic-badge__icon" aria-hidden="true">⚠️</span>
        <span className="hbc-bic-badge__name">Unassigned</span>
        {variant !== 'essential' && (
          <span className="hbc-bic-badge__dot hbc-bic--immediate" aria-label="Immediate attention required" />
        )}
      </span>
    );
  }

  const { currentOwner, urgencyTier, isOverdue, isBlocked, expectedAction } = state;
  const dotClass = urgencyClass(urgencyTier, isBlocked);
  const dotLabel = urgencyLabel(urgencyTier, isOverdue, isBlocked);

  return (
    <span
      className={`hbc-bic-badge ${dotClass} ${className}`}
      title={buildTooltip(state)}
      role="img"
      aria-label={buildAriaLabel(state)}
    >
      {/* Avatar — always shown in all variants */}
      <span
        className="hbc-bic-badge__avatar"
        aria-hidden="true"
      >
        {currentOwner.displayName.charAt(0).toUpperCase()}
      </span>

      {/* Owner name — always shown in all variants */}
      <span className="hbc-bic-badge__name">{currentOwner.displayName}</span>

      {/* Urgency dot — Standard and Expert only */}
      {variant !== 'essential' && (
        isBlocked ? (
          <span className="hbc-bic-badge__lock" aria-label="Blocked">🔒</span>
        ) : (
          <span className={`hbc-bic-badge__dot ${dotClass}`} aria-label={dotLabel} />
        )
      )}

      {/* Action text — Expert only, truncated to 40 chars */}
      {variant === 'expert' && (
        <span className="hbc-bic-badge__action" aria-hidden="true">
          {truncate(expectedAction, 40)}
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accessibility helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildTooltip(state: IBicNextMoveState): string {
  if (state.currentOwner === null) return 'No owner assigned — this item may be stalled';
  const parts = [
    `${state.currentOwner.displayName} (${state.currentOwner.role})`,
    state.expectedAction,
  ];
  if (state.dueDate) parts.push(relativeDate(state.dueDate));
  if (state.isBlocked) parts.push(`Blocked: ${state.blockedReason}`);
  return parts.join(' · ');
}

function buildAriaLabel(state: IBicNextMoveState): string {
  if (state.currentOwner === null) return 'Ball in court: Unassigned';
  return `Ball in court: ${state.currentOwner.displayName}, ${state.expectedAction}`;
}

function relativeDate(isoDate: string): string {
  const due = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Overdue';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}
