# W0-G6-T03 — Operational Dashboards, Queue Visibility, and Bottleneck Rules

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`
> **Related:** `docs/architecture/plans/MVP/G6/W0-G6-T01-Admin-Failures-Inbox-and-Action-Boundaries.md`; `docs/architecture/plans/MVP/G6/W0-G6-T02-Audience-Permissions-and-Bounded-Retry-Rules.md`; `docs/maintenance/provisioning-runbook.md`

**Status:** Proposed
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-01, LD-02, LD-03, LD-08, LD-09

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/provisioning` | `packages/provisioning/` | Queue visibility — `listRequests` filtered by state, `ProjectSetupRequestState` type | **READY.** `listRequests` is implemented. `ProjectSetupRequestState` covers all 8 provisioning states. |
| `@hbc/features-admin` | `packages/features/admin/` | `ImplementationTruthDashboard`, `AdminAlertDashboard`, `useInfrastructureProbes`, `useAdminAlerts`, `AdminAlertBadge` | **PARTIAL.** UI components are real. `useAdminAlerts` and `useInfrastructureProbes` hooks call stub APIs. Dashboards will display empty/stub data. T03 may proceed with this limitation, clearly labeled. |
| `@hbc/auth` | `packages/auth/` | Permission-gated dashboard sections (LD-03, LD-08) | **READY.** Permission gates from T02 apply here. |
| `@hbc/ui-kit` | `packages/ui-kit/` | All visual components | **READY.** |

### Gate Outcome

T03 may proceed. The two key dashboards (`AdminAlertDashboard` and `ImplementationTruthDashboard`) are already built in `@hbc/features-admin`. T03 wires them into the admin app surface and adds the queue visibility view. All probe and alert data will be stub/empty until T04 and T06 implement monitor and probe backends.

---

## Objective

Deliver the operational visibility surfaces that allow admins to understand the current state of the provisioning queue at a glance. After this task:

1. The provisioning queue is visible in the admin surface with a breakdown by state
2. `AdminAlertDashboard` is wired into the admin surface and accessible to technical admins
3. `ImplementationTruthDashboard` (infrastructure probe results) is accessible to technical admins
4. Business-ops leads see a summary health view (healthy/degraded/failed counts) — not full alert or probe detail (LD-08)
5. Bottleneck rules are defined: which queue states constitute a bottleneck, and what threshold triggers visibility in the dashboard

This task does not implement alert detection or probe live connections. It wires the existing dashboard components and adds queue state visibility.

---

## Scope

- Add a "Queue Overview" section to the admin surface showing request counts grouped by `ProjectSetupRequestState` (Submitted, UnderReview, NeedsClarification, AwaitingExternalSetup, ReadyToProvision, Provisioning, Completed, Failed)
- Define bottleneck thresholds: requests in `Provisioning` state for >30 minutes, or counts in `Failed` above a threshold, trigger a visual bottleneck indicator (derived from runbook alert thresholds)
- Wire `AdminAlertDashboard` from `@hbc/features-admin` into the admin surface, gated to technical admins (`PermissionGate`)
- Wire `ImplementationTruthDashboard` from `@hbc/features-admin` into the admin surface, gated to technical admins
- Wire `AdminAlertBadge` into the app shell / navigation so alert count is visible from all admin routes
- Implement business-ops summary view: aggregated health counts (how many requests in healthy/active states vs. degraded/stuck/failed states), without individual alert records or probe details (LD-08)
- Implement a "Run probes now" trigger in `ImplementationTruthDashboard` — already has an `onRunProbes` prop; wire the button to `useInfrastructureProbes().refresh()`

---

## Exclusions / Non-Goals

- Do not implement live probe connections or real monitor data. That belongs to T04 (monitors) and T06 (probes).
- Do not implement historical trend charts. Wave 0 is current-state visibility only (LD-01).
- Do not implement bulk queue actions (bulk retry, bulk archive). Individual actions from T01 are sufficient for Wave 0.
- Do not implement coordinator or requester views in the admin surface (LD-10).

---

## Governing Constraints

- Queue visibility data must come from `@hbc/provisioning` `listRequests` — no bespoke admin-side data aggregation (LD-02)
- Dashboard components must come from `@hbc/features-admin` — do not re-implement in `apps/admin/` (LD-02)
- Business-ops summary view must not expose individual alert records or probe detail (LD-08)
- Permission gating uses `@hbc/auth` guard components (LD-03)
- No new reusable visual primitives outside `@hbc/ui-kit` (LD-09)

---

## Bottleneck Rules

These rules govern when the queue overview triggers a visual indicator. Derived from `docs/maintenance/provisioning-runbook.md`.

| Condition | Threshold | Indicator |
|---|---|---|
| Requests stuck in `Provisioning` | > 30 minutes (no state change) | Warning indicator on queue overview |
| Requests in `Failed` state | Count ≥ 1 | Alert count badge; warning band |
| Requests in `NeedsClarification` | Count ≥ 1 with age > 48 hours | Aging indicator |
| Requests in `AwaitingExternalSetup` | Count ≥ 1 with age > 5 business days | Aging indicator |
| Azure Function timer failure | Cannot be detected from queue state alone | Defer to T06 (probe-based detection) |

**Wave 0 limitation:** Stuck provisioning detection (>30 minutes) requires either a timestamp comparison against `lastStateChangedAt` or a backend-pushed alert. If `lastStateChangedAt` is not available on `IProjectSetupRequest`, derive from available fields or document as a known gap.

---

## Business-Ops Summary View Specification

Business-ops leads see an aggregated health summary (LD-08):

| Metric | Definition |
|---|---|
| Active requests | Count of requests in (Submitted, UnderReview, ReadyToProvision, Provisioning) |
| Needs attention | Count of requests in (NeedsClarification, AwaitingExternalSetup, Failed) |
| Completed (last 7 days) | Count of requests in Completed state with completion date in last 7 days |
| Overall health | Derived: all systems go if `Failed` = 0 and no stuck alerts; degraded otherwise |

No individual request names, no alert detail, no probe data visible to business-ops leads.

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/provisioning` | Required | `listRequests`, `ProjectSetupRequestState` |
| `@hbc/features-admin` | Required | `AdminAlertDashboard`, `ImplementationTruthDashboard`, `AdminAlertBadge`, `useInfrastructureProbes`, `useAdminAlerts` |
| `@hbc/auth` | Required | Permission gating for dashboard sections |
| `@hbc/ui-kit` | Required | Queue overview visual composition |
| `apps/admin` | Target app | Dashboard wiring lives here |

---

## Acceptance Criteria

1. **Queue overview visible:** Technical admins and business-ops leads can see provisioning request counts grouped by state in the admin surface.

2. **Bottleneck indicators present:** Visual indicators appear for `Failed` requests ≥ 1 and for requests with aging states (per bottleneck rules table above).

3. **Alert dashboard wired:** `AdminAlertDashboard` is present in the admin surface, gated to technical admins. It displays empty state when `AdminAlertsApi` is stub.

4. **Infrastructure truth wired:** `ImplementationTruthDashboard` is present, gated to technical admins. "Run probes now" trigger is wired to `useInfrastructureProbes().refresh()`. Probe data is clearly labeled as stub until T06 implements live connections.

5. **Alert badge in navigation:** `AdminAlertBadge` appears in the admin app navigation and is visible from all admin routes.

6. **Business-ops summary view:** Business-ops leads see only the summary health view (aggregated counts). No individual alert records, probe detail, or request names are visible to business-ops leads in this view.

7. **No new reusable primitives:** No new visual components created outside `@hbc/ui-kit` or `@hbc/features-admin`.

---

## Validation / Readiness Criteria

Before T03 is ready for review:

- TypeScript compilation clean in `apps/admin/`
- Unit tests cover: bottleneck threshold logic, business-ops summary view data derivation, permission gate behavior for dashboard sections
- Manual walkthrough: technical admin sees full dashboards; business-ops lead sees only summary view
- Manual walkthrough: queue overview shows correct state counts for a set of mock provisioning records

---

## Known Risks / Pitfalls

**`lastStateChangedAt` availability.** Stuck provisioning detection requires knowing when a request last changed state. If this field is absent from `IProjectSetupRequest`, the 30-minute bottleneck indicator cannot be client-side derived. Verify during T03 implementation.

**Probe staleness indicator.** `ImplementationTruthDashboard` has a staleness check using `PROBE_STALENESS_MS`. Confirm the value of this constant is appropriate for the Wave 0 polling interval (`PROBE_SCHEDULER_DEFAULT_MS = 900_000` = 15 minutes).

**Empty state quality.** When all APIs return stub data, the dashboards will show empty states. Ensure empty states in `AdminAlertDashboard` and `ImplementationTruthDashboard` are informative, not blank or confusing.

---

## Progress Documentation Requirements

During active T03 work:

- Record whether `lastStateChangedAt` exists on `IProjectSetupRequest` or needs to be derived/added
- Record any changes made to bottleneck thresholds after product owner confirmation
- Note if business-ops summary view definition changes based on stakeholder feedback

---

## Closure Documentation Requirements

Before T03 can be closed:

- Bottleneck rules table updated with any confirmed threshold changes
- Business-ops summary view specification confirmed as implemented
- All acceptance criteria verified and checked off
- TypeScript compilation clean
- Known limitations (stub APIs, no live probe data) documented with clear in-UI labeling
