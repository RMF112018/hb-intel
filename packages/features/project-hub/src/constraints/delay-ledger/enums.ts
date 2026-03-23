/**
 * P3-E6-T03 Delay Ledger enumerations.
 * String literal union types for all governed value sets.
 */

// ── Delay Status Lifecycle (§3.4) ───────────────────────────────────

/** Delay lifecycle status. Terminal states: Closed, Void, Cancelled. */
export type DelayStatus =
  | 'Identified'
  | 'UnderAnalysis'
  | 'Quantified'
  | 'Dispositioned'
  | 'Closed'
  | 'Void'
  | 'Cancelled';

// ── Delay Event Type (§3.5) ─────────────────────────────────────────

/** Governed delay event type. Immutable after creation. */
export type DelayEventType =
  | 'OWNER_DIRECTED'
  | 'DIFFERING_CONDITIONS'
  | 'WEATHER_EXCEEDANCE'
  | 'THIRD_PARTY'
  | 'DESIGN_CHANGE'
  | 'FORCE_MAJEURE'
  | 'CONCURRENT'
  | 'CONTRACTOR_CAUSED'
  | 'SUBCONTRACTOR_CAUSED'
  | 'PROCUREMENT'
  | 'LABOR'
  | 'OTHER';

// ── Responsible Party (§3.6) ────────────────────────────────────────

/** Governed responsible party attribution. */
export type ResponsibleParty =
  | 'OWNER'
  | 'GC'
  | 'SUBCONTRACTOR'
  | 'THIRD_PARTY'
  | 'FORCE_MAJEURE'
  | 'CONCURRENT'
  | 'UNKNOWN';

// ── Critical Path Impact (§3.7) ─────────────────────────────────────

/** Governed critical path impact assessment. */
export type CriticalPathImpact =
  | 'CRITICAL'
  | 'NEAR_CRITICAL'
  | 'NON_CRITICAL'
  | 'UNKNOWN';

// ── Analysis Method (§3.8) ──────────────────────────────────────────

/** Governed time impact analysis method. */
export type AnalysisMethod =
  | 'TIA'
  | 'FRAGNET'
  | 'GLOBAL_IMPACT'
  | 'AS_PLANNED_VS_AS_BUILT'
  | 'CONTEMPORANEOUS_UPDATE'
  | 'MANUAL_ESTIMATE'
  | 'NOT_YET_PERFORMED';

// ── Evidence Type (§3.9) ────────────────────────────────────────────

/** Governed evidence attachment type for claims packaging. */
export type EvidenceType =
  | 'CORRESPONDENCE'
  | 'MEETING_MINUTES'
  | 'SCHEDULE_DOCUMENT'
  | 'PHOTO'
  | 'DAILY_REPORT'
  | 'COST_DOCUMENT'
  | 'THIRD_PARTY_DOCUMENT'
  | 'TIA_DOCUMENT'
  | 'OTHER';

// ── Quantification Confidence ───────────────────────────────────────

/** Confidence level for time or cost quantification. */
export type QuantificationConfidence =
  | 'Rough'
  | 'Ordered'
  | 'Definitive';

// ── Disposition Outcome ─────────────────────────────────────────────

/** Required at Dispositioned state gate. */
export type DispositionOutcome =
  | 'Withdrawn'
  | 'SettledByChange'
  | 'SettledByTime'
  | 'ClaimPreserved'
  | 'Dispute';

// ── Schedule Reference Mode ─────────────────────────────────────────

/** Determines which schedule reference fields are active. */
export type ScheduleReferenceMode =
  | 'Integrated'
  | 'ManualFallback';
