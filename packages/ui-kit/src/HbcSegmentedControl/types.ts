/**
 * HbcSegmentedControl — Governed pill-group selector
 * Composable radiogroup with HbcButton pills and keyboard navigation.
 */

export interface SegmentedOption<T extends string | number = string> {
  /** Value returned via onChange */
  value: T;
  /** Display label */
  label: string;
  /** Disable this individual option */
  disabled?: boolean;
}

export interface HbcSegmentedControlProps<T extends string | number = string> {
  /** Accessible group label (rendered visually if showLabel is true) */
  label: string;
  /** Whether to show the label text visually (default true) */
  showLabel?: boolean;
  /** Available options */
  options: SegmentedOption<T>[];
  /** Currently selected value */
  value: T;
  /** Called when the user selects a different option */
  onChange: (value: T) => void;
  /** Button size (default 'sm') */
  size?: 'sm' | 'md' | 'lg';
  /** Disable all options */
  disabled?: boolean;
  /** Additional CSS class on the wrapper */
  className?: string;
}
