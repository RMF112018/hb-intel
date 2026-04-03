# Admin SPFx IT Control Center — Post-Install Verification

**Prompt:** P6-07 — Post-Install Verification and Health Checks
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the verification flow that confirms environment operability after install/bootstrap.

---

## 1. Verification purpose

Post-install verification answers: **"Did the environment become operational?"**

It is distinct from preflight (which answers "Can we start?") and from the install execution (which answers "Did the steps succeed?"). A successful install run may still result in a non-operational environment if external dependencies (DNS, permission propagation, app catalog deployment) have not completed.

Verification checks are **observational** — they report pass/warn/fail but do not roll back the install. Failed verification findings should trigger retry, repair, or escalation guidance.

---

## 2. Result categories

| # | Check ID | Category | What it verifies |
|---|----------|----------|-----------------|
| 1 | `function-app-responds` | Backend reachability | Function App is running and core config is present |
| 2 | `table-storage-accessible` | Persistence readiness | Azure Table Storage endpoint is configured |
| 3 | `graph-api-functional` | Graph/Entra posture | Tenant ID, client ID, and Graph group permission confirmed |
| 4 | `sharepoint-tenant-reachable` | SharePoint posture | SharePoint tenant URL and projects site URL configured |
| 5 | `spfx-package-deployed` | SharePoint posture | App catalog URL and SPFx app ID configured |
| 6 | `api-permissions-granted` | Permission posture | Graph permissions confirmed and adapter mode is proxy |

---

## 3. Pass/warn/fail semantics

| Outcome | Meaning | Operator action |
|---------|---------|----------------|
| **All passed** | Environment is operational. Install is complete. | No action needed. |
| **Some failed** | Environment has gaps. Some features may not work. | Review failed checks. May need to complete manual steps, wait for propagation, or retry verification later. |
| **All failed** | Environment is not operational. | Investigate install steps. May need to retry the install or escalate. |

The `IAdminPostRunValidationSummary.outcomeAccepted` field is `true` only when **all checks pass**.

---

## 4. Relationship to preflight and install execution

```
Preflight          →  Install Execution  →  Post-Install Verification
"Can we start?"       "Execute the steps"   "Is it working?"
Blocks launch         Modifies environment  Reports status only
Critical = blocker    Failure = run fails   Failure = findings (no rollback)
```

| Concept | Preflight | Install | Verification |
|---------|-----------|---------|-------------|
| Purpose | Block launch on known-bad state | Deploy and configure | Confirm operability |
| Blocking | Yes (critical checks) | Yes (blocking steps) | No (observational) |
| Modifies environment | No | Yes | No |
| When to run | Before install launch | During install | After install completion |
| Persistence | Evidence (PreviewResult) | Run envelope + audit events | Evidence (PostValidationSummary) |

---

## 5. What findings should trigger

| Finding | Recommended action |
|---------|-------------------|
| Function App not responding | Check Azure deployment. Retry install. |
| Table Storage not accessible | Check AZURE_TABLE_ENDPOINT. Verify storage account exists. |
| Graph API not functional | Complete admin consent in Entra portal. Set GRAPH_GROUP_PERMISSION_CONFIRMED=true. |
| SharePoint not reachable | Check SHAREPOINT_TENANT_URL and SHAREPOINT_PROJECTS_SITE_URL. |
| SPFx package not deployed | Upload package to app catalog. Set HB_INTEL_SPFX_APP_ID. |
| API permissions not granted | Complete SharePoint API access approval. Set HBC_ADAPTER_MODE=proxy. |

---

## Implementation location

| File | Purpose |
|------|---------|
| `backend/functions/src/services/admin-control-plane/install-verification-service.ts` | `executeVerificationChecks()`, `runPostInstallVerification()` |
| `backend/functions/src/services/admin-control-plane/__tests__/install-verification-service.test.ts` | Unit tests — check count, pass/fail behavior, audit recording, evidence capture |

---

## Cross-references

- [Preflight Validator](admin-spfx-preflight-validator.md) — pre-launch readiness checks (distinct from verification)
- [Install/Bootstrap Step Model](admin-spfx-install-bootstrap-step-model.md) — step family 5 (verification)
- [Install Contract Slice](admin-spfx-install-contract-slice.md) — `InstallVerificationCheckId`, `IAdminPostRunValidationSummary`
