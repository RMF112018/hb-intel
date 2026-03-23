/**
 * @hbc/bulk-actions
 *
 * Shared bulk-actions primitive for HB Intel. Selection semantics,
 * per-item eligibility, chunked execution, mixed-result reporting.
 *
 * @see docs/architecture/plans/shared-features/SF27-Bulk-Actions.md
 */

export type {
  SelectionScope, BulkActionCategory, EligibilityStatus, ExecutionItemStatus,
  IBulkSelectionState, IBulkAction, IEligibilityResult, IChunkPlan,
  IBulkExecutionResult, IBulkExecutionItemResult, ISelectionSourceAdapter,
  ISavedViewContext, IBulkActionExecutionContext,
} from './types/index.js';

export { SELECTION_SCOPES, BULK_ACTION_CATEGORIES } from './types/index.js';

// Model (SF27-T03) // export * from './model/index.js';
// Selection (SF27-T03) // export * from './selection/index.js';
// Execution (SF27-T03) // export * from './execution/index.js';
// Hooks (SF27-T04) // export * from './hooks/index.js';
// Adapters (SF27-T07) // export * from './adapters/index.js';
// Telemetry (SF27-T07) // export * from './telemetry/index.js';
