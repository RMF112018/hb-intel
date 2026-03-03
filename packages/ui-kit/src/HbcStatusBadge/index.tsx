/**
 * HbcStatusBadge — Consistent status indicators
 * Blueprint §1d — status variant → semantic color mapping, Fluent Badge base
 */
import * as React from 'react';
import { Badge, mergeClasses } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_STATUS_COLORS } from '../theme/tokens.js';
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

const useStyles = makeStyles({
  badge: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
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

  return (
    <Badge
      data-hbc-ui="status-badge"
      data-hbc-status={variant}
      className={mergeClasses(styles.badge, className)}
      size={size}
      icon={icon as React.JSX.Element | undefined}
      appearance="filled"
      color="brand"
      style={{ backgroundColor: color }}
    >
      {label}
    </Badge>
  );
};

export type { HbcStatusBadgeProps, StatusVariant } from './types.js';
