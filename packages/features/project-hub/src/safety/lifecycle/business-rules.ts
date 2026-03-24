/**
 * P3-E8-T03 SSSP approval governance and business rules.
 * Pure functions for approval completeness, edit access, material change, addendum routing.
 */

import type { SSSPSectionKey, SSSPStatus } from '../records/enums.js';
import type { SafetyAuthorityRole } from '../foundation/enums.js';
import type { ISSSPApproval, ISSSPAddendumApproval, SSSPApproverRole } from './types.js';
import {
  GOVERNED_SECTION_KEYS,
  MATERIAL_CHANGE_SECTION_KEYS,
  BASE_PLAN_REQUIRED_APPROVERS,
  ADDENDUM_ALWAYS_REQUIRED_APPROVERS,
  ADDENDUM_OPERATIONALLY_AFFECTED_APPROVERS,
} from './constants.js';

// -- Approval Completeness (§3.1–3.2) --------------------------------------

/**
 * §3.1: Base plan requires all three signatures (Safety Manager, PM, Superintendent).
 * Returns true when all three approval slots are populated.
 */
export const isSSSPApprovalComplete = (approval: ISSSPApproval): boolean =>
  approval.safetyManagerApproval !== null &&
  approval.pmApproval !== null &&
  approval.superintendentApproval !== null;

/**
 * §3.2: Addendum approval. Safety Manager always required.
 * PM and Superintendent required only when operationallyAffected = true.
 */
export const isAddendumApprovalComplete = (
  approval: ISSSPAddendumApproval,
  operationallyAffected: boolean,
): boolean => {
  if (approval.safetyManagerApproval === null) return false;
  if (operationallyAffected) {
    return approval.pmApproval !== null && approval.superintendentApproval !== null;
  }
  return true;
};

// -- Edit Access (§2) -------------------------------------------------------

/**
 * Determines if a section can be edited given the current SSSP status and user role.
 *
 * Rules:
 * - DRAFT: governed sections editable by SafetyManager/SafetyOfficer; instance sections by project team
 * - PENDING_APPROVAL: all sections locked (no edits until approval or rejection)
 * - APPROVED: no direct edits; changes must go through addenda
 * - SUPERSEDED: permanent read-only
 */
export const canEditSSSPSection = (
  status: SSSPStatus,
  sectionKey: SSSPSectionKey,
  role: SafetyAuthorityRole,
): boolean => {
  if (status !== 'DRAFT') return false;

  const isGoverned = (GOVERNED_SECTION_KEYS as readonly string[]).includes(sectionKey);

  if (isGoverned) {
    return role === 'SafetyManager' || role === 'SafetyOfficer';
  }

  // Instance sections editable by project team + Safety roles in DRAFT
  return (
    role === 'SafetyManager' ||
    role === 'SafetyOfficer' ||
    role === 'ProjectManager' ||
    role === 'Superintendent'
  );
};

// -- Material Change Detection (§4.3) --------------------------------------

/**
 * Returns true if any of the affected sections constitute a material change
 * requiring full base plan reapproval rather than an addendum.
 */
export const isMaterialChange = (affectedSections: readonly SSSPSectionKey[]): boolean =>
  affectedSections.some((key) =>
    (MATERIAL_CHANGE_SECTION_KEYS as readonly string[]).includes(key),
  );

// -- Addendum Governance (§4.2) ---------------------------------------------

/**
 * §4.2: If an addendum affects a governed section, only the Safety Manager may draft it.
 */
export const canDraftAddendum = (
  affectedSections: readonly SSSPSectionKey[],
  role: SafetyAuthorityRole,
): boolean => {
  const affectsGoverned = affectedSections.some((key) =>
    (GOVERNED_SECTION_KEYS as readonly string[]).includes(key),
  );

  if (affectsGoverned) {
    return role === 'SafetyManager' || role === 'SafetyOfficer';
  }

  // Instance-only addenda can be drafted by project team
  return (
    role === 'SafetyManager' ||
    role === 'SafetyOfficer' ||
    role === 'ProjectManager' ||
    role === 'Superintendent'
  );
};

/**
 * §3.2: Returns the list of approver roles required for an addendum.
 */
export const getRequiredApproversForAddendum = (
  operationallyAffected: boolean,
): readonly SSSPApproverRole[] =>
  operationallyAffected
    ? ADDENDUM_OPERATIONALLY_AFFECTED_APPROVERS
    : ADDENDUM_ALWAYS_REQUIRED_APPROVERS;

/**
 * Returns the list of approver roles required for a base plan.
 */
export const getRequiredApproversForBasePlan = (): readonly SSSPApproverRole[] =>
  BASE_PLAN_REQUIRED_APPROVERS;

// -- Factory Helpers --------------------------------------------------------

/** Create an empty SSSP approval record (no signatures). */
export const createEmptySSSPApproval = (): ISSSPApproval => ({
  safetyManagerApproval: null,
  pmApproval: null,
  superintendentApproval: null,
  allApprovedAt: null,
  rejections: [],
});

/** Create an empty addendum approval record (no signatures). */
export const createEmptyAddendumApproval = (): ISSSPAddendumApproval => ({
  safetyManagerApproval: null,
  pmApproval: null,
  superintendentApproval: null,
  allRequiredApprovedAt: null,
  rejections: [],
});
