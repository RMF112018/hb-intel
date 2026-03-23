import { createMockDelayRecord } from './createMockDelayRecord.js';
import { createMockTimeImpactRecord } from './createMockTimeImpactRecord.js';
import { createMockCommercialImpactRecord } from './createMockCommercialImpactRecord.js';

/** Pre-built scenario records for all Delay Ledger lifecycle states and edge cases. */
export const mockDelayLedgerScenarios = {
  /** Default: newly identified delay event. */
  identifiedDelay: createMockDelayRecord(),

  /** Delay under active impact analysis. */
  underAnalysisDelay: createMockDelayRecord({
    delayId: 'del-002',
    delayNumber: 'DEL-002',
    status: 'UnderAnalysis',
    statusDate: '2026-02-01',
    notificationDate: '2026-01-22',
    notificationReference: 'Letter GC-2026-015',
  }),

  /** Fully quantified delay with time and commercial impact. */
  quantifiedDelay: createMockDelayRecord({
    delayId: 'del-003',
    delayNumber: 'DEL-003',
    status: 'Quantified',
    statusDate: '2026-02-15',
    notificationDate: '2026-01-22',
    notificationReference: 'Letter GC-2026-015',
    criticalPathImpact: 'CRITICAL',
    timeImpact: createMockTimeImpactRecord(),
    commercialImpact: createMockCommercialImpactRecord(),
  }),

  /** Dispositioned delay with formal outcome. */
  dispositionedDelay: createMockDelayRecord({
    delayId: 'del-004',
    delayNumber: 'DEL-004',
    status: 'Dispositioned',
    statusDate: '2026-03-01',
    notificationDate: '2026-01-22',
    criticalPathImpact: 'CRITICAL',
    timeImpact: createMockTimeImpactRecord(),
    commercialImpact: createMockCommercialImpactRecord(),
    dispositionOutcome: 'SettledByTime',
    dispositionNotes: 'Owner agreed to 14-day time extension via PCO-005. No cost recovery.',
  }),

  /** Closed delay. */
  closedDelay: createMockDelayRecord({
    delayId: 'del-005',
    delayNumber: 'DEL-005',
    status: 'Closed',
    statusDate: '2026-03-15',
    dateClosed: '2026-03-15',
    notificationDate: '2026-01-22',
    criticalPathImpact: 'CRITICAL',
    timeImpact: createMockTimeImpactRecord(),
    commercialImpact: createMockCommercialImpactRecord(),
    dispositionOutcome: 'SettledByTime',
    dispositionNotes: 'Time extension granted and incorporated into contract.',
    closureReason: 'Delay resolved via time extension.',
    delayEndDate: '2026-02-28',
  }),

  /** Voided delay — created in error. */
  voidDelay: createMockDelayRecord({
    delayId: 'del-006',
    delayNumber: 'DEL-006',
    status: 'Void',
    statusDate: '2026-01-25',
    closureReason: 'Duplicate of DEL-001.',
    dateClosed: '2026-01-25',
  }),

  /** Cancelled delay — deliberate withdrawal. */
  cancelledDelay: createMockDelayRecord({
    delayId: 'del-007',
    delayNumber: 'DEL-007',
    status: 'Cancelled',
    statusDate: '2026-02-10',
    closureReason: 'Steel fabricator recovered schedule; no actual delay materialized.',
    dateClosed: '2026-02-10',
  }),

  /** Open delay without notification past threshold — pending notification. */
  overdueNotificationDelay: createMockDelayRecord({
    delayId: 'del-008',
    delayNumber: 'DEL-008',
    status: 'UnderAnalysis',
    statusDate: '2026-01-25',
    delayStartDate: '2025-12-01',
    notificationDate: null,
  }),

  /** Critical path delay for metric testing. */
  criticalPathDelay: createMockDelayRecord({
    delayId: 'del-009',
    delayNumber: 'DEL-009',
    criticalPathImpact: 'CRITICAL',
    delayEventType: 'OWNER_DIRECTED',
    responsibleParty: 'OWNER',
    title: 'Owner-directed suspension of excavation',
    eventDescription:
      'Owner directed cessation of excavation work at Building B pending completion of supplemental environmental assessment. Work stoppage commenced 2026-02-01 with no defined resumption date.',
  }),

  /** Delay using integrated schedule reference mode. */
  integratedScheduleDelay: createMockDelayRecord({
    delayId: 'del-010',
    delayNumber: 'DEL-010',
    scheduleReferenceMode: 'Integrated',
    scheduleVersionId: 'sv-001',
    impactedActivityIds: ['act-101', 'act-102'],
    impactedActivityFreeText: [],
  }),

  /** Delay using manual fallback schedule reference. */
  manualFallbackDelay: createMockDelayRecord({
    delayId: 'del-011',
    delayNumber: 'DEL-011',
    scheduleReferenceMode: 'ManualFallback',
    scheduleVersionId: null,
    impactedActivityIds: [],
    impactedActivityFreeText: ['Foundation Work — Zone 3', 'Underground Utilities — Zone 3'],
  }),

  /** Delay spawned from a constraint record. */
  spawnedFromConstraintDelay: createMockDelayRecord({
    delayId: 'del-012',
    delayNumber: 'DEL-012',
    parentConstraintId: 'con-008',
    delayEventType: 'PROCUREMENT',
    title: 'Elevator equipment delivery delay (from CON-008)',
    eventDescription:
      'Constraint CON-008 (elevator equipment delivery) has caused a confirmed schedule delay. Elevator manufacturer confirmed 20-week lead time exceeds original schedule allowance by 4 weeks, directly impacting vertical transportation critical path.',
  }),
} as const;
