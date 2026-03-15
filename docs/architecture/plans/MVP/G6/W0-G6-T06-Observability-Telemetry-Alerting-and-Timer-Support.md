# W0-G6-T06 — Observability, Telemetry, Alerting, and Timer Support

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`
> **Related:** `docs/maintenance/provisioning-observability-runbook.md`; `packages/features/admin/src/probes/`

**Status:** Complete
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-01, LD-02, LD-06, LD-09

---

## Shared Feature Gate Check

### Required Packages / Infrastructure

| Component | Status | Required For |
|---|---|---|
| `@hbc/features-admin` probes (`azureFunctionsProbe`, `sharePointProbe`, `searchProbe`, `notificationProbe`, `moduleRecordHealthProbe`) | **STUB** — all return `healthy` with "no live connection configured" | Live infrastructure visibility — T06 must implement at minimum one probe with a real connection |
| `@hbc/features-admin` `ProbeScheduler` | **READY** | Probe orchestration, retry, snapshot building |
| `@hbc/features-admin` `InfrastructureProbeApi` | **Assess** — inspect `packages/features/admin/src/api/InfrastructureProbeApi.ts` before implementation | Probe snapshot persistence |
| Application Insights workspace | **Backend-only** — no frontend SDK in any package | KQL queries require Application Insights workspace access; browser-side telemetry is not available |
| Azure Functions timer / Durable Functions | **Backend concern** — not in frontend packages | Timer trigger support requires runbook documentation and manual trigger capability |

### Gate Outcome

**Before beginning T06 implementation:** inspect `packages/features/admin/src/api/InfrastructureProbeApi.ts` to confirm whether it is a real implementation or a stub. Record the gate outcome in the Gate Check Record below.

T06 may proceed on the KQL template and runbook update work regardless of probe implementation status. Probe live connections may be deferred if Azure endpoint configuration is not available in the development environment, with a clear labeling requirement in the UI.

---

## Objective

Deliver Wave 0 observability depth — real infrastructure probe data, Application Insights KQL query templates maintained in runbooks, production alert rules, and documented support for Azure Functions timer diagnostics. After this task:

1. At minimum one infrastructure probe (`azureFunctionsProbe` or `sharePointProbe`) has a real connection and returns real health data
2. KQL query templates in `docs/maintenance/provisioning-observability-runbook.md` are verified and updated to reflect the current Application Insights schema
3. At least one Azure Monitor alert rule is configured and documented (stuck provisioning > 30 minutes)
4. The Azure Functions timer diagnostic path is documented in the runbook and linked from the admin surface (via T05)
5. The dev/staging manual timer trigger procedure is documented per the Wave 0 plan G6 sketch

---

## Scope

### Probe Implementation (minimum Wave 0 subset)

Implement at minimum the two most operationally critical probes:

| Probe | Priority | Implementation |
|---|---|---|
| `azureFunctionsProbe` | **Wave 0 required** | Check Azure Functions health endpoint or Azure Management API; return `healthy`/`degraded`/`error` with a real status |
| `sharePointProbe` | **Wave 0 required** | Check SharePoint site availability and list access for `HBC_AdminAlerts`, `HBC_InfrastructureProbeSnapshots`, `HBC_ApprovalAuthorityRules`; return health status |
| `searchProbe` | Post-Wave-0 (document as follow-on) | Azure Cognitive Search index health |
| `notificationProbe` | Post-Wave-0 (document as follow-on) | Notification delivery health |
| `moduleRecordHealthProbe` | Post-Wave-0 (document as follow-on) | Module record consistency |

### KQL Template Verification and Update

The following KQL queries in `docs/maintenance/provisioning-observability-runbook.md` must be verified against the current Application Insights workspace schema:

- Full provisioning timeline query
- Failed provisioning runs query
- Step duration distribution query
- Success rate trend query
- Step 5 deferral rate query
- Stuck provisioning detection (> 30 minutes) — basis for Alert Rule 1

If any query is stale or the schema has changed, update the runbook with the corrected query.

### Alert Rule Documentation

Wave 0 requires at least one Azure Monitor alert rule to be configured and documented:

| Alert Rule | Condition | Severity | Escalation Target |
|---|---|---|---|
| Alert Rule 1: Stuck provisioning | Provisioning runs with no completion signal > 30 minutes | High | Teams channel (per LD-05) |

Document the alert rule configuration (metric, threshold, action group) in `docs/maintenance/provisioning-observability-runbook.md`. If the alert rule is already configured in production, verify and confirm. If not, create it and document the steps.

### Timer Diagnostic Documentation

The Wave 0 plan G6 sketch calls for:
- Dev/staging manual timer trigger procedure
- Timer failure diagnostic steps

These must be documented in `docs/maintenance/provisioning-runbook.md` under "Timer Support" if not already present. Cross-reference from T05's runbook link registry.

---

## Exclusions / Non-Goals

- Do not implement frontend Application Insights SDK integration. Browser-side telemetry is not available in the current architecture (backend-only observability via Azure Functions). This is a known limitation, not a Wave 0 gap.
- Do not implement complex multi-step observability pipelines or dashboards beyond what is needed for the two required probes.
- Do not implement the remaining 3 probes in Wave 0. Document as follow-on.
- Do not create a bespoke telemetry package. All probe and health types live in `@hbc/features-admin`.

---

## Governing Constraints

- All probe types must implement `IInfrastructureProbeDefinition` from `@hbc/features-admin` — no custom probe interfaces (LD-02)
- Runbook updates go in `docs/maintenance/` — not in plan files or feature package READMEs (LD-06)
- `ProbeScheduler` orchestrates probe execution — do not call probe `run()` directly from components (LD-02)
- No new reusable visual components outside `@hbc/ui-kit` (LD-09)

---

## Probe Data Flow

```
ProbeScheduler.runAll(nowIso)
  → [azureFunctionsProbe.run(), sharePointProbe.run(), ...]
  → IInfrastructureProbeResult[]
  → ProbeScheduler.buildSnapshot(results, snapshotId, capturedAt)
  → IProbeSnapshot
  → InfrastructureProbeApi.saveSnapshot(snapshot)  ← [verify API maturity]
  → useInfrastructureProbes() hook reads latest snapshot
  → ImplementationTruthDashboard renders results
```

**Probe staleness:** `PROBE_STALENESS_MS` constant governs when the dashboard shows a "stale" warning. Confirm this value is consistent with `PROBE_SCHEDULER_DEFAULT_MS = 900_000` (15 minutes). Staleness should trigger after > 30 minutes (2× the probe interval).

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/features-admin` | Primary | Probe types, `ProbeScheduler`, `IInfrastructureProbeDefinition`, `InfrastructureProbeApi` |
| `apps/admin` | Target app | Probe scheduler initialization on admin app mount |
| `docs/maintenance/` | Updated | KQL queries, alert rule documentation, timer diagnostic steps |

---

## Acceptance Criteria

1. **Live probe data:** `azureFunctionsProbe.run()` returns real health data (not "no live connection configured"). `sharePointProbe.run()` returns real SharePoint connectivity status.

2. **Probe results visible:** `ImplementationTruthDashboard` shows real probe results for the two implemented probes.

3. **KQL queries verified:** All KQL queries in `docs/maintenance/provisioning-observability-runbook.md` are verified against the current Application Insights workspace schema. Stale queries are updated.

4. **Alert Rule 1 documented:** Stuck provisioning alert rule configuration is documented in the observability runbook. If configured in production, the configuration is verified and confirmed.

5. **Timer diagnostics documented:** Dev/staging manual timer trigger procedure and timer failure diagnostic steps are in `docs/maintenance/provisioning-runbook.md`.

6. **Remaining probes tracked:** The 3 deferred probes are documented as follow-on tasks with clear next steps.

7. **Frontend telemetry limitation noted:** The absence of a browser-side Application Insights SDK is documented as a known architecture characteristic (not a bug), with the backend-observability path noted.

---

## Validation / Readiness Criteria

Before T06 is ready for review:

- TypeScript compilation clean in `packages/features/admin/`
- Unit tests cover: `azureFunctionsProbe.run()` success and error paths (mock HTTP), `sharePointProbe.run()` success and error paths, `ProbeScheduler.runAll()` with mixed results including error
- Manual walkthrough: admin sees real probe health status in `ImplementationTruthDashboard` (not stub data)
- Runbook KQL queries manually executed against Application Insights to confirm they return expected results

---

## Known Risks / Pitfalls

**Azure endpoint access in dev.** The `azureFunctionsProbe` needs an Azure Functions health endpoint or Management API key. These may not be available in the development environment. Define a mock fallback for local dev that does not affect the prod probe implementation.

**SharePoint context in probe.** The `sharePointProbe` needs a SharePoint site URL and credentials. In the SPFx context, the SP context is available via `ComplexityProvider` / `spfxContext`. Verify how probe implementations access the SharePoint client context.

**`InfrastructureProbeApi` maturity.** This was not inspected before the current session began. Gate check requires reading `packages/features/admin/src/api/InfrastructureProbeApi.ts` before implementation. If it is a stub (similar to `AdminAlertsApi`), probe snapshot persistence needs to be implemented in T06.

---

## Gate Check Record

*(Record outcome of `InfrastructureProbeApi` inspection here before implementation begins.)*

**`InfrastructureProbeApi`:** ✅ Was STUB — `getLatestSnapshot()` returned null, `runNow()` returned empty snapshot. T06 replaced with in-memory `Map`-backed implementation with `saveSnapshot()`, `getLatestSnapshot()` (tracks latest by `capturedAt`), `listSnapshots(range?)`, and `runNow()` (returns latest or empty).

---

## Progress Documentation Requirements

During active T06 work:

- ✅ **InfrastructureProbeApi:** Was STUB, now in-memory `Map` implementation (same pattern as `AdminAlertsApi`). SharePoint `HBC_InfrastructureProbeSnapshots` list is Wave 1 target.
- ✅ **Azure Functions health endpoint:** `{baseUrl}/api/health` with Bearer token auth. `createAzureFunctionsProbe(config)` factory calls it and returns healthy/degraded/error based on HTTP status.
- ✅ **SharePoint connectivity check:** `{baseUrl}/api/project-setup-requests?state=Submitted` used as lightweight connectivity probe. `createSharePointProbe(config)` factory wraps the call.
- ✅ **KQL queries:** All 5 queries in `provisioning-observability-runbook.md` verified against current schema — no changes needed.
- ✅ **Alert Rule 1:** Stuck provisioning (>30m) already documented and configured per observability runbook §Alert Rule 1.
- ✅ **Timer diagnostics:** Added "Timer Support" section to `provisioning-runbook.md` with dev/staging manual trigger procedure and timer failure diagnostic steps.
- ✅ **Probe DI pattern:** `ProbeConnectionConfig` interface + factory functions mirror the monitor DI pattern. `createDefaultProbeScheduler(config?)` wires configured probes when config provided.
- ✅ **PROBE_STALENESS_MS:** Added as constant = 1,800,000 (30 min = 2× probe interval).
- ✅ **Deferred probes:** `searchProbe`, `notificationProbe`, `moduleRecordHealthProbe` remain stubs — tracked as post-Wave-0 follow-on.
- ✅ **Frontend telemetry:** No browser-side Application Insights SDK — documented as known architecture characteristic, not a bug. Backend-only observability via Azure Functions.

---

## Closure Documentation Requirements

Before T06 can be closed:

- Gate Check Record updated with `InfrastructureProbeApi` status
- At minimum 2 probes implemented with real connections (not stubs)
- All KQL queries in observability runbook verified
- Alert Rule 1 documented (or configured) in the observability runbook
- Timer diagnostic documentation committed to `docs/maintenance/provisioning-runbook.md`
- All acceptance criteria verified and checked off
- TypeScript compilation clean in `packages/features/admin/`
- Deferred probes listed as follow-on tasks
