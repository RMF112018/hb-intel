/**
 * HbcSpinner — Phase 4.9 Messaging & Feedback System
 * CSS border spinner with 3 sizes.
 */

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface HbcSpinnerProps {
  /** Spinner size (default: md) */
  size?: SpinnerSize;
  /** Override spinner color (default: HBC_PRIMARY_BLUE) */
  color?: string;
  /** Screen-reader label (default: "Loading") */
  label?: string;
  /** Additional CSS class */
  className?: string;
}
