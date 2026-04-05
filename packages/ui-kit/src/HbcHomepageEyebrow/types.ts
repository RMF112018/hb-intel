/**
 * HbcHomepageEyebrow — Editorial kicker/metadata types
 * Phase 12B-02 — Top-band editorial hierarchy primitive
 */

export type EyebrowTone = 'default' | 'muted' | 'on-dark';

export interface HbcHomepageEyebrowProps {
  /** Eyebrow text content */
  children: React.ReactNode;
  /**
   * Color tone:
   * - `'default'` — neutral foreground (standard light surfaces)
   * - `'muted'` — reduced-emphasis foreground
   * - `'on-dark'` — white text for use on gradient/dark backgrounds (hero banner)
   */
  tone?: EyebrowTone;
  /** Additional CSS class */
  className?: string;
}
