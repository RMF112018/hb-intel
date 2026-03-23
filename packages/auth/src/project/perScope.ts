/**
 * Phase 3 Stage 2.3 — PER non-membership scope helpers.
 *
 * Enforces the PER boundary: non-membership, no operational writes,
 * review-layer-only annotation on review-capable surfaces.
 *
 * Governing: P3-A2 §3.2, §6.4
 */

import type { ProjectRoleResolutionResult } from './resolveProjectRole.js';
import { getPerModuleVisibility, type ProjectModuleId } from './moduleVisibility.js';

// ─────────────────────────────────────────────────────────────────────────────
// PER identification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a role resolution result is PER (Portfolio Executive Reviewer).
 */
export function isPerRole(result: ProjectRoleResolutionResult): boolean {
  return result.effectiveRole === 'portfolio-executive-reviewer';
}

// ─────────────────────────────────────────────────────────────────────────────
// PER capability checks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether PER can annotate a specific module.
 *
 * Returns true for review-capable modules, false for Safety (P3-E1 §9.3)
 * and other non-annotatable modules.
 */
export function canPerAnnotate(moduleId: ProjectModuleId): boolean {
  return getPerModuleVisibility(moduleId) === 'review-layer';
}

/**
 * Check whether PER can Push-to-Project-Team from a specific module.
 *
 * Push is available on review-capable modules where PER has annotation access.
 * Safety is excluded (no annotation layer → no push pathway).
 */
export function canPerPushToTeam(moduleId: ProjectModuleId): boolean {
  return getPerModuleVisibility(moduleId) === 'review-layer';
}

// ─────────────────────────────────────────────────────────────────────────────
// PER restrictions (P3-A2 §3.2 — explicit prohibition list)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Canonical set of PER prohibitions per P3-A2 §3.2.
 *
 * All values are `false` — PER is never permitted to perform these actions.
 * This object is frozen and serves as a discoverable reference for all
 * PER restrictions.
 */
export interface PerRestrictions {
  readonly canWriteSourceRecords: false;
  readonly canAppearInMembershipRoster: false;
  readonly canConfirmPmDraft: false;
  readonly canReleaseReports: false;
  readonly canAssumeNarrativeOwnership: false;
}

const PER_RESTRICTIONS: PerRestrictions = Object.freeze({
  canWriteSourceRecords: false,
  canAppearInMembershipRoster: false,
  canConfirmPmDraft: false,
  canReleaseReports: false,
  canAssumeNarrativeOwnership: false,
});

/**
 * Get the canonical PER restriction set.
 *
 * Returns a frozen object where all flags are `false` — PER is never
 * permitted to write source records, appear in rosters, confirm PM drafts,
 * release reports, or assume narrative ownership.
 */
export function getPerRestrictions(): PerRestrictions {
  return PER_RESTRICTIONS;
}
