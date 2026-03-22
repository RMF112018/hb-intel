/**
 * Phase 3 Stage 1.6 — Governed department reclassification.
 *
 * Orchestrates Manager-of-OpEx-approved department changes on project
 * registry records with audit trail. Override suspension is handled by
 * the caller using @hbc/auth's suspendPerOverridesForDepartmentChange.
 *
 * Governing: P3-A1 §3.6 (Department reclassification governance),
 *            P3-A2 §7 (Effects on access)
 */

import type {
  IProjectRegistryRecord,
  ProjectDepartment,
} from '@hbc/models';

// ─────────────────────────────────────────────────────────────────────────────
// Input / Output contracts
// ─────────────────────────────────────────────────────────────────────────────

export interface DepartmentReclassificationInput {
  /** Canonical projectId of the project being reclassified */
  projectId: string;
  /** Target department value */
  newDepartment: ProjectDepartment;
  /** UPN of the approving Manager of Operational Excellence */
  approverUpn: string;
  /** Role of the approver — must be 'Manager of Operational Excellence' */
  approverRole: string;
  /** Business justification for the reclassification */
  reason: string;
}

export interface DepartmentReclassificationResult {
  /** The department value before reclassification */
  previousDepartment: ProjectDepartment;
  /** The department value after reclassification */
  newDepartment: ProjectDepartment;
  /** The updated registry record with new department */
  updatedRecord: IProjectRegistryRecord;
  /** ISO 8601 timestamp of the reclassification */
  auditTimestamp: string;
}

/** The only role authorized to approve department reclassification (P3-A1 §3.6) */
export const RECLASSIFICATION_APPROVER_ROLE = 'Manager of Operational Excellence';

// ─────────────────────────────────────────────────────────────────────────────
// Authority validation (P3-A1 §3.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate that the approver has authority to approve department reclassification.
 *
 * @returns null if authority is valid; error message string if not
 */
export function validateReclassificationAuthority(
  input: DepartmentReclassificationInput,
): string | null {
  if (!input.approverUpn) {
    return 'Approver UPN is required.';
  }

  if (input.approverRole !== RECLASSIFICATION_APPROVER_ROLE) {
    return `Department reclassification requires approval by ${RECLASSIFICATION_APPROVER_ROLE}. Provided role: "${input.approverRole}".`;
  }

  if (!input.reason || input.reason.trim().length < 10) {
    return 'A detailed reason (minimum 10 characters) is required for department reclassification.';
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reclassification orchestration (P3-A1 §3.6, P3-A2 §7)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute a governed department reclassification transaction.
 *
 * Pure function — caller handles persistence and override suspension.
 * The caller should use @hbc/auth's suspendPerOverridesForDepartmentChange
 * with the returned previousDepartment to suspend active PER overrides.
 *
 * @throws Error if authority validation fails or if reclassification is a no-op
 */
export function executeDepartmentReclassification(
  input: DepartmentReclassificationInput,
  currentRecord: IProjectRegistryRecord,
): DepartmentReclassificationResult {
  // Validate authority
  const authorityError = validateReclassificationAuthority(input);
  if (authorityError) {
    throw new Error(authorityError);
  }

  // Validate project identity
  if (currentRecord.projectId !== input.projectId) {
    throw new Error(
      `Project ID mismatch: input "${input.projectId}" does not match record "${currentRecord.projectId}".`,
    );
  }

  // Reject no-op
  if (currentRecord.department === input.newDepartment) {
    throw new Error(
      `Project is already classified as "${input.newDepartment}". No reclassification needed.`,
    );
  }

  const auditTimestamp = new Date().toISOString();
  const previousDepartment = currentRecord.department;

  // Update registry record with new department
  const updatedRecord: IProjectRegistryRecord = {
    ...currentRecord,
    department: input.newDepartment,
  };

  return {
    previousDepartment,
    newDepartment: input.newDepartment,
    updatedRecord,
    auditTimestamp,
  };
}
