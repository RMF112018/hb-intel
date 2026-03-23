/**
 * SF27-T01 — Bulk Actions TypeScript Contract Stubs.
 * Governing: SF27-T01, L-01/L-02/L-03/L-08/L-09
 */

export type SelectionScope = 'selected-rows' | 'filtered-set' | 'all';
export type BulkActionCategory = 'immediate' | 'configured';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'warning';
export type ExecutionItemStatus = 'pending' | 'success' | 'failed' | 'skipped';

export interface IBulkSelectionState {
  scope: SelectionScope;
  selectedIds: string[];
  filteredSetSnapshot: string[] | null;
  totalCount: number;
  moduleKey: string;
}

export interface IBulkAction {
  actionId: string;
  label: string;
  category: BulkActionCategory;
  destructive: boolean;
  requiresConfirmation: boolean;
  requiresInput: boolean;
  permissionKey: string | null;
}

export interface IEligibilityResult {
  itemId: string;
  status: EligibilityStatus;
  reason: string | null;
}

export interface IChunkPlan {
  chunkIndex: number;
  itemIds: string[];
  chunkSize: number;
  totalChunks: number;
}

export interface IBulkExecutionResult {
  actionId: string;
  totalItems: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  items: IBulkExecutionItemResult[];
  completedAtIso: string;
}

export interface IBulkExecutionItemResult {
  itemId: string;
  status: ExecutionItemStatus;
  message: string | null;
  retryable: boolean;
}

export interface ISelectionSourceAdapter {
  sourceId: string;
  getSelectedIds(): string[];
  getFilteredSetIds(): string[];
  getTotalCount(): number;
}

export interface ISavedViewContext {
  activeViewId: string | undefined;
  activeViewTitle: string | undefined;
  activeFilterClauses: unknown[];
  activeSortBy: unknown[];
  activeGroupBy: unknown[];
  activePresentation: Record<string, unknown>;
  moduleKey: string;
  workspaceKey: string;
}

export interface IBulkActionExecutionContext {
  action: IBulkAction;
  selection: IBulkSelectionState;
  savedViewContext: ISavedViewContext | null;
  inputValues: Record<string, unknown> | null;
}

export const SELECTION_SCOPES: readonly SelectionScope[] = ['selected-rows', 'filtered-set', 'all'] as const;
export const BULK_ACTION_CATEGORIES: readonly BulkActionCategory[] = ['immediate', 'configured'] as const;
