import type { IFinancialAnnotationAnchor } from '../src/financial/types/index.js';

/** Pre-built annotation anchors for testing carry-forward logic. */
export const mockAnnotationAnchors = {
  fieldAnchor: {
    forecastVersionId: 'ver-confirmed',
    anchorType: 'field' as const,
    canonicalBudgetLineId: 'canon-001',
    fieldKey: 'forecastToComplete',
  } satisfies IFinancialAnnotationAnchor,

  sectionAnchor: {
    forecastVersionId: 'ver-confirmed',
    anchorType: 'section' as const,
    sectionKey: 'cost-summary',
  } satisfies IFinancialAnnotationAnchor,

  blockAnchor: {
    forecastVersionId: 'ver-confirmed',
    anchorType: 'block' as const,
    blockKey: 'cash-flow-q2-2026',
  } satisfies IFinancialAnnotationAnchor,

  unresolvedFieldAnchor: {
    forecastVersionId: 'ver-confirmed',
    anchorType: 'field' as const,
    canonicalBudgetLineId: 'canon-removed',
    fieldKey: 'forecastToComplete',
  } satisfies IFinancialAnnotationAnchor,
};

/** Mock source annotations for carry-forward testing. */
export const mockSourceAnnotations = [
  { annotationId: 'ann-001', anchor: mockAnnotationAnchors.fieldAnchor, value: 37000 },
  { annotationId: 'ann-002', anchor: mockAnnotationAnchors.sectionAnchor },
  { annotationId: 'ann-003', anchor: mockAnnotationAnchors.unresolvedFieldAnchor, value: 50000 },
];

/** Health metric snapshot input for testing. */
export const mockHealthSnapshotInput = {
  projectedOverUnder: 50000,
  profitMargin: 12.5,
  estimatedCostAtCompletion: 8500000,
  totalCostExposureToDate: 5000000,
  percentBuyoutCompleteDollarWeighted: 70,
  totalRealizedBuyoutSavings: 125000,
  totalUndispositionedSavings: 25000,
  peakCashRequirement: -75000,
  cashFlowAtRisk: -450000,
  buyoutToCommittedCostsReconciliation: 3.2,
} as const;
