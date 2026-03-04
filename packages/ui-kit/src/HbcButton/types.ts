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
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
}
