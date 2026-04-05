/**
 * HbcHomepageSectionShell — Homepage section wrapper types
 * Phase 11A — Shared homepage section primitive
 */

export interface HbcHomepageSectionShellProps {
  /** Section title rendered as h2 */
  title: string;
  /** Optional subtitle rendered below title */
  subtitle?: string;
  /** Optional introductory text paragraph */
  intro?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
