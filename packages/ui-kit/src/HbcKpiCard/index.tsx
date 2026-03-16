/**
 * HbcKpiCard — KPI metric card with trend + click-to-filter
 * PH4.7 §7.3 | Blueprint §1d
 *
 * Standalone KPI card extracted from ToolLandingLayout inline rendering.
 * Supports trend arrows, click-to-filter active state, and Field Mode.
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HBC_PRIMARY_BLUE, HBC_STATUS_COLORS, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { hbcTypeScale } from '../theme/typography.js';
import { HBC_RADIUS_XL } from '../theme/radii.js';
import { HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcKpiCardProps } from './types.js';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: '20px',
    paddingRight: '20px',
    borderRadius: HBC_RADIUS_XL,
    backgroundColor: 'var(--colorNeutralBackground1)',
    border: '1px solid var(--colorNeutralStroke2)',
    borderTopWidth: '3px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--colorNeutralStroke2)',
    cursor: 'default',
    transitionProperty: 'border-color, background-color, box-shadow',
    transitionDuration: TRANSITION_FAST,
    minWidth: '160px',
    flex: '1 1 0',
    maxWidth: '240px',
  },
  cardClickable: {
    cursor: 'pointer',
    ':hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
  },
  cardActive: {
    borderTopWidth: '2px',
    borderTopStyle: 'solid',
    borderTopColor: HBC_PRIMARY_BLUE as string,
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_PRIMARY_BLUE as string,
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_PRIMARY_BLUE as string,
    borderRightWidth: '2px',
    borderRightStyle: 'solid',
    borderRightColor: HBC_PRIMARY_BLUE as string,
    backgroundColor: HBC_SURFACE_LIGHT['surface-active'],
  },
  label: {
    fontFamily: hbcTypeScale.label.fontFamily,
    fontSize: hbcTypeScale.label.fontSize,
    fontWeight: hbcTypeScale.label.fontWeight as string,
    lineHeight: hbcTypeScale.label.lineHeight,
    color: HBC_SURFACE_LIGHT['text-muted'] as string,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  value: {
    fontFamily: hbcTypeScale.display.fontFamily,
    fontSize: '1.5rem',
    fontWeight: '700',
    lineHeight: '1.2',
    color: HBC_SURFACE_LIGHT['text-primary'] as string,
  },
  trend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: hbcTypeScale.bodySmall.fontFamily,
    fontSize: hbcTypeScale.bodySmall.fontSize,
    fontWeight: hbcTypeScale.bodySmall.fontWeight as string,
    lineHeight: hbcTypeScale.bodySmall.lineHeight,
  },
  trendUp: {
    color: HBC_STATUS_COLORS.success as string,
  },
  trendDown: {
    color: HBC_STATUS_COLORS.error as string,
  },
  trendFlat: {
    color: HBC_SURFACE_LIGHT['text-muted'] as string,
  },
});

const TREND_ARROWS: Record<string, string> = {
  up: '\u25B2',
  down: '\u25BC',
  flat: '\u25B6',
};

export const HbcKpiCard: React.FC<HbcKpiCardProps> = ({
  label,
  value,
  trend,
  color,
  isActive = false,
  onClick,
  className,
}) => {
  const styles = useStyles();

  const trendClass = trend
    ? trend.direction === 'up'
      ? styles.trendUp
      : trend.direction === 'down'
        ? styles.trendDown
        : styles.trendFlat
    : undefined;

  return (
    <div
      data-hbc-ui="kpi-card"
      className={mergeClasses(
        styles.card,
        onClick ? styles.cardClickable : undefined,
        isActive ? styles.cardActive : undefined,
        className,
      )}
      style={color ? { borderTopColor: color } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {trend && (
        <span className={mergeClasses(styles.trend, trendClass)}>
          {TREND_ARROWS[trend.direction]} {trend.label}
        </span>
      )}
    </div>
  );
};

export type { HbcKpiCardProps, KpiTrend } from './types.js';
