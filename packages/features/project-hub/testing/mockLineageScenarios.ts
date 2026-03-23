import { createMockLineageRecord } from './createMockLineageRecord.js';
import { createMockCrossLedgerLink } from './createMockCrossLedgerLink.js';

/** Pre-built lineage scenarios for all spawn paths and peer links. */
export const mockLineageScenarios = {
  /** Risk → Constraint spawn lineage. */
  riskToConstraintLineage: createMockLineageRecord(),

  /** Constraint → Delay spawn lineage. */
  constraintToDelayLineage: createMockLineageRecord({
    lineageId: 'lin-002',
    spawnAction: 'ConstraintToDelay',
    parentLedger: 'Constraint',
    parentRecordId: 'con-008',
    parentRecordNumber: 'CON-008',
    childLedger: 'Delay',
    childRecordId: 'del-012',
    childRecordNumber: 'DEL-012',
    inheritedFields: ['projectId', 'category', 'owner', 'description', 'identifiedBy'],
    inheritedValues: {
      projectId: 'proj-001',
      category: 'PROCUREMENT',
      owner: 'user-002',
      description: 'Long-lead elevator equipment delivery',
      identifiedBy: 'user-001',
    },
  }),

  /** Constraint → Change Event spawn lineage. */
  constraintToChangeLineage: createMockLineageRecord({
    lineageId: 'lin-003',
    spawnAction: 'ConstraintToChange',
    parentLedger: 'Constraint',
    parentRecordId: 'con-008',
    parentRecordNumber: 'CON-008',
    childLedger: 'Change',
    childRecordId: 'ce-010',
    childRecordNumber: 'CE-010',
    inheritedFields: ['projectId', 'category', 'description', 'identifiedBy'],
    inheritedValues: {
      projectId: 'proj-001',
      category: 'PROCUREMENT',
      description: 'Long-lead elevator equipment delivery',
      identifiedBy: 'user-001',
    },
  }),

  /** Delay ↔ Change Event peer link. */
  delayToChangeLink: createMockCrossLedgerLink(),

  /** Reverse direction: Change ↔ Delay peer link. */
  changeToDelayLink: createMockCrossLedgerLink({
    linkId: 'link-002',
    sourceRecordId: 'ce-004',
    sourceLedger: 'Change',
    targetRecordId: 'del-003',
    targetLedger: 'Delay',
  }),
} as const;
