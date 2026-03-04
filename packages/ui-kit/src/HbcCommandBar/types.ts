/**
 * HbcCommandBar — Blueprint §1d toolbar
 * PH4.6 §Step 10 — saved views + density control
 */

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

// PH4.6 §Step 10 — Saved views

export type SavedViewScope = 'personal' | 'project' | 'organization';

export interface SavedView {
  /** Unique identifier */
  id: string;
  /** View display name */
  name: string;
  /** Scope tier (V2.1 Dec 14) */
  scope: SavedViewScope;
  /** Currently active view */
  isActive?: boolean;
}

// PH4.6 §Step 10 — Density tiers (V2.1 Dec 23)

export type DensityTier = 'compact' | 'standard' | 'touch';

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
  /** Three-tier saved views (V2.1 Dec 14) */
  savedViews?: SavedView[];
  /** Saved view change handler */
  onViewChange?: (viewId: string) => void;
  /** Save current view handler */
  onViewSave?: () => void;
  /** Density tier override (V2.1 Dec 23) */
  densityTier?: DensityTier;
  /** Density change handler */
  onDensityChange?: (tier: DensityTier) => void;
  /** Column configurator trigger slot */
  columnConfigTrigger?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
