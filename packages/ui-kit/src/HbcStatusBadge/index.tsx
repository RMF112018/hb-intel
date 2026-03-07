/**
 * HbcStatusBadge — Consistent status indicators (V2.1 dual-channel)
 * Blueprint §1d — status variant → semantic color + mandatory shape icon
 * PH4.6 §Step 1 — Dual-channel: color + shape, never color alone (V2.1 Dec 26)
 * PH4.12 §Step 7 — animate prop: crossfade + pulse on variant change
 * D-PH4C-12 / PH4C.6 — tokenized high-contrast status classes with forced-colors support.
 */
import * as React from 'react';
import { Badge, makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import { TIMING, keyframes as kf } from '../theme/animations.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import {
  StatusCompleteIcon,
  StatusAttentionIcon,
  StatusOverdueIcon,
  StatusInfoIcon,
  StatusDraftIcon,
} from '../icons/index.js';
import type { HbcStatusBadgeProps, StatusVariant } from './types.js';

type StatusStyleKey = 'active' | 'pending' | 'atRisk' | 'complete' | 'inactive' | 'warning' | 'draft' | 'approved';

/**
 * PH4C.6 semantic mapping from legacy UI-kit variants to the normalized
 * eight-status palette used for token-based classes and high-contrast behavior.
 */
const VARIANT_TO_STATUS_STYLE: Record<StatusVariant, StatusStyleKey> = {
  success: 'approved',
  warning: 'warning',
  error: 'atRisk',
  info: 'draft',
  neutral: 'inactive',
  onTrack: 'active',
  atRisk: 'atRisk',
  critical: 'atRisk',
  pending: 'pending',
  inProgress: 'draft',
  completed: 'complete',
  draft: 'draft',
};

/**
 * V2.1 dual-channel icon map: each variant gets a distinct shape
 * so status is conveyed by both color AND shape (accessible in grayscale).
 */
const STATUS_ICON_MAP: Record<StatusVariant, React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }>> = {
  success: StatusCompleteIcon,
  onTrack: StatusCompleteIcon,
  completed: StatusCompleteIcon,
  warning: StatusAttentionIcon,
  atRisk: StatusAttentionIcon,
  error: StatusOverdueIcon,
  critical: StatusOverdueIcon,
  info: StatusInfoIcon,
  inProgress: StatusInfoIcon,
  neutral: StatusDraftIcon,
  pending: StatusDraftIcon,
  draft: StatusDraftIcon,
};

/**
 * PH4C.6 / D-PH4C-12:
 * Tokenized status classes with explicit forced-colors handling for Windows High Contrast.
 * Mapping intentionally mirrors docs/architecture/plans/PH4C.6-HighContrast-StatusBadge.md §4C.6.2.
 */
const useStatusStyles = makeStyles({
  // Active + Approved share green semantics but remain separate traceable classes.
  active: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'solid', 'ButtonText'),
    },
  },
  pending: {
    backgroundColor: tokens.colorPaletteYellowBackground3,
    color: tokens.colorNeutralForeground1,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'solid', 'ButtonText'),
    },
  },
  atRisk: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '600',
    '@media (forced-colors: active)': {
      backgroundColor: 'HighlightText',
      color: 'Highlight',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'solid', 'Highlight'),
    },
  },
  complete: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'solid', 'ButtonText'),
    },
  },
  inactive: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    fontWeight: '400',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'GrayText',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'solid', 'GrayText'),
      opacity: '0.6',
    },
  },
  warning: {
    // Fluent token set exposes DarkOrangeBackground3 (no OrangeBackground3 token in this build).
    backgroundColor: tokens.colorPaletteDarkOrangeBackground3,
    color: tokens.colorNeutralForeground1,
    fontWeight: '600',
    '@media (forced-colors: active)': {
      backgroundColor: 'HighlightText',
      color: 'Highlight',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'solid', 'Highlight'),
    },
  },
  draft: {
    // Fluent token set exposes BlueBackground2 (no LightBlueBackground3 token in this build).
    backgroundColor: tokens.colorPaletteBlueBackground2,
    color: tokens.colorNeutralForeground1,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'dashed', 'ButtonText'),
    },
  },
  approved: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      ...shorthands.border('1px', 'solid', 'ButtonText'),
    },
  },
});

const useStyles = makeStyles({
  badge: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  animating: {
    animationName: {
      '0%': { transform: 'scale(1)', opacity: 0.7 },
      '50%': { transform: 'scale(1.1)', opacity: 1 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    animationDuration: TIMING.badgePulse,
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'forwards',
  },
  reducedMotionAnimating: {
    animationName: kf.crossfade,
    animationDuration: TIMING.crossfade,
    animationFillMode: 'forwards',
  },
});

export const HbcStatusBadge: React.FC<HbcStatusBadgeProps> = ({
  variant,
  label,
  size = 'medium',
  icon,
  animate = false,
  className,
}) => {
  const styles = useStyles();
  const statusStyles = useStatusStyles();
  const prefersReduced = usePrefersReducedMotion();
  const statusKey = VARIANT_TO_STATUS_STYLE[variant];

  // Track previous variant to detect changes
  const prevVariantRef = React.useRef(variant);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (animate && prevVariantRef.current !== variant) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevVariantRef.current = variant;
      return () => clearTimeout(timer);
    }
    prevVariantRef.current = variant;
  }, [variant, animate]);

  // Auto-inject icon from variant map when not explicitly provided
  const IconComponent = STATUS_ICON_MAP[variant];
  const resolvedIcon = icon ?? <IconComponent size="sm" color="currentColor" />;

  return (
    <Badge
      data-hbc-ui="status-badge"
      data-hbc-status={variant}
      className={mergeClasses(
        styles.badge,
        statusStyles[statusKey],
        isAnimating && !prefersReduced && styles.animating,
        isAnimating && prefersReduced && styles.reducedMotionAnimating,
        className,
      )}
      size={size}
      icon={resolvedIcon as React.JSX.Element}
      appearance="filled"
      aria-label={`${variant}: ${label}`}
    >
      {label}
    </Badge>
  );
};

export type { HbcStatusBadgeProps, StatusVariant } from './types.js';
