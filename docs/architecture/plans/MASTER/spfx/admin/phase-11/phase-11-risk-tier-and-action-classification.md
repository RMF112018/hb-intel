# Phase 11 — Risk-Tier and Action Classification

## 1. Purpose

This document defines the canonical risk-tier model and action classification for the Phase 11 safety framework. It specifies what safety controls are required for each class of admin action so that implementation can map any action to a deterministic safety envelope.

---

## 2. Risk tiers

Phase 11 uses five risk tiers. These align with the existing `AdminRiskLevel` enum in `@hbc/models` (`read-only`, `low`, `moderate`, `high`, `critical`) but are given operational names for clarity.

| Tier | Enum value | Operational name | Description |
|------|-----------|------------------|-------------|
| T0 | `read-only` | **Read-only** | Queries that inspect state without modification. No safety controls required. |
| T1 | `low` | **Routine** | Low-impact state changes that are easily reversible and affect only local scope. |
| T2 | `moderate` | **Elevated** | State changes with moderate impact, limited blast radius, or partial reversibility. |
| T3 | `high` | **Destructive** | State changes that are difficult or impossible to reverse, or that affect production-critical resources. |
| T4 | `critical` | **Tenant-sensitive** | State changes that affect tenant-wide configuration, cross-domain resources, or enterprise-scoped policy. |

---

## 3. Execution modes

Each action also has an execution mode from the existing `AdminExecutionMode` enum. The execution mode describes how the action runs, independent of its risk tier.

| Mode | Description | Typical pairing |
|------|-------------|-----------------|
| `seamless` | Executes immediately without operator pause points. | Routine and some elevated actions. |
| `checkpointed` | Pauses at defined points for operator decision or external verification. | Elevated and destructive actions involving multi-step workflows. |
| `destructive` | Requires enhanced confirmation and captures additional evidence before execution. | Destructive and tenant-sensitive actions. |
| `advisory` | Produces preview/analysis results only; does not modify state. | Preview-only and dry-run operations. |

---

## 4. Safety controls per risk tier

The following table defines which safety controls are **required** for each risk tier. "When possible" means the control is required when the backend can technically support it for that action; if not technically feasible, the variance must be documented in the action's safety profile.

| Safety control | T0 Read-only | T1 Routine | T2 Elevated | T3 Destructive | T4 Tenant-sensitive |
|---------------|:---:|:---:|:---:|:---:|:---:|
| **Auth + scope enforcement** | Required | Required | Required | Required | Required |
| **Preview / impact summary** | -- | -- | Required | Required | Required |
| **Dry-run** | -- | -- | When possible | When possible | Required when possible |
| **Explicit confirmation** | -- | -- | Standard | Enhanced + typed | Enhanced + typed |
| **Scope restriction** | -- | -- | -- | Required | Required |
| **Post-run validation** | -- | -- | When possible | Required | Required |
| **Recovery guidance** | -- | -- | -- | Required | Required |
| **Durable audit record** | -- | Required | Required | Required | Required |
| **Evidence capture (input snapshot)** | -- | -- | Required | Required | Required |
| **Evidence capture (preview result)** | -- | -- | Required | Required | Required |
| **Evidence capture (execution result)** | -- | Required | Required | Required | Required |
| **Evidence capture (validation summary)** | -- | -- | When possible | Required | Required |

### Control definitions

**Auth + scope enforcement:** Existing `withAuth()` + `requireAdmin()` + `requireDelegatedScope()` middleware. All non-read-only actions require admin role and delegated scope.

**Preview / impact summary:** Backend inspects current system state and returns a structured result describing what the action will change, what it will not change, and any warnings or advisory items. The operator reviews this before confirming.

**Dry-run:** Backend simulates execution without committing changes. Returns the same result shape as execution but with a `dryRun: true` flag. Not all actions support dry-run; the safety profile declares whether it is supported.

**Explicit confirmation:** Operator must deliberately acknowledge the action. Standard confirmation uses a dialog with scope summary. Enhanced confirmation adds explicit risk warning and requires the operator to type a confirmation phrase (e.g., the resource name or "DELETE").

**Scope restriction:** The action must declare and enforce its intended scope (e.g., specific resource IDs, domain, or tenant partition). The backend rejects requests that exceed declared scope.

**Post-run validation:** After execution, the backend checks whether the action produced the intended result. Returns structured findings (pass/fail per check) that are displayed to the operator and stored as evidence.

**Recovery guidance:** If execution fails or validation finds discrepancies, the backend returns structured recovery steps. These are contextual to the specific failure, not generic error messages.

**Durable audit record:** An `IAdminAuditRecord` is written to the `AdminAuditEvents` table with actor context, rationale, event type, and timestamps.

**Evidence capture:** Structured evidence is written to the `AdminEvidence` table via `IAdminEvidenceService`. Evidence types include `command-input-snapshot`, `preview-result`, `step-result-detail`, `post-validation-summary`, `compensation-record`, and `error-diagnostic`.

---

## 5. Action classification by domain

The following tables classify currently implemented admin actions by risk tier. Actions not yet implemented are excluded. Classifications are based on confirmed repo state from the [P11-01 audit](./phase-11-repo-truth-and-dependency-audit.md).

### Provisioning domain

| Action | Risk tier | Execution mode | Notes |
|--------|-----------|----------------|-------|
| List provisioning runs | T0 Read-only | -- | Query only |
| Get provisioning run detail | T0 Read-only | -- | Query only |
| Retry provisioning run | T2 Elevated | Checkpointed | Re-executes failed saga steps; retry ceiling enforced |
| Archive provisioning failure | T1 Routine | Seamless | Marks failure as acknowledged; no system state change |
| Acknowledge escalation | T1 Routine | Seamless | Marks escalation as acknowledged |
| Force state transition | T3 Destructive | Destructive | Overrides run state machine; risk of inconsistent state |
| Launch provisioning run | T2 Elevated | Checkpointed | Creates site, lists, permissions; compensatable |

### Setup and install domain

| Action | Risk tier | Execution mode | Notes |
|--------|-----------|----------------|-------|
| Run preflight checks | T0 Read-only | Advisory | Inspection only |
| Launch install run | T2 Elevated | Checkpointed | Multi-step install with checkpoint approval |
| Approve checkpoint | T2 Elevated | Checkpointed | Resumes install after manual verification |
| Reject checkpoint | T1 Routine | Seamless | Stops install at checkpoint; no destructive effect |
| Run post-install verification | T0 Read-only | Advisory | Inspection only |

### App binding domain

| Action | Risk tier | Execution mode | Notes |
|--------|-----------|----------------|-------|
| List bindings | T0 Read-only | -- | Query only |
| Verify binding | T0 Read-only | Advisory | Inspection only |
| Repair binding | T2 Elevated | Checkpointed | Modifies binding record with rationale |
| Publish binding | T2 Elevated | Checkpointed | Makes binding available to managed apps |

### Hybrid identity domain

| Action | Risk tier | Execution mode | Notes |
|--------|-----------|----------------|-------|
| Search users | T0 Read-only | -- | Query only |
| Read user | T0 Read-only | -- | Query only |
| Create user (AD DS) | T3 Destructive | Destructive | Creates identity in on-prem AD; difficult to reverse cleanly |
| Create user (cloud) | T2 Elevated | Checkpointed | Creates Entra identity; reversible via disable/delete |
| Update user | T2 Elevated | Checkpointed | Modifies identity attributes |
| Enable user | T1 Routine | Seamless | Re-enables disabled identity |
| Disable user | T2 Elevated | Checkpointed | Removes access; reversible via enable |
| Delete user | T3 Destructive | Destructive | Removes identity; may require recovery from backup |
| List connections | T0 Read-only | -- | Query only |
| Upsert connection | T2 Elevated | Checkpointed | Modifies governed connector settings |
| Test connection | T0 Read-only | Advisory | Inspection only |
| Rotate connection secret | T2 Elevated | Checkpointed | Replaces secret reference; old secret becomes invalid |

### White-glove device deployment domain

| Action | Risk tier | Execution mode | Notes |
|--------|-----------|----------------|-------|
| Launch package run | T2 Elevated | Checkpointed | Initiates multi-device deployment |
| Approve checkpoint | T2 Elevated | Checkpointed | Resumes deployment after technician verification |
| Reject checkpoint | T1 Routine | Seamless | Stops deployment at checkpoint |
| Test connector | T0 Read-only | Advisory | Inspection only |

### Standards and configuration domain

| Action | Risk tier | Execution mode | Notes |
|--------|-----------|----------------|-------|
| Get config | T0 Read-only | -- | Query only |
| Publish config override | T2 Elevated | Checkpointed | Changes live config with audit reason required |
| Revert config override | T2 Elevated | Checkpointed | Restores prior version with audit reason required |

### SharePoint control domain

| Action | Risk tier | Execution mode | Notes |
|--------|-----------|----------------|-------|
| Run drift detection | T0 Read-only | Advisory | Inspection only |
| Preview repair | T0 Read-only | Advisory | Dry-run inspection only |
| Apply repair | T3 Destructive | Destructive | Modifies SharePoint assets to match standards |
| Check posture | T0 Read-only | Advisory | Inspection only |

---

## 6. Safety profile contract

Each action must declare a safety profile that maps it to the framework. The safety profile is the unit of safety enforcement — the backend uses it to determine which controls to require before executing.

The safety profile should include:

| Field | Type | Description |
|-------|------|-------------|
| `actionKey` | `string` | Unique identifier for the action (e.g., `provisioning.force-state-transition`) |
| `domain` | `AdminDomain` | The admin domain that owns the action |
| `riskLevel` | `AdminRiskLevel` | The risk tier classification |
| `executionMode` | `AdminExecutionMode` | How the action executes |
| `requiredControls` | `AdminSafetyControl[]` | Array of required safety controls for this action |
| `supportsPreview` | `boolean` | Whether the action supports preview/impact summary |
| `supportsDryRun` | `boolean` | Whether the action supports dry-run simulation |
| `scopeDescription` | `string` | Human-readable description of the action's intended scope |
| `confirmationType` | `'none' \| 'standard' \| 'enhanced'` | Required confirmation ceremony |

This profile is code-defined in the backend and registered in a safety policy registry. The frontend reads the profile to determine the appropriate UX ceremony. The backend enforces that all required controls are satisfied before execution proceeds.

---

## 7. Constraints

1. **Classifications are not permanent.** As the system matures, actions may be reclassified based on operational experience. The safety profile registry is the single source of truth.

2. **New actions must declare a safety profile.** Any new admin action added to the system must include a safety profile before it can be registered in the admin API.

3. **Preview-only and advisory operations are T0.** Operations that only inspect state and return information are classified as read-only, even if they inform a subsequent destructive action.

4. **The frontend does not determine risk tier.** The backend declares the risk tier and required controls. The frontend presents the appropriate UX based on the backend's declaration.

5. **Scope restriction is cumulative with auth.** Scope restriction limits what a specific action execution can touch. It does not replace role-based access control.

---

## 8. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 safety baseline](./phase-11-safety-baseline.md) | Safety doctrine and frontend/backend boundary |
| [Phase 11 repo-truth and dependency audit](./phase-11-repo-truth-and-dependency-audit.md) | Confirmed repo state and maturity |
| [Phase 11 summary plan](./Admin-SPFx-IT-Control-Center-Phase-11-Summary-Plan.md) | Phase scope and acceptance criteria |
| [End-state plan](../admin-spfx-it-control-center-end-state-plan.md) | Phase 11 definition and exit criteria |
