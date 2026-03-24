/**
 * P3-E11-T10 Stage 3 Project Startup Safety Readiness enumerations.
 * 32-item safety checklist, remediation model, escalation levels.
 */

// -- Section Titles (T07 §3) ------------------------------------------------

/** The 2 safety readiness section titles per T07 §3. */
export type SafetyReadinessSectionTitle =
  | 'AreasOfHighestRisk'
  | 'OtherRisks';

// -- Item Result (T07 §4) ---------------------------------------------------

/** Safety readiness item result per T07 §4. Null while not yet assessed. */
export type SafetyReadinessResult =
  | 'Pass'
  | 'Fail'
  | 'NA';

// -- Remediation Status (T07 §5) --------------------------------------------

/** SafetyRemediationRecord status per T07 §5.0. */
export type RemediationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ESCALATED';

// -- Escalation Level (T07 §5.2) --------------------------------------------

/** Remediation escalation level per T07 §5.2. */
export type EscalationLevel =
  | 'NONE'
  | 'PM'
  | 'PX';

// -- Stage 3 Activity Spine Events (T10 §2 Stage 3) -------------------------

/** Activity Spine events emitted by Stage 3 per T10 §2 Stage 3. */
export type Stage3ActivityEvent =
  | 'SafetyReadinessItemUpdated'
  | 'SafetyRemediationCreated'
  | 'SafetyRemediationEscalated'
  | 'SafetyRemediationResolved';

// -- Stage 3 Health Spine Metrics (T10 §2 Stage 3) --------------------------

/** Health Spine metrics published by Stage 3 per T10 §2 Stage 3. */
export type Stage3HealthMetric =
  | 'safetyReadinessOpenRemediations'
  | 'safetyReadinessEscalatedRemediations';

// -- Stage 3 Work Queue Items (T07 §5, T10 §2 Stage 3) ----------------------

/** Work Queue item types raised by Stage 3. */
export type Stage3WorkQueueItem =
  | 'SafetyRemediationPending'
  | 'SafetyRemediationUnassigned'
  | 'SafetyRemediationOverdue'
  | 'SafetyRemediationEscalated';
