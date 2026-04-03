# Admin SPFx IT Control Center — Phase 5 Route Taxonomy

**Prompt:** P5-02 — Route Taxonomy and Navigation Registry
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Freeze the canonical route/lane taxonomy for the Admin operator console.

---

## 1. Lane model

The Admin operator console organizes all surfaces into 8 workflow lanes. Each lane anchors a top-level route and owns a category of operator activity.

| # | Lane | Route | Label | Status | Content source |
|---|------|-------|-------|--------|---------------|
| 1 | Setup / Install | `/setup` | Setup | Scaffold | Phase 6 — install/bootstrap execution |
| 2 | Validation | `/validation` | Validation | Scaffold | Phase 7+ — validation engine |
| 3 | Runs / History | `/runs` | Runs | Active | Rehomed `ProvisioningOversightPage` |
| 4 | SharePoint Control | `/sharepoint` | SharePoint | Scaffold | Phase 7+ — SharePoint operations |
| 5 | Entra Control | `/entra` | Entra | Scaffold | Phase 9+ — Entra administration |
| 6 | Standards / Config | `/config` | Config | Active | Rehomed `SystemSettingsPage` (access control + approval authority) |
| 7 | Health / Alerts | `/health` | Health | Active | Rehomed `OperationalDashboardPage` |
| 8 | Error / Audit | `/errors` | Errors | Scaffold | Existing `ErrorLogPage` empty state (SF17-T05 deferred) |

### Lane ordering rationale

The lanes are ordered by operator workflow priority:
1. **Setup / Install** — one-time environment bootstrap (entry point for new deployments)
2. **Validation** — pre-execution checks
3. **Runs / History** — primary day-to-day operational surface
4. **SharePoint Control** and **Entra Control** — platform-specific administration
5. **Standards / Config** — governance and configuration (less frequent)
6. **Health / Alerts** — observability (often a secondary check)
7. **Error / Audit** — forensic and compliance (least frequent direct access)

---

## 2. Route registry

### New lane routes

| Route | Lane | Page component | Permission | Search params |
|-------|------|---------------|------------|---------------|
| `/setup` | Setup / Install | `SetupPlaceholderPage` | `admin:access-control:view` | — |
| `/validation` | Validation | `ValidationPlaceholderPage` | `admin:access-control:view` | — |
| `/runs` | Runs / History | `ProvisioningOversightPage` | `admin:access-control:view` | `?projectId=` |
| `/sharepoint` | SharePoint Control | `SharePointPlaceholderPage` | `admin:access-control:view` | — |
| `/entra` | Entra Control | `EntraPlaceholderPage` | `admin:access-control:view` | — |
| `/config` | Standards / Config | `SystemSettingsPage` | `admin:access-control:view` | — |
| `/health` | Health / Alerts | `OperationalDashboardPage` | `admin:access-control:view` | — |
| `/errors` | Error / Audit | `ErrorLogPage` | `admin:access-control:view` | — |

### Index route

The index route (`/`) will redirect to the operator-console landing. The specific target is an implementation decision for Prompt 03 (shell refactor). The route registry defines the index as a redirect, not a content route.

### Legacy redirect routes

These routes preserve backward compatibility for cross-app deep links and bookmarks:

| Old route | Redirects to | Preserves search params | Reason |
|-----------|-------------|------------------------|--------|
| `/provisioning-failures` | `/runs` | Yes (`?projectId=`) | Accounting and Estimating deep links |
| `/dashboards` | `/health` | No | Internal navigation / bookmarks |
| `/error-log` | `/errors` | No | Internal navigation / bookmarks |

**Note:** The old `/` (SystemSettingsPage) does not need a redirect — `/` becomes the index redirect to the operator landing, and SystemSettingsPage moves to `/config`.

---

## 3. Permission model

All non-index routes require `admin:access-control:view` (or `*:*` wildcard). This is unchanged from the current model. The permission guard applies to all 8 lane routes and all legacy redirect routes.

The index route (`/`) intentionally omits the permission guard to prevent an infinite redirect loop — this is the existing pattern and is preserved.

---

## 4. Navigation metadata

Each lane carries navigation metadata for the shell:

| Lane | Nav label | Nav order | Visible | Badge |
|------|-----------|-----------|---------|-------|
| Setup / Install | Setup | 1 | Always | — |
| Validation | Validation | 2 | Always | — |
| Runs / History | Runs | 3 | Always | — |
| SharePoint Control | SharePoint | 4 | Always | — |
| Entra Control | Entra | 5 | Always | — |
| Standards / Config | Config | 6 | Always | — |
| Health / Alerts | Health | 7 | Always | Alert badge (existing `AdminAlertBadge`) |
| Error / Audit | Errors | 8 | Always | — |

All lanes are visible regardless of content status. Scaffold lanes render clear empty states that explain what will be available and which phase delivers it. Hiding empty lanes would make the operator-console structure invisible.

---

## 5. Access control placement decision

**Decision:** Access control administration and approval authority configuration remain under the **Standards / Config** lane (`/config`).

**Rationale:**
- Access control and approval rules are configuration/governance concerns
- They do not warrant a dedicated lane — the end-state plan does not define an "Access Control" lane
- `SystemSettingsPage` already owns both concerns and is rehomed as a unit
- If Standards / Config grows too large in later phases, it can be split into sub-routes (e.g., `/config/access`, `/config/standards`) without changing the lane model

---

## Cross-references

- [P5-01 Operator-Console Baseline](admin-spfx-phase-5-operator-console-baseline.md) — controlling input for this taxonomy
- [End-state plan — Phase 5](../admin-spfx-it-control-center-end-state-plan.md) — 8 workflow lanes
- [Phase 5 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md) — acceptance criteria
- Route registry implementation: `apps/admin/src/router/lane-registry.ts`
