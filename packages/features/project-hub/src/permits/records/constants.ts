/**
 * P3-E7-T02 Permits Record Architecture constants.
 */

import type {
  CheckpointStatus, DeficiencyResolutionStatus, DeficiencySeverity,
  ExpirationRiskTier, InspectionVisitResult, IssuedPermitStatus,
  PartyType, PermitAccountableRole, PermitApplicationStatus,
  PermitEvidenceType, PermitHealthTier, PermitLifecycleActionType,
  PermitType, RequiredInspectionResult, SubmissionMethod,
} from './enums.js';

export const RECORDS_SCOPE = 'permits/records' as const;

export const PERMIT_APPLICATION_STATUSES = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'WITHDRAWN',
] as const satisfies ReadonlyArray<PermitApplicationStatus>;

export const ISSUED_PERMIT_STATUSES = [
  'ACTIVE', 'ACTIVE_EXPIRING', 'UNDER_INSPECTION', 'SUSPENDED', 'STOP_WORK', 'VIOLATION_ISSUED',
  'RENEWAL_IN_PROGRESS', 'RENEWED', 'EXPIRED', 'CLOSED', 'REVOKED', 'REJECTED',
] as const satisfies ReadonlyArray<IssuedPermitStatus>;

export const CHECKPOINT_STATUSES = [
  'NOT_SCHEDULED', 'CALLED_IN', 'SCHEDULED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'WAIVED', 'NOT_APPLICABLE',
] as const satisfies ReadonlyArray<CheckpointStatus>;

export const INSPECTION_VISIT_RESULTS = [
  'PASSED', 'PASSED_WITH_CONDITIONS', 'FAILED', 'PARTIAL_PASS', 'RESCHEDULED', 'CANCELLED', 'PENDING',
] as const satisfies ReadonlyArray<InspectionVisitResult>;

export const DEFICIENCY_SEVERITIES = [
  'HIGH', 'MEDIUM', 'LOW',
] as const satisfies ReadonlyArray<DeficiencySeverity>;

export const DEFICIENCY_RESOLUTION_STATUSES = [
  'OPEN', 'ACKNOWLEDGED', 'REMEDIATION_IN_PROGRESS', 'RESOLVED', 'VERIFIED_RESOLVED', 'DISPUTED', 'WAIVED',
] as const satisfies ReadonlyArray<DeficiencyResolutionStatus>;

export const PERMIT_LIFECYCLE_ACTION_TYPES = [
  'ISSUED', 'ACTIVATED', 'INSPECTION_PASSED', 'INSPECTION_FAILED',
  'DEFICIENCY_OPENED', 'DEFICIENCY_RESOLVED', 'STOP_WORK_ISSUED', 'STOP_WORK_LIFTED',
  'VIOLATION_ISSUED', 'VIOLATION_RESOLVED', 'SUSPENSION_ISSUED', 'SUSPENSION_LIFTED',
  'RENEWAL_INITIATED', 'RENEWAL_APPROVED', 'RENEWAL_DENIED', 'EXPIRATION_WARNING',
  'EXPIRED', 'REVOKED', 'CLOSED', 'CORRECTION_ISSUED',
] as const satisfies ReadonlyArray<PermitLifecycleActionType>;

export const PERMIT_EVIDENCE_TYPES = [
  'PERMIT_DOCUMENT', 'APPROVED_PLANS', 'INSPECTION_REPORT', 'CERTIFICATE_OF_OCCUPANCY',
  'VIOLATION_NOTICE', 'STOP_WORK_ORDER', 'RENEWAL_APPLICATION', 'PHOTO_EVIDENCE',
  'CORRESPONDENCE', 'OTHER',
] as const satisfies ReadonlyArray<PermitEvidenceType>;

export const PERMIT_TYPES = [
  'DEMOLITION', 'ELECTRICAL', 'ELEVATOR', 'FIRE_ALARM', 'FIRE_SPRINKLER', 'MASS_GRADING',
  'MASTER_BUILDING', 'MECHANICAL', 'PLUMBING', 'POOL_BARRICADE', 'ROOFING', 'SITE_DEVELOPMENT',
] as const satisfies ReadonlyArray<PermitType>;

export const EXPIRATION_RISK_TIERS = [
  'CRITICAL', 'HIGH', 'MEDIUM', 'LOW',
] as const satisfies ReadonlyArray<ExpirationRiskTier>;

export const PERMIT_HEALTH_TIERS = [
  'CRITICAL', 'AT_RISK', 'NORMAL', 'CLOSED',
] as const satisfies ReadonlyArray<PermitHealthTier>;

export const PERMIT_ACCOUNTABLE_ROLES = [
  'PROJECT_MANAGER', 'SITE_SUPERVISOR', 'GC_REPRESENTATIVE', 'OWNER_REPRESENTATIVE', 'PERMIT_EXPEDITER',
] as const satisfies ReadonlyArray<PermitAccountableRole>;

export const REQUIRED_INSPECTION_RESULTS = [
  'PASS', 'FAIL', 'NOT_APPLICABLE', 'PENDING',
] as const satisfies ReadonlyArray<RequiredInspectionResult>;

export const SUBMISSION_METHODS = [
  'ONLINE', 'IN_PERSON', 'MAIL', 'PORTAL',
] as const satisfies ReadonlyArray<SubmissionMethod>;

export const PARTY_TYPES = [
  'USER', 'ORGANIZATION', 'SUBCONTRACTOR', 'JURISDICTION',
] as const satisfies ReadonlyArray<PartyType>;

// ── Label Maps ──────────────────────────────────────────────────────

export const PERMIT_TYPE_LABELS: Readonly<Record<PermitType, string>> = {
  DEMOLITION: 'Demolition', ELECTRICAL: 'Electrical', ELEVATOR: 'Elevator',
  FIRE_ALARM: 'Fire Alarm', FIRE_SPRINKLER: 'Fire Sprinkler', MASS_GRADING: 'Mass Grading',
  MASTER_BUILDING: 'Master Building', MECHANICAL: 'Mechanical', PLUMBING: 'Plumbing',
  POOL_BARRICADE: 'Pool/Barricade', ROOFING: 'Roofing', SITE_DEVELOPMENT: 'Site Development',
};

export const ISSUED_PERMIT_STATUS_LABELS: Readonly<Record<IssuedPermitStatus, string>> = {
  ACTIVE: 'Active', ACTIVE_EXPIRING: 'Active (Expiring)', UNDER_INSPECTION: 'Under Inspection',
  SUSPENDED: 'Suspended', STOP_WORK: 'Stop Work', VIOLATION_ISSUED: 'Violation Issued',
  RENEWAL_IN_PROGRESS: 'Renewal in Progress', RENEWED: 'Renewed', EXPIRED: 'Expired',
  CLOSED: 'Closed', REVOKED: 'Revoked', REJECTED: 'Rejected',
};

export const DEFICIENCY_SEVERITY_LABELS: Readonly<Record<DeficiencySeverity, string>> = {
  HIGH: 'High — safety-critical; immediate action required',
  MEDIUM: 'Medium — significant; resolve before next phase',
  LOW: 'Low — minor; resolve before closeout',
};
