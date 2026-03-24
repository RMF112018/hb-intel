/**
 * P3-E7-T02 Permits Record Architecture enumerations.
 * All status, type, and classification enums for the 7 record families.
 */

// ── PermitApplicationStatus (§2.3) ──────────────────────────────────

export type PermitApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

// ── IssuedPermitStatus (§3.3) ───────────────────────────────────────

export type IssuedPermitStatus =
  | 'ACTIVE'
  | 'ACTIVE_EXPIRING'
  | 'UNDER_INSPECTION'
  | 'SUSPENDED'
  | 'STOP_WORK'
  | 'VIOLATION_ISSUED'
  | 'RENEWAL_IN_PROGRESS'
  | 'RENEWED'
  | 'EXPIRED'
  | 'CLOSED'
  | 'REVOKED'
  | 'REJECTED';

// ── CheckpointStatus (§4.3) ─────────────────────────────────────────

export type CheckpointStatus =
  | 'NOT_SCHEDULED'
  | 'CALLED_IN'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'PASSED'
  | 'FAILED'
  | 'WAIVED'
  | 'NOT_APPLICABLE';

// ── InspectionVisitResult (§5.3) ────────────────────────────────────

export type InspectionVisitResult =
  | 'PASSED'
  | 'PASSED_WITH_CONDITIONS'
  | 'FAILED'
  | 'PARTIAL_PASS'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'PENDING';

// ── DeficiencySeverity (§6.3) ───────────────────────────────────────

export type DeficiencySeverity =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

// ── DeficiencyResolutionStatus (§6.4) ───────────────────────────────

export type DeficiencyResolutionStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'REMEDIATION_IN_PROGRESS'
  | 'RESOLVED'
  | 'VERIFIED_RESOLVED'
  | 'DISPUTED'
  | 'WAIVED';

// ── PermitLifecycleActionType (§7.3) ────────────────────────────────

export type PermitLifecycleActionType =
  | 'ISSUED'
  | 'ACTIVATED'
  | 'INSPECTION_PASSED'
  | 'INSPECTION_FAILED'
  | 'DEFICIENCY_OPENED'
  | 'DEFICIENCY_RESOLVED'
  | 'STOP_WORK_ISSUED'
  | 'STOP_WORK_LIFTED'
  | 'VIOLATION_ISSUED'
  | 'VIOLATION_RESOLVED'
  | 'SUSPENSION_ISSUED'
  | 'SUSPENSION_LIFTED'
  | 'RENEWAL_INITIATED'
  | 'RENEWAL_APPROVED'
  | 'RENEWAL_DENIED'
  | 'EXPIRATION_WARNING'
  | 'EXPIRED'
  | 'REVOKED'
  | 'CLOSED'
  | 'CORRECTION_ISSUED';

// ── PermitEvidenceType (§8.3) ───────────────────────────────────────

export type PermitEvidenceType =
  | 'PERMIT_DOCUMENT'
  | 'APPROVED_PLANS'
  | 'INSPECTION_REPORT'
  | 'CERTIFICATE_OF_OCCUPANCY'
  | 'VIOLATION_NOTICE'
  | 'STOP_WORK_ORDER'
  | 'RENEWAL_APPLICATION'
  | 'PHOTO_EVIDENCE'
  | 'CORRESPONDENCE'
  | 'OTHER';

// ── PermitType (§9.3) ──────────────────────────────────────────────

export type PermitType =
  | 'DEMOLITION'
  | 'ELECTRICAL'
  | 'ELEVATOR'
  | 'FIRE_ALARM'
  | 'FIRE_SPRINKLER'
  | 'MASS_GRADING'
  | 'MASTER_BUILDING'
  | 'MECHANICAL'
  | 'PLUMBING'
  | 'POOL_BARRICADE'
  | 'ROOFING'
  | 'SITE_DEVELOPMENT';

// ── ExpirationRiskTier (§9.4) ──────────────────────────────────────

export type ExpirationRiskTier =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

// ── PermitHealthTier (§9.5) ────────────────────────────────────────

export type PermitHealthTier =
  | 'CRITICAL'
  | 'AT_RISK'
  | 'NORMAL'
  | 'CLOSED';

// ── PermitAccountableRole (§9.6) ───────────────────────────────────

export type PermitAccountableRole =
  | 'PROJECT_MANAGER'
  | 'SITE_SUPERVISOR'
  | 'GC_REPRESENTATIVE'
  | 'OWNER_REPRESENTATIVE'
  | 'PERMIT_EXPEDITER';

// ── RequiredInspectionResult (§9.7) ─────────────────────────────────

export type RequiredInspectionResult =
  | 'PASS'
  | 'FAIL'
  | 'NOT_APPLICABLE'
  | 'PENDING';

// ── SubmissionMethod (§9.8) ─────────────────────────────────────────

export type SubmissionMethod =
  | 'ONLINE'
  | 'IN_PERSON'
  | 'MAIL'
  | 'PORTAL';

// ── PartyType (§9.9) ───────────────────────────────────────────────

export type PartyType =
  | 'USER'
  | 'ORGANIZATION'
  | 'SUBCONTRACTOR'
  | 'JURISDICTION';
