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
