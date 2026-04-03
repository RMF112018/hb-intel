# Admin SPFx IT Control Center — Install/Bootstrap Architecture

**Prompt:** P6-02 — Install/Bootstrap Architecture and Step Model
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Define the Phase 6 architecture slice for in-app backend install and bootstrap.

---

## 1. Purpose of the Phase 6 lane

The Setup / Install lane (`/setup`) is the operator surface where an authorized admin can:

1. Discover the current environment state
2. Validate prerequisites before attempting install
3. Launch a backend install/bootstrap run
4. Monitor progress and respond to manual checkpoint prompts
5. Review post-install verification results
6. Inspect the audit trail and evidence for the completed install

Phase 6 delivers the **first end-to-end privileged operation** that flows through the admin control plane from operator initiation to durable completion. It establishes the pattern that later phases (SharePoint control, Entra control, standards governance) will follow.

---

## 2. Layer responsibilities

### Operator console (SPFx — `apps/admin`)

| Responsibility | Boundary |
|---------------|----------|
| Display preflight readiness results | Read-only — backend computes results |
| Preview install plan (dry-run) | Calls `adminPreview` — backend simulates |
| Launch install run | Calls `adminLaunchRun` — backend executes |
| Poll run status | Calls `adminGetRun` at polling interval |
| Display checkpoint prompts | Reads checkpoint state from run envelope |
| Submit checkpoint decisions (approve/reject/cancel) | Calls `adminCheckpointDecision` |
| Display run history and audit trail | Calls `adminListRuns`, `adminListRunAuditEvents`, `adminGetRunEvidence` |
| Display post-install verification results | Reads verification step results from run envelope |

**SPFx must NOT:**
- Execute Azure Resource Manager, Graph, or SharePoint Admin API calls directly
- Store durable run state in browser storage
- Bypass checkpoint gates by auto-approving
- Create or modify Azure resources

### Backend control plane (`backend/functions`)

| Responsibility | Boundary |
|---------------|----------|
| Validate preflight prerequisites | Owns `IAdminPreflightService` |
| Orchestrate install step sequence | Owns install orchestration service |
| Execute privileged adapter operations | Delegates to `AdminAdapterRegistry` invokers |
| Persist run lifecycle | Owns `DurableAdminRunStore` |
| Record audit events | Owns `DurableAdminAuditStore` |
| Capture evidence artifacts | Owns `DurableAdminEvidenceStore` |
| Pause at manual checkpoints | Sets run status to `AwaitingApproval` |
| Resume/reject/cancel on checkpoint decision | Resumes orchestration or terminates |
| Execute post-install verification | Runs health probes and adapter checks |

### Adapters (`backend/functions/src/services/admin-control-plane/`)

| Adapter | Domain | Phase 6 role |
|---------|--------|-------------|
| `azure-deployment:bicep` | `installBootstrap` | Deploy Function App, Storage Account, resource group |
| `entra-graph:group-lifecycle` | `provisioning`, `entraControl` | Create app registrations, grant API permissions |
| `sharepoint-alm:package-install` | `provisioning`, `sharepointControl` | Install SPFx packages to app catalog |
| `sharepoint-api-access:permissions` | `sharepointControl` | Request/approve SharePoint API access |
| `validation-probe:readiness` | `provisioning`, `installBootstrap` | Readiness checks for preflight and post-install |

---

## 3. Preflight vs install vs post-install verification

| Phase | Purpose | Owner | Blocking? | Outputs |
|-------|---------|-------|-----------|---------|
| **Preflight** | Validate environment readiness before install attempt | `IAdminPreflightService` | Yes — install cannot launch if critical checks fail | Structured readiness report with pass/warn/fail per check |
| **Install execution** | Deploy infrastructure, configure services, install packages | Install orchestration service via adapter registry | Yes — each step must succeed or checkpoint before next | Step results, evidence artifacts, audit events |
| **Post-install verification** | Confirm environment health after install completes | Verification flow via health probes + adapter checks | No — verification failures are reported, not rolled back | Verification report with health status per subsystem |

### Why separation matters

- **Preflight catches known-bad states** before spending time on deployment
- **Install execution is the privileged action** that modifies external systems
- **Post-install verification confirms reality** instead of trusting step success alone

---

## 4. Why Phase 6 reuses provisioning/backend foundations

The P6-01 prerequisite audit confirmed that Phases 3–4 established:

- A durable run store that supports multi-domain runs via `AdminDomain`
- An adapter registry with descriptor metadata for install-relevant adapters
- An audit spine and evidence service for traceability
- API endpoints for run launch, status, cancel, retry, audit, and evidence
- A service container and factory pattern for production/mock wiring

Phase 6 extends this substrate by:

1. Adding real invokers to planned adapter descriptors
2. Replacing the preflight stub with real validation logic
3. Implementing checkpoint resume/cancel on the existing endpoint
4. Adding install-specific orchestration that coordinates steps through the adapter registry

This avoids reimplementing run lifecycle, persistence, or API routing.

---

## 5. Where checkpointed manual action is allowed

Manual checkpoints are allowed **only** where automation is blocked by:

- **Tenant-admin consent requirements** — SharePoint API access approval, Entra admin consent
- **External verification that cannot be programmatically confirmed** — DNS propagation, certificate issuance
- **Organizational approval gates** — deployment approval policies that require human sign-off

Checkpoints are **not allowed** for:

- Steps that can be fully automated (resource deployment, config writes, package upload)
- Steps where the operator would just click "continue" without meaningful review
- Error recovery — failures should use retry/cancel, not checkpoint

See [Manual Checkpoint Policy](admin-spfx-install-manual-checkpoint-policy.md) for full policy.

---

## 6. Explicit out-of-boundary items for SPFx

| Item | Why excluded |
|------|-------------|
| Azure Resource Manager API calls | Privileged — requires managed identity, not user token |
| Graph Admin API calls (app registrations, permissions) | Privileged — requires application permissions |
| SharePoint Admin API calls (app catalog, ALM) | Privileged — requires tenant-admin context |
| Durable run state persistence | Backend-owned — Table Storage via service container |
| Checkpoint auto-approval | Dangerous — operator must consciously approve |
| Bicep/ARM template execution | Backend-only — requires Azure deployment credentials |
| Direct Azure Table Storage writes | Backend-only — SPFx has no storage credentials |

---

## Cross-references

- [Install/Bootstrap Step Model](admin-spfx-install-bootstrap-step-model.md) — canonical step families
- [Manual Checkpoint Policy](admin-spfx-install-manual-checkpoint-policy.md) — checkpoint rules
- [Prerequisite Audit](admin-spfx-phase-6-prerequisite-audit.md) — substrate inventory
- [Target Architecture](../admin-spfx-target-architecture.md) — 4-layer model
- [Phase 6 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md) — objectives and acceptance criteria
