/**
 * Project Hub Layout Family — type contracts.
 *
 * Three governed layout families, resolved from role + context + device.
 * All families share a common slot/region contract so they compose inside
 * the same WorkspacePageShell + route structure without route fragmentation.
 *
 * Governing specs:
 *   02 + 03 → project-operating (canvas + command rail merged)
 *   05      → executive (health/risk cockpit)
 *   07      → field-tablet (split-pane hub)
 */

import type { ReactNode } from 'react';

// ── Layout Family Identifiers ───────────────────────────────────────

/**
 * The three governed layout families.
 *
 * - `project-operating`: PM/PE/Superintendent daily work surface.
 *   Merges 02 (canvas-first) and 03 (command rail) into one family
 *   because both serve the same role set, share the same route, and
 *   differ only in layout emphasis (canvas vs. module posture list).
 *
 * - `executive`: Portfolio executive / leadership intervention surface.
 *   Oriented toward watchlist-driven health assessment and risk
 *   intervention, not daily operational work.
 *
 * - `field-tablet`: Superintendent / field engineer tablet surface.
 *   Location-first paradigm with split-pane (area + action stack),
 *   touch-density defaults, and always-visible quick-action bar.
 */
export type ProjectHubLayoutFamily =
  | 'project-operating'
  | 'executive'
  | 'field-tablet';

// ── Slot/Region Contracts ───────────────────────────────────────────

/**
 * Region identifiers shared across all layout families.
 * Every family renders a subset of these regions; unused regions
 * are simply omitted (not rendered as empty containers).
 */
export type ProjectHubRegionId =
  | 'header'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom';

/**
 * Content provided for a single region slot.
 * Regions are optional — a family may or may not render a given region.
 */
export interface ProjectHubRegionSlot {
  /** Region identifier. */
  readonly region: ProjectHubRegionId;
  /** React content to render in this region. */
  readonly content: ReactNode;
  /** Whether the region should be collapsible (rail panels). */
  readonly collapsible?: boolean;
  /** Default collapsed state. Ignored when collapsible is false. */
  readonly defaultCollapsed?: boolean;
}

/**
 * Complete slot map for a layout family instance.
 * Keys are region IDs; values are the content to render.
 * Regions omitted from the map are not rendered.
 */
export type ProjectHubSlotMap = Partial<Record<ProjectHubRegionId, ProjectHubRegionSlot>>;

// ── Layout Family Definition ────────────────────────────────────────

/**
 * Semantic role describing what a region contains in a given family.
 * Used for documentation and accessibility — not for rendering logic.
 */
export type ProjectHubRegionRole =
  | 'project-context'    // header: project name, phase, health, search
  | 'command-rail'       // left: module posture list (project-operating)
  | 'canvas'             // center: tile grid (project-operating)
  | 'control-center'     // center: summary + KPI + decisions (project-operating)
  | 'watchlist'          // left: project/signal watchlist (executive)
  | 'risk-canvas'        // center: health/risk zones (executive)
  | 'intervention-rail'  // right: escalate/assign actions (executive)
  | 'area-sheet'         // left: location/sheet pane (field-tablet)
  | 'action-stack'       // right: field work cards (field-tablet)
  | 'quick-action-bar'   // bottom: field capture actions (field-tablet)
  | 'context-rail'       // right: next moves, related records (project-operating)
  | 'activity-strip'     // bottom: timeline/decisions (project-operating, executive)
  | 'trend-zone';        // bottom: trend lines (executive)

/**
 * Describes one region within a layout family definition.
 */
export interface ProjectHubRegionDefinition {
  readonly region: ProjectHubRegionId;
  readonly role: ProjectHubRegionRole;
  readonly required: boolean;
  readonly collapsible: boolean;
  readonly defaultCollapsed: boolean;
}

/**
 * Static definition of a layout family.
 * Describes which regions it uses and what semantic role each serves.
 */
export interface ProjectHubLayoutFamilyDefinition {
  readonly family: ProjectHubLayoutFamily;
  readonly label: string;
  readonly description: string;
  readonly regions: readonly ProjectHubRegionDefinition[];
}

// ── Resolution Inputs ───────────────────────────────────────────────

/**
 * Device posture detected from viewport and input characteristics.
 * Drives layout family resolution together with role.
 */
export type ProjectHubDevicePosture =
  | 'desktop'
  | 'tablet'
  | 'field-tablet';

/**
 * Authority role for layout family resolution.
 * Mapped from the app-level auth role, not a 1:1 pass-through.
 */
export type ProjectHubLayoutRole =
  | 'project-manager'
  | 'project-executive'
  | 'portfolio-executive'
  | 'superintendent'
  | 'field-engineer'
  | 'leadership';

/**
 * Inputs to the layout family resolver.
 */
export interface ProjectHubLayoutResolutionInput {
  readonly role: ProjectHubLayoutRole;
  readonly devicePosture: ProjectHubDevicePosture;
  /** Explicit user override — only allowed within role-governance bounds. */
  readonly userOverride?: ProjectHubLayoutFamily | null;
}

/**
 * Result of layout family resolution.
 */
export interface ProjectHubLayoutResolutionResult {
  readonly family: ProjectHubLayoutFamily;
  readonly definition: ProjectHubLayoutFamilyDefinition;
  /** True when the resolved family differs from what the user requested. */
  readonly overrideRejected: boolean;
  /** Reason the override was rejected, if applicable. */
  readonly overrideRejectionReason?: string;
}

// ── Summary Adapter Contracts ───────────────────────────────────────

/**
 * Module posture summary — consumed by command rail and canvas tiles.
 * Every module surfaces this contract regardless of layout family.
 */
export interface ProjectHubModulePostureSummary {
  readonly moduleSlug: string;
  readonly label: string;
  readonly posture: 'healthy' | 'watch' | 'at-risk' | 'critical' | 'no-data' | 'read-only';
  readonly issueCount: number;
  readonly actionCount: number;
  readonly owner: string | null;
  readonly lastUpdated: string | null;
}

/**
 * Work queue summary — consumed by action rails and next-move panels.
 */
export interface ProjectHubWorkQueueSummary {
  readonly totalItems: number;
  readonly urgentItems: number;
  readonly overdueItems: number;
  readonly items: readonly ProjectHubWorkQueueItem[];
}

export interface ProjectHubWorkQueueItem {
  readonly id: string;
  readonly title: string;
  readonly sourceModule: string;
  readonly owner: string;
  readonly urgency: 'urgent' | 'standard' | 'low';
  readonly dueDate: string | null;
  readonly aging: number | null;
}

/**
 * Next-move summary — consumed by context rails and action stacks.
 */
export interface ProjectHubNextMoveSummary {
  readonly items: readonly ProjectHubNextMoveItem[];
}

export interface ProjectHubNextMoveItem {
  readonly id: string;
  readonly title: string;
  readonly sourceModule: string;
  readonly owner: string;
  readonly action: string;
  readonly priority: 'critical' | 'high' | 'standard';
}

/**
 * Related-items summary — consumed by context rails.
 */
export interface ProjectHubRelatedItemsSummary {
  readonly items: readonly ProjectHubRelatedItem[];
}

export interface ProjectHubRelatedItem {
  readonly id: string;
  readonly title: string;
  readonly sourceModule: string;
  readonly relationship: string;
  readonly status: string;
}

/**
 * Activity/timeline summary — consumed by activity strips and trend zones.
 */
export interface ProjectHubActivitySummary {
  readonly entries: readonly ProjectHubActivityEntry[];
}

export interface ProjectHubActivityEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly type: 'decision' | 'milestone' | 'escalation' | 'publication' | 'blocker' | 'handoff' | 'state-change';
  readonly title: string;
  readonly sourceModule: string;
  readonly actor: string | null;
}
