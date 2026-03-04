/** HbcEmptyState — Blueprint §1d zero-data states */

export interface HbcEmptyStateProps {
  /** Primary title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Icon or illustration element (preferred name) */
  icon?: React.ReactNode;
  /** @deprecated Use `icon` instead */
  illustration?: React.ReactNode;
  /** Primary call-to-action (preferred name) */
  primaryAction?: React.ReactNode;
  /** Secondary call-to-action */
  secondaryAction?: React.ReactNode;
  /** @deprecated Use `primaryAction` instead */
  action?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
