/**
 * Canvas grid defaults — D-SF13-T01, D-SF13-T02
 * D-02 (role defaults), D-04 (editor constraints), D-05 (mandatory governance), D-08 (data-source)
 */

import type { DataSourceBadge, IDataSourceTooltip } from '../types/index.js';

/** Number of columns in the canvas grid layout */
export const CANVAS_GRID_COLUMNS = 12;

/** Default column span for a new tile */
export const DEFAULT_COL_SPAN = 4;

/** Default row span for a new tile */
export const DEFAULT_ROW_SPAN = 1;

// --- Role default tile-set map — D-02 ---

/** Default tile keys per role, ordered by display priority */
export const ROLE_DEFAULT_TILES: Record<string, string[]> = {
  'Superintendent': ['bic-my-items', 'active-constraints', 'project-health-pulse', 'permit-status'],
  'Project Manager': ['bic-my-items', 'project-health-pulse', 'pending-approvals', 'active-constraints', 'bd-heritage', 'workflow-handoff-inbox'],
  'Project Engineer': ['bic-my-items', 'active-constraints', 'permit-status', 'document-activity'],
  'Chief Estimator': ['bic-my-items', 'estimating-pursuit', 'bd-heritage', 'workflow-handoff-inbox'],
  'VP of Operations': ['project-health-pulse', 'bic-my-items', 'pending-approvals', 'notification-summary'],
  'Director of Preconstruction': ['bic-my-items', 'workflow-handoff-inbox', 'pending-approvals', 'bd-heritage'],

  // --- Hub role defaults — P2-D2 §7 (My Work Hub) ---
  // Only currently registered hub:* tiles included. Future tiles (hub:team-workload,
  // hub:escalation-candidates, hub:quick-actions, hub:provisioning-health) to be
  // added as they are implemented.
  'Member': [
    'hub:lane-summary', 'hub:personal-analytics', 'hub:source-breakdown',
    'hub:recent-context',
  ],
  'Executive': [
    'hub:lane-summary', 'hub:personal-analytics', 'hub:aging-blocked',
    'hub:team-portfolio', 'hub:source-breakdown', 'hub:recent-context',
  ],
  'Administrator': [
    'hub:lane-summary', 'hub:personal-analytics', 'hub:source-breakdown',
    'hub:admin-oversight', 'hub:recent-context',
  ],
};

// --- Editor constraints — D-04 ---

/** Minimum column span a tile may occupy */
export const MIN_COL_SPAN = 3;

/** Maximum column span a tile may occupy */
export const MAX_COL_SPAN = 12;

/** Minimum row span a tile may occupy */
export const MIN_ROW_SPAN = 1;

/** Maximum row span a tile may occupy */
export const MAX_ROW_SPAN = 2;

// --- Recommendation signal ordering — D-02 ---

/** Ordered recommendation signals used by the canvas suggestion engine */
export const RECOMMENDATION_SIGNALS = ['health', 'phase', 'usage-history'] as const;

/** Union type derived from RECOMMENDATION_SIGNALS */
export type RecommendationSignal = (typeof RECOMMENDATION_SIGNALS)[number];

// --- Data-source badge vocabulary — D-08 ---

/** Valid data-source badge values */
export const DATA_SOURCE_BADGES = ['Live', 'Manual', 'Hybrid'] as const;

/** Tooltip schema for each data-source badge */
export const DATA_SOURCE_TOOLTIP_SCHEMA: Record<DataSourceBadge, IDataSourceTooltip> = {
  Live: {
    badge: 'Live',
    label: 'Live Data',
    description: 'Automatically synced from the source system in real time.',
    showLastSync: true,
    showSourceSystem: true,
    showQuickControls: false,
  },
  Manual: {
    badge: 'Manual',
    label: 'Manual Entry',
    description: 'Data entered or updated manually by a team member.',
    showLastSync: false,
    showSourceSystem: false,
    showQuickControls: true,
  },
  Hybrid: {
    badge: 'Hybrid',
    label: 'Hybrid Source',
    description: 'Combines live system data with manual overrides.',
    showLastSync: true,
    showSourceSystem: true,
    showQuickControls: true,
  },
};

// --- Mandatory governance — D-05 ---

/** How mandatory tile enforcement is applied */
export const MANDATORY_GOVERNANCE_APPLY_MODE = 'role-wide' as const;

/** Icon used for locked/mandatory tiles */
export const MANDATORY_TILE_LOCK_ICON = 'lock' as const;
