/**
 * P3-E11-T10 Stage 4 Project Startup Permit Posting Verification business rules.
 * Verification completeness, discrepancy handling, certification eligibility,
 * non-interference, PWA/SPFx depth.
 */

import type { AppSurface, PermitVerificationResult } from './enums.js';

// -- Verification Completeness (T07 §9.1) ------------------------------------

/** Minimal detail shape for verification check. */
interface VerificationCheck {
  readonly verifiedBy: string | null;
  readonly verifiedAt: string | null;
  readonly physicalEvidenceAttachmentIds: readonly string[];
  readonly discrepancyReason: string | null;
}

/**
 * Returns true if the permit verification is complete for the given task result.
 * Per T07 §9.1:
 * - Yes: requires verifiedBy, verifiedAt, and at least one physicalEvidenceAttachmentId
 * - No: requires discrepancyReason
 * - NA: always complete (no verification required)
 * - null: not yet assessed, not complete
 */
export const isPermitVerificationComplete = (
  detail: VerificationCheck,
  taskResult: PermitVerificationResult | null,
): boolean => {
  if (taskResult === null) return false;
  if (taskResult === 'NA') return true;
  if (taskResult === 'Yes') return canConfirmPermitPosted(detail);
  // taskResult === 'No'
  return detail.discrepancyReason !== null && detail.discrepancyReason !== '';
};

/**
 * Returns true if all 3 required Yes fields are populated.
 * Per T07 §9.1: verifiedBy, verifiedAt, and physicalEvidenceAttachmentIds[].
 */
export const canConfirmPermitPosted = (
  detail: VerificationCheck,
): boolean =>
  detail.verifiedBy !== null && detail.verifiedBy !== '' &&
  detail.verifiedAt !== null && detail.verifiedAt !== '' &&
  detail.physicalEvidenceAttachmentIds.length > 0;

// -- Discrepancy Requirement (T07 §9.4) --------------------------------------

/**
 * Returns true if discrepancyReason is required for this task result.
 * Per T07 §9.4: required when result = No.
 */
export const requiresDiscrepancyReason = (
  taskResult: PermitVerificationResult | null,
): boolean =>
  taskResult === 'No';

// -- Work Queue (T07 §9.4) ---------------------------------------------------

/**
 * Returns true if a PermitNotPosted Work Queue item should be raised.
 * Per T07 §9.4: raised when result = No.
 */
export const shouldRaisePermitNotPostedWorkItem = (
  taskResult: PermitVerificationResult | null,
): boolean =>
  taskResult === 'No';

// -- Certification Eligibility (T07 §9.5) ------------------------------------

/** Minimal item shape for permit posting certification check. */
interface PermitCertItem {
  readonly taskInstanceId: string;
  readonly result: PermitVerificationResult | null;
}

/** Minimal detail shape for permit posting certification check. */
interface PermitCertDetail {
  readonly taskInstanceId: string;
  readonly verifiedBy: string | null;
  readonly verifiedAt: string | null;
  readonly physicalEvidenceAttachmentIds: readonly string[];
  readonly discrepancyReason: string | null;
}

/**
 * Returns true if PERMIT_POSTING certification may be submitted per T07 §9.5.
 * Requirements:
 * 1. All Section 4 items have result ≠ null
 * 2. All Yes items have physicalEvidenceAttachmentIds[], verifiedBy, verifiedAt
 * 3. All No items have discrepancyReason populated
 * 4. NA items excluded from requirements
 */
export const canSubmitPermitPostingCertification = (
  items: ReadonlyArray<PermitCertItem>,
  details: ReadonlyArray<PermitCertDetail>,
): boolean => {
  // Rule 1: all items assessed
  if (items.some((item) => item.result === null)) return false;

  for (const item of items) {
    if (item.result === 'NA') continue;

    const detail = details.find((d) => d.taskInstanceId === item.taskInstanceId);
    if (!detail) return false;

    if (item.result === 'Yes') {
      // Rule 2: Yes items need evidence
      if (!detail.verifiedBy || !detail.verifiedAt || detail.physicalEvidenceAttachmentIds.length === 0) {
        return false;
      }
    }

    if (item.result === 'No') {
      // Rule 3: No items need discrepancy reason
      if (!detail.discrepancyReason) return false;
    }
  }

  return true;
};

// -- Non-Interference (T07 §8.1) ---------------------------------------------

/**
 * Startup Permit Posting Verification never writes to the P3-E7 Permits module.
 * Always returns false. Per T07 §8.1 non-interference rule.
 */
export const canStartupWriteToPermitsModule = (): false => false;

// -- PWA/SPFx Depth (T09 §7.2) -----------------------------------------------

/**
 * Returns true if photo evidence upload is available on the given surface.
 * Per T09 §7.2: PWA supports full photo upload; SPFx defers to PWA.
 */
export const isPhotoUploadAvailable = (surface: AppSurface): boolean =>
  surface === 'PWA';
