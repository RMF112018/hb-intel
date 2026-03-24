/**
 * P3-E8-T05 Corrective actions, incidents, evidence constants.
 */

import type { CorrectiveActionStatus } from '../records/enums.js';
import type { IncidentPersonRole } from './enums.js';
import type {
  ICAWorkQueueTrigger,
  IIncidentVisibilityRule,
  IEvidenceSensitivityDefault,
  IEvidenceRetentionRule,
  ICompositeCAHealthSignal,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const INCIDENT_PERSON_ROLES = [
  'INJURED_PARTY', 'WITNESS', 'SUPERVISOR_ON_DUTY', 'FIRST_RESPONDER',
] as const satisfies ReadonlyArray<IncidentPersonRole>;

// -- CA Escalation Thresholds -----------------------------------------------

export const CRITICAL_CA_ESCALATION_HOURS = 4;
export const PENDING_VERIFICATION_ESCALATION_DAYS = 2;

/** Statuses that can be considered overdue (non-terminal, non-closed). */
export const CA_OVERDUE_CANDIDATE_STATUSES: readonly CorrectiveActionStatus[] = [
  'OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION',
];

// -- CA Work Queue Triggers (§1.4) ------------------------------------------

export const CA_WORK_QUEUE_TRIGGERS: ReadonlyArray<ICAWorkQueueTrigger> = [
  {
    trigger: 'CA created',
    workQueueItem: 'Complete safety corrective action',
    priority: 'Per severity',
    assignee: 'Assigned party',
  },
  {
    trigger: 'CA is overdue',
    workQueueItem: 'OVERDUE: safety corrective action',
    priority: 'One level above severity',
    assignee: 'Assigned party + Safety Manager',
  },
  {
    trigger: 'CA in PENDING_VERIFICATION > 2 business days',
    workQueueItem: 'Verify corrective action completion',
    priority: 'MEDIUM',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'CRITICAL CA open > 4 hours without IN_PROGRESS',
    workQueueItem: 'Respond to critical safety finding',
    priority: 'CRITICAL',
    assignee: 'Safety Manager + PM',
  },
];

// -- Incident Visibility Rules (§2.3) ---------------------------------------

export const INCIDENT_VISIBILITY_RULES: ReadonlyArray<IIncidentVisibilityRule> = [
  // STANDARD tier
  { privacyTier: 'STANDARD', role: 'SafetyManager', visibleFields: 'Full record' },
  { privacyTier: 'STANDARD', role: 'SafetyOfficer', visibleFields: 'Full record' },
  { privacyTier: 'STANDARD', role: 'ProjectManager', visibleFields: 'Full record except personsInvolved' },
  { privacyTier: 'STANDARD', role: 'Superintendent', visibleFields: 'Full record except personsInvolved' },
  { privacyTier: 'STANDARD', role: 'FieldEngineer', visibleFields: 'Not visible' },
  // SENSITIVE tier
  { privacyTier: 'SENSITIVE', role: 'SafetyManager', visibleFields: 'Full record' },
  { privacyTier: 'SENSITIVE', role: 'SafetyOfficer', visibleFields: 'Full record' },
  { privacyTier: 'SENSITIVE', role: 'ProjectManager', visibleFields: 'Type, date, location, immediate actions, CAs only' },
  { privacyTier: 'SENSITIVE', role: 'Superintendent', visibleFields: 'Not visible' },
  { privacyTier: 'SENSITIVE', role: 'FieldEngineer', visibleFields: 'Not visible' },
  // RESTRICTED tier
  { privacyTier: 'RESTRICTED', role: 'SafetyManager', visibleFields: 'Full record' },
  { privacyTier: 'RESTRICTED', role: 'SafetyOfficer', visibleFields: 'Full record' },
  { privacyTier: 'RESTRICTED', role: 'ProjectManager', visibleFields: 'Type and date only' },
  { privacyTier: 'RESTRICTED', role: 'Superintendent', visibleFields: 'Not visible' },
  { privacyTier: 'RESTRICTED', role: 'FieldEngineer', visibleFields: 'Not visible' },
];

// -- Evidence Sensitivity Defaults (§3.2) -----------------------------------

export const EVIDENCE_SENSITIVITY_DEFAULTS: ReadonlyArray<IEvidenceSensitivityDefault> = [
  { sourceType: 'INSPECTION', defaultSensitivity: 'STANDARD' },
  { sourceType: 'INCIDENT', defaultSensitivity: 'SENSITIVE' },
  { sourceType: 'JHA', defaultSensitivity: 'STANDARD' },
  { sourceType: 'CORRECTIVE_ACTION', defaultSensitivity: 'STANDARD' },
  { sourceType: 'TOOLBOX_TALK', defaultSensitivity: 'STANDARD' },
  { sourceType: 'ORIENTATION', defaultSensitivity: 'STANDARD' },
  { sourceType: 'SUBMISSION', defaultSensitivity: 'STANDARD' },
  { sourceType: 'CERTIFICATION', defaultSensitivity: 'STANDARD' },
  { sourceType: 'GENERAL', defaultSensitivity: 'STANDARD' },
];

// -- Evidence Retention Rules (§3.3) ----------------------------------------

export const EVIDENCE_RETENTION_RULES: ReadonlyArray<IEvidenceRetentionRule> = [
  {
    category: 'STANDARD_PROJECT',
    minimumRetention: 'Project close + 3 years',
    governanceRule: 'Standard project safety records',
  },
  {
    category: 'EXTENDED_REGULATORY',
    minimumRetention: 'Project close + 7 years',
    governanceRule: 'OSHA-required records, SSSP, training records',
  },
  {
    category: 'LITIGATION_HOLD',
    minimumRetention: 'Until legal hold released',
    governanceRule: 'Cannot expire; cannot be deleted without Safety Manager action and audit note',
  },
];

// -- Composite CA Health Signals (§4) ----------------------------------------

export const COMPOSITE_CA_HEALTH_SIGNALS: ReadonlyArray<ICompositeCAHealthSignal> = [
  { signal: 'Open CRITICAL CAs', computation: 'Count of CAs in OPEN or IN_PROGRESS with severity CRITICAL' },
  { signal: 'Overdue CAs', computation: 'Count of CAs where isOverdue = true and status not terminal' },
  { signal: 'CA aging', computation: 'Average days open for OPEN + IN_PROGRESS CAs' },
  { signal: 'Incident count (current project)', computation: 'Count by type in current 30-day window' },
  { signal: 'LITIGATED incidents', computation: 'Boolean: any incident in LITIGATED state on project' },
];

// -- Label Maps -------------------------------------------------------------

export const INCIDENT_PERSON_ROLE_LABELS: Readonly<Record<IncidentPersonRole, string>> = {
  INJURED_PARTY: 'Injured Party',
  WITNESS: 'Witness',
  SUPERVISOR_ON_DUTY: 'Supervisor on Duty',
  FIRST_RESPONDER: 'First Responder',
};
