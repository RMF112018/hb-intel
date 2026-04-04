# Phase 11 — Destructive-Action Confirmation and Checkpoint Execution Model

## 1. Purpose

This document describes the destructive-action confirmation service and checkpoint execution bridge implemented in Phase 11 Prompt-07. These components ensure that destructive and tenant-sensitive admin actions cannot execute without proven operator acknowledgment, and that the confirmation state is recorded as durable evidence.

---

## 2. Architecture

### Files added/modified

| File | Package | Purpose |
|------|---------|---------|
| `backend/functions/src/services/admin-control-plane/safety-confirmation-service.ts` | `@hbc/functions` | Confirmation validation, recording, full flow, checkpoint bridge |
| `backend/functions/src/services/admin-control-plane/__tests__/safety-confirmation-service.test.ts` | `@hbc/functions` | 20 tests |
| `packages/features/admin/src/hooks/useDestructiveActionConfirmation.ts` | `@hbc/features-admin` | React hook for confirmation flow |

---

## 3. Confirmation validation

`validateConfirmation(payload, expectedPhrase?)` checks:

| Check | When required |
|-------|---------------|
| Profile exists | Always |
| Acknowledgment text present | Standard and enhanced confirmation |
| Acknowledgment matches phrase | Enhanced confirmation (destructive/critical) |
| Scope declared | Profile includes `ScopeRestriction` control |
| Preview evidence linked | Profile includes `PreviewEvidence` control |

Returns `{ valid, errors, confirmationType }`.

### Confirmation types by risk tier

| Risk tier | Confirmation type | Requirements |
|-----------|------------------|--------------|
| Read-only | `none` | No confirmation needed |
| Low (Routine) | `none` | No confirmation needed |
| Moderate (Elevated) | `standard` | Acknowledgment text + preview evidence |
| High (Destructive) | `enhanced` | Typed phrase + preview evidence + scope |
| Critical (Tenant-sensitive) | `enhanced` | Typed phrase + preview evidence + scope |

---

## 4. Confirmation recording

`recordConfirmation()` creates:
1. An evidence record (`AdminEvidenceType.CommandInputSnapshot`) with the confirmation details
2. An audit event (`AdminAuditEventType.CheckpointDecided`) linking the confirmation to the action

The evidence ID is used downstream in `ISafetyGateContext.confirmationCaptured` to prove the backend that confirmation was satisfied.

---

## 5. Full confirmation flow

`executeConfirmationFlow()` is the primary entry point for route handlers:

```
validate → (if invalid: return errors) → record → return evidenceId
```

Returns `{ valid, errors, confirmationEvidenceId, confirmationPayload }`.

---

## 6. Checkpoint execution bridge

Two helpers bridge the Phase 11 safety model with the existing Phase 6 checkpoint infrastructure:

| Helper | Purpose |
|--------|---------|
| `requiresCheckpointExecution(profile)` | Returns `true` if the action uses checkpoint-style pause/resume (elevated actions) |
| `requiresDestructiveConfirmation(profile)` | Returns `true` if the action needs enhanced typed-phrase confirmation (destructive/critical) |

### Execution patterns by mode

| Execution mode | Pattern | Example |
|---------------|---------|---------|
| Seamless | Execute immediately after routine safety gates | Archive failure |
| Checkpointed | Preview → Standard confirm → Execute with pause points | Publish binding, retry provisioning |
| Destructive | Preview → Enhanced confirm (typed phrase) → Execute straight-through → Post-run validate | Force state transition, delete user, apply repair |
| Advisory | Execute read-only, no confirmation | Preflight, drift detection |

### Provisioning protection

Per the prompt requirement: normal provisioning flow (`seamless` mode for routine actions, `checkpointed` mode for launch/retry) is left intact. The destructive confirmation path only applies to actions classified as `high` or `critical` risk, which use `destructive` execution mode.

---

## 7. Frontend integration

`useDestructiveActionConfirmation` hook provides:

| Property | Type | Description |
|----------|------|-------------|
| `confirmed` | `boolean` | Whether confirmation has been recorded |
| `isSubmitting` | `boolean` | Request in progress |
| `error` | `string \| null` | Error from last attempt |
| `validationErrors` | `string[]` | Backend validation errors |
| `confirmationEvidenceId` | `string \| null` | Evidence ID for gate context |
| `submitConfirmation` | `(request) => Promise<boolean>` | Submit confirmation |
| `resetConfirmation` | `() => void` | Reset state |
| `buildGateContext` | `(previewEvidenceId?) => SafetyGateContext` | Build gate context for execution request |

The hook calls `POST /api/admin/safety/confirm` and the returned `confirmationEvidenceId` is included in the execution request's safety gate context.

---

## 8. Evidence chain

The full evidence chain for a destructive action:

```
Preview evidence (P11-05)
  ↓ previewEvidenceId
Confirmation evidence (P11-07)
  ↓ confirmationEvidenceId
Safety gate context (P11-04)
  ↓ { previewCompleted, confirmationCaptured, scopeDeclared }
Execution evidence (existing run model)
  ↓ runId
Post-run validation evidence (P11-08, future)
```

Each link is captured as a durable `IAdminEvidenceReference`.

---

## 9. Validation results

- `pnpm --filter @hbc/functions check-types` — clean
- `pnpm --filter @hbc/functions test` — 95 files, 1799 tests passed, 3 skipped
- `pnpm --filter @hbc/features-admin check-types` — clean
- `pnpm --filter @hbc/features-admin test` — 13 files, 181 tests passed

---

## 10. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 backend safety enforcement](./phase-11-backend-safety-enforcement.md) | Safety gate enforcement (`requireSafetyGates`) |
| [Phase 11 risk-tier classification](./phase-11-risk-tier-and-action-classification.md) | Confirmation type per risk tier |
| [Phase 11 operator safety UX](./phase-11-operator-safety-ux.md) | `SafetyConfirmationDialog` consumes this service |
| [Phase 11 preview pipeline](./phase-11-preview-pipeline.md) | Preview evidence linked to confirmation |
| [Phase 11 shared contracts](./phase-11-preview-dry-run-and-confirmation-model.md) | `IAdminConfirmationPayload` type |
