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

// ── P3-E6-T06 Publication testing surface ─────────────────────────────

export { createMockLedgerRecordSnapshot } from './createMockLedgerRecordSnapshot.js';
export { createMockReviewPackage } from './createMockReviewPackage.js';
export { mockConstraintsPublicationScenarios } from './mockConstraintsPublicationScenarios.js';

// ── P3-E7-T01 Permits foundation testing surface ─────────────────────

export { createMockPermitThreadNode } from './createMockPermitThreadNode.js';
export { mockPermitFoundationScenarios } from './mockPermitFoundationScenarios.js';

// ── P3-E7-T02 Permits records testing surface ────────────────────────

export { createMockPermitApplication } from './createMockPermitApplication.js';
export { createMockIssuedPermit } from './createMockIssuedPermit.js';

// ── P3-E7-T04 Permits inspection testing surface ─────────────────────

export { createMockCheckpointTemplate } from './createMockCheckpointTemplate.js';

// ── P3-E8-T01 Safety foundation testing surface ──────────────────────

export { createMockSafetyAuthorityRule } from './createMockSafetyAuthorityRule.js';

// ── P3-E8-T02 Safety records testing surface ─────────────────────────

export {
  createMockSiteSpecificSafetyPlan,
  createMockCompletedInspection,
  createMockSafetyCorrectiveAction,
  createMockIncidentRecord,
  createMockJhaRecord,
  createMockSafetyEvidenceRecord,
} from './createMockSafetyRecord.js';

// ── P3-E10-T01 Closeout foundation testing surface ──────────────────

export { createMockCloseoutSoTBoundary } from './createMockCloseoutSoTBoundary.js';

// ── P3-E10-T02 Closeout records testing surface ────────────────────

export {
  createMockCloseoutChecklist,
  createMockSubcontractorScorecard,
  createMockLessonEntry,
} from './createMockCloseoutRecordFamily.js';

// ── P3-E10-T03 Closeout checklist testing surface ──────────────────

export {
  createMockGovernedChecklistItem,
  createMockChecklistSectionDefinition,
} from './createMockGovernedChecklistItem.js';

// ── P3-E10-T04 Closeout lifecycle testing surface ──────────────────

export {
  createMockCloseoutMilestoneRecord,
  createMockArchiveReadyContext,
} from './createMockCloseoutMilestone.js';

// ── P3-E10-T05 Closeout lessons testing surface ────────────────────

export {
  createMockLessonsLearnedSnapshot,
} from './createMockLessonsSnapshot.js';

// ── P3-E10-T06 Closeout scorecard testing surface ──────────────────

export {
  createMockScorecardCriterionScores,
} from './createMockScorecardCriterion.js';

// ── P3-E10-T07 Closeout autopsy testing surface ────────────────────

export {
  createMockAutopsyRecord,
} from './createMockAutopsyRecord.js';

// ── P3-E10-T08 Closeout consumption testing surface ────────────────

export {
  createMockProjectProfile,
  createMockIndexEntryProfile,
} from './createMockConsumptionSurface.js';

// ── P3-E10-T09 Closeout permissions testing surface ────────────────

export {
  createMockCloseoutRoleAction,
} from './createMockCloseoutRoleAction.js';

// ── P3-E10-T10 Closeout integration testing surface ────────────────

export {
  createMockRelatedItemsPair,
} from './createMockIntegrationContract.js';

// ── P3-E11-T10 Stage 1 Startup foundation testing surface ──────────

export { createMockStartupProgram } from './createMockStartupProgram.js';

// ── P3-E11-T10 Stage 2 Startup task library testing surface ────────

export { createMockStartupTaskInstance } from './createMockStartupTaskInstance.js';
export { createMockTaskBlocker } from './createMockTaskBlocker.js';

// ── P3-E11-T10 Stage 3 Startup safety readiness testing surface ────

export { createMockSafetyReadinessItem } from './createMockSafetyReadinessItem.js';
export { createMockSafetyRemediationRecord } from './createMockSafetyRemediationRecord.js';

// ── P3-E11-T10 Stage 4 Startup permit posting testing surface ──────

export { createMockPermitVerificationDetail } from './createMockPermitVerificationDetail.js';

// ── P3-E11-T10 Stage 5 Startup contract obligations testing surface ─

export { createMockContractObligation } from './createMockContractObligation.js';

// ── P3-E11-T10 Stage 6 Startup responsibility matrix testing surface ─

export { createMockResponsibilityAssignment } from './createMockResponsibilityAssignment.js';
