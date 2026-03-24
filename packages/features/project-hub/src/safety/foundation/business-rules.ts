/**
 * P3-E8-T01 Safety Module foundation business rules.
 * Authority checks, lane ownership, visibility doctrine.
 */

import type { SafetyAuthorityAction, SafetyAuthorityRole, SafetyLaneOwner, SafetyRecordFamily } from './enums.js';
import {
  SAFETY_AUTHORITY_MATRIX,
  SAFETY_MANAGER_ONLY_FIELDS,
  SAFETY_LANE_MAPPINGS,
  SAFETY_VISIBILITY_RULES,
} from './constants.js';

// -- Authority Model (SS4.1-4.3) -------------------------------------------

/**
 * Check if a role is authorized to perform a specific action on a record family.
 */
export const canSafetyRolePerformAction = (
  role: SafetyAuthorityRole,
  recordFamily: SafetyRecordFamily,
  action: SafetyAuthorityAction,
): boolean => {
  const rule = SAFETY_AUTHORITY_MATRIX.find(
    (r) => r.role === role && r.recordFamily === recordFamily,
  );
  if (!rule) return false;
  return rule.allowedActions.includes(action);
};

/**
 * SS4.3: Check if a field on a record family is restricted to Safety Manager editing.
 * Fields carrying `safetyManagerOnly: true` are enforced at the API layer.
 */
export const isSafetyManagerOnlyField = (
  recordFamily: SafetyRecordFamily,
  fieldName: string,
): boolean => {
  const declaration = SAFETY_MANAGER_ONLY_FIELDS.find(
    (d) => d.recordFamily === recordFamily,
  );
  if (!declaration) return false;
  return declaration.fieldNames.includes(fieldName);
};

// -- Lane Ownership (SS4.1-4.2) -------------------------------------------

/**
 * Returns true if the record family is owned by the Safety Manager lane.
 */
export const isSafetyManagerLane = (recordFamily: SafetyRecordFamily): boolean => {
  const mapping = SAFETY_LANE_MAPPINGS.find((m) => m.recordFamily === recordFamily);
  return mapping?.lane === 'SafetyManagerLane';
};

/**
 * Returns true if the record family is owned by the project team lane.
 */
export const isProjectTeamLane = (recordFamily: SafetyRecordFamily): boolean => {
  const mapping = SAFETY_LANE_MAPPINGS.find((m) => m.recordFamily === recordFamily);
  return mapping?.lane === 'ProjectTeamLane';
};

/**
 * Returns the lane owner for a record family.
 */
export const getRecordFamilyLaneOwner = (recordFamily: SafetyRecordFamily): SafetyLaneOwner => {
  const mapping = SAFETY_LANE_MAPPINGS.find((m) => m.recordFamily === recordFamily);
  if (!mapping) {
    throw new Error(`No lane mapping found for record family: ${recordFamily}`);
  }
  return mapping.lane;
};

// -- Visibility Doctrine (SS5) -------------------------------------------

/**
 * Returns true if the role can view the full Safety workspace.
 */
export const canViewSafetyWorkspace = (role: SafetyAuthorityRole): boolean => {
  const rule = SAFETY_VISIBILITY_RULES.find((r) => r.role === role);
  return rule?.canViewWorkspace ?? false;
};

/**
 * Returns true if the role can edit Safety Manager-owned content.
 */
export const canEditSafetyManagerContent = (role: SafetyAuthorityRole): boolean => {
  const rule = SAFETY_VISIBILITY_RULES.find((r) => r.role === role);
  return rule?.canEditSafetyManagerContent ?? false;
};

// -- PER Exclusions (SS5.3, P3-E1 SS9.3) ----------------------------------

/**
 * Safety is explicitly excluded from Phase 3 Executive Review annotation.
 * Always returns true per P3-E1 SS9.3.
 */
export const isExcludedFromAnnotation = (): true => true;

/**
 * Safety has no push-to-team capability for PER content.
 * Always returns false.
 */
export const isSafetyPushToTeamAllowed = (): false => false;
