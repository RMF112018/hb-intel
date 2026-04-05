/**
 * HbcHomepageIconFrame — Homepage icon container types
 * Phase 11A — Shared homepage icon primitive
 */

export type IconFrameSize = 'sm' | 'md' | 'lg';

export interface HbcHomepageIconFrameProps {
  /** Icon content (typically an SVG or icon component) */
  children: React.ReactNode;
  /** Frame size — sm: 28px, md: 36px, lg: 44px */
  size?: IconFrameSize;
  /** Accessible label — when provided, renders role="img" with aria-label */
  label?: string;
  /** Additional CSS class */
  className?: string;
}
