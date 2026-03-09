import * as React from 'react';
import { useStepProgress } from '../hooks/useStepProgress';
import type { IStepWizardConfig } from '../types/IStepWizard';

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
  const { completedCount, requiredCount, percentComplete, isComplete, isStale } =
    useStepProgress(config, item);

  return (
    <span
      className={[
        'hbc-step-progress',
        `hbc-step-progress--${variant}`,
        isComplete && 'hbc-step-progress--complete',
        isStale && 'hbc-step-progress--stale',
      ]
        .filter(Boolean)
        .join(' ')}
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
          className="hbc-step-progress__stale-indicator"
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
  return (
    <span className="hbc-step-progress__fraction">
      {isComplete ? (
        <>
          <span className="hbc-step-progress__check">✓</span> Complete
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
  return (
    <span className="hbc-step-progress__bar-wrap">
      <span
        className="hbc-step-progress__bar-fill"
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
      className="hbc-step-progress__ring"
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
        stroke="var(--hbc-color-neutral-200)"
        strokeWidth="3"
      />
      {/* Fill */}
      <circle
        cx="20"
        cy="20"
        r={RADIUS}
        fill="none"
        stroke={isComplete ? 'var(--hbc-color-success)' : 'var(--hbc-color-primary)'}
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
        fill="var(--hbc-color-neutral-700)"
      >
        {isComplete ? '✓' : `${percentComplete}%`}
      </text>
    </svg>
  );
}
