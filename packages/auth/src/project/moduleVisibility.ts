/**
 * Phase 3 Stage 2.3 — Module visibility matrix.
 *
 * Pure lookup functions that determine module access level by project role.
 * Implements the P3-A2 §4.1 visibility matrix with P3-E1 §9.1/§9.3
 * review-capable surface rules and Safety annotation exclusion.
 *
 * Governing: P3-A2 §4.1; P3-E1 §9.1, §9.3
 */

import type { ProjectRole } from '@hbc/models';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Module access level for a given project role.
 *
 * full         — Full operational access (read + write + all actions)
 * review-layer — Read + annotation capability (no source-record mutation)
 * read-only    — Read access only (no annotation, no write)
 * hidden       — Module not visible to this role
 */
export type ModuleVisibility = 'full' | 'review-layer' | 'read-only' | 'hidden';

/**
 * Canonical module identifiers for Project Hub modules.
 */
export type ProjectModuleId =
  | 'home'
  | 'financial'
  | 'schedule'
  | 'constraints'
  | 'permits'
  | 'safety'
  | 'reports'
  | 'health'
  | 'activity'
  | 'work-queue'
  | 'related-items'
  | 'quality-control'
  | 'warranty';

// ─────────────────────────────────────────────────────────────────────────────
// PER visibility matrix (P3-A2 §4.1, P3-E1 §9.1, §9.3)
// ─────────────────────────────────────────────────────────────────────────────

const PER_MODULE_VISIBILITY: Record<ProjectModuleId, ModuleVisibility> = {
  home: 'read-only',
  financial: 'review-layer',
  schedule: 'review-layer',
  constraints: 'review-layer',
  permits: 'review-layer',
  safety: 'read-only',          // P3-E1 §9.3 — Safety excluded from annotation
  reports: 'review-layer',
  health: 'review-layer',
  activity: 'read-only',
  'work-queue': 'read-only',    // Push-to-Project-Team creates items, not direct access
  'related-items': 'read-only',
  'quality-control': 'hidden',
  warranty: 'hidden',
};

/** Modules accessible to project viewers (read-only members) */
const VIEWER_MODULE_VISIBILITY: Record<ProjectModuleId, ModuleVisibility> = {
  home: 'read-only',
  financial: 'read-only',
  schedule: 'read-only',
  constraints: 'read-only',
  permits: 'read-only',
  safety: 'read-only',
  reports: 'read-only',
  health: 'read-only',
  activity: 'read-only',
  'work-queue': 'hidden',
  'related-items': 'read-only',
  'quality-control': 'read-only',
  warranty: 'read-only',
};

/** Modules accessible to external contributors (grant-scoped) */
const EXTERNAL_MODULE_VISIBILITY: Record<ProjectModuleId, ModuleVisibility> = {
  home: 'read-only',
  financial: 'hidden',
  schedule: 'hidden',
  constraints: 'hidden',
  permits: 'hidden',
  safety: 'hidden',
  reports: 'hidden',
  health: 'hidden',
  activity: 'hidden',
  'work-queue': 'hidden',
  'related-items': 'hidden',
  'quality-control': 'hidden',
  warranty: 'hidden',
};

// ─────────────────────────────────────────────────────────────────────────────
// Lookup functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the module visibility level for a given project role and module.
 *
 * Pure matrix lookup — no async, no side effects.
 */
export function getModuleVisibility(
  role: ProjectRole,
  moduleId: ProjectModuleId,
): ModuleVisibility {
  switch (role) {
    case 'project-administrator':
    case 'project-executive':
    case 'project-manager':
    case 'superintendent':
    case 'project-team-member':
      return 'full';

    case 'portfolio-executive-reviewer':
      return PER_MODULE_VISIBILITY[moduleId];

    case 'project-viewer':
      return VIEWER_MODULE_VISIBILITY[moduleId];

    case 'external-contributor':
      return EXTERNAL_MODULE_VISIBILITY[moduleId];
  }
}

/**
 * Get PER-specific module visibility (convenience shorthand).
 */
export function getPerModuleVisibility(moduleId: ProjectModuleId): ModuleVisibility {
  return PER_MODULE_VISIBILITY[moduleId];
}

/**
 * Check whether a role can place annotations on a module.
 *
 * Only roles with 'full' or 'review-layer' access on review-capable
 * modules can annotate. Safety is explicitly excluded for PER (P3-E1 §9.3).
 */
export function canAnnotateModule(
  role: ProjectRole,
  moduleId: ProjectModuleId,
): boolean {
  const visibility = getModuleVisibility(role, moduleId);
  return visibility === 'full' || visibility === 'review-layer';
}
