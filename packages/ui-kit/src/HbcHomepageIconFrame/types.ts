/**
 * HbcHomepageIconFrame — Homepage icon container types
 * Phase 11A-02 — Production-grade icon primitive
 */

export type IconFrameSize = 'sm' | 'md' | 'lg';
export type IconFrameTint = 'brand' | 'neutral' | 'subtle';

export interface HbcHomepageIconFrameProps {
  /** Icon content (typically an SVG or icon component) */
  children: React.ReactNode;
  /** Frame size — sm: 28px, md: 36px, lg: 44px */
  size?: IconFrameSize;
  /** Color tint for the frame background and icon color */
  tint?: IconFrameTint;
  /** Accessible label — when provided, renders role="img" with aria-label */
  label?: string;
  /** Additional CSS class */
  className?: string;
}
