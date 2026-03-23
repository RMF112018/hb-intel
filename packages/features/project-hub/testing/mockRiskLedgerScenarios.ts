import { createMockRiskRecord } from './createMockRiskRecord.js';

/** Pre-built scenario records for all Risk Ledger lifecycle states and edge cases. */
export const mockRiskLedgerScenarios = {
  /** Default: newly identified risk. */
  identifiedRisk: createMockRiskRecord(),

  /** Risk under active probability/impact assessment. */
  underAssessmentRisk: createMockRiskRecord({
    riskId: 'risk-002',
    riskNumber: 'RISK-002',
    status: 'UnderAssessment',
    statusDate: '2026-02-01',
    mitigationStrategy: 'Engage geotechnical consultant for additional borings.',
  }),

  /** Mitigation actions completed; residual risk acceptable. */
  mitigatedRisk: createMockRiskRecord({
    riskId: 'risk-003',
    riskNumber: 'RISK-003',
    status: 'Mitigated',
    statusDate: '2026-03-01',
    probability: 2,
    impact: 3,
    riskScore: 6,
    mitigationStrategy: 'Additional borings completed; foundation design revised.',
    residualRiskNotes: 'Minor residual risk of unexpected clay deposits at northwest corner.',
  }),

  /** Risk accepted as within tolerance. */
  acceptedRisk: createMockRiskRecord({
    riskId: 'risk-004',
    riskNumber: 'RISK-004',
    status: 'Accepted',
    statusDate: '2026-02-15',
    probability: 1,
    impact: 2,
    riskScore: 2,
    category: 'WEATHER_ENVIRONMENTAL',
    title: 'Seasonal rainfall may delay exterior work',
    description:
      'Normal seasonal rainfall patterns may cause minor delays to exterior concrete and waterproofing work during March-April period.',
  }),

  /** Risk materializing; constraint spawn underway. */
  materializationPendingRisk: createMockRiskRecord({
    riskId: 'risk-005',
    riskNumber: 'RISK-005',
    status: 'MaterializationPending',
    statusDate: '2026-03-10',
    probability: 5,
    impact: 4,
    riskScore: 20,
    spawnedConstraintIds: ['constraint-001'],
  }),

  /** Closed risk with closure reason and date. */
  closedRisk: createMockRiskRecord({
    riskId: 'risk-006',
    riskNumber: 'RISK-006',
    status: 'Closed',
    statusDate: '2026-03-15',
    closureReason: 'Foundation redesign completed successfully. No further risk.',
    dateClosed: '2026-03-15',
  }),

  /** Voided risk — created in error. */
  voidRisk: createMockRiskRecord({
    riskId: 'risk-007',
    riskNumber: 'RISK-007',
    status: 'Void',
    statusDate: '2026-01-20',
    closureReason: 'Duplicate of RISK-001.',
    dateClosed: '2026-01-20',
  }),

  /** Cancelled risk — deliberate withdrawal. */
  cancelledRisk: createMockRiskRecord({
    riskId: 'risk-008',
    riskNumber: 'RISK-008',
    status: 'Cancelled',
    statusDate: '2026-02-10',
    closureReason: 'Project scope revised; this risk area no longer applicable.',
    dateClosed: '2026-02-10',
    category: 'SCOPE',
    title: 'Scope expansion risk for Phase 2 addition',
    description:
      'Potential scope expansion due to owner discussions about adding Phase 2 building to current contract period.',
  }),

  /** Open risk past its target mitigation date — overdue. */
  overdueRisk: createMockRiskRecord({
    riskId: 'risk-009',
    riskNumber: 'RISK-009',
    status: 'Identified',
    statusDate: '2025-11-01',
    targetMitigationDate: '2026-01-01',
    category: 'PROCUREMENT',
    title: 'Long-lead structural steel delivery risk',
    description:
      'Structural steel fabricator lead time may exceed project schedule allowance, requiring expediting or alternative sourcing.',
  }),

  /** Highest possible risk score (5 × 5 = 25). */
  highScoreRisk: createMockRiskRecord({
    riskId: 'risk-010',
    riskNumber: 'RISK-010',
    probability: 5,
    impact: 5,
    riskScore: 25,
    category: 'FINANCIAL',
    title: 'Owner insolvency risk',
    description:
      'Recent financial press indicates owner may face significant liquidity challenges that could affect project funding continuity.',
  }),

  /** Lowest possible risk score (1 × 1 = 1). */
  lowScoreRisk: createMockRiskRecord({
    riskId: 'risk-011',
    riskNumber: 'RISK-011',
    probability: 1,
    impact: 1,
    riskScore: 1,
    category: 'TECHNOLOGY',
    title: 'BIM software version incompatibility',
    description:
      'Minor version differences between design team Revit versions may require model reconciliation during coordination.',
  }),
} as const;
