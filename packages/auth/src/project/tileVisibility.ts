/**
 * Phase 3 Stage 2.5 — Canvas tile and spine component visibility.
 *
 * Role-based visibility for canvas tiles (identity header, health,
 * work queue, related items, activity) and spine components.
 * Extends the module visibility matrix from 2.3 with tile-specific rules.
 *
 * Governing: P3-A2 §7 (role visibility), P3-C2 §8 (tile visibility by role)
 */

import type { ProjectRole } from '@hbc/models';
import { getModuleVisibility, type ModuleVisibility, type ProjectModuleId } from './moduleVisibility.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Canvas tile access level for a given project role.
 */
export type TileVisibility = 'visible' | 'read-only' | 'hidden';

/**
 * Mandatory core canvas tile keys per P3-C2.
 */
export type CanvasTileKey =
  | 'identity-header'
  | 'health'
  | 'work-queue'
  | 'related-items'
  | 'activity';

/** All canvas tile keys */
const ALL_TILE_KEYS: readonly CanvasTileKey[] = [
  'identity-header',
  'health',
  'work-queue',
  'related-items',
  'activity',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// PER tile visibility (P3-C2 §8)
// ─────────────────────────────────────────────────────────────────────────────

const PER_TILE_VISIBILITY: Record<CanvasTileKey, TileVisibility> = {
  'identity-header': 'visible',
  health: 'read-only',
  'work-queue': 'hidden',        // Push-to-Project-Team is via module, not tile
  'related-items': 'read-only',
  activity: 'read-only',
};

const VIEWER_TILE_VISIBILITY: Record<CanvasTileKey, TileVisibility> = {
  'identity-header': 'visible',
  health: 'read-only',
  'work-queue': 'hidden',        // Viewers don't participate in work queue
  'related-items': 'read-only',
  activity: 'read-only',
};

const EXTERNAL_TILE_VISIBILITY: Record<CanvasTileKey, TileVisibility> = {
  'identity-header': 'visible',
  health: 'hidden',
  'work-queue': 'hidden',
  'related-items': 'hidden',
  activity: 'hidden',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tile visibility lookup (P3-C2 §8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get canvas tile visibility for a given project role.
 *
 * Pure matrix lookup. Tile visibility is distinct from module visibility —
 * tiles compose data from modules/spines but have their own visibility rules.
 */
export function getTileVisibility(
  role: ProjectRole,
  tileKey: CanvasTileKey,
): TileVisibility {
  switch (role) {
    case 'project-administrator':
    case 'project-executive':
    case 'project-manager':
    case 'superintendent':
    case 'project-team-member':
      return 'visible';

    case 'portfolio-executive-reviewer':
      return PER_TILE_VISIBILITY[tileKey];

    case 'project-viewer':
      return VIEWER_TILE_VISIBILITY[tileKey];

    case 'external-contributor':
      return EXTERNAL_TILE_VISIBILITY[tileKey];
  }
}

/**
 * Get the set of canvas tile keys visible (not hidden) for a role.
 *
 * Returns tiles with visibility `'visible'` or `'read-only'`.
 */
export function getVisibleTileKeys(role: ProjectRole): CanvasTileKey[] {
  return ALL_TILE_KEYS.filter((key) => getTileVisibility(role, key) !== 'hidden');
}

// ─────────────────────────────────────────────────────────────────────────────
// Spine visibility (delegates to module visibility)
// ─────────────────────────────────────────────────────────────────────────────

/** Spine-to-module mapping */
const SPINE_TO_MODULE: Record<string, ProjectModuleId> = {
  health: 'health',
  'work-queue': 'work-queue',
  activity: 'activity',
  'related-items': 'related-items',
};

/**
 * Get spine component visibility for a given project role.
 *
 * Delegates to `getModuleVisibility` — spine visibility follows
 * the module visibility matrix. This function provides a named
 * entry point for spine-consuming code.
 */
export function getSpineVisibility(
  role: ProjectRole,
  spineId: 'health' | 'work-queue' | 'activity' | 'related-items',
): ModuleVisibility {
  const moduleId = SPINE_TO_MODULE[spineId];
  return getModuleVisibility(role, moduleId);
}
