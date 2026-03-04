/**
 * HbcStatusBadge — Consistent status indicators (V2.1 dual-channel)
 * Blueprint §1d — status variant → semantic color + mandatory shape icon
 * PH4.6 §Step 1 — Dual-channel: color + shape, never color alone (V2.1 Dec 26)
 */
import * as React from 'react';
import { Badge, mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HBC_STATUS_COLORS } from '../theme/tokens.js';
import {
  StatusCompleteIcon,
  StatusAttentionIcon,
  StatusOverdueIcon,
  StatusInfoIcon,
  StatusDraftIcon,
} from '../icons/index.js';
import type { HbcStatusBadgeProps, StatusVariant } from './types.js';

const STATUS_COLOR_MAP: Record<StatusVariant, string> = {
  success: HBC_STATUS_COLORS.success,
  warning: HBC_STATUS_COLORS.warning,
  error: HBC_STATUS_COLORS.error,
  info: HBC_STATUS_COLORS.info,
  neutral: HBC_STATUS_COLORS.neutral,
  onTrack: HBC_STATUS_COLORS.onTrack,
  atRisk: HBC_STATUS_COLORS.atRisk,
  critical: HBC_STATUS_COLORS.critical,
  pending: HBC_STATUS_COLORS.pending,
  inProgress: HBC_STATUS_COLORS.inProgress,
  completed: HBC_STATUS_COLORS.completed,
  draft: HBC_STATUS_COLORS.draft,
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

const useStyles = makeStyles({
  badge: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
});

export const HbcStatusBadge: React.FC<HbcStatusBadgeProps> = ({
  variant,
  label,
  size = 'medium',
  icon,
  className,
}) => {
  const styles = useStyles();
  const color = STATUS_COLOR_MAP[variant];

  // Auto-inject icon from variant map when not explicitly provided
  const IconComponent = STATUS_ICON_MAP[variant];
  const resolvedIcon = icon ?? <IconComponent size="sm" color="#FFFFFF" />;

  return (
    <Badge
      data-hbc-ui="status-badge"
      data-hbc-status={variant}
      className={mergeClasses(styles.badge, className)}
      size={size}
      icon={resolvedIcon as React.JSX.Element}
      appearance="filled"
      color="brand"
      style={{ backgroundColor: color }}
      aria-label={`${variant}: ${label}`}
    >
      {label}
    </Badge>
  );
};

export type { HbcStatusBadgeProps, StatusVariant } from './types.js';
