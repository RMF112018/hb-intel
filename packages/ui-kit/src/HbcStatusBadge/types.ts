/** HbcStatusBadge — Blueprint §1d status indicators */

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
  /** Status variant determines color mapping */
  variant: StatusVariant;
  /** Display label text */
  label: string;
  /** Optional size override */
  size?: 'small' | 'medium' | 'large';
  /** Optional icon before the label */
  icon?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
