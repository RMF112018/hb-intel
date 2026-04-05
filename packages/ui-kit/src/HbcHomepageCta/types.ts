/**
 * HbcHomepageCta — Homepage call-to-action types
 * Phase 11A — Shared homepage CTA primitive
 */

export type HomepageCtaVariant = 'link' | 'button' | 'secondary';

export interface HbcHomepageCtaProps {
  /** CTA label text */
  label: string;
  /** Target URL */
  href: string;
  /**
   * Visual variant:
   * - `'link'` — branded text link with underline on hover (default)
   * - `'button'` — filled brand-colored button
   * - `'secondary'` — outlined button with brand border
   */
  variant?: HomepageCtaVariant;
  /** Whether to open in new tab (adds rel="noopener noreferrer") */
  external?: boolean;
  /** Show trailing arrow indicator (→) */
  arrow?: boolean;
  /** Additional CSS class */
  className?: string;
}
