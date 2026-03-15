# Wave 0 — Group 6: Admin, Support, and Observability

> **Doc Classification:** Canonical Group Plan — Wave 0 Group 6
> **Authority:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` §G6
> **Related:** `docs/architecture/blueprint/current-state-map.md`; `docs/architecture/blueprint/package-relationship-map.md`; `docs/maintenance/provisioning-runbook.md`; `docs/maintenance/provisioning-observability-runbook.md`

**Status:** Active
**Stream:** Wave 0 / G6

---

## Package Name Correction

The locked G6 decisions reference "the existing `@hbc/admin` package." No standalone `@hbc/admin` package exists. The actual package is **`@hbc/features-admin`** at `packages/features/admin/`. All G6 task plans use the correct name. This is a terminology correction, not a scope change — the intent of the locked decision is preserved.

---

## Purpose

Group 6 delivers the admin, support, and observability surfaces that make the Wave 0 provisioning workflow operationally viable. The goal is not a full enterprise ITSM but real operational capability: admins can detect, diagnose, and act on provisioning failures; alerts reach the right people through the right channels; runbooks are embedded in context; infrastructure health is visible; and the permission boundary between business-ops leads and technical admins is enforced.

G6 completes the operational readiness requirement for the Wave 0 pilot. Without G6, the provisioning workflow has no recovery path, no alert escalation, and no operational accountability.

---

## Locked Decisions

These decisions are governance inputs to G6. Task plans must honor them without revisiting the decision itself. A "Known Corrections" section at the bottom of this file records any conflicts found during G6 execution.

| ID | Decision |
|---|---|
| LD-01 | The admin toolset for Wave 0 is lightweight but operationally meaningful — not a full ITSM. Alert detection, runbook surfacing, and escalation targeting are in scope. Complex bulk analytics and multi-workflow orchestration are deferred. |
| LD-02 | `@hbc/features-admin` is the primary admin intelligence package. All monitor, probe, alert, and approval boundary types flow through it. No parallel admin type definitions in `apps/admin/`. |
| LD-03 | Business-ops leads see provisioning status, request review summaries, and summary-level health indicators. Technical admins see the full failures inbox, all override actions, system settings, and all alert detail. The permission boundary is enforced via `@hbc/auth` (`admin:access-control:view` permission). |
| LD-04 | Retry behavior is safe and bounded. Retry count is visible to the admin before triggering. Retry enforces `@hbc/provisioning` state machine constraints — no state transitions that bypass `STATE_TRANSITIONS`. Maximum retry attempt tracking is surfaced. |
| LD-05 | Alert routing targets for Wave 0: Teams channel for `critical` and `high` severity; email to `hbtech@hedrickbrothers.com` for `medium` and `low` digest alerts. This routing contract is implemented in `@hbc/features-admin`'s `notificationRouter.ts` and consumed by the dispatch adapter. |
| LD-06 | Runbook ownership by type: operational runbooks (provisioning failure, stuck workflow, timer failure) are owned by the admin/dev team and live in `docs/maintenance/`. Support runbooks (requester-facing guidance for common errors) are owned by business-ops leads and embedded in the admin surface as contextual guidance. |
| LD-07 | Guidance model: contextual guidance is embedded in the admin surface (coaching callouts, linked runbook sections) rather than in a separate help section. No standalone help portal in Wave 0. |
| LD-08 | Business-ops summary visibility: business-ops leads see aggregated health counts (healthy/degraded/failed) rather than individual alert records. Full alert detail is restricted to technical admins. |
| LD-09 | All shared UI belongs in `@hbc/ui-kit`. `@hbc/features-admin` may contain feature-local composition components. `apps/admin/` contains only app-shell and route-level composition. No new reusable visual primitives outside `@hbc/ui-kit`. |
| LD-10 | G6 scope boundary: admin surfaces, observability tooling, and embedded support guidance only. Coordinator approval decisions are a coordinator concern (G4/SPFx). Requester surfaces are G5. Approval authority rule _configuration_ (managing who can approve) is G6 scope; approval _decisions_ are not. |

---

## Repo Inspection Summary

Performed 2026-03-15. Key findings that govern G6 planning:

### What is ready for consumption

- **`ProvisioningOversightPage`** (`apps/admin/src/pages/ProvisioningOversightPage.tsx`): Fully implemented. Filter tabs (active/failures/completed/all), retry/archive/escalate/force-state-transition actions, integrates `@hbc/provisioning` API client and `@hbc/complexity`.
- **`SystemSettingsPage`** (`apps/admin/src/pages/SystemSettingsPage.tsx`): Real — uses `AdminAccessControlPage` from `@hbc/auth`.
- **`AdminAlertDashboard`**, **`AdminAlertBadge`**, **`ImplementationTruthDashboard`**, **`ApprovalAuthorityTable`**, **`ApprovalRuleEditor`**: All real UI components in `@hbc/features-admin`.
- **`MonitorRegistry`**: Real implementation — register, run, deduplicate logic works.
- **`ProbeScheduler`**: Real implementation — exponential-backoff retry (`PROBE_MAX_RETRY=3`, 100ms base), `buildSnapshot`, `runAll`.
- **`notificationRouter.ts`**: Real routing logic — critical/high → `immediate`; medium/low → `digest`.
- **Route permission guard**: `admin:access-control:view` enforced via `usePermissionStore` from `@hbc/auth`.
- **Admin app routes**: `/` (SystemSettingsPage), `/error-log` (SystemSettingsPage audit-log section), `/provisioning-failures` (ProvisioningOversightPage) — all real.
- **`notificationDispatchAdapter.ts`**: Defines `INotificationDispatchAdapter` interface and `ReferenceNotificationDispatchAdapter`. Contract is ready; actual Teams/email delivery is not wired.

### What is not ready (no-go gates)

| Component | Status | Gate Impact |
|---|---|---|
| All 6 alert monitors (`provisioningFailureMonitor`, `stuckWorkflowMonitor`, `overdueProvisioningMonitor`, `staleRecordMonitor`, `permissionAnomalyMonitor`, `upcomingExpirationMonitor`) | **STUB** — `run()` returns `[]` | T04 is gated; T01 alert-badge behavior is degraded |
| `AdminAlertsApi.listActive()` and `acknowledge()` | **STUB** — returns empty list; no-op | T01 and T04 gated |
| `ApprovalAuthorityApi` (getRules, upsertRule, deleteRule, testEligibility) | **STUB** — "deferred to SF17-T05" | T02 approval boundary configuration gated |
| All 5 probes (`azureFunctionsProbe`, `sharePointProbe`, `searchProbe`, `notificationProbe`, `moduleRecordHealthProbe`) | **STUB** — return `healthy` with "no live connection configured" | T06 probe data is not real; T06 gated for live connectivity |
| Teams/email alert delivery | **Not wired** — `ReferenceNotificationDispatchAdapter` defines contract only | T04 alert delivery is gated |
| `ErrorLogPage` | **STUB** — shows "available in a future release" | T03 error log view is gated |
| Application Insights SDK | **Not integrated in frontend** — observability is backend-only via Azure Functions + KQL | T06 browser-side telemetry not available; runbook-based KQL is available |

### Constants confirmed

- `ADMIN_ALERTS_POLL_MS = 30_000` (30s poll for alerts)
- `PROBE_SCHEDULER_DEFAULT_MS = 900_000` (15min probe interval)
- `PROBE_MAX_RETRY = 3` (exponential backoff: 100ms, 200ms)
- SharePoint list names: `HBC_AdminAlerts`, `HBC_InfrastructureProbeSnapshots`, `HBC_ApprovalAuthorityRules`

---

## Admin Surface Map

```
apps/admin/ (SPFx admin app)
│
├── /                          → SystemSettingsPage
│   └── AdminAccessControlPage (from @hbc/auth)
│
├── /error-log                 → SystemSettingsPage (audit-log section)
│   └── STUB — "available in a future release"
│
└── /provisioning-failures     → ProvisioningOversightPage
    ├── Filter tabs: active / failures / completed / all
    ├── Actions: retry / archive / escalate / force-state-transition
    └── Permission guard: admin:access-control:view
```

```
@hbc/features-admin package seams:
├── monitors/           ← MonitorRegistry (real); all 6 monitors STUB
├── probes/             ← ProbeScheduler (real); all 5 probes STUB
├── api/                ← AdminAlertsApi STUB; ApprovalAuthorityApi STUB
├── hooks/              ← useAdminAlerts, useApprovalAuthority, useInfrastructureProbes (real hooks over stub APIs)
├── components/         ← AdminAlertDashboard, AdminAlertBadge, ImplementationTruthDashboard,
│                          ApprovalAuthorityTable, ApprovalRuleEditor (all real UI)
├── integrations/       ← acknowledgmentAdapter, bicNextMoveAdapter, complexityGatingAdapter,
│                          notificationDispatchAdapter (contract-ready; Teams/email not wired),
│                          versionedRecordAdapter
└── types/              ← IAdminAlert, AlertCategory (6), AlertSeverity (4),
                           IInfrastructureProbeDefinition, IApprovalAuthorityRule, NotificationRoute
```

---

## Dependency and Boundary Doctrine

### What G6 may use

| Package | Purpose |
|---|---|
| `@hbc/features-admin` | Monitors, probes, alerts, approval authority, notification dispatch adapter |
| `@hbc/provisioning` | Provisioning state machine, API client, failure modes, state transitions |
| `@hbc/auth` | Route guards, `PermissionGate`, `RoleGate`, `usePermissionStore` |
| `@hbc/ui-kit` | All shared visual components — no parallel reusable UI in G6 code |
| `@hbc/complexity` | Complexity tier for admin views (already integrated in admin app) |
| `@hbc/notification-intelligence` | Notification routing for alert delivery (if sufficiently mature) |

### What G6 must not do

- Do not build a bespoke notification delivery system. Notification delivery belongs to `@hbc/notification-intelligence` or the Teams/email adapter owned by `@hbc/features-admin`. G6 wires the dispatch; it does not reimplement it.
- Do not add coordinator or requester features to `apps/admin/`. G6 is admin/support/observability only (LD-10).
- Do not create new reusable visual primitives outside `@hbc/ui-kit` (LD-09).
- Do not bypass `@hbc/provisioning` `STATE_TRANSITIONS` for admin override actions (LD-04).
- Do not implement approval decisions in G6. Approval authority rule configuration is in scope; actual approve/reject workflow actions are not (LD-10).

---

## Shared Feature No-Go Summary

| Package | Maturity for G6 | No-Go Gate |
|---|---|---|
| `@hbc/features-admin` monitors | **STUB** — all 6 monitors return empty | T04 alert detection gated until monitors are implemented |
| `@hbc/features-admin` `AdminAlertsApi` | **STUB** — `listActive()` returns `[]` | T01 failures inbox alert badge gated; T04 gated |
| `@hbc/features-admin` probes | **STUB** — all 5 return `healthy` with no real connection | T06 live infrastructure visibility gated |
| `@hbc/features-admin` `ApprovalAuthorityApi` | **STUB** — all methods deferred to SF17-T05 | T02 approval boundary configuration gated |
| Teams/email delivery wiring | **Not wired** | T04 alert delivery gated |
| `ErrorLogPage` | **STUB** | T03 error log feature gated |
| Application Insights SDK | **Not in frontend packages** | T06 browser-side telemetry not available |

**Gate policy:** Tasks with no-go gated components must document the gap explicitly, implement any available structural work, and mark the gated behavior as a clearly labeled stub or TODO with a reference to the gate condition. Do not implement workarounds that bypass the intended package ownership.

---

## Task Sequencing

```
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08
```

**Rationale:**
- T01 establishes the failures inbox as the primary admin action surface. T02 locks the permission and retry boundary that T01 respects. T03 adds queue visibility and operational dashboards on top of T01 and T02. T04 wires alert routing now that monitors and dispatch are understood from T01–T03. T05 embeds guidance and runbook links as a surface layer over T01–T04 functionality. T06 adds observability depth (probe implementation, KQL templates, alert rules) building on T04. T07 formalizes surface boundaries, failure modes, and configuration rules. T08 verifies the full group.

- T01 and T02 can begin in parallel if team capacity allows, but T03 depends on both.
- T04 is the critical path blocker for real alert behavior — T01–T03 may be implemented against stub monitors while T04's monitor implementation work proceeds.

---

## Supporting Artifacts

- `docs/maintenance/provisioning-runbook.md` — Operational procedures (manual retry, escalation, Step 5 manual re-run, alert thresholds)
- `docs/maintenance/provisioning-observability-runbook.md` — KQL queries (full timeline, failed runs, step durations, success rate trend, stuck provisioning alert rule)
- `packages/features/admin/README.md` — Package capability summary

---

## Progress Documentation Requirements

During active G6 work:

- Record gate check outcomes for each T0x as they are resolved in this file under a "Gate Check Record" section
- If any monitor is implemented, record the monitor key and implementation date
- If Teams/email delivery is wired, record the adapter implementation and target configuration
- Track any deferred items that require post-Wave-0 follow-on tasks

---

## Closure Documentation Requirements

Before G6 may be declared complete:

- All T01–T08 task files have Status: Complete
- All T08 acceptance criteria are verified
- All gated components are either implemented or documented as explicit known limitations with follow-on tasks created
- `packages/features/admin/README.md` is updated to reflect the post-G6 implementation state
- `docs/maintenance/` runbooks are updated if T05 or T06 change the operational procedures

---

## Acceptance Gate

G6 is pilot-ready when:

1. Admin users with `admin:access-control:view` can navigate to the provisioning failures view and take retry, escalate, or archive actions on real provisioning failures
2. Business-ops leads see a summary health view (no full alert detail)
3. At least one alert monitor produces real alerts (not stub) for a provisioning failure scenario
4. Alert routing to the correct target (immediate vs. digest) is implemented and documented
5. Infrastructure probe results are visible in the admin UI (stub data is acceptable for Wave 0 if live probe connections are not yet available, with clear labeling)
6. Embedded runbook links and contextual guidance are present in the failures inbox
7. No new reusable visual primitives exist outside `@hbc/ui-kit`
8. TypeScript compilation is clean across `apps/admin/` and `packages/features/admin/`
9. T08 verification checklist items are passed or explicitly deferred with tracking

---

## Known Corrections

*(Record conflicts found during G6 execution here.)*

- **`@hbc/admin` → `@hbc/features-admin`**: Locked G6 decisions reference the package as `@hbc/admin`. The actual package is `@hbc/features-admin` at `packages/features/admin/`. All task plans use the correct name.
