# SF27-T02 - TypeScript Contracts: Bulk Actions

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF27-T02 contracts task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Lock primitive-owned public contracts for selection scope, action definitions, per-item eligibility, configured inputs, execution planning, progress tracking, grouped results, permission gating, and telemetry. Consumer contracts remain projection-only.

---

## Types to Define

```ts
export type BulkSelectionScope = 'page' | 'visible' | 'filtered';
export type BulkActionKind = 'immediate' | 'configured';
export type BulkExecutionPhase =
  | 'idle'
  | 'evaluating'
  | 'confirming'
  | 'running'
  | 'complete'
  | 'partial'
  | 'failed';

export type BulkResultKind = 'succeeded' | 'failed' | 'skipped' | 'retryable';

export interface IBulkActionItemRef {
  id: string;
  label?: string;
  moduleKey: string;
  projectId?: string;
}

export interface IBulkSelectionSnapshot {
  scope: BulkSelectionScope;
  selectedIds: string[];
  exactCount: number;
  filterSnapshot?: Record<string, unknown>;
  viewSnapshot?: Record<string, unknown>;
}
```

Additional contracts must include:

- `IBulkActionDefinition<TInput>`
- `IBulkEligibilityResult`
- `IBulkActionContext`
- `IBulkConfiguredInputSchema`
- `IBulkExecutionPlan`
- `IBulkExecutionProgress`
- `IBulkExecutionResult`
- `IBulkItemExecutionResult`
- `IBulkGroupedFailureReason`
- `IBulkPermissionGate`
- `IBulkDestructiveActionMetadata`
- `IBulkAuditEmission`
- `IBulkSelectionAdapter`
- `IBulkResultsSummary`

---

## Semantic Contract Requirements

- selection snapshot must answer:
  - whether selection is page, visible, or filtered
  - exact attempted count
  - stable filter/view snapshot when scope is filtered
- action definition must distinguish:
  - immediate vs configured action kind
  - whether destructive warnings apply
  - whether elevated permission is required
  - whether transactional semantics are explicitly declared
- eligibility result must distinguish:
  - eligible
  - ineligible with reason
  - permission blocked
  - destructive warning or externally visible warning
- execution result must distinguish:
  - attempted items
  - succeeded items
  - skipped items
  - failed items
  - retryable items
- grouped failure reasons must preserve both grouped reason patterns and drill-down item references

---

## Reason-Code Enums to Lock

- `BulkIneligibilityReasonCode`
- `BulkPermissionFailureReasonCode`
- `BulkConfirmationReasonCode`
- `BulkBatchSkipReasonCode`
- `BulkRetryableFailureReasonCode`
- `BulkScopeMismatchReasonCode`

These enums are required so explainability, result grouping, and telemetry remain deterministic and testable.

---

## Constants to Lock

- `BULK_ACTIONS_DEFAULT_CHUNK_SIZE = 50`
- `BULK_ACTIONS_SCOPE_VALUES = ['page', 'visible', 'filtered']`
- `BULK_ACTIONS_EXECUTION_PHASES = ['idle', 'evaluating', 'confirming', 'running', 'complete', 'partial', 'failed']`
- `BULK_ACTIONS_RESULT_KINDS = ['succeeded', 'failed', 'skipped', 'retryable']`

---

## Verification Commands

```bash
pnpm --filter @hbc/bulk-actions check-types
pnpm --filter @hbc/bulk-actions test -- contracts
pnpm --filter @hbc/ui-kit check-types
```
