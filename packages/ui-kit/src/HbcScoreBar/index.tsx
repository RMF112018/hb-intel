/**
 * HbcScoreBar — Horizontal score visualization bar
 * PH4.13 §13.2 | Blueprint §1d
 *
 * Three color segments: red (0–40), amber (41–69), green (70–100).
 * Score marker positioned at the score percentage.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_GREEN,
} from '../theme/tokens.js';
import { HBC_RADIUS_LG, HBC_RADIUS_SM } from '../theme/radii.js';
import type { HbcScoreBarProps } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  track: {
    position: 'relative',
    width: '100%',
    borderRadius: HBC_RADIUS_LG,
    overflow: 'hidden',
    display: 'flex',
  },
  segmentRed: {
    width: '40%',
    backgroundColor: HBC_STATUS_RAMP_RED[50],
  },
  segmentAmber: {
    width: '29%',
    backgroundColor: HBC_STATUS_RAMP_AMBER[50],
  },
  segmentGreen: {
    width: '31%',
    backgroundColor: HBC_STATUS_RAMP_GREEN[50],
  },
  marker: {
    position: 'absolute',
    top: '-2px',
    width: '4px',
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: '#1A1D23',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  },
  label: {
    position: 'absolute',
    top: '-20px',
    transform: 'translateX(-50%)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#1A1D23',
    whiteSpace: 'nowrap',
  },
});

export function HbcScoreBar({
  score,
  showLabel = false,
  height = '12px',
  className,
}: HbcScoreBarProps): React.JSX.Element {
  const styles = useStyles();
  const clampedScore = Math.max(0, Math.min(100, score));
  const markerHeight = `calc(${height} + 4px)`;

  return (
    <div
      data-hbc-ui="score-bar"
      className={mergeClasses(styles.root, className)}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score: ${clampedScore}`}
    >
      <div className={styles.track} style={{ height }}>
        <div className={styles.segmentRed} />
        <div className={styles.segmentAmber} />
        <div className={styles.segmentGreen} />
        <div
          className={styles.marker}
          style={{ left: `${clampedScore}%`, height: markerHeight }}
        />
        {showLabel && (
          <span
            className={styles.label}
            style={{ left: `${clampedScore}%` }}
          >
            {clampedScore}
          </span>
        )}
      </div>
    </div>
  );
}

export type { HbcScoreBarProps } from './types.js';
