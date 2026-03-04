/**
 * HbcTypography — PH4.6 §Step 3
 * Intent-based typography wrapper types
 */

export type TypographyIntent =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'code';

export interface HbcTypographyProps {
  /** Typography intent — maps to design system type scale */
  intent: TypographyIntent;
  /** Semantic HTML element override (defaults to intent-based mapping) */
  as?: React.ElementType;
  /** Content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Color token override */
  color?: string;
  /** Truncate with ellipsis */
  truncate?: boolean;
}
