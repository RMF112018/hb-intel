/** HbcCommandBar — Blueprint §1d toolbar */

export interface CommandBarAction {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Visually emphasize as primary action */
  primary?: boolean;
}

export interface CommandBarFilter {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Filter is active */
  active: boolean;
  /** Toggle handler */
  onToggle: () => void;
}

export interface HbcCommandBarProps {
  /** Search box value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Filter toggle buttons */
  filters?: CommandBarFilter[];
  /** Action buttons (right side) */
  actions?: CommandBarAction[];
  /** Additional CSS class */
  className?: string;
}
