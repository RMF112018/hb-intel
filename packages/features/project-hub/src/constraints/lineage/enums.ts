/**
 * P3-E6-T05 Cross-Ledger Lineage enumerations.
 */

// ── Spawn Actions (§5.2) ────────────────────────────────────────────

/** Governed spawn action types between ledgers. */
export type SpawnAction =
  | 'RiskToConstraint'
  | 'ConstraintToDelay'
  | 'ConstraintToChange';

// ── Ledger Types ────────────────────────────────────────────────────

/** The four peer ledger types in the Constraints module. */
export type LedgerType =
  | 'Risk'
  | 'Constraint'
  | 'Delay'
  | 'Change';

// ── Related Item Object Types (§5.7) ────────────────────────────────

/** Record types registered with @hbc/related-items. */
export type RelatedItemObjectType =
  | 'RiskRecord'
  | 'ConstraintRecord'
  | 'DelayRecord'
  | 'ChangeEventRecord';

// ── Relationship Types (§5.7) ───────────────────────────────────────

/** Cross-module relationship types from @hbc/related-items registry. */
export type ConstraintsRelationshipType =
  | 'ScheduleActivity'
  | 'FinancialBudgetLine'
  | 'PermitRecord'
  | 'RFI'
  | 'Submittal'
  | 'DrawingDocument'
  | 'PhotoSiteEvidence'
  | 'MeetingActionItem'
  | 'SafetyIncident';
