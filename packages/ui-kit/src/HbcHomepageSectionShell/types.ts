/**
 * HbcHomepageSectionShell — Homepage section wrapper types
 * Phase 11A-02 — Production-grade section primitive
 */

export interface HbcHomepageSectionShellProps {
  /** Section title rendered as h2 */
  title: string;
  /** Optional subtitle rendered below title in muted style */
  subtitle?: string;
  /** Optional introductory text paragraph */
  intro?: string;
  /** Optional trailing action in the header (e.g., "See all" CTA) */
  headerAction?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
