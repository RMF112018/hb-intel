/**
 * P3-E15-T10 Stage 3 Project QC Module record-families enumerations.
 */

// -- QC Issue Severity (T03 §2.3) ---------------------------------------------

/** QC issue severity levels per T03 §2.3. */
export type QcIssueSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFORMATIONAL';

// -- QC Issue Readiness Impact (T03 §2.3) -------------------------------------

/** QC issue readiness impact per T03 §2.3. */
export type QcIssueReadinessImpact =
  | 'BLOCKS_READINESS'
  | 'DEGRADES_READINESS'
  | 'NO_IMPACT';

// -- Control Gate Type (T03 §2.2) ---------------------------------------------

/** Control gate types per T03 §2.2. */
export type ControlGateType =
  | 'PREINSTALLATION_MEETING'
  | 'MOCKUP'
  | 'TEST'
  | 'HOLD_POINT'
  | 'WITNESS_POINT';

// -- Finding Disposition Type (T03 §2.2) --------------------------------------

/** Finding disposition types per T03 §2.2. */
export type FindingDispositionType =
  | 'ACCEPTED'
  | 'DEFERRED'
  | 'CONVERTED_TO_ISSUE'
  | 'REJECTED';

// -- Evidence Type (T03 §2.4) -------------------------------------------------

/** QC evidence types per T03 §2.4. */
export type QcEvidenceType =
  | 'DOCUMENT'
  | 'PHOTO'
  | 'INSPECTION_RECORD'
  | 'TEST_RESULT'
  | 'THIRD_PARTY_REPORT'
  | 'MANUFACTURER_CERTIFICATE'
  | 'LINKED_ARTIFACT';

// -- Approval Authority Type (T03 §2.4) ---------------------------------------

/** Approval authority types per T03 §2.4. */
export type ApprovalAuthorityType =
  | 'AOR_CONSULTANT'
  | 'THIRD_PARTY_INSPECTOR'
  | 'REGULATORY_BODY'
  | 'OWNER_REPRESENTATIVE'
  | 'INTERNAL_AUTHORITY';

// -- Root Cause Category (T03 §2.5) -------------------------------------------

/** QC root cause categories per T03 §2.5. */
export type QcRootCauseCategory =
  | 'DESIGN'
  | 'MATERIAL'
  | 'WORKMANSHIP'
  | 'PROCEDURE'
  | 'ENVIRONMENTAL'
  | 'EQUIPMENT'
  | 'SUPERVISION'
  | 'COMMUNICATION'
  | 'TRAINING'
  | 'OTHER';

// -- Recurrence Classification (T03 §2.5) ------------------------------------

/** Recurrence classifications per T03 §2.5. */
export type RecurrenceClassification =
  | 'FIRST_OCCURRENCE'
  | 'RECURRING'
  | 'SYSTEMIC'
  | 'TRENDING';

// -- Submittal Activation Stage (T03 §2.6) ------------------------------------

/** Submittal activation stages per T03 §2.6. */
export type SubmittalActivationStage =
  | 'PRELIMINARY_GUIDANCE'
  | 'FULL_PACKAGE_DEPENDENT';

// -- Currentness Status (T03 §2.6) --------------------------------------------

/** Currentness statuses per T03 §2.6. */
export type CurrentnessStatus =
  | 'CURRENT'
  | 'SUPERSEDED_BY_NEWER'
  | 'UNABLE_TO_VERIFY'
  | 'NOT_CHECKED';

// -- Reference Match Confidence (T03 §2.6) ------------------------------------

/** Reference match confidence levels per T03 §2.6. */
export type ReferenceMatchConfidence =
  | 'HIGH'
  | 'MODERATE'
  | 'LOW'
  | 'UNMATCHED';

// -- QC SLA Class (T03 §2.3) --------------------------------------------------

/** QC SLA classes per T03 §2.3. */
export type QcSlaClass =
  | 'STANDARD'
  | 'EXPEDITED'
  | 'CRITICAL';

// -- QC Escalation Level (T03 §2.3) -------------------------------------------

/** QC escalation levels per T03 §2.3. */
export type QcEscalationLevel =
  | 'NONE'
  | 'PM'
  | 'PX'
  | 'EXECUTIVE';

// -- Deviation Exception Type (T03 §2.3) --------------------------------------

/** Deviation exception types per T03 §2.3. */
export type DeviationExceptionType =
  | 'DEVIATION'
  | 'WAIVER';
