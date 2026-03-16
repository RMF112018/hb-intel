import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_PRIMARY_BLUE,
  HBC_RADIUS_FULL,
  label as labelTypo,
} from '@hbc/ui-kit/theme';
import { useStepProgress } from '../hooks/useStepProgress';
import type { IStepWizardConfig } from '../types/IStepWizard';

// ── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    columnGap: '4px',
  },
  complete: {
    color: HBC_STATUS_COLORS.success,
  },
  stale: {
    opacity: 0.7,
  },
  fraction: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    fontWeight: labelTypo.fontWeight as React.CSSProperties['fontWeight'],
    lineHeight: labelTypo.lineHeight,
    letterSpacing: labelTypo.letterSpacing,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  fractionComplete: {
    color: HBC_STATUS_COLORS.success,
  },
  check: {
    marginRight: '2px',
  },
  barWrap: {
    display: 'inline-flex',
    width: '80px',
    height: '6px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    borderRadius: HBC_RADIUS_FULL,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: HBC_STATUS_COLORS.success,
    borderRadius: HBC_RADIUS_FULL,
    transitionProperty: 'width',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease',
  },
  staleIndicator: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

// ── Props ───────────────────────────────────────────────────────────────────

export interface HbcStepProgressProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  /** Display variant. Defaults to 'fraction'. */
  variant?: 'bar' | 'ring' | 'fraction';
}

// ── Root Component ──────────────────────────────────────────────────────────

export function HbcStepProgress<T>({
  item,
  config,
  variant = 'fraction',
}: HbcStepProgressProps<T>): React.ReactElement {
  const styles = useStyles();
  const { completedCount, requiredCount, percentComplete, isComplete, isStale } =
    useStepProgress(config, item);

  return (
    <span
      className={mergeClasses(
        styles.root,
        isComplete && styles.complete,
        isStale && styles.stale,
      )}
      aria-label={`${completedCount} of ${requiredCount} steps complete`}
    >
      {variant === 'fraction' && (
        <FractionVariant
          completedCount={completedCount}
          requiredCount={requiredCount}
          isComplete={isComplete}
        />
      )}
      {variant === 'bar' && (
        <BarVariant percentComplete={percentComplete} isComplete={isComplete} />
      )}
      {variant === 'ring' && (
        <RingVariant percentComplete={percentComplete} isComplete={isComplete} />
      )}
      {isStale && (
        <span
          className={styles.staleIndicator}
          title="Progress data may be out of date"
        >
          ↻
        </span>
      )}
    </span>
  );
}

// ── Fraction Variant ────────────────────────────────────────────────────────

function FractionVariant({
  completedCount,
  requiredCount,
  isComplete,
}: {
  completedCount: number;
  requiredCount: number;
  isComplete: boolean;
}): React.ReactElement {
  const styles = useStyles();
  return (
    <span className={mergeClasses(styles.fraction, isComplete && styles.fractionComplete)}>
      {isComplete ? (
        <>
          <span className={styles.check}>✓</span> Complete
        </>
      ) : (
        <>
          {completedCount} of {requiredCount}
        </>
      )}
    </span>
  );
}

// ── Bar Variant ─────────────────────────────────────────────────────────────

function BarVariant({
  percentComplete,
}: {
  percentComplete: number;
  isComplete: boolean;
}): React.ReactElement {
  const styles = useStyles();
  return (
    <span className={styles.barWrap}>
      <span
        className={styles.barFill}
        style={{ width: `${percentComplete}%` }}
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percentComplete}% complete`}
      />
    </span>
  );
}

// ── Ring Variant (SVG) ──────────────────────────────────────────────────────

function RingVariant({
  percentComplete,
  isComplete,
}: {
  percentComplete: number;
  isComplete: boolean;
}): React.ReactElement {
  const RADIUS = 16;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - percentComplete / 100);

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx="20"
        cy="20"
        r={RADIUS}
        fill="none"
        stroke={HBC_SURFACE_LIGHT['surface-2']}
        strokeWidth="3"
      />
      {/* Fill */}
      <circle
        cx="20"
        cy="20"
        r={RADIUS}
        fill="none"
        stroke={isComplete ? HBC_STATUS_COLORS.success : HBC_PRIMARY_BLUE}
        strokeWidth="3"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
      {/* Center label */}
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fontSize="10"
        fill={HBC_SURFACE_LIGHT['text-muted']}
      >
        {isComplete ? '✓' : `${percentComplete}%`}
      </text>
    </svg>
  );
}
