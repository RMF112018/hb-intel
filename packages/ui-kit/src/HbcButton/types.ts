/**
 * HbcButton — PH4.6 §Step 6
 * Branded button variants with touch auto-scale
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface HbcButtonProps {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size (auto-bumped on coarse pointer devices) */
  size?: ButtonSize;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Icon position relative to children */
  iconPosition?: 'before' | 'after';
  /** Show loading spinner, disables interaction */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full-width button */
  fullWidth?: boolean;
  /** Toggle/pressed state for filter or toggle buttons (sets aria-pressed) */
  pressed?: boolean;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline style overrides (use sparingly — prefer className) */
  style?: React.CSSProperties;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
}
