/**
 * P3-E6-T03 Delay Ledger constants.
 * Contract-locked values for enumerations, transition rules, and governed defaults.
 */

import type {
  AnalysisMethod,
  CriticalPathImpact,
  DelayEventType,
  DelayStatus,
  DispositionOutcome,
  EvidenceType,
  QuantificationConfidence,
  ResponsibleParty,
  ScheduleReferenceMode,
} from './enums.js';

// ── Module Scope ────────────────────────────────────────────────────

export const DELAY_LEDGER_SCOPE = 'constraints/delay-ledger' as const;

// ── Status Enumerations (§3.4) ──────────────────────────────────────

export const DELAY_STATUSES = [
  'Identified',
  'UnderAnalysis',
  'Quantified',
  'Dispositioned',
  'Closed',
  'Void',
  'Cancelled',
] as const satisfies ReadonlyArray<DelayStatus>;

export const TERMINAL_DELAY_STATUSES = [
  'Closed',
  'Void',
  'Cancelled',
] as const satisfies ReadonlyArray<DelayStatus>;

// ── Event Type Enumeration (§3.5) ──────────────────────────────────

export const DELAY_EVENT_TYPES = [
  'OWNER_DIRECTED',
  'DIFFERING_CONDITIONS',
  'WEATHER_EXCEEDANCE',
  'THIRD_PARTY',
  'DESIGN_CHANGE',
  'FORCE_MAJEURE',
  'CONCURRENT',
  'CONTRACTOR_CAUSED',
  'SUBCONTRACTOR_CAUSED',
  'PROCUREMENT',
  'LABOR',
  'OTHER',
] as const satisfies ReadonlyArray<DelayEventType>;

// ── Responsible Party Enumeration (§3.6) ────────────────────────────

export const RESPONSIBLE_PARTIES = [
  'OWNER',
  'GC',
  'SUBCONTRACTOR',
  'THIRD_PARTY',
  'FORCE_MAJEURE',
  'CONCURRENT',
  'UNKNOWN',
] as const satisfies ReadonlyArray<ResponsibleParty>;

// ── Critical Path Impact (§3.7) ─────────────────────────────────────

export const CRITICAL_PATH_IMPACTS = [
  'CRITICAL',
  'NEAR_CRITICAL',
  'NON_CRITICAL',
  'UNKNOWN',
] as const satisfies ReadonlyArray<CriticalPathImpact>;

// ── Analysis Method (§3.8) ──────────────────────────────────────────

export const ANALYSIS_METHODS = [
  'TIA',
  'FRAGNET',
  'GLOBAL_IMPACT',
  'AS_PLANNED_VS_AS_BUILT',
  'CONTEMPORANEOUS_UPDATE',
  'MANUAL_ESTIMATE',
  'NOT_YET_PERFORMED',
] as const satisfies ReadonlyArray<AnalysisMethod>;

// ── Evidence Type (§3.9) ────────────────────────────────────────────

export const EVIDENCE_TYPES = [
  'CORRESPONDENCE',
  'MEETING_MINUTES',
  'SCHEDULE_DOCUMENT',
  'PHOTO',
  'DAILY_REPORT',
  'COST_DOCUMENT',
  'THIRD_PARTY_DOCUMENT',
  'TIA_DOCUMENT',
  'OTHER',
] as const satisfies ReadonlyArray<EvidenceType>;

// ── Quantification Confidence ───────────────────────────────────────

export const QUANTIFICATION_CONFIDENCE_LEVELS = [
  'Rough',
  'Ordered',
  'Definitive',
] as const satisfies ReadonlyArray<QuantificationConfidence>;

// ── Disposition Outcome ─────────────────────────────────────────────

export const DISPOSITION_OUTCOMES = [
  'Withdrawn',
  'SettledByChange',
  'SettledByTime',
  'ClaimPreserved',
  'Dispute',
] as const satisfies ReadonlyArray<DispositionOutcome>;

// ── Schedule Reference Mode ─────────────────────────────────────────

export const SCHEDULE_REFERENCE_MODES = [
  'Integrated',
  'ManualFallback',
] as const satisfies ReadonlyArray<ScheduleReferenceMode>;

// ── State Transition Map (§3.4) ─────────────────────────────────────

export const VALID_DELAY_TRANSITIONS: Readonly<Record<DelayStatus, readonly DelayStatus[]>> = {
  Identified: ['UnderAnalysis', 'Void'],
  UnderAnalysis: ['Quantified', 'Void', 'Cancelled'],
  Quantified: ['Dispositioned', 'Closed', 'Void'],
  Dispositioned: ['Closed'],
  Closed: [],
  Void: [],
  Cancelled: [],
};

// ── Immutable Fields ────────────────────────────────────────────────

export const DELAY_IMMUTABLE_FIELDS = [
  'delayId',
  'projectId',
  'delayNumber',
  'delayEventType',
  'dateIdentified',
  'identifiedBy',
  'delayStartDate',
  'parentConstraintId',
  'createdAt',
  'createdBy',
] as const;

// ── Governed Defaults ───────────────────────────────────────────────

/** Default threshold days for pending notification warning. */
export const DEFAULT_NOTIFICATION_THRESHOLD_DAYS = 7;

// ── Label Maps ──────────────────────────────────────────────────────

export const DELAY_EVENT_TYPE_LABELS: Readonly<Record<DelayEventType, string>> = {
  OWNER_DIRECTED: 'Owner-directed delay (change, suspension, access)',
  DIFFERING_CONDITIONS: 'Differing site or subsurface conditions',
  WEATHER_EXCEEDANCE: 'Adverse weather exceeding contract baseline',
  THIRD_PARTY: 'Third-party caused (utility, public authority, regulator)',
  DESIGN_CHANGE: 'Design change or coordination failure',
  FORCE_MAJEURE: 'Force majeure event',
  CONCURRENT: 'Concurrent delay (multiple parties)',
  CONTRACTOR_CAUSED: 'Contractor-caused delay (self-assessment)',
  SUBCONTRACTOR_CAUSED: 'Subcontractor-caused delay',
  PROCUREMENT: 'Material or equipment procurement delay',
  LABOR: 'Labor shortage or workforce delay',
  OTHER: 'Unclassified delay event',
};

export const RESPONSIBLE_PARTY_LABELS: Readonly<Record<ResponsibleParty, string>> = {
  OWNER: 'Owner or owner\'s representative',
  GC: 'General contractor',
  SUBCONTRACTOR: 'Subcontractor or sub-tier',
  THIRD_PARTY: 'Third party (utility, regulator, public authority)',
  FORCE_MAJEURE: 'Force majeure (no responsible party)',
  CONCURRENT: 'Concurrent (shared responsibility)',
  UNKNOWN: 'Not yet determined',
};

export const CRITICAL_PATH_IMPACT_LABELS: Readonly<Record<CriticalPathImpact, string>> = {
  CRITICAL: 'Delay is on or will impact the critical path',
  NEAR_CRITICAL: 'Delay is on near-critical path with < governed float threshold',
  NON_CRITICAL: 'Delay does not impact critical path',
  UNKNOWN: 'Not yet analyzed',
};

export const ANALYSIS_METHOD_LABELS: Readonly<Record<AnalysisMethod, string>> = {
  TIA: 'Time Impact Analysis (AACE RP 29R-03 compliant)',
  FRAGNET: 'Fragnet insertion method',
  GLOBAL_IMPACT: 'Global impact method (total delay apportionment)',
  AS_PLANNED_VS_AS_BUILT: 'As-planned versus as-built comparison',
  CONTEMPORANEOUS_UPDATE: 'Contemporaneous schedule update method',
  MANUAL_ESTIMATE: 'Manual estimate by PM/scheduler',
  NOT_YET_PERFORMED: 'Analysis not yet complete',
};

export const EVIDENCE_TYPE_LABELS: Readonly<Record<EvidenceType, string>> = {
  CORRESPONDENCE: 'Owner/GC letters, emails, or notices',
  MEETING_MINUTES: 'Meeting minutes or action items',
  SCHEDULE_DOCUMENT: 'Schedule file (CPM file, update, or fragnet)',
  PHOTO: 'Site photographs',
  DAILY_REPORT: 'Daily report or foreman log',
  COST_DOCUMENT: 'Cost estimate, invoice, or backup',
  THIRD_PARTY_DOCUMENT: 'Utility, regulatory, or public authority document',
  TIA_DOCUMENT: 'Formal TIA report',
  OTHER: 'Uncategorized evidence',
};

export const DISPOSITION_OUTCOME_LABELS: Readonly<Record<DispositionOutcome, string>> = {
  Withdrawn: 'Withdrawn',
  SettledByChange: 'Settled by change order',
  SettledByTime: 'Settled by time extension',
  ClaimPreserved: 'Claim preserved for future resolution',
  Dispute: 'In dispute',
};
