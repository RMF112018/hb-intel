# Phase 7 — Provisioning Hardening Baseline

## 1. Purpose

This document defines the operational terms, failure taxonomy, operator boundaries, and deferral commitments that govern Phase 7 provisioning hardening. Every definition is grounded in the Phase 7 gap map (`admin-spfx-phase-7-provisioning-gap-map.md`) and verified repo state.

Phase 7 preserves the existing provisioning foundations and hardens them — it does not replace or redesign the provisioning model.

## 2. Straight-through provisioning — operational definition

**Straight-through provisioning** means a provisioning run that:

1. passes all prerequisite validation before any step executes,
2. executes Steps 1-7 in sequence without manual intervention,
3. persists durable status after every step transition,
4. completes with `overallStatus='Completed'` and a valid `siteUrl`,
5. reconciles the project setup request to `Completed` state.

Step 5 (Install Web Parts) may defer to the overnight timer without breaking the straight-through contract — Steps 6-7 continue immediately, and the timer completes Step 5 asynchronously. The run transitions through `WebPartsPending` to `Completed` without operator action.

A straight-through run should be the **overwhelmingly common case**. Phase 7 hardening must not add friction or gates to the normal path.

## 3. Pre-launch dependency failure

A **pre-launch dependency failure** is any condition detected by `validateProvisioningPrerequisites()` (`backend/functions/src/utils/validate-config.ts`) or by new Phase 7 health-checks that prevents the saga from starting.

Current pre-launch gates (8 required):

| Gate | What it checks |
|------|---------------|
| GRAPH_GROUP_PERMISSION_CONFIRMED | Entra Group.ReadWrite.All permission flag |
| AZURE_TENANT_ID | Tenant identifier for identity claims |
| SHAREPOINT_TENANT_URL | Root SharePoint URL for all SP operations |
| SHAREPOINT_HUB_SITE_ID | Hub site GUID for Step 7 association |
| SHAREPOINT_APP_CATALOG_URL | App catalog URL for Step 5 SPFx install |
| HB_INTEL_SPFX_APP_ID | SPFx app package GUID for Step 5 |
| OPEX_MANAGER_UPN | OpEx manager for Step 6 Leaders group |
| SITES_SELECTED_GRANT_CONFIRMED | Per-site grant confirmation (conditional on Sites.Selected model) |

**Phase 7 additions** (from gap map section 6):

- **Endpoint reachability probes**: lightweight health-checks against SharePoint and Graph endpoints at prerequisite time, so a misconfigured or unreachable endpoint fails before Step 1 — not during it.
- **Permission model runtime verification**: where feasible, verify Graph permissions are actually active rather than trusting only the env flag.

Pre-launch failures must:
- aggregate all detected issues into a single error response,
- return a clear, structured error to the API caller before any step runs,
- log a telemetry event with the specific gates that failed,
- never partially execute the saga.

## 4. Transient execution failure

A **transient execution failure** is a step-level error caused by a temporary platform condition that may resolve on retry.

Detection criteria (from `backend/functions/src/utils/retry.ts`):

| Signal | Example |
|--------|---------|
| HTTP 429 | Graph or SharePoint throttling |
| ECONNRESET | Network connection dropped |
| ETIMEDOUT | Request timeout |
| Fetch failed | DNS or TLS failure |
| Retry-After header | Platform-requested backoff |

Transient failures are handled by `withRetry()` (3 attempts, exponential backoff: 2s/4s/8s) at the step level. If all 3 attempts fail, the step is marked Failed and the saga enters compensation.

**Phase 7 addition**: when a step fails after exhausting retries, the saga must classify the failure as `transient` in the `failureClass` field if the final error matched transient detection criteria. This populates the orphaned `failureClass` field identified in gap map section 7.

## 5. Terminal failure

A **terminal failure** is a step-level error that cannot be resolved by retry and requires operator investigation or structural correction.

Examples:

| Category | Signal | Typical cause |
|----------|--------|---------------|
| Permissions | HTTP 403, `GraphPermissionNotConfirmedError` | Missing or revoked Graph/SP permissions |
| Structural | HTTP 400, validation error | Bad input, malformed request, schema mismatch |
| Configuration | Missing resource, 404 on expected entity | Deleted hub site, missing app catalog entry |
| Repeated | Same error class on retry after prior failure | Persistent platform issue, not truly transient |

Terminal failures must:
- populate `failureClass` with the appropriate classification (`permissions`, `structural`, `repeated`),
- persist the classified error in the durable run record,
- trigger compensation,
- surface a clear error message to the operator via the admin UI.

**Phase 7 must implement**: a `classifyFailure(error, context)` function in the backend that examines the error shape (status code, error type, message patterns, retry history) and assigns the correct `failureClass` value. The admin UI already reads this field — wiring it closes the gap.

## 6. Operator visibility boundary — SPFx

The admin SPFx app is the **operator console**. Operators may:

- **View**: provisioning run status, step progress, failure classification, step-level error details (complexity-gated), diagnostic evidence, retry count, escalation state, timestamps, and Entra group identifiers.
- **Initiate**: Force Retry (permission-gated, ceiling-aware), Archive Failure, Acknowledge Escalation, Manual State Override (expert-tier only).
- **Access**: runbook links, failure-class descriptions, coaching guidance.

Operators must **never**:
- execute privileged operations directly (site creation, group creation, permission assignment),
- modify saga orchestration behavior,
- bypass prerequisite validation,
- or access raw Table Storage data.

**Phase 7 additions to operator visibility**:
- Aggregated evidence payload in the detail modal (step errors, timing, permission posture collected into a structured view).
- Conditional recovery guidance based on the specific failed step and failure classification.
- Audit trail visibility for admin-initiated retries.

## 7. Privileged backend boundary

The backend control plane (`backend/functions`) owns:

- prerequisite validation and health-checks,
- saga orchestration and step sequencing,
- in-step retry logic with transient detection,
- failure classification assignment,
- compensation chain execution,
- durable run state persistence (Azure Table Storage),
- request state reconciliation,
- timer-driven Step 5 deferral processing,
- evidence/diagnostic payload construction,
- all privileged operations against Graph, SharePoint, and Azure.

**Phase 7 additions to the backend**:
- Failure classification function (`classifyFailure`),
- Endpoint health-check probes at prerequisite time,
- Step 6 compensation (Entra group deletion),
- Step 5 deferral deadline enforcement,
- Structured evidence payload assembly,
- Retry audit logging (identity + timestamp),
- Enriched error context for Step 5 timeouts and Graph API failures.

## 8. Evidence and status contract

A provisioning run must expose the following evidence through its durable status record:

### Already present (preserve)

| Field | Purpose |
|-------|---------|
| overallStatus | Current run state |
| currentStep | Step being executed or that last failed |
| stepsJson | Per-step status, error, timestamp, metadata |
| siteUrl | Created site URL (after Step 1) |
| retryCount, lastRetryAt | Retry history |
| escalatedBy, escalatedAt | Escalation state |
| failureClass | Failure classification (currently orphaned) |
| step5DeferredToTimer | Deferral flag |
| correlationId, parentCorrelationId | Run lineage |
| groupMembers, entraGroups | Entra group evidence |
| department | Project department |
| timestamps | startedAt, completedAt, failedAt |

### Phase 7 additions

| Field / Enrichment | Purpose |
|-------------------|---------|
| **failureClass populated** | Classify every failure as transient, structural, permissions, or repeated |
| **Step-level error classification** | Per-step error categorization (not just the overall run) |
| **Evidence summary** | Aggregated diagnostic object: step errors, durations, attempt counts, permission posture at failure time |
| **Retry initiator identity** | Who triggered an admin retry (triggeredByOid on retry) |
| **Step 5 deferral age** | How long a deferred job has been pending |
| **Enriched Step 5 context** | App Catalog lookup result, install-attempt details on timeout |
| **Enriched Graph error context** | Structured error code/category for 403, 404, 409, 429 |

## 9. Repair and retry visibility

Phase 7 must provide:

- **Failure-class-aware guidance**: when a run fails, the admin detail modal must show recovery recommendations conditional on the failure classification and failed step — not just static runbook links.
- **Retry audit trail**: every admin-initiated retry must log the initiating identity and timestamp in the durable run record, visible in the detail modal.
- **Step 6 compensation**: Entra ID groups created before a failure must be cleaned up during compensation, preventing orphaned groups.
- **Step 5 deferral deadline**: deferred jobs older than a configurable threshold (default: 7 days) must auto-escalate to Failed with a clear explanation.
- **Escalation guidance**: when `failureClass` is `repeated` or retryCount exceeds the ceiling, the UI must present explicit escalation guidance rather than just disabling the retry button.

## 10. Phase 7 deliberate deferrals

Phase 7 will **not** implement:

| Concern | Deferred to | Reason |
|---------|------------|--------|
| Full observability build-out (in-memory → persistent stores, 4 deferred monitors, 3 deferred probes, SMTP, durable webhooks) | Phase 12 | Observability completion is a separate workstream; Phase 7 improves provisioning-specific diagnostics only |
| SharePoint governance and standards enforcement | Phase 8 | Scaffold lanes for Validation and SharePoint Control are Phase 8 scope |
| Entra control lane | Phase 9 | EntraLanePage is explicitly Phase 9 |
| Destructive-action safety framework | Phase 11 | Recovery visibility improvements must not blur into destructive-action safety |
| Error logging and audit trail | SF17-T05 | ErrorLogPage is intentionally deferred |
| Approval authority persistence | SF17-T05 | ApprovalAuthorityApi remains a stub |
| Automated Sites.Selected grant workflow (Option A1) | Later | Manual `tools/grant-site-access.sh` is sufficient for Phase 7 |
| Wholesale provisioning model replacement | Never (Phase 7) | Phase 7 hardens — it does not redesign |
| Moving privileged execution into SPFx | Never | Target architecture requires backend-owned privileged operations |
