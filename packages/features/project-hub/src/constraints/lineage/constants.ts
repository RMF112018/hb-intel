/**
 * P3-E6-T05 Cross-Ledger Lineage constants.
 */

import type { ConstraintsRelationshipType, LedgerType, RelatedItemObjectType, SpawnAction } from './enums.js';
import type { IRelatedItemRegistration, IRelationshipTypeMapping, ISpawnPathConfig } from './types.js';

// ── Module Scope ────────────────────────────────────────────────────

export const LINEAGE_SCOPE = 'constraints/lineage' as const;

// ── Enum Arrays ─────────────────────────────────────────────────────

export const SPAWN_ACTIONS = [
  'RiskToConstraint',
  'ConstraintToDelay',
  'ConstraintToChange',
] as const satisfies ReadonlyArray<SpawnAction>;

export const LEDGER_TYPES = [
  'Risk',
  'Constraint',
  'Delay',
  'Change',
] as const satisfies ReadonlyArray<LedgerType>;

export const RELATED_ITEM_OBJECT_TYPES = [
  'RiskRecord',
  'ConstraintRecord',
  'DelayRecord',
  'ChangeEventRecord',
] as const satisfies ReadonlyArray<RelatedItemObjectType>;

export const CONSTRAINTS_RELATIONSHIP_TYPES = [
  'ScheduleActivity',
  'FinancialBudgetLine',
  'PermitRecord',
  'RFI',
  'Submittal',
  'DrawingDocument',
  'PhotoSiteEvidence',
  'MeetingActionItem',
  'SafetyIncident',
] as const satisfies ReadonlyArray<ConstraintsRelationshipType>;

// ── Spawn Path Configuration (§5.2) ─────────────────────────────────

export const SPAWN_PATH_CONFIGS: ReadonlyArray<ISpawnPathConfig> = [
  {
    spawnAction: 'RiskToConstraint',
    parentLedger: 'Risk',
    childLedger: 'Constraint',
    inheritedFields: ['category', 'description', 'owner', 'bic', 'projectId'],
  },
  {
    spawnAction: 'ConstraintToDelay',
    parentLedger: 'Constraint',
    childLedger: 'Delay',
    inheritedFields: ['projectId', 'category', 'owner', 'description', 'identifiedBy'],
  },
  {
    spawnAction: 'ConstraintToChange',
    parentLedger: 'Constraint',
    childLedger: 'Change',
    inheritedFields: ['projectId', 'category', 'description', 'identifiedBy'],
  },
];

// ── Related Items Registrations (§5.7) ──────────────────────────────

export const RELATED_ITEM_REGISTRATIONS: ReadonlyArray<IRelatedItemRegistration> = [
  { objectType: 'RiskRecord', ledgerType: 'Risk', displayName: 'Risk' },
  { objectType: 'ConstraintRecord', ledgerType: 'Constraint', displayName: 'Constraint' },
  { objectType: 'DelayRecord', ledgerType: 'Delay', displayName: 'Delay' },
  { objectType: 'ChangeEventRecord', ledgerType: 'Change', displayName: 'Change Event' },
];

export const RELATIONSHIP_TYPE_MAPPINGS: ReadonlyArray<IRelationshipTypeMapping> = [
  { relationshipType: 'ScheduleActivity', applicableTo: ['ConstraintRecord', 'DelayRecord', 'ChangeEventRecord'] },
  { relationshipType: 'FinancialBudgetLine', applicableTo: ['ConstraintRecord', 'DelayRecord', 'ChangeEventRecord'] },
  { relationshipType: 'PermitRecord', applicableTo: ['ConstraintRecord', 'DelayRecord'] },
  { relationshipType: 'RFI', applicableTo: ['RiskRecord', 'ConstraintRecord', 'DelayRecord', 'ChangeEventRecord'] },
  { relationshipType: 'Submittal', applicableTo: ['ConstraintRecord', 'ChangeEventRecord'] },
  { relationshipType: 'DrawingDocument', applicableTo: ['RiskRecord', 'ConstraintRecord', 'DelayRecord', 'ChangeEventRecord'] },
  { relationshipType: 'PhotoSiteEvidence', applicableTo: ['RiskRecord', 'ConstraintRecord', 'DelayRecord', 'ChangeEventRecord'] },
  { relationshipType: 'MeetingActionItem', applicableTo: ['RiskRecord', 'ConstraintRecord', 'DelayRecord', 'ChangeEventRecord'] },
  { relationshipType: 'SafetyIncident', applicableTo: ['ConstraintRecord'] },
];

// ── Label Maps ──────────────────────────────────────────────────────

export const SPAWN_ACTION_LABELS: Readonly<Record<SpawnAction, string>> = {
  RiskToConstraint: 'Risk → Constraint (materialization)',
  ConstraintToDelay: 'Constraint → Delay (schedule impact)',
  ConstraintToChange: 'Constraint → Change Event (scope/cost change)',
};

export const LEDGER_TYPE_LABELS: Readonly<Record<LedgerType, string>> = {
  Risk: 'Risk Ledger',
  Constraint: 'Constraint Ledger',
  Delay: 'Delay Ledger',
  Change: 'Change Ledger',
};
