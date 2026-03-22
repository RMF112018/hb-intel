/**
 * Phase 3 project-scoped role definitions (P3-A2 §3.1).
 *
 * Project roles are distinct from system roles (SystemRole enum).
 * They determine what a user can see and do within a specific project,
 * resolved from multiple inputs (system role, Entra groups, team anchors,
 * membership records, PER scope eligibility).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Project role type (P3-A2 §3.1 — all 8 roles)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project-scoped role determining module visibility and action authority.
 */
export type ProjectRole =
  | 'project-administrator'
  | 'portfolio-executive-reviewer'
  | 'project-executive'
  | 'project-manager'
  | 'superintendent'
  | 'project-team-member'
  | 'project-viewer'
  | 'external-contributor';

/**
 * Tier classification for project roles.
 */
export type ProjectRoleTier =
  | 'platform'     // Project Administrator — system-level bypass
  | 'leadership'   // PER, PE — leadership-derived
  | 'member'       // PM, Supt, Team, Viewer — project membership
  | 'external';    // External Contributor — grant-scoped

// ─────────────────────────────────────────────────────────────────────────────
// Precedence and classification (P3-A2 §3.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project role precedence order (highest to lowest).
 * When a user qualifies for multiple roles, the highest-precedence role wins.
 */
export const PROJECT_ROLE_PRECEDENCE: readonly ProjectRole[] = [
  'project-administrator',
  'portfolio-executive-reviewer',
  'project-executive',
  'project-manager',
  'superintendent',
  'project-team-member',
  'project-viewer',
  'external-contributor',
] as const;

/**
 * Tier classification for each project role.
 */
export const PROJECT_ROLE_TIER: Record<ProjectRole, ProjectRoleTier> = {
  'project-administrator': 'platform',
  'portfolio-executive-reviewer': 'leadership',
  'project-executive': 'leadership',
  'project-manager': 'member',
  'superintendent': 'member',
  'project-team-member': 'member',
  'project-viewer': 'member',
  'external-contributor': 'external',
};

/**
 * Human-readable display labels for project roles.
 */
export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  'project-administrator': 'Project Administrator',
  'portfolio-executive-reviewer': 'Portfolio Executive Reviewer',
  'project-executive': 'Project Executive',
  'project-manager': 'Project Manager',
  'superintendent': 'Superintendent',
  'project-team-member': 'Project Team Member',
  'project-viewer': 'Project Viewer',
  'external-contributor': 'External Contributor',
};

/**
 * Whether the role confers project membership (as opposed to non-member access).
 * PER is explicitly non-member (P3-A2 §3.2).
 */
export const PROJECT_ROLE_IS_MEMBER: Record<ProjectRole, boolean> = {
  'project-administrator': true,
  'portfolio-executive-reviewer': false, // Non-member oversight posture
  'project-executive': true,
  'project-manager': true,
  'superintendent': true,
  'project-team-member': true,
  'project-viewer': true,
  'external-contributor': false, // Grant-scoped, not full membership
};
