/**
 * HbcHomepageSectionShell — Homepage section wrapper types
 * Phase 11A-02 — Production-grade section primitive
 * Phase 15-02 — Added accent prop for zone-aware header treatment
 */

export type SectionAccent = 'brand' | 'warm' | 'neutral';

export interface HbcHomepageSectionShellProps {
  /** Section title rendered as h2 */
  title: string;
  /** Optional subtitle rendered below title in muted style */
  subtitle?: string;
  /** Optional introductory text paragraph */
  intro?: string;
  /** Optional trailing action in the header (e.g., "See all" CTA) */
  headerAction?: React.ReactNode;
  /**
   * Header accent treatment:
   * - 'brand' — blue bottom accent bar (default)
   * - 'warm' — orange bottom accent bar
   * - 'neutral' — subtle gray bottom accent bar
   */
  accent?: SectionAccent;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
