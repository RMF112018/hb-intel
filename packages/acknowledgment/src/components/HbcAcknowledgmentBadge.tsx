import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useComplexity, type ComplexityTier } from '@hbc/complexity';
import { HbcTooltip } from '@hbc/ui-kit';
import {
  HBC_STATUS_COLORS,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_RADIUS_FULL,
  label as labelTypo,
} from '@hbc/ui-kit/theme';
import { useAcknowledgment } from '../hooks/useAcknowledgment';
import type { IAcknowledgmentConfig, IAcknowledgmentState } from '../types';

// ─── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    columnGap: `${HBC_SPACE_XS}px`,
    borderRadius: HBC_RADIUS_FULL,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    fontWeight: labelTypo.fontWeight as React.CSSProperties['fontWeight'],
    lineHeight: labelTypo.lineHeight,
    letterSpacing: labelTypo.letterSpacing,
  },
  success: {
    backgroundColor: `${HBC_STATUS_COLORS.success}1A`,
    color: HBC_STATUS_COLORS.success,
  },
  warning: {
    backgroundColor: `${HBC_STATUS_COLORS.warning}1A`,
    color: HBC_STATUS_COLORS.warning,
  },
  danger: {
    backgroundColor: `${HBC_STATUS_COLORS.error}1A`,
    color: HBC_STATUS_COLORS.error,
  },
  neutral: {
    backgroundColor: `${HBC_STATUS_COLORS.neutral}1A`,
    color: HBC_STATUS_COLORS.neutral,
  },
});

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
  const styles = useStyles();
  return (
    <span className={mergeClasses(styles.badge, styles.neutral)} aria-busy="true">
      <span>Loading…</span>
    </span>
  );
}

// ─── Display Resolver ───────────────────────────────────────────────────────

type ColorVariant = 'success' | 'warning' | 'danger' | 'neutral';

function resolveBadgeDisplay(
  overallStatus: IAcknowledgmentState['overallStatus'],
  acknowledgedCount: number,
  requiredCount: number,
  hasBypass: boolean,
): { icon: string; label: string; colorVariant: ColorVariant } {
  if (overallStatus === 'declined') {
    return { icon: '✗', label: 'Declined', colorVariant: 'danger' };
  }
  if (overallStatus === 'acknowledged') {
    return hasBypass
      ? { icon: '✓', label: 'Complete (with bypass)', colorVariant: 'warning' }
      : { icon: '✓', label: 'Complete', colorVariant: 'success' };
  }
  return {
    icon: '⏳',
    label: `${acknowledgedCount} of ${requiredCount} acknowledged`,
    colorVariant: acknowledgedCount > 0 ? 'warning' : 'neutral',
  };
}

// ─── Badge ──────────────────────────────────────────────────────────────────

export function HbcAcknowledgmentBadge<T>({
  item,
  config,
  contextId,
  complexityTier: complexityTierProp,
}: HbcAcknowledgmentBadgeProps<T>) {
  const styles = useStyles();
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

  const { icon, label, colorVariant } = resolveBadgeDisplay(
    state.overallStatus,
    acknowledged.length,
    required.length,
    hasBypass,
  );

  const badgeEl = (
    <span
      className={mergeClasses(styles.badge, styles[colorVariant])}
      aria-label={label}
    >
      <span aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );

  // Expert: wrap in tooltip showing pending party names (D-07)
  if (effectiveTier === 'expert' && pending.length > 0) {
    const tooltipContent = `Pending: ${pending.map((p) => p.displayName).join(', ')}`;
    return <HbcTooltip content={tooltipContent}>{badgeEl}</HbcTooltip>;
  }

  return badgeEl;
}
