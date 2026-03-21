/**
 * HbcCommandBar — Blueprint §1d toolbar
 * PH4.6 §Step 10 — saved views + density control
 *
 * PH4B.2 §Step 1 — DensityTier re-exported from @hbc/models
 */
import type { DensityTier } from '@hbc/models';

// Re-export for backward compat
export type { DensityTier };

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
  /** Renders as danger-styled button (red). PH4B.4 §4b.4.1 */
  isDestructive?: boolean;
  /** Tooltip text shown on hover. PH4B.4 §4b.4.1 */
  tooltip?: string;
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
  /** Item count badge. Omit or undefined to hide. (UIF-012) */
  count?: number;
  /** Urgency level for badge accent color. Default: 'neutral'. (UIF-012) */
  urgency?: 'error' | 'warning' | 'neutral';
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

/** UIF-010: Mutually exclusive grouping control. Radio semantics via aria-pressed + radiogroup wrapper. */
export interface CommandBarGrouping {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** This grouping is currently active */
  active: boolean;
  /** Selection handler */
  onSelect: () => void;
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
  /** Overflow menu actions — rendered in "More" popover. PH4B.4 §4b.4.2 */
  overflowActions?: CommandBarAction[];
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
  /** Mutually exclusive grouping controls. Rendered as a radiogroup of toggle buttons. (UIF-010) */
  groupings?: CommandBarGrouping[];
  /** Additional CSS class */
  className?: string;
}
