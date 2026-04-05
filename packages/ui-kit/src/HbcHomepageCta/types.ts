/**
 * HbcHomepageCta — Homepage call-to-action types
 * Phase 11A — Shared homepage CTA primitive
 * Phase 12B-02 — Added size prop for hero-level CTA prominence
 */

export type HomepageCtaVariant = 'link' | 'button' | 'secondary';
export type HomepageCtaSize = 'default' | 'large';

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
  /**
   * Size:
   * - `'default'` — standard padding for editorial and utility surfaces
   * - `'large'` — increased padding and font size for hero-level prominence
   */
  size?: HomepageCtaSize;
  /** Whether to open in new tab (adds rel="noopener noreferrer") */
  external?: boolean;
  /** Show trailing arrow indicator (→) */
  arrow?: boolean;
  /** Additional CSS class */
  className?: string;
}
