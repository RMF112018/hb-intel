/**
 * HbcHomepageCta — Homepage call-to-action types
 * Phase 11A — Shared homepage CTA primitive
 */

export type HomepageCtaVariant = 'link' | 'button';

export interface HbcHomepageCtaProps {
  /** CTA label text */
  label: string;
  /** Target URL */
  href: string;
  /** Visual variant — 'link' renders branded text link, 'button' renders filled button style */
  variant?: HomepageCtaVariant;
  /** Whether to open in new tab (adds rel="noopener noreferrer") */
  external?: boolean;
  /** Additional CSS class */
  className?: string;
}
