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
  // UIF-045-addl: Adaptive density — padding, gap, and min-height scale with viewport.
  // Narrow cards get tighter spacing; wide cards get breathing room.
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(3px, 1vw, 6px)',
    position: 'relative',
    paddingTop: 'clamp(10px, 2vw, 14px)',
    paddingBottom: 'clamp(10px, 2vw, 14px)',
    paddingLeft: 'clamp(10px, 3vw, 20px)',
    paddingRight: 'clamp(10px, 3vw, 20px)',
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
    minHeight: 'clamp(80px, 12vw, 100px)',
    minWidth: '0',
    overflow: 'hidden',
    flex: '1 1 0',
    // UIF-041-addl: maxWidth removed — grid/flex parents control card width.
  },
  cardClickable: {
    cursor: 'pointer',
    // UIF-019-addl (THA-003): Removed white glow; uses standard elevation only.
    ':hover': {
      boxShadow: elevationLevel2,
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
  // UIF-042-addl: Label with truncation for narrow cards.
  label: {
    fontFamily: hbcTypeScale.label.fontFamily,
    fontSize: hbcTypeScale.label.fontSize,
    fontWeight: hbcTypeScale.label.fontWeight as string,
    lineHeight: hbcTypeScale.label.lineHeight,
    color: tokens.colorNeutralForeground2,
    letterSpacing: '0.02em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // UIF-042-addl: Adaptive value font — clamp scales between 20px (narrow cards)
  // and 28px (wide cards) using viewport-relative intermediate. Falls back to
  // 1.75rem in browsers without clamp() support.
  value: {
    fontFamily: hbcTypeScale.display.fontFamily,
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: '700',
    lineHeight: '1.2',
    color: tokens.colorNeutralForeground1,
  },
  // UIF-045-addl: Trend pill with adaptive max-width — truncates label text at
  // narrow widths while keeping the direction arrow visible.
  trend: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontFamily: hbcTypeScale.bodySmall.fontFamily,
    fontSize: '0.6875rem',
    fontWeight: '600',
    lineHeight: '1',
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: '10px',
    alignSelf: 'flex-start',
    maxWidth: 'clamp(40px, 10vw, 120px)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  trendUp: {
    color: HBC_STATUS_COLORS.success as string,
    backgroundColor: `${HBC_STATUS_COLORS.success}18`,
  },
  trendDown: {
    color: HBC_STATUS_COLORS.error as string,
    backgroundColor: `${HBC_STATUS_COLORS.error}18`,
  },
  trendFlat: {
    color: tokens.colorNeutralForeground3,
    backgroundColor: tokens.colorNeutralBackground3,
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
  // UIF-042-addl: Subtitle with truncation — graceful at narrow card widths.
  subtitle: {
    ...hbcTypeScale.label,
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

// UIF-041-addl: Simpler arrow characters for pill badge — less heavy than filled triangles.
const TREND_ARROWS: Record<string, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
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
      // INS-016: Gradient wash — soft color-matched "warm glow" from the top.
      // Hex suffix 14 = 8% opacity. Gradient fades to transparent at 40%.
      style={color ? {
        borderTopColor: color,
        background: `linear-gradient(180deg, ${color}14 0%, transparent 40%)`,
      } : undefined}
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
        <span
          className={mergeClasses(styles.trend, trendClass)}
          aria-label={`Trend: ${trend.direction === 'up' ? 'improving' : trend.direction === 'down' ? 'worsening' : 'no change'}`}
        >
          {TREND_ARROWS[trend.direction]} {trend.label}
        </span>
      )}
    </div>
  );
};

export type { HbcKpiCardProps, KpiTrend } from './types.js';
