/** HbcEmptyState — Blueprint §1d zero-data states */

export interface HbcEmptyStateProps {
  /** Primary title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional illustration element (icon, image, or SVG) */
  illustration?: React.ReactNode;
  /** Optional call-to-action button or element */
  action?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
