/**
 * P3-E8-T09 Publication contract enumerations.
 * Safety posture, activity events, relationship types, report types.
 */

// -- Safety Posture (§2.2) --------------------------------------------------

export type SafetyPosture =
  | 'CRITICAL'
  | 'AT_RISK'
  | 'ATTENTION'
  | 'NORMAL'
  | 'INSUFFICIENT_DATA';

// -- Activity Spine Event Types (§3) ----------------------------------------

export type SafetyActivityEventType =
  | 'SSSP_SUBMITTED_FOR_APPROVAL'
  | 'SSSP_APPROVED'
  | 'SSSP_ADDENDUM_APPROVED'
  | 'INSPECTION_COMPLETED'
  | 'INSPECTION_TREND_DECLINING'
  | 'CRITICAL_CA_CREATED'
  | 'CORRECTIVE_ACTION_CLOSED'
  | 'INCIDENT_REPORTED'
  | 'JHA_APPROVED'
  | 'TOOLBOX_TALK_COMPLETED'
  | 'SUBCONTRACTOR_SUBMISSION_APPROVED'
  | 'SUBCONTRACTOR_SUBMISSION_REJECTED'
  | 'CREW_ORIENTATION_COMPLETED'
  | 'CERTIFICATION_EXPIRED_BLOCKING'
  | 'ORIENTATION_GAP_DETECTED'
  | 'READINESS_DECISION_CHANGED'
  | 'READINESS_OVERRIDE_ACKNOWLEDGED'
  | 'READINESS_OVERRIDE_LAPSED';

// -- Related Items Relationship Types (§5) ----------------------------------

export type SafetyRelationshipType =
  | 'ORIGINATED_FROM'
  | 'GENERATED'
  | 'GOVERNS'
  | 'FULFILLS'
  | 'QUALIFIES_FOR'
  | 'AMENDS';

// -- Report Types (§6) ------------------------------------------------------

export type SafetyReportType =
  | 'WEEKLY_SUMMARY'
  | 'INSPECTION_HISTORY'
  | 'CA_AGING'
  | 'INCIDENT_REGISTER'
  | 'SUBCONTRACTOR_COMPLIANCE'
  | 'TREND_REPORT'
  | 'SSSP_VERSION_HISTORY';
