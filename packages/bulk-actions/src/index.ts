/**
 * @hbc/bulk-actions — Shared bulk-actions primitive.
 * @see docs/architecture/plans/shared-features/SF27-Bulk-Actions.md
 */

export type {
  BulkSelectionScope, BulkActionKind, BulkExecutionPhase, BulkResultKind,
  IBulkActionItemRef, IBulkSelectionSnapshot,
  IBulkActionDefinition, IBulkDestructiveActionMetadata, IBulkPermissionGate,
  IBulkConfiguredInputSchema, IBulkConfiguredInputField,
  IBulkEligibilityResult, IBulkActionContext,
  IBulkExecutionPlan, IBulkExecutionChunk, IBulkExecutionProgress,
  IBulkExecutionResult, IBulkItemExecutionResult,
  IBulkGroupedFailureReason, IBulkResultsSummary,
  IBulkSelectionAdapter, IBulkAuditEmission,
  BulkIneligibilityReasonCode, BulkPermissionFailureReasonCode,
  BulkConfirmationReasonCode, BulkBatchSkipReasonCode,
  BulkRetryableFailureReasonCode, BulkScopeMismatchReasonCode,
} from './types/index.js';

export {
  BULK_ACTIONS_DEFAULT_CHUNK_SIZE, BULK_ACTIONS_SCOPE_VALUES,
  BULK_ACTIONS_EXECUTION_PHASES, BULK_ACTIONS_RESULT_KINDS,
} from './types/index.js';

// Model (SF27-T03)
export { evaluateEligibility, filterEligible } from './model/index.js';
export type { EligibilityEvaluator } from './model/index.js';

// Selection (SF27-T03)
export { createSelectionSnapshot, escalateScope, validateScopeIntegrity } from './selection/index.js';

// Execution (SF27-T03)
export { planExecution, aggregateResults } from './execution/index.js';
// Hooks (SF27-T04)
export { bulkActionKeys, useBulkSelection, useBulkActionExecution } from './hooks/index.js';
export type { UseBulkSelectionOptions, UseBulkSelectionResult, UseBulkActionExecutionOptions, UseBulkActionExecutionResult } from './hooks/index.js';
// Adapters (SF27-T07) // export * from './adapters/index.js';
// Telemetry (SF27-T07) // export * from './telemetry/index.js';
