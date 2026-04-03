# Admin SPFx IT Control Center — Install Contract Slice

**Prompt:** P6-03 — Shared Contracts and Persistence Slice
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the shared contract surface for Phase 6 install/bootstrap, explain why it is minimal, and map to persistence expectations.

---

## 1. Where the shared contracts live

All install/bootstrap contracts are in `packages/models/src/admin-control-plane/`:

| File | Content |
|------|---------|
| `IInstallBootstrap.ts` | **New (P6-03)** — Install step catalog, step families, preflight check IDs, verification check IDs, action keys |
| `IAdminRun.ts` | Generalized run envelope, run status, step status, actor context, step result, failure summary |
| `IAdminCheckpoint.ts` | Checkpoint categories, checkpoint status, checkpoint definition, checkpoint instance, checkpoint decision |
| `IAdminApi.ts` | API DTOs — launch request/response, preflight request/response, preview response, checkpoint decision request |
| `IAdminAudit.ts` | Audit records, evidence references, post-run validation summary/checks, config snapshots, rationale |
| `AdminEnums.ts` | `AdminDomain.SetupInstall`, risk levels, execution modes |
| `index.ts` | Barrel exports for all types |

---

## 2. Why this slice is intentionally minimal

The existing generalized admin control plane model (Phases 2–4) already provides:

| Need | Existing type | Status |
|------|--------------|--------|
| Run lifecycle | `IAdminRunEnvelope` + `AdminRunStatus` | **Ready** — supports multi-domain runs via `AdminDomain` |
| Step tracking | `IAdminStepResult` + `AdminStepStatus` | **Ready** — step number, label, status, timing, error |
| Checkpoint handling | `IAdminCheckpoint` + `IAdminCheckpointDefinition` + `IAdminCheckpointDecision` | **Ready** — full checkpoint lifecycle |
| Preflight validation | `IAdminPreflightRequest` / `IAdminPreflightResponse` / `IAdminPreflightCheck` | **Ready** — structured pass/warn/fail per check |
| Preview / dry-run | `IAdminPreviewResponse` / `IAdminPreviewImpactItem` | **Ready** — impact summary with change types |
| Audit trail | `IAdminAuditRecord` + `AdminAuditEventType` | **Ready** — event types for run, checkpoint, config events |
| Evidence capture | `IAdminEvidenceReference` + `AdminEvidenceType` | **Ready** — includes `PostValidationSummary`, `DeploymentLog` |
| Post-install verification | `IAdminPostRunValidationSummary` / `IAdminPostRunValidationCheck` | **Ready** — pass/fail per check with operator comment |
| Launch request | `IAdminRunLaunchRequest` / `IAdminRunLaunchResponse` | **Ready** — action key, command input, dry-run flag |
| Cancel / retry | `IAdminRunCancelRequest` / `IAdminRunRetryRequest` | **Ready** |

Phase 6 adds **only** the install-specific vocabulary that the generalized model cannot provide:

| New type | Purpose |
|----------|---------|
| `InstallStepId` enum (19 values) | Canonical step identifiers for install orchestration and display |
| `IInstallStepDefinition` interface | Step metadata: adapter key, operation, checkpoint flag, idempotency, blocking behavior |
| `InstallStepFamily` enum (5 values) | Step grouping for orchestration and UI |
| `InstallPreflightCheckId` enum (9 values) | Canonical preflight check IDs for structured results |
| `InstallVerificationCheckId` enum (6 values) | Canonical post-install verification check IDs |
| `INSTALL_ACTION_KEYS` const | Well-known action keys: full-install, preflight-only, verify-only |
| `InstallActionKey` type | Union type of install action keys |

---

## 3. Install run status mapping

The prompt requested explicit install run states. These map directly to the existing `AdminRunStatus` enum — no new status values are needed:

| Install concept | `AdminRunStatus` value | When |
|----------------|----------------------|------|
| Draft / ReadyToValidate | `Pending` | Run created, not yet started |
| ValidationInProgress | `Validating` | Preflight checks executing |
| ValidationFailed | `Failed` | Critical preflight check failed (run.failure records detail) |
| ReadyToInstall | `Pending` | Preflight passed, awaiting launch confirmation |
| InstallInProgress | `Running` | Install steps executing |
| WaitingForCheckpoint | `AwaitingApproval` | Paused at manual checkpoint |
| VerificationInProgress | `Running` | Post-install verification steps executing (step family distinguishes) |
| Completed | `Completed` | All steps succeeded, evidence published |
| Failed | `Failed` | A blocking step failed |
| Cancelled | `Cancelled` | Operator cancelled during checkpoint or at any point |

**Design decision:** Rather than creating a parallel `InstallRunStatus` enum, install runs use the generalized status vocabulary. The install step family (`InstallStepFamily`) and current step number provide the install-specific context needed to distinguish "validating" from "installing" from "verifying" within a `Running` state.

---

## 4. Persistence expectations

Install runs reuse the Phase 4 durable persistence substrate with no new storage services:

| Storage need | Existing service | Table |
|-------------|-----------------|-------|
| Run header / lifecycle | `DurableAdminRunStore` | `AdminRuns` (partition: `setup-install`, row: `runId`) |
| Step execution detail | Embedded in `IAdminRunEnvelope.steps[]` | `AdminRuns` (same entity) |
| Checkpoint payload | `DurableAdminAuditStore` with `CheckpointCreated` / `CheckpointDecided` events | `AdminAuditEvents` |
| Preflight findings | `DurableAdminEvidenceStore` with `PreviewResult` evidence type | `AdminEvidence` |
| Verification findings | `DurableAdminEvidenceStore` with `PostValidationSummary` evidence type | `AdminEvidence` |
| Evidence references | `DurableAdminEvidenceStore` | `AdminEvidence` |
| Operator identity | Embedded in `IAdminActorContext` on run envelope and audit records | — |
| Timestamps | Embedded in run envelope, step results, audit records | — |

**No new Azure Table Storage tables are required for Phase 6.** Install runs are distinguished by `domain: AdminDomain.SetupInstall` in the existing tables.

---

## 5. Forward compatibility

This contract slice is forward-compatible with broader admin-run generalization:

- **New domains** add their own `*StepId` enums and `*ActionKey` constants without modifying install types
- **New step families** can extend `InstallStepFamily` or create domain-specific family enums
- **New preflight checks** add values to domain-specific check ID enums
- **Generalized orchestration** can consume `IInstallStepDefinition` through the same `IAdminAdapterDescriptor` → invoker pattern
- **Future shared orchestration** can abstract across domains using the generalized `IAdminRunEnvelope` + `IAdminStepResult` model

---

## Cross-references

- [Install/Bootstrap Architecture](admin-spfx-install-bootstrap-architecture.md) — layer responsibilities
- [Install/Bootstrap Step Model](admin-spfx-install-bootstrap-step-model.md) — step families and concrete steps
- [Phase 4 Store Implementation Notes](../phase-04/admin-spfx-phase-4-store-implementation-notes.md) — Table Storage keying and serialization
- Code: `packages/models/src/admin-control-plane/IInstallBootstrap.ts`
