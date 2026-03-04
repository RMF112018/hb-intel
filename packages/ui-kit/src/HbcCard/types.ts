/**
 * HbcCard — Surface card component types
 * PH4.8 §Step 3 | Blueprint §1d
 */

export interface HbcCardProps {
  /** Card body content */
  children: React.ReactNode;
  /** Optional header content (rendered above body with border divider) */
  header?: React.ReactNode;
  /** Optional footer content (rendered below body with border divider) */
  footer?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
