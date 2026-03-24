/**
 * P3-E8-T07 Compliance and qualification business rules.
 * Certification status computation, designation cascade, orientation,
 * submission review, SDS compliance, workforce identity.
 */

import type {
  AcknowledgmentMethod,
  CertificationStatus,
  OrientationStatus,
  SafetySubmissionType,
  SdsStatus,
  SubmissionReviewStatus,
} from '../records/enums.js';
import type { ICertificationStatusResult } from './types.js';
import { EXPIRING_SOON_THRESHOLD_DAYS, REQUIRED_EVIDENCE_METHODS } from './constants.js';

// -- Certification Status Computation (§3) ----------------------------------

/**
 * §3: Compute certification status from expiration date and revocation flag.
 * - null expiration → ACTIVE (no expiration)
 * - > 30 days → ACTIVE
 * - ≤ 30 days → EXPIRING_SOON
 * - Past → EXPIRED
 * - Revoked flag → REVOKED (overrides date logic)
 */
export const computeCertificationStatus = (
  expirationDate: string | null,
  isRevoked: boolean,
  today: string = new Date().toISOString().slice(0, 10),
): ICertificationStatusResult => {
  if (isRevoked) {
    return { status: 'REVOKED', daysToExpiration: null };
  }

  if (expirationDate === null) {
    return { status: 'ACTIVE', daysToExpiration: null };
  }

  const expMs = new Date(expirationDate).getTime();
  const todayMs = new Date(today).getTime();
  const daysToExpiration = Math.floor((expMs - todayMs) / (1000 * 60 * 60 * 24));

  if (daysToExpiration < 0) {
    return { status: 'EXPIRED', daysToExpiration };
  }

  if (daysToExpiration <= EXPIRING_SOON_THRESHOLD_DAYS) {
    return { status: 'EXPIRING_SOON', daysToExpiration };
  }

  return { status: 'ACTIVE', daysToExpiration };
};

// -- Designation Cascade (§5.4) ---------------------------------------------

/**
 * §5.4: When cert expires or is revoked, linked designation must cascade.
 */
export const shouldCascadeDesignation = (certStatus: CertificationStatus): boolean =>
  certStatus === 'EXPIRED' || certStatus === 'REVOKED';

// -- Acknowledgment Evidence (§1) -------------------------------------------

/**
 * §1: PHYSICAL_SIGNATURE requires linked evidence record.
 * DIGITAL_SIGNATURE and VERBAL_CONFIRMED do not.
 */
export const isAcknowledgmentEvidenceRequired = (method: AcknowledgmentMethod): boolean =>
  (REQUIRED_EVIDENCE_METHODS as readonly string[]).includes(method);

// -- Orientation Completeness (§1) ------------------------------------------

/**
 * §1: Orientation is complete when status is COMPLETE and acknowledgment is present.
 */
export const isOrientationComplete = (
  status: OrientationStatus,
  acknowledgedAt: string | null,
): boolean =>
  status === 'COMPLETE' && acknowledgedAt !== null;

// -- Submission Review (§2) -------------------------------------------------

/**
 * §2: Check if all required submission types are in APPROVED state.
 */
export const areRequiredSubmissionsApproved = (
  submissions: ReadonlyArray<{ submissionType: SafetySubmissionType; status: SubmissionReviewStatus }>,
  requiredTypes: readonly SafetySubmissionType[],
): boolean =>
  requiredTypes.every((requiredType) =>
    submissions.some(
      (s) => s.submissionType === requiredType && s.status === 'APPROVED',
    ),
  );

/**
 * §2: REJECTED or REVISION_REQUESTED requires resubmission.
 */
export const isSubmissionResubmissionRequired = (status: SubmissionReviewStatus): boolean =>
  status === 'REJECTED' || status === 'REVISION_REQUESTED';

// -- Workforce Identity (§6) ------------------------------------------------

/**
 * §6.3: Provisional worker (workerId null) can be upgraded to governed identity.
 * Already-governed workers (workerId non-null) are already linked.
 */
export const canUpgradeWorkerIdentity = (currentWorkerId: string | null): boolean =>
  currentWorkerId === null;

// -- SDS Compliance (§4) ----------------------------------------------------

/**
 * §4: Check if there is a compliance gap — active products without ACTIVE SDS records.
 */
export const hasSdsComplianceGap = (
  activeProductNames: readonly string[],
  sdsRecords: ReadonlyArray<{ productName: string; status: SdsStatus }>,
): boolean => {
  if (activeProductNames.length === 0) return false;
  return activeProductNames.some((product) =>
    !sdsRecords.some((sds) => sds.productName === product && sds.status === 'ACTIVE'),
  );
};
