/**
 * HbcSearch — Type definitions (discriminated union)
 * PH4.10 §Step 5 | Blueprint §2c
 */

export type HbcSearchVariant = 'global' | 'local';

/** Global variant: wraps HbcGlobalSearch (does NOT re-register Cmd+K) */
export interface HbcSearchGlobalProps {
  variant: 'global';
  /** Callback when the global search button is clicked */
  onSearchOpen?: () => void;
  /** Additional CSS class */
  className?: string;
}

/** Local variant: native text input with debounced search */
export interface HbcSearchLocalProps {
  variant: 'local';
  /** Current search value */
  value: string;
  /** Debounced search callback (fires after 200ms) */
  onSearch: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** When true, uses HBC_SURFACE_FIELD dark tokens */
  isFieldMode?: boolean;
  /** Additional CSS class */
  className?: string;
}

export type HbcSearchProps = HbcSearchGlobalProps | HbcSearchLocalProps;
