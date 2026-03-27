/**
 * Multi-Column Layout — generic type contracts for rail/strip/slot composition.
 *
 * These types support responsive multi-column layouts with collapsible
 * left/right rails, a center content area, and an optional bottom strip.
 * All visual primitives built on these contracts use HBC_* tokens exclusively.
 */

import type { ReactNode } from 'react';

// ── Multi-Column Layout ─────────────────────────────────────────────

/** Region identifiers for the multi-column grid. */
export type MultiColumnRegionId = 'left' | 'center' | 'right' | 'bottom';

/** Configuration for a single column/region in the grid. */
export interface MultiColumnRegionConfig {
  /** Width in pixels when expanded. Center is always `1fr`. */
  readonly width?: number;
  /** Whether the region can be collapsed. */
  readonly collapsible?: boolean;
  /** Width in pixels when collapsed (icon-only rail). */
  readonly collapsedWidth?: number;
  /** Whether the region starts collapsed. */
  readonly defaultCollapsed?: boolean;
  /** Whether the region is hidden below the tablet breakpoint. */
  readonly hideOnTablet?: boolean;
  /** Whether the region is hidden below the mobile breakpoint. */
  readonly hideOnMobile?: boolean;
}

/** Configuration for the entire multi-column layout. */
export interface MultiColumnLayoutConfig {
  readonly left?: MultiColumnRegionConfig;
  readonly right?: MultiColumnRegionConfig;
  readonly bottom?: MultiColumnRegionConfig;
}

/** Props for the generic MultiColumnLayout component. */
export interface MultiColumnLayoutProps {
  /** Configuration for column widths and collapse behavior. */
  readonly config: MultiColumnLayoutConfig;
  /** Left region content (nav rail, watchlist, focus rail). */
  readonly leftSlot?: ReactNode;
  /** Center region content (canvas, risk canvas, action stack). */
  readonly centerSlot: ReactNode;
  /** Right region content (context rail, intervention rail). */
  readonly rightSlot?: ReactNode;
  /** Bottom region content (activity strip, quick action bar). */
  readonly bottomSlot?: ReactNode;
  /** Test ID for the root element. */
  readonly testId?: string;
}

// ── Nav Rail ────────────────────────────────────────────────────────

/** Posture/status indicator for a nav rail item. */
export type NavRailItemStatus =
  | 'healthy'
  | 'watch'
  | 'at-risk'
  | 'critical'
  | 'no-data'
  | 'read-only'
  | 'review-only'
  | 'escalates';

/** A single item in a collapsible nav rail. */
export interface NavRailItem {
  readonly id: string;
  readonly label: string;
  readonly status: NavRailItemStatus;
  readonly issueCount: number;
  readonly actionCount: number;
  readonly sublabel?: string;
}

/** Props for the generic HbcNavRail component. */
export interface HbcNavRailProps {
  readonly items: readonly NavRailItem[];
  readonly selectedItemId: string | null;
  readonly onSelectItem: (id: string | null) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly title?: string;
  readonly testId?: string;
}

// ── Activity Strip ──────────────────────────────────────────────────

/** A single entry in a timeline/activity strip. */
export interface ActivityStripEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly type: string;
  readonly title: string;
  readonly source: string;
  readonly actor: string | null;
}

/** Props for the generic HbcActivityStrip component. */
export interface HbcActivityStripProps {
  readonly entries: readonly ActivityStripEntry[];
  readonly defaultCollapsed?: boolean;
  readonly typeLabels?: Readonly<Record<string, string>>;
  readonly typeColors?: Readonly<Record<string, string>>;
  readonly testId?: string;
}

// ── Quick Action Bar ────────────────────────────────────────────────

/** A single action in a persistent touch-safe toolbar. */
export interface QuickAction {
  readonly id: string;
  readonly label: string;
  readonly available: boolean;
  readonly unavailableLabel?: string;
}

/** Props for the generic HbcQuickActionBar component. */
export interface HbcQuickActionBarProps {
  readonly actions: readonly QuickAction[];
  readonly onAction: (actionId: string) => void;
  readonly testId?: string;
}

// ── Sync Status Bar ─────────────────────────────────────────────────

/** Sync state for the status bar. */
export type SyncState = 'synced' | 'syncing' | 'pending' | 'failed';

/** Props for the generic HbcSyncStatusBar component. */
export interface HbcSyncStatusBarProps {
  readonly state: SyncState;
  readonly pendingCount: number;
  readonly failedCount: number;
  readonly lastSyncLabel: string;
  readonly testId?: string;
}
