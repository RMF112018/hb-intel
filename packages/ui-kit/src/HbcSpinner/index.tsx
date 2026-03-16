/**
 * HbcSpinner — Phase 4.9 Messaging & Feedback System
 * Reference: PH4.9-UI-Design-Plan.md §9 | WS1-T07
 *
 * CSS border spinner with sm/md/lg sizes.
 * Pair with useMinDisplayTime hook to prevent flash-of-spinner.
 * Respects prefers-reduced-motion: replaces rotation with a gentle pulse.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { SpinnerSize, HbcSpinnerProps } from './types.js';
import { HBC_PRIMARY_BLUE } from '../theme/index.js';

/* ── size config ─────────────────────────────────────────────── */
const SIZE_MAP: Record<SpinnerSize, { dimension: number; stroke: number }> = {
  sm: { dimension: 20, stroke: 2 },
  md: { dimension: 40, stroke: 3 },
  lg: { dimension: 64, stroke: 4 },
};

/* ── styles ──────────────────────────────────────────────────── */
const useStyles = makeStyles({
  spinner: {
    display: 'inline-block',
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderColor('transparent'),
    borderTopColor: HBC_PRIMARY_BLUE,
    ...shorthands.borderRadius('50%'),
    animationName: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    } as unknown as string,
    animationDuration: '0.8s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: {
        '0%': { opacity: '1' },
        '50%': { opacity: '0.4' },
        '100%': { opacity: '1' },
      } as unknown as string,
      animationDuration: '2s',
      animationTimingFunction: 'ease-in-out',
    },
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    ...shorthands.padding('0px'),
    ...shorthands.margin('-1px'),
    ...shorthands.overflow('hidden'),
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    ...shorthands.borderWidth('0px'),
  },
});

/* ── component ───────────────────────────────────────────────── */
export const HbcSpinner: React.FC<HbcSpinnerProps> = ({
  size = 'md',
  color,
  label = 'Loading',
  className,
}) => {
  const classes = useStyles();
  const { dimension, stroke } = SIZE_MAP[size];

  return (
    <span role="status" data-hbc-ui="spinner" className={mergeClasses(className)}>
      <span
        className={classes.spinner}
        style={{
          width: dimension,
          height: dimension,
          borderWidth: stroke,
          ...(color ? { borderTopColor: color } : {}),
        }}
      />
      <span className={classes.srOnly}>{label}</span>
    </span>
  );
};

export type { HbcSpinnerProps, SpinnerSize } from './types.js';
