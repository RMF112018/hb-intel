/**
 * SF27-T02 — Bulk Actions TypeScript Contracts.
 * Governing: SF27-T02, L-01 through L-10
 */

// ── Selection ────────────────────────────────────────────────────────────

export type BulkSelectionScope = 'page' | 'visible' | 'filtered';
export type BulkActionKind = 'immediate' | 'configured';
export type BulkExecutionPhase = 'idle' | 'evaluating' | 'confirming' | 'running' | 'complete' | 'partial' | 'failed';
export type BulkResultKind = 'succeeded' | 'failed' | 'skipped' | 'retryable';

export interface IBulkActionItemRef { id: string; label?: string; moduleKey: string; projectId?: string; }

export interface IBulkSelectionSnapshot {
  scope: BulkSelectionScope;
  selectedIds: string[];
  exactCount: number;
  filterSnapshot?: Record<string, unknown>;
  viewSnapshot?: Record<string, unknown>;
}

// ── Action Definition ────────────────────────────────────────────────────

export interface IBulkActionDefinition<TInput = void> {
  actionId: string;
  label: string;
  kind: BulkActionKind;
  destructive: boolean;
  destructiveMetadata: IBulkDestructiveActionMetadata | null;
  requiresConfirmation: boolean;
  requiresInput: TInput extends void ? false : true;
  inputSchema: TInput extends void ? null : IBulkConfiguredInputSchema;
  permissionGate: IBulkPermissionGate | null;
  transactional: boolean;
}

export interface IBulkDestructiveActionMetadata {
  warningMessage: string;
  externallyVisible: boolean;
  requiresElevatedPermission: boolean;
}

export interface IBulkPermissionGate {
  permissionKey: string;
  requiredRole: string | null;
  denialMessage: string;
}

export interface IBulkConfiguredInputSchema {
  fields: IBulkConfiguredInputField[];
}

export interface IBulkConfiguredInputField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
}

// ── Eligibility ──────────────────────────────────────────────────────────

export interface IBulkEligibilityResult {
  itemRef: IBulkActionItemRef;
  eligible: boolean;
  reasonCode: BulkIneligibilityReasonCode | null;
  warningCode: BulkConfirmationReasonCode | null;
  message: string | null;
}

// ── Execution ────────────────────────────────────────────────────────────

export interface IBulkActionContext {
  action: IBulkActionDefinition<unknown>;
  selection: IBulkSelectionSnapshot;
  savedViewContext: Record<string, unknown> | null;
  inputValues: Record<string, unknown> | null;
}

export interface IBulkExecutionPlan {
  totalItems: number;
  chunkSize: number;
  totalChunks: number;
  chunks: IBulkExecutionChunk[];
}

export interface IBulkExecutionChunk { chunkIndex: number; itemIds: string[]; }

export interface IBulkExecutionProgress {
  phase: BulkExecutionPhase;
  completedChunks: number;
  totalChunks: number;
  processedItems: number;
  totalItems: number;
  estimatedRemainingMs: number | null;
}

export interface IBulkExecutionResult {
  actionId: string;
  phase: BulkExecutionPhase;
  totalItems: number;
  succeeded: number;
  failed: number;
  skipped: number;
  retryable: number;
  items: IBulkItemExecutionResult[];
  groupedFailures: IBulkGroupedFailureReason[];
  completedAtIso: string;
}

export interface IBulkItemExecutionResult {
  itemRef: IBulkActionItemRef;
  resultKind: BulkResultKind;
  message: string | null;
  retryable: boolean;
}

export interface IBulkGroupedFailureReason {
  reasonCode: string;
  message: string;
  itemCount: number;
  itemRefs: IBulkActionItemRef[];
}

export interface IBulkResultsSummary {
  totalAttempted: number;
  succeeded: number;
  failed: number;
  skipped: number;
  retryable: number;
  hasFailures: boolean;
  hasRetryable: boolean;
}

// ── Adapter ──────────────────────────────────────────────────────────────

export interface IBulkSelectionAdapter {
  sourceId: string;
  getSelectedIds(): string[];
  getFilteredSetIds(): string[];
  getTotalCount(): number;
  getItemRef(id: string): IBulkActionItemRef | null;
}

// ── Audit ────────────────────────────────────────────────────────────────

export interface IBulkAuditEmission {
  actionId: string;
  executionId: string;
  performedByUpn: string;
  performedAtIso: string;
  selectionScope: BulkSelectionScope;
  totalItems: number;
  succeeded: number;
  failed: number;
}

// ── Reason Codes ─────────────────────────────────────────────────────────

export type BulkIneligibilityReasonCode = 'status-incompatible' | 'permission-denied' | 'record-locked' | 'dependency-unmet' | 'scope-mismatch';
export type BulkPermissionFailureReasonCode = 'insufficient-role' | 'scope-denied' | 'action-disabled';
export type BulkConfirmationReasonCode = 'destructive-action' | 'externally-visible' | 'large-selection' | 'irreversible';
export type BulkBatchSkipReasonCode = 'already-processed' | 'stale-record' | 'conflict-detected';
export type BulkRetryableFailureReasonCode = 'transient-error' | 'timeout' | 'throttled';
export type BulkScopeMismatchReasonCode = 'filter-changed' | 'selection-stale' | 'view-changed';

// ── Constants ────────────────────────────────────────────────────────────

export const BULK_ACTIONS_DEFAULT_CHUNK_SIZE = 50 as const;
export const BULK_ACTIONS_SCOPE_VALUES: readonly BulkSelectionScope[] = ['page', 'visible', 'filtered'] as const;
export const BULK_ACTIONS_EXECUTION_PHASES: readonly BulkExecutionPhase[] = ['idle', 'evaluating', 'confirming', 'running', 'complete', 'partial', 'failed'] as const;
export const BULK_ACTIONS_RESULT_KINDS: readonly BulkResultKind[] = ['succeeded', 'failed', 'skipped', 'retryable'] as const;
