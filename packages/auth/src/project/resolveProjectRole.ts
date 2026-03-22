/**
 * Phase 3 Stage 2.1 — Project role resolution pipeline (P3-A2 §3.3).
 *
 * Resolves a user's effective project role from multiple inputs:
 * system roles, team anchors, Entra group membership, department scope,
 * and PER overrides. Produces a single ProjectRole with tier and
 * membership classification.
 *
 * Governing: P3-A2 §3.1 (taxonomy), §3.3 (pipeline), §6.1 (eligibility)
 */

import type {
  ProjectRole,
  ProjectRoleTier,
  IProjectRegistryRecord,
  IProjectMember,
  IExternalMember,
} from '@hbc/models';
import { PROJECT_ROLE_TIER, PROJECT_ROLE_IS_MEMBER } from '@hbc/models';
import type { AccessControlOverrideRecord } from '../types.js';
import { resolvePerEligibility, type PerEligibilitySource } from './resolvePerEligibility.js';

// ─────────────────────────────────────────────────────────────────────────────
// Input / Output contracts
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectRoleResolutionInput {
  /** System-level resolved roles (e.g., ['Administrator', 'Executive']) */
  systemRoles: string[];
  /** The project's canonical registry record */
  projectRecord: IProjectRegistryRecord;
  /** The authenticated user's UPN */
  userUpn: string;
  /** User's department assignment (for PER scope eligibility) */
  userDepartment?: string;
  /** Whether the user holds a C-suite position (CEO, COO, CFO) */
  isCsuite?: boolean;
  /** Project membership record for this user (null if not a member) */
  projectMember?: IProjectMember | null;
  /** External member record for this user (null if not external) */
  externalMember?: IExternalMember | null;
  /** Entra group membership for this project's groups */
  entraGroupMembership?: { leaders: boolean; team: boolean; viewers: boolean };
  /** Active PER override records for PER scope resolution */
  activePerOverrides?: AccessControlOverrideRecord[];
}

export interface ProjectRoleResolutionResult {
  /** The resolved effective project role */
  effectiveRole: ProjectRole;
  /** The tier classification of the resolved role */
  tier: ProjectRoleTier;
  /** Whether the role confers project membership (PER is explicitly non-member) */
  isMember: boolean;
  /** The eligibility path that granted access (P3-A2 §6.1) */
  eligibilityPath: string;
  /** PER eligibility source (only set for PER roles) */
  perSource?: PerEligibilitySource;
}

// ─────────────────────────────────────────────────────────────────────────────
// System role detection helpers
// ─────────────────────────────────────────────────────────────────────────────

function hasSystemRole(roles: string[], ...targets: string[]): boolean {
  return targets.some((t) => roles.includes(t));
}

function isAdminRole(roles: string[]): boolean {
  return hasSystemRole(roles, 'Administrator', 'SYSTEM_ADMIN');
}

function isLeadershipTier(roles: string[]): boolean {
  return hasSystemRole(roles, 'Executive', 'EXECUTIVE', 'PROJECT_EXECUTIVE');
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolution pipeline (P3-A2 §3.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the effective project role for a user-project combination.
 *
 * Returns null if the user has no access to this project.
 *
 * Resolution order (P3-A2 §3.3, §6.1):
 * 1. Administrator → project-administrator (bypasses membership)
 * 2. Leadership + team anchor/Leaders group → project-executive
 * 3. Leadership + department scope/override → portfolio-executive-reviewer
 * 4. PM anchor or PM system role + group → project-manager
 * 5. Superintendent anchor or role + group → superintendent
 * 6. Team group → project-team-member
 * 7. Viewers group → project-viewer
 * 8. External member → external-contributor
 */
export function resolveProjectRole(
  input: ProjectRoleResolutionInput,
): ProjectRoleResolutionResult | null {
  const {
    systemRoles,
    projectRecord,
    userUpn,
    userDepartment,
    isCsuite = false,
    projectMember,
    externalMember,
    entraGroupMembership,
    activePerOverrides = [],
  } = input;

  const upnLower = userUpn.toLowerCase();

  // ── Path 1: System Administrator ──────────────────────────────────────
  if (isAdminRole(systemRoles)) {
    return buildResult('project-administrator', 'system-admin-bypass');
  }

  // ── Path 2: Leadership + explicit project membership → Project Executive ─
  if (isLeadershipTier(systemRoles)) {
    const isTeamAnchor =
      projectRecord.projectExecutiveUpn?.toLowerCase() === upnLower ||
      projectRecord.projectManagerUpn?.toLowerCase() === upnLower;
    const isLeadersGroup = entraGroupMembership?.leaders === true;

    if (isTeamAnchor || isLeadersGroup) {
      return buildResult('project-executive', 'leadership-member-anchor');
    }

    // ── Path 3: Leadership + department scope → PER ───────────────────
    const perEligibility = resolvePerEligibility(
      userDepartment,
      isCsuite,
      projectRecord.department,
      activePerOverrides,
      projectRecord.projectId,
    );

    if (perEligibility.eligible) {
      return buildResult(
        'portfolio-executive-reviewer',
        `per-${perEligibility.source}`,
        perEligibility.source,
      );
    }
  }

  // ── Path 4: PM anchor or system role + group ──────────────────────────
  if (projectRecord.projectManagerUpn?.toLowerCase() === upnLower) {
    return buildResult('project-manager', 'pm-team-anchor');
  }
  if (
    hasSystemRole(systemRoles, 'PROJECT_MANAGER') &&
    entraGroupMembership?.leaders === true
  ) {
    return buildResult('project-manager', 'pm-role-leaders-group');
  }

  // ── Path 5: Superintendent anchor or system role + group ──────────────
  if (projectRecord.superintendentUpn?.toLowerCase() === upnLower) {
    return buildResult('superintendent', 'superintendent-team-anchor');
  }
  if (
    hasSystemRole(systemRoles, 'SUPERINTENDENT') &&
    (entraGroupMembership?.leaders === true || entraGroupMembership?.team === true)
  ) {
    return buildResult('superintendent', 'superintendent-role-group');
  }

  // ── Path 6: Project member with override role ─────────────────────────
  if (projectMember) {
    if (projectMember.projectRoleId) {
      const overrideRole = projectMember.projectRoleId as ProjectRole;
      if (PROJECT_ROLE_TIER[overrideRole]) {
        return buildResult(overrideRole, 'project-member-role-override');
      }
    }
  }

  // ── Path 7: Entra group membership ────────────────────────────────────
  if (entraGroupMembership?.leaders) {
    return buildResult('project-team-member', 'leaders-group');
  }
  if (entraGroupMembership?.team) {
    return buildResult('project-team-member', 'team-group');
  }
  if (entraGroupMembership?.viewers) {
    return buildResult('project-viewer', 'viewers-group');
  }

  // ── Path 8: Explicit project member record ────────────────────────────
  if (projectMember) {
    return buildResult('project-team-member', 'explicit-member-record');
  }

  // ── Path 9: External member ───────────────────────────────────────────
  if (externalMember && externalMember.status === 'active') {
    return buildResult('external-contributor', 'external-member-record');
  }

  // ── No access ─────────────────────────────────────────────────────────
  return null;
}

function buildResult(
  role: ProjectRole,
  eligibilityPath: string,
  perSource?: PerEligibilitySource,
): ProjectRoleResolutionResult {
  return {
    effectiveRole: role,
    tier: PROJECT_ROLE_TIER[role],
    isMember: PROJECT_ROLE_IS_MEMBER[role],
    eligibilityPath,
    perSource,
  };
}
