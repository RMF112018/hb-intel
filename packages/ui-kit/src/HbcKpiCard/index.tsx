/**
 * HbcKpiCard — KPI metric card with trend + click-to-filter
 * PH4.7 §7.3 | Blueprint §1d
 *
 * Standalone KPI card extracted from ToolLandingLayout inline rendering.
 * Supports trend arrows, click-to-filter active state, and Field Mode.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HBC_PRIMARY_BLUE, HBC_STATUS_COLORS } from '../theme/tokens.js';
import { hbcTypeScale } from '../theme/typography.js';
import { HBC_RADIUS_XL } from '../theme/radii.js';
import { elevationLevel2 } from '../theme/elevation.js';
import { HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcKpiCardProps } from './types.js';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    position: 'relative',
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: '20px',
    paddingRight: '20px',
    borderRadius: HBC_RADIUS_XL,
    backgroundColor: tokens.colorNeutralBackground1,
    // INS-001: Only top accent border — side/bottom borders removed to eliminate
    // visual clutter from overlapping border contexts (panel → card → hairlines).
    borderLeftStyle: 'none',
    borderRightStyle: 'none',
    borderBottomStyle: 'none',
    // INS-003: 4px pixel-aligned accent — sharp, intentional, visually impactful.
    borderTopWidth: '4px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    cursor: 'default',
    // INS-008: Transition includes box-shadow + transform for hover/active states.
    transitionProperty: 'border-color, background-color, box-shadow, transform',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease',
    // UIF-001: minWidth removed — hard floor blocked grid track shrinking and caused
    // horizontal overflow in secondary zone tiles. Grid/flex parents now control
    // card width via track sizing. overflow:hidden prevents label text from forcing
    // the card wider than its allocated track.
    // INS-005: Uniform minimum height — all cards same size for even grid rhythm.
    minHeight: '100px',
    minWidth: '0',
    overflow: 'hidden',
    flex: '1 1 0',
    maxWidth: '240px',
  },
  cardClickable: {
    cursor: 'pointer',
    // INS-008: Hover elevation with accent glow + pressed scale-down.
    ':hover': {
      boxShadow: `${elevationLevel2}, 0 0 8px 0 rgba(255,255,255,0.06)`,
    },
    ':active': {
      transform: 'scale(0.98)',
    },
  },
  cardActive: {
    // INS-001/003: Active state uses top + bottom 4px accent — no side borders.
    borderTopWidth: '4px',
    borderTopStyle: 'solid',
    borderTopColor: HBC_PRIMARY_BLUE as string,
    borderBottomWidth: '4px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_PRIMARY_BLUE as string,
    backgroundColor: tokens.colorSubtleBackgroundSelected,
  },
  label: {
    fontFamily: hbcTypeScale.label.fontFamily,
    fontSize: hbcTypeScale.label.fontSize,
    fontWeight: hbcTypeScale.label.fontWeight as string,
    lineHeight: hbcTypeScale.label.lineHeight,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  value: {
    fontFamily: hbcTypeScale.display.fontFamily,
    fontSize: '1.5rem',
    fontWeight: '700',
    lineHeight: '1.2',
    color: tokens.colorNeutralForeground1,
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
    color: tokens.colorNeutralForeground3,
  },
  // INS-007: Icon in top-right corner — subtle at rest, visible on hover.
  iconSlot: {
    position: 'absolute',
    top: `${HBC_SPACE_MD}px`,
    right: '12px',
    width: '20px',
    height: '20px',
    opacity: '0.4',
    transitionProperty: 'opacity',
    transitionDuration: TRANSITION_FAST,
    pointerEvents: 'none',
  },
  // INS-007: Icon opacity on card hover.
  cardHoverIcon: {
    opacity: '0.8',
  },
  // INS-006: Subtitle below the value — small muted descriptor text.
  subtitle: {
    fontSize: '0.625rem',
    fontWeight: '400',
    lineHeight: '1.4',
    color: tokens.colorNeutralForeground3,
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
  subtitle,
  icon,
  ariaLabel,
  onClick,
  className,
}) => {
  const styles = useStyles();
  const [isHovered, setIsHovered] = React.useState(false);

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
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      {icon && (
        <span
          className={mergeClasses(styles.iconSlot, isHovered && styles.cardHoverIcon)}
          style={color ? { color } : undefined}
        >
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      {trend && (
        <span className={mergeClasses(styles.trend, trendClass)}>
          {TREND_ARROWS[trend.direction]} {trend.label}
        </span>
      )}
    </div>
  );
};

export type { HbcKpiCardProps, KpiTrend } from './types.js';
