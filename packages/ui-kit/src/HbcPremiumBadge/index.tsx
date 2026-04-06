/**
 * HbcPremiumBadge — Premium status indicator with icon + label
 * Phase 16-02 — Shared premium primitive rebuild
 *
 * Stronger status expression than text-only badges. Uses lucide icons
 * for dual-channel encoding (color + shape) and cva for variant control.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import styles from './badge.module.css';

const badge = cva(styles.base, {
  variants: {
    status: {
      success: styles.success,
      warning: styles.warning,
      critical: styles.critical,
      info: styles.info,
      pending: styles.pending,
      neutral: styles.neutral,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
    },
  },
  defaultVariants: {
    status: 'info',
    size: 'md',
  },
});

export type PremiumBadgeStatus = 'success' | 'warning' | 'critical' | 'info' | 'pending' | 'neutral';
export type PremiumBadgeSize = 'sm' | 'md';

const STATUS_ICON: Record<PremiumBadgeStatus, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertCircle,
  info: Info,
  pending: Clock,
  neutral: Circle,
};

export interface HbcPremiumBadgeProps extends VariantProps<typeof badge> {
  label: string;
  className?: string;
}

export function HbcPremiumBadge({
  label,
  status,
  size,
  className,
}: HbcPremiumBadgeProps): React.JSX.Element {
  const resolvedStatus = status ?? 'info';
  const IconComponent = STATUS_ICON[resolvedStatus];
  const iconPx = size === 'sm' ? 11 : 13;

  return (
    <span
      className={clsx(badge({ status, size }), className)}
      data-hbc-premium="badge"
      data-hbc-status={resolvedStatus}
    >
      <IconComponent size={iconPx} strokeWidth={2.5} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
