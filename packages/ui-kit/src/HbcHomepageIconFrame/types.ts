/**
 * HbcHomepageIconFrame — Homepage icon container types
 * Phase 11A-02 — Production-grade icon primitive
 * Phase 15-02 — Added xl size and accent/warm tints for premium surfaces
 */

export type IconFrameSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconFrameTint = 'brand' | 'neutral' | 'subtle' | 'accent' | 'warm';

export interface HbcHomepageIconFrameProps {
  /** Icon content (typically an SVG or icon component) */
  children: React.ReactNode;
  /** Frame size — sm: 28px, md: 36px, lg: 44px, xl: 56px */
  size?: IconFrameSize;
  /**
   * Color tint for the frame background and icon color:
   * - brand: primary blue tint (default)
   * - neutral: gray background
   * - subtle: minimal background
   * - accent: strong brand blue for command/utility surfaces
   * - warm: orange-tinted for editorial/discovery surfaces
   */
  tint?: IconFrameTint;
  /** Accessible label — when provided, renders role="img" with aria-label */
  label?: string;
  /** Additional CSS class */
  className?: string;
}
