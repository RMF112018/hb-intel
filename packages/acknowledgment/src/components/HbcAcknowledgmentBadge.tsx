import * as React from 'react';
import { useComplexity, type ComplexityTier } from '@hbc/complexity';
import { HbcTooltip } from '@hbc/ui-kit';
import { useAcknowledgment } from '../hooks/useAcknowledgment';
import type { IAcknowledgmentConfig, IAcknowledgmentState } from '../types';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface HbcAcknowledgmentBadgeProps<T> {
  item: T;
  config: IAcknowledgmentConfig<T>;
  contextId: string;
  /** Override complexity tier for testing/Storybook. Uses useComplexity() if absent. */
  complexityTier?: ComplexityTier;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function BadgeSkeleton() {
  return (
    <span className="hbc-ack-badge hbc-ack-badge--neutral" aria-busy="true">
      <span className="hbc-ack-badge__label">Loading…</span>
    </span>
  );
}

// ─── Display Resolver ───────────────────────────────────────────────────────

function resolveBadgeDisplay(
  overallStatus: IAcknowledgmentState['overallStatus'],
  acknowledgedCount: number,
  requiredCount: number,
  hasBypass: boolean,
): { icon: string; label: string; colorClass: string } {
  if (overallStatus === 'declined') {
    return { icon: '✗', label: 'Declined', colorClass: 'danger' };
  }
  if (overallStatus === 'acknowledged') {
    return hasBypass
      ? { icon: '✓', label: 'Complete (with bypass)', colorClass: 'warning' }
      : { icon: '✓', label: 'Complete', colorClass: 'success' };
  }
  return {
    icon: '⏳',
    label: `${acknowledgedCount} of ${requiredCount} acknowledged`,
    colorClass: acknowledgedCount > 0 ? 'warning' : 'neutral',
  };
}

// ─── Badge ──────────────────────────────────────────────────────────────────

export function HbcAcknowledgmentBadge<T>({
  item,
  config,
  contextId,
  complexityTier: complexityTierProp,
}: HbcAcknowledgmentBadgeProps<T>) {
  const { tier: contextTier } = useComplexity();
  // D-07: floor = standard — Essential renders same as Standard
  const effectiveTier: ComplexityTier =
    complexityTierProp === 'essential' || contextTier === 'essential'
      ? 'standard'
      : (complexityTierProp ?? contextTier);

  // Badge fetches its own state (lightweight — badge may appear in list rows
  // without a parent panel mounted). staleTime and refetchInterval apply (D-05).
  const { state } = useAcknowledgment(config, contextId, '');

  if (!state) return <BadgeSkeleton />;

  const parties = config.resolveParties(item);
  const required = parties.filter((p) => p.required);
  const acknowledged = state.events.filter(
    (e) => e.status === 'acknowledged' || e.status === 'bypassed',
  );
  const pending = required.filter(
    (p) =>
      !state.events.find(
        (e) =>
          e.partyUserId === p.userId &&
          (e.status === 'acknowledged' || e.status === 'bypassed'),
      ),
  );
  const hasBypass = state.events.some((e) => e.isBypass);

  const { icon, label, colorClass } = resolveBadgeDisplay(
    state.overallStatus,
    acknowledged.length,
    required.length,
    hasBypass,
  );

  const badgeEl = (
    <span
      className={`hbc-ack-badge hbc-ack-badge--${colorClass}`}
      aria-label={label}
    >
      <span className="hbc-ack-badge__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="hbc-ack-badge__label">{label}</span>
    </span>
  );

  // Expert: wrap in tooltip showing pending party names (D-07)
  if (effectiveTier === 'expert' && pending.length > 0) {
    const tooltipContent = `Pending: ${pending.map((p) => p.displayName).join(', ')}`;
    return <HbcTooltip content={tooltipContent}>{badgeEl}</HbcTooltip>;
  }

  return badgeEl;
}
