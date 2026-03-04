/**
 * HbcStatusBadge — Blueprint §1d status indicators
 * V2.1 Dec 26 — Dual-channel: color + shape, never color alone
 */

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'onTrack'
  | 'atRisk'
  | 'critical'
  | 'pending'
  | 'inProgress'
  | 'completed'
  | 'draft';

export interface HbcStatusBadgeProps {
  /** Status variant determines color + icon mapping (dual-channel) */
  variant: StatusVariant;
  /** Display label text */
  label: string;
  /** Optional size override */
  size?: 'small' | 'medium' | 'large';
  /** Optional icon override — auto-injected from variant map when omitted */
  icon?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
