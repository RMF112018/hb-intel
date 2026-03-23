/**
 * Public testing surface for @hbc/features-project-hub.
 * Consumers should import SF21 fixtures from this subpath instead of deep internals.
 */

export {
  createMockProjectHealthPulse,
  createMockHealthPulseAdminConfig,
  createMockProjectHealthTelemetry,
} from './createMockProjectHealthPulse.js';

export {
  createMockHealthDimension,
} from './createMockHealthDimension.js';

export {
  createMockHealthMetric,
} from './createMockHealthMetric.js';

export { mockProjectHealthStates } from './mockProjectHealthStates.js';

export {
  createMockProjectHealthPulseSnapshot,
} from './createMockProjectHealthPulseSnapshot.js';

export { createMockFinancialAccessQuery } from './createMockFinancialAccessQuery.js';
export { mockFinancialAccessScenarios } from './mockFinancialScenarios.js';

export { createMockBudgetLineItem } from './createMockBudgetLineItem.js';
export { createMockReconciliationCondition } from './createMockReconciliationCondition.js';
export { createMockBudgetImportRow } from './createMockBudgetImportRow.js';
export {
  cleanImportRows,
  matchedImportRows,
  matchedExistingLines,
  ambiguousImportRows,
  ambiguousExistingLines,
  validationFailureRows,
} from './mockBudgetImportScenarios.js';

export { createMockForecastVersion } from './createMockForecastVersion.js';
export { createMockChecklistItem } from './createMockChecklistItem.js';
export { mockVersioningScenarios } from './mockVersioningScenarios.js';

export { createMockCashFlowActualRecord } from './createMockCashFlowActualRecord.js';
export { createMockCashFlowForecastRecord } from './createMockCashFlowForecastRecord.js';
export { createMockARAgingRecord } from './createMockARAgingRecord.js';
export {
  surplusActualRecords,
  surplusForecastRecords,
  deficitForecastRecords,
} from './mockCashFlowScenarios.js';

export { createMockBuyoutLineItem } from './createMockBuyoutLineItem.js';
export { createMockBuyoutSavingsDisposition } from './createMockBuyoutSavingsDisposition.js';
export {
  notStartedLine,
  executedLineWithSavings,
  executedLineOverBudget,
  voidLine,
  completeLine,
  mixedBuyoutLines,
} from './mockBuyoutScenarios.js';

export { businessRuleScenarios } from './mockBusinessRuleScenarios.js';

export {
  mockAnnotationAnchors,
  mockSourceAnnotations,
  mockHealthSnapshotInput,
} from './mockSpineEventScenarios.js';

// ── P3-E5 Schedule module testing surface ────────────────────────────

export { createMockScheduleSource } from './createMockScheduleSource.js';
export { createMockScheduleVersion } from './createMockScheduleVersion.js';
export { createMockBaselineRecord } from './createMockBaselineRecord.js';
export { createMockImportedActivitySnapshot } from './createMockImportedActivitySnapshot.js';
export { createMockCalendarRule, createMockOperatingCalendar } from './createMockCalendarRule.js';
export { mockScheduleAccessScenarios, importValidationScenarios } from './mockScheduleScenarios.js';

// ── P3-E5-T02 Commitment and milestone testing surface ───────────────

export { createMockCommitmentRecord } from './createMockCommitmentRecord.js';
export { createMockReconciliationRecord } from './createMockReconciliationRecord.js';
export { createMockMilestoneRecord } from './createMockMilestoneRecord.js';
export { mockCommitmentScenarios, mockMilestoneStatusScenarios } from './mockCommitmentScenarios.js';

// ── P3-E5-T03 Publication layer testing surface ──────────────────────

export { createMockPublicationRecord } from './createMockPublicationRecord.js';
export { createMockPublishedActivitySnapshot } from './createMockPublishedActivitySnapshot.js';
export { createMockScheduleSummaryProjection } from './createMockScheduleSummaryProjection.js';
export { mockPublicationBlockers, scheduleSummaryVarianceScenarios } from './mockPublicationScenarios.js';

// ── P3-E5-T04 Scenario branch testing surface ───────────────────────

export { createMockScenarioBranch } from './createMockScenarioBranch.js';
export { createMockScenarioActivityRecord } from './createMockScenarioActivityRecord.js';
export { scenarioActivityOverrides } from './mockScenarioScenarios.js';

// ── P3-E5-T05 Field execution testing surface ───────────────────────

export { createMockFieldWorkPackage } from './createMockFieldWorkPackage.js';
export { createMockFieldCommitmentRecord } from './createMockFieldCommitmentRecord.js';
export { createMockBlockerRecord } from './createMockBlockerRecord.js';
export { createMockLookAheadPlan } from './createMockLookAheadPlan.js';
export { blockerRollUpScenarios, commitmentRollUpScenarios } from './mockFieldExecutionScenarios.js';

// ── P3-E5-T06 Logic dependencies testing surface ────────────────────

export { createMockImportedRelationshipRecord } from './createMockImportedRelationshipRecord.js';
export { createMockWorkPackageLinkRecord } from './createMockWorkPackageLinkRecord.js';

// ── P3-E5-T07 Analytics testing surface ─────────────────────────────

export { createMockScheduleQualityGrade } from './createMockScheduleQualityGrade.js';
export { createMockConfidenceRecord } from './createMockConfidenceRecord.js';
export { createMockRecommendationRecord } from './createMockRecommendationRecord.js';

// ── P3-E5-T09 Integration and governance testing surface ────────────

export { createMockGovernedPolicySet } from './createMockGovernedPolicySet.js';

// ── P3-E5-T08 Classification and offline testing surface ────────────

export { createMockIntentRecord } from './createMockIntentRecord.js';
export { createMockExternalParticipantRecord } from './createMockExternalParticipantRecord.js';

// ── P3-E6-T01 Risk Ledger testing surface ─────────────────────────────

export { createMockRiskRecord } from './createMockRiskRecord.js';
export { mockRiskLedgerScenarios } from './mockRiskLedgerScenarios.js';

// ── P3-E6-T02 Constraint Ledger testing surface ──────────────────────

export { createMockConstraintRecord } from './createMockConstraintRecord.js';
export { mockConstraintLedgerScenarios } from './mockConstraintLedgerScenarios.js';

// ── P3-E6-T03 Delay Ledger testing surface ────────────────────────────

export { createMockDelayRecord } from './createMockDelayRecord.js';
export { createMockTimeImpactRecord } from './createMockTimeImpactRecord.js';
export { createMockCommercialImpactRecord } from './createMockCommercialImpactRecord.js';
export { mockDelayLedgerScenarios } from './mockDelayLedgerScenarios.js';

// ── P3-E6-T04 Change Ledger testing surface ───────────────────────────

export { createMockChangeEventRecord } from './createMockChangeEventRecord.js';
export { createMockChangeLineItem } from './createMockChangeLineItem.js';
export { createMockProcoreMappingRecord } from './createMockProcoreMappingRecord.js';
export { mockChangeLedgerScenarios } from './mockChangeLedgerScenarios.js';

// ── P3-E6-T05 Lineage testing surface ─────────────────────────────────

export { createMockLineageRecord } from './createMockLineageRecord.js';
export { createMockCrossLedgerLink } from './createMockCrossLedgerLink.js';
export { mockLineageScenarios } from './mockLineageScenarios.js';
