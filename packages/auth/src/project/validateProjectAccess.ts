/**
 * Phase 3 Stage 2.2 — Project membership enforcement.
 *
 * Wraps resolveProjectRole with grant/deny semantics and typed denial
 * reasons for use in route guards and component-level enforcement.
 *
 * Governing: P3-A2 §6 (Project access eligibility rules)
 */

import {
  resolveProjectRole,
  type ProjectRoleResolutionInput,
  type ProjectRoleResolutionResult,
} from './resolveProjectRole.js';

// ─────────────────────────────────────────────────────────────────────────────
// Denial reasons
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Typed reasons why project access was denied.
 */
export type ProjectAccessDenialReason =
  | 'no-eligibility-path'
  | 'project-not-found'
  | 'external-member-expired';

// ─────────────────────────────────────────────────────────────────────────────
// Access result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of project access validation.
 */
export type ProjectAccessResult =
  | {
      granted: true;
      role: ProjectRoleResolutionResult;
      denialReason?: undefined;
    }
  | {
      granted: false;
      role: null;
      denialReason: ProjectAccessDenialReason;
    };

// ─────────────────────────────────────────────────────────────────────────────
// Enforcement function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate whether a user has access to a project.
 *
 * Wraps `resolveProjectRole()` with explicit grant/deny semantics.
 * Returns typed denial reasons for UI-level error handling
 * (access-denied page, project selector redirect, expired notice).
 *
 * @param input - All inputs needed for role resolution (P3-A2 §6.1)
 * @returns Access result with role (if granted) or denial reason
 */
export function validateProjectAccess(
  input: ProjectRoleResolutionInput,
): ProjectAccessResult {
  // Check for expired external member before role resolution
  if (
    input.externalMember &&
    input.externalMember.status !== 'active'
  ) {
    return {
      granted: false,
      role: null,
      denialReason: 'external-member-expired',
    };
  }

  const roleResult = resolveProjectRole(input);

  if (roleResult === null) {
    return {
      granted: false,
      role: null,
      denialReason: 'no-eligibility-path',
    };
  }

  return {
    granted: true,
    role: roleResult,
  };
}
