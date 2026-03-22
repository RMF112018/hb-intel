/**
 * Phase 3 Stage 2.1 — PER scope eligibility resolver.
 *
 * Determines whether a Leadership-tier user has Portfolio Executive Reviewer
 * access to a specific project based on department scope, C-suite breadth,
 * or active out-of-scope override.
 *
 * Governing: P3-A2 §2.3 (Leadership scope model), §6.1 paths 6–7
 */

import type { ProjectDepartment } from '@hbc/models';
import type { AccessControlOverrideRecord } from '../types.js';
import { isPerOverride } from '../backend/perOverride.js';

export type PerEligibilitySource =
  | 'department-scope'
  | 'c-suite'
  | 'override'
  | 'none';

export interface PerEligibilityResult {
  eligible: boolean;
  source: PerEligibilitySource;
}

/**
 * Determine whether a Leadership-tier user has PER eligibility for a project.
 *
 * Resolution order (P3-A2 §2.3):
 * 1. C-suite users → eligible for all projects regardless of department
 * 2. Department match → user's department covers this project
 * 3. Active out-of-scope override → time-bounded PER grant for this project
 *
 * @param userDepartment - The user's assigned department (undefined for C-suite)
 * @param isCsuite - Whether the user holds a C-suite position
 * @param projectDepartment - The project's department from the registry record
 * @param activeOverrides - All active AccessControlOverrideRecords
 * @param projectId - The project's canonical ID
 */
export function resolvePerEligibility(
  userDepartment: string | undefined,
  isCsuite: boolean,
  projectDepartment: ProjectDepartment,
  activeOverrides: AccessControlOverrideRecord[],
  projectId: string,
): PerEligibilityResult {
  // C-suite: company-wide scope — all projects
  if (isCsuite) {
    return { eligible: true, source: 'c-suite' };
  }

  // Department match: user's department covers this project
  if (userDepartment && userDepartment === projectDepartment) {
    return { eligible: true, source: 'department-scope' };
  }

  // Active out-of-scope override for this project
  const hasOverride = activeOverrides.some(
    (o) =>
      isPerOverride(o) &&
      o.status === 'active' &&
      o.approval.state === 'approved' &&
      o.projectIds != null &&
      o.projectIds.includes(projectId),
  );

  if (hasOverride) {
    return { eligible: true, source: 'override' };
  }

  return { eligible: false, source: 'none' };
}
