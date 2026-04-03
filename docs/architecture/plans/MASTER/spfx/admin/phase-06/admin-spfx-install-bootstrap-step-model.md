# Admin SPFx IT Control Center — Install/Bootstrap Step Model

**Prompt:** P6-02 — Install/Bootstrap Architecture and Step Model
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Define the canonical step families for the install/bootstrap run sequence.

---

## Overview

An install/bootstrap run proceeds through 6 step families in order. Each family contains one or more concrete steps. Steps within a family execute sequentially. The run pauses at manual checkpoints and fails on blocking errors.

```
Environment Discovery → Preflight Validation → Install Execution → Manual Checkpoints → Post-Install Verification → Evidence Publication
```

---

## Step Family 1: Environment Discovery

**Purpose:** Detect the current environment state so preflight and install steps operate on known facts rather than assumptions.

| Field | Value |
|-------|-------|
| Owner layer | Backend control plane |
| Required inputs | Environment config from `wave0-env-registry.ts`, managed identity credentials |
| Expected outputs | `EnvironmentSnapshot` — tenant ID, subscription ID, resource group existence, app registration state, SharePoint tenant URL, app catalog URL, existing SPFx packages |
| Blocking behavior | **Warning-only** — discovery failures degrade preflight accuracy but do not block the run |
| Automation | Fully automatable |

### Concrete steps

| Step | Adapter | Operation |
|------|---------|-----------|
| 1.1 Discover Azure subscription and resource group | `azure-deployment:bicep` | `discoverResourceGroup` |
| 1.2 Discover Entra app registrations | `entra-graph:group-lifecycle` | `discoverAppRegistrations` |
| 1.3 Discover SharePoint app catalog state | `sharepoint-alm:package-install` | `discoverAppCatalog` |
| 1.4 Discover existing infrastructure | `validation-probe:readiness` | `checkReadiness` |

---

## Step Family 2: Preflight Validation

**Purpose:** Validate that all prerequisites for a successful install are met before committing to execution.

| Field | Value |
|-------|-------|
| Owner layer | Backend control plane (`IAdminPreflightService`) |
| Required inputs | `EnvironmentSnapshot` from discovery, env config, health probe results |
| Expected outputs | `PreflightReport` — structured list of checks with pass/warn/fail status and remediation guidance |
| Blocking behavior | **Blocking** — any critical failure prevents install launch |
| Automation | Fully automatable |

### Concrete checks

| Check | Severity | What it validates |
|-------|----------|-------------------|
| 2.1 Azure subscription accessible | Critical | Managed identity can authenticate to ARM |
| 2.2 Resource group exists or can be created | Critical | Target RG is reachable or creatable |
| 2.3 Entra app registration prerequisites | Critical | Required app registrations exist or can be created |
| 2.4 Graph API permissions available | Critical | Managed identity has required Graph scopes |
| 2.5 SharePoint tenant URL reachable | Critical | Tenant URL resolves and is accessible |
| 2.6 App catalog URL configured | Critical | `SHAREPOINT_APP_CATALOG_URL` is set and reachable |
| 2.7 SPFx app package available | Warning | `HB_INTEL_SPFX_APP_ID` is set; package may be uploaded during install |
| 2.8 Table Storage endpoint accessible | Critical | `AZURE_TABLE_ENDPOINT` is writable |
| 2.9 Environment config completeness | Warning | All optional env vars checked, missing ones reported |

---

## Step Family 3: Install/Bootstrap Execution

**Purpose:** Deploy infrastructure, configure services, and install packages through privileged backend adapters.

| Field | Value |
|-------|-------|
| Owner layer | Backend control plane (install orchestration service via adapter registry) |
| Required inputs | `PreflightReport` (all critical checks passed), `EnvironmentSnapshot`, operator launch request with `IAdminActorContext` |
| Expected outputs | Per-step `IAdminStepResult` with success/failure, evidence references, and audit events |
| Blocking behavior | **Blocking** — step failure halts the run (operator can retry or cancel) |
| Automation | Steps are automated; some steps may require manual checkpoint (see Family 4) |

### Concrete steps

| Step | Adapter | Operation | Checkpoint? |
|------|---------|-----------|------------|
| 3.1 Deploy resource group | `azure-deployment:bicep` | `deployResourceGroup` | No |
| 3.2 Deploy Storage Account | `azure-deployment:bicep` | `deployStorage` | No |
| 3.3 Deploy Function App | `azure-deployment:bicep` | `deployFunctionApp` | No |
| 3.4 Configure app settings | `azure-deployment:bicep` | `configureAppSettings` | No |
| 3.5 Create/update Entra app registration | `entra-graph:group-lifecycle` | `createAppRegistration` | No |
| 3.6 Grant API permissions | `entra-graph:group-lifecycle` | `grantApiPermissions` | **Yes** — tenant admin consent may be required |
| 3.7 Upload SPFx package to app catalog | `sharepoint-alm:package-install` | `installWebParts` | No |
| 3.8 Request SharePoint API access | `sharepoint-api-access:permissions` | `requestApproval` | **Yes** — tenant admin must approve API access |
| 3.9 Configure hub site association | `sharepoint-site:lifecycle` | `associateHub` | No |

### Step ordering constraints

- Steps 3.1–3.4 (Azure infrastructure) must complete before 3.5–3.6 (Entra) because the Function App URI is needed for the app registration reply URL
- Step 3.5 must complete before 3.6 (permissions require the app registration)
- Step 3.7 can execute after 3.1–3.4 (app catalog is independent of Entra)
- Step 3.8 depends on 3.7 (API access requires the package to be installed)
- Step 3.9 is last (hub association requires all other infrastructure)

---

## Step Family 4: Manual Checkpoint Handling

**Purpose:** Pause the run at points where human action is required and cannot be safely automated.

| Field | Value |
|-------|-------|
| Owner layer | Backend control plane (run status → `AwaitingApproval`); operator decision via SPFx |
| Required inputs | Checkpoint definition with operator instructions, evidence of what was requested |
| Expected outputs | Operator decision (approve/reject/cancel) with `IAdminActorContext` and optional rationale |
| Blocking behavior | **Blocking** — run is paused until operator acts |
| Automation | **Manual-checkpointed** — cannot be automated |

### When checkpoints occur

Checkpoints are embedded within Step Family 3 at specific steps (3.6 and 3.8). When the orchestrator reaches a checkpoint step:

1. The step requests the privileged action (e.g., API permission grant request)
2. The orchestrator records the checkpoint in the run envelope
3. Run status changes to `AwaitingApproval`
4. The SPFx UI displays the checkpoint with instructions
5. The operator performs the manual action in the external system (e.g., Entra admin portal)
6. The operator submits approve/reject/cancel via `adminCheckpointDecision`
7. On approve: orchestrator resumes from the next step
8. On reject/cancel: run transitions to `Failed` or `Cancelled`

See [Manual Checkpoint Policy](admin-spfx-install-manual-checkpoint-policy.md) for full rules.

---

## Step Family 5: Post-Install Verification

**Purpose:** Confirm that the installed environment is healthy and functional after all install steps complete.

| Field | Value |
|-------|-------|
| Owner layer | Backend control plane (verification flow via health probes and adapter checks) |
| Required inputs | Completed install run, environment config |
| Expected outputs | `VerificationReport` — per-subsystem health status (healthy/degraded/failed) |
| Blocking behavior | **Observational** — verification failures are reported but do not roll back the install |
| Automation | Fully automatable |

### Concrete checks

| Check | Adapter/Probe | What it verifies |
|-------|--------------|-----------------|
| 5.1 Function App responds | `validation-probe:readiness` | Health endpoint returns 200 |
| 5.2 Table Storage accessible | `validation-probe:readiness` | Can read/write test entity |
| 5.3 Graph API functional | `entra-graph:group-lifecycle` | Can query app registration |
| 5.4 SharePoint tenant reachable | `validation-probe:readiness` | Tenant URL responds |
| 5.5 SPFx package deployed | `sharepoint-alm:package-install` | Package visible in app catalog |
| 5.6 API permissions granted | `sharepoint-api-access:permissions` | Permission check returns approved |

---

## Step Family 6: Evidence Publication

**Purpose:** Publish final evidence and audit records for the completed install run.

| Field | Value |
|-------|-------|
| Owner layer | Backend control plane (evidence service + audit store) |
| Required inputs | All step results, verification report, run envelope |
| Expected outputs | Evidence references persisted, final audit event recorded, run status → `Completed` |
| Blocking behavior | **Non-blocking** — publication failures are logged but do not fail the run |
| Automation | Fully automatable |

### Evidence artifacts captured

| Artifact | Evidence type | Retention class |
|----------|--------------|----------------|
| Bicep deployment output | `DeploymentLog` | Compliance |
| App registration details | `CommandInputSnapshot` | Compliance |
| API permission grant record | `ApprovalDecision` | Compliance |
| SPFx package install record | `StepResultDetail` | Operational |
| Preflight report | `PreviewResult` | Operational |
| Verification report | `PostValidationSummary` | Operational |
| Environment snapshot | `CommandInputSnapshot` | Compliance |

---

## Cross-references

- [Install/Bootstrap Architecture](admin-spfx-install-bootstrap-architecture.md) — layer responsibilities
- [Manual Checkpoint Policy](admin-spfx-install-manual-checkpoint-policy.md) — checkpoint rules
- [Prerequisite Audit](admin-spfx-phase-6-prerequisite-audit.md) — substrate inventory
