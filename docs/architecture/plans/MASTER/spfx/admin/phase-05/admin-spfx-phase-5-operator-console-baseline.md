# Admin SPFx IT Control Center — Phase 5 Operator-Console Baseline

**Prompt:** P5-01 — Phase 5 Repo Truth and Operator-Console Baseline
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Establish the implementation-ready baseline for the Phase 5 operator-console transformation, grounded in current repo truth.

---

## 1. Purpose

This document captures what the Admin SPFx app is today, where it falls short of the intended operator-console model, what Phase 5 must change, and what Phase 5 must preserve. It serves as the canonical factual baseline for Prompts 02–08.

All claims are derived from live code inspection as of 2026-04-03. Where earlier review artifacts (Phase 5 exception-path audit, recovery boundary report) contain findings that are still current, those are incorporated. Where they conflict with live code, live code wins.

---

## 2. Current Admin shell and route posture

### Shell

The Admin app uses `ShellLayout` from `@hbc/shell` in **simplified mode** (`apps/admin/src/router/root-route.tsx`).

Configuration:
```typescript
const ADMIN_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Admin',
  showBackToProjectHub: false,
  toolPickerItems: [
    { label: 'System Settings', path: '/' },
    { label: 'Dashboards', path: '/dashboards' },
    { label: 'Error Log', path: '/error-log' },
    { label: 'Provisioning Oversight', path: '/provisioning-failures' },
  ],
};
```

The shell renders a flat `<nav>` with 4 `<button>` elements using `useNavigate()` for client-side routing. An `AdminAlertBadge` is appended to the nav footer, navigating to `/dashboards` on click.

This is a **tool-picker navigation model**, not an operator-console navigation model. The 4 items are flat, unstructured, and do not map to the 8 operator workflow lanes defined in the end-state plan.

### Root layout

The root component (`RootComponent` in `root-route.tsx`) also starts two polling services on mount:
- `useAlertPolling()` — alert monitor execution at 30-second intervals
- `useProbePolling()` — infrastructure probe execution at 15-minute intervals

These are healthy root-level concerns and should be preserved.

### Routes

All routes are defined in `apps/admin/src/router/routes.ts`:

| Route | Page component | Permission guard | Notes |
|-------|---------------|-----------------|-------|
| `/` | `SystemSettingsPage` | None (prevents redirect loop) | Index route; sets workspace to `admin` |
| `/error-log` | `ErrorLogPage` | `admin:access-control:view` | Deferred placeholder |
| `/provisioning-failures` | `ProvisioningOversightPage` | `admin:access-control:view` | Accepts `?projectId=` via `validateSearch` |
| `/dashboards` | `OperationalDashboardPage` | `admin:access-control:view` | Observability and queue health |

All non-index routes redirect to `/` on permission failure. All routes set `admin` as active workspace via `useNavStore`.

### Router

TanStack Router with `createRootRoute` / `createRoute`. Lazy route components via `lazyRouteComponent`. Router factory in `apps/admin/src/router/index.ts`.

### Provider stack

`App.tsx` wraps the router in: `HbcThemeProvider` → `HbcToastProvider` → `QueryClientProvider` → `HbcErrorBoundary` → `ComplexityProvider` → `RouterProvider`. Accepts optional `spfxContext` for SharePoint integration.

---

## 3. Current page inventory and what each page actually owns

### SystemSettingsPage (`/`)

**File:** `apps/admin/src/pages/SystemSettingsPage.tsx` (756 lines)

**Owns:**
- Access control administration via `AdminAccessControlPage` component
- Approval authority configuration (Wave 0, non-persisted) via `ApprovalAuthorityTable` and `ApprovalRuleEditor`
- Approval management gated by `ADMIN_APPROVAL_MANAGE` permission

**Layout:** `WorkspacePageShell` with "Administration" title.

**Assessment:** This page is configuration/governance-focused. In the operator-console model, it maps to the **Standards / Config** lane, not a general landing page. It currently serves as the index route only because there was no better default — not because it is the intended operator-console entry point.

### ProvisioningOversightPage (`/provisioning-failures`)

**File:** `apps/admin/src/pages/ProvisioningOversightPage.tsx` (758 lines)

**Owns:**
- Provisioning run monitoring with 4 tabs: Active Runs, Failures, Completed, All
- Data table with columns: Project #, Project Name, Status, Failure Class, Current Step, Triggered By, Started, Actions
- Detail modal with complexity-tiered sections:
  - Essential: summary + status badges
  - Standard: step log
  - Expert: error details, metadata, Entra groups, identifiers, manual state override
- 5 admin recovery actions:
  - Force Retry (`ADMIN_PROVISIONING_RETRY`)
  - Archive Failure (`ADMIN_PROVISIONING_ARCHIVE`)
  - Acknowledge Escalation (`ADMIN_PROVISIONING_ESCALATE`)
  - Manual State Override (`ADMIN_PROVISIONING_FORCE_STATE` + expert tier)
  - View Full Diagnostics (expert tier, display only)
- Cross-app inbound context: accepts `?projectId=` from Accounting/Estimating deep links
- Retry ceiling enforcement with runbook guidance
- Session guard and load-error handling

**Assessment:** This is the strongest current run-oriented workflow page and the most production-ready surface. It maps to the **Runs / History** lane. It must be preserved and rehomed, not rebuilt.

### OperationalDashboardPage (`/dashboards`)

**File:** `apps/admin/src/pages/OperationalDashboardPage.tsx` (295 lines)

**Owns:**
- Queue health summary: active count, needs attention, completed in 7 days, overall health status
- Queue overview by state: state counts grid across all provisioning states
- Alert Dashboard (gated by `ADMIN_PROVISIONING_ALERT_FULL_DETAIL`, standard+ tier)
- Infrastructure Health / Implementation Truth Dashboard (expert tier)

**Assessment:** Observability and queue-oriented. Maps to the **Health / Alerts** lane. Healthy and should be preserved.

### ErrorLogPage (`/error-log`)

**File:** `apps/admin/src/pages/ErrorLogPage.tsx` (51 lines)

**Owns:** Nothing operational — renders `HbcSmartEmptyState` with guidance pointing to Provisioning Oversight. Deferred to SF17-T05.

**Assessment:** Placeholder. Maps to the **Error / Audit** lane. Phase 5 should keep this as a lane anchor but does not need to implement the error/audit platform (later-phase work).

---

## 4. What Phase 5 must preserve

### Functional surfaces
- **ProvisioningOversightPage** — all 5 admin actions, 4 tabs, detail modal, complexity gating, cross-app deep-link behavior
- **OperationalDashboardPage** — queue health, alert dashboard, infrastructure probes
- **SystemSettingsPage** — access control administration, approval authority configuration
- **ErrorLogPage** — smart empty state (as lane placeholder)

### Route contracts
- `/provisioning-failures?projectId=` must continue to work — Accounting and Estimating deep-link to this route
- Permission guard (`admin:access-control:view`) on non-index routes

### Shell services
- Alert polling and probe polling on root mount
- Alert badge in navigation

### Package boundaries
- `@hbc/features-admin` remains admin intelligence (monitors, probes, APIs, hooks, components) — not shell ownership
- `@hbc/shell` remains canonical shell owner
- Privileged execution remains in `backend/functions`

### Cross-app links
- `getAdminAppUrl()` in `apps/*/src/utils/crossAppUrls.ts` resolves the admin base URL
- Accounting's "Send to Admin" opens `/provisioning-failures?projectId=...` in a new tab
- Estimating's "Open Admin Recovery" was fixed in the Phase 5 exception-path work to use `/provisioning-failures` (previously broken link to `/provisioning-oversight`)

---

## 5. What Phase 5 must change

### Shell model
- **Replace** the simplified tool-picker navigation with a structured operator-console navigation model
- The current 4-button flat nav must become a lane-organized navigation that reflects operator workflow categories
- `ShellLayout` may need a new mode or configuration shape from `@hbc/shell`, or the admin app may compose its own navigation shell using existing `@hbc/shell` primitives

### Route taxonomy
- **Expand** the route set to provide lane anchors for all 8 operator workflow categories
- **Organize** routes into a taxonomy that maps to the lane model
- Routes for lanes not yet implemented should render clear placeholder/empty-state pages

### Index route
- **Change** the default landing from System Settings to an operator-console–appropriate entry point
- The operator should land on a surface that provides operational awareness, not configuration

### Page rehoming
- **Move** existing pages into their appropriate lanes without breaking functionality
- ProvisioningOversightPage → Runs / History lane
- OperationalDashboardPage → Health / Alerts lane
- SystemSettingsPage → Standards / Config lane (or split if needed)
- ErrorLogPage → Error / Audit lane

### Navigation structure
- **Provide** lane-level navigation that makes the 8 workflow categories discoverable
- **Preserve** alert badge integration in the new navigation

---

## 6. Canonical operator-console lane set for this phase

The end-state plan defines 8 operator workflow lanes. Phase 5 establishes the lane structure and populates only what current repo truth supports:

| Lane | Route anchor | Phase 5 content | Status |
|------|-------------|-----------------|--------|
| **Setup / Install** | `/setup` | Placeholder — Phase 6 implements install/bootstrap | Empty state |
| **Validation** | `/validation` | Placeholder — Phase 7+ implements validation engine | Empty state |
| **Runs / History** | `/runs` | Rehomed `ProvisioningOversightPage` (primary content) | Active |
| **SharePoint Control** | `/sharepoint` | Placeholder — Phase 7+ implements SharePoint ops | Empty state |
| **Entra Control** | `/entra` | Placeholder — Phase 9+ implements Entra admin | Empty state |
| **Standards / Config** | `/config` | Rehomed `SystemSettingsPage` content | Active |
| **Health / Alerts** | `/health` | Rehomed `OperationalDashboardPage` (primary content) | Active |
| **Error / Audit** | `/errors` | Existing `ErrorLogPage` empty state (SF17-T05 deferred) | Placeholder |

### Route migration paths

Existing routes must redirect to their new homes to preserve deep links:

| Old route | New route | Reason |
|-----------|-----------|--------|
| `/provisioning-failures` | `/runs` (with `?projectId=` preserved) | Cross-app deep links from Accounting and Estimating |
| `/dashboards` | `/health` | Internal navigation |
| `/error-log` | `/errors` | Internal navigation |
| `/` (System Settings) | `/config` | No longer index; index becomes operator landing |

### Index route decision

The index `/` should resolve to the operator-console landing experience. Options for Prompt 03 to decide:
- **Option A:** Redirect to `/health` (operational awareness first)
- **Option B:** Redirect to `/runs` (run-oriented first)
- **Option C:** Light operator summary page that links to active lanes

This is an implementation decision for Prompt 03, not a baseline determination.

---

## 7. Known current gaps / mismatches

| # | Gap | Impact | Resolution scope |
|---|-----|--------|-----------------|
| 1 | Shell is a flat tool-picker, not a lane-organized operator console | Primary Phase 5 objective | Prompt 03 |
| 2 | No route structure for 8 workflow lanes — only 4 routes exist | Phase 5 must scaffold all 8 | Prompts 02–04 |
| 3 | Index route is SystemSettings (configuration), not operational awareness | Operator lands on configuration instead of operational context | Prompt 03 |
| 4 | No admin run launch/management UI | Backend admin API exists (Phase 3–4) but no frontend surfaces consume it | Later Prompt 06 (entry points) or later phase |
| 5 | No preflight/preview UI | Backend preflight and preview APIs exist but are not wired | Phase 5 entry points (Prompt 06) or later |
| 6 | ErrorLogPage is a deferred placeholder | Error/audit lane has no functional content | SF17-T05 / later phase — Phase 5 preserves as lane anchor |
| 7 | `ProvisioningOversightPage` uses `useSearch()` for `projectId` (fixed in Phase 5 exception-path work) | Cross-app deep links now work correctly | Already resolved |
| 8 | Admin API retrieval endpoints (Phase 4) not yet consumed by frontend | Run audit history and evidence manifests exist backend-only | Phase 5 entry points or later |
| 9 | No operator command palette or action discovery | The 13 admin API endpoints have no frontend catalog | Later phase — Phase 5 may add basic action entry if scoped |
| 10 | `ApprovalAuthorityApi` rules are not persisted (Wave 0 in-memory only) | Configuration appears lost on reload | SF17-T05 target; not Phase 5 scope |

---

## 8. Explicit non-goals for this phase

These are **out of scope** for Phase 5 per the Summary Plan:

1. **Backend contract changes** — Phase 5 does not create, modify, or extend backend APIs or admin control-plane services
2. **Install / bootstrap execution UI** — Phase 6 scope; Phase 5 provides only the lane anchor
3. **Validation engine UI** — Phase 7+ scope; Phase 5 provides only the lane anchor
4. **SharePoint control operations** — Phase 7+ scope
5. **Entra control operations** — Phase 9+ scope
6. **Standards / config governance engine** — Phase 10+ scope; Phase 5 rehomes existing settings page
7. **Durable error/audit platform** — SF17-T05 / Phase 13; Phase 5 preserves the placeholder
8. **New `@hbc/features-admin` intelligence features** — Phase 5 does not expand the admin intelligence layer
9. **Orchestration or durable-state changes** — Phase 4 established the spine; Phase 5 consumes, not modifies
10. **Moving privileged execution into SPFx** — locked architectural invariant

---

## 9. Implementation implications for Prompts 02–08

### Prompt 02 — Route taxonomy and navigation registry
- Define the full route taxonomy for 8 lanes
- Create a canonical route registry (likely `apps/admin/src/router/lane-registry.ts` or similar)
- Map each lane to its route path, label, icon, active status, and permission requirements
- Define redirect mappings for old routes → new routes

### Prompt 03 — Shell refactor and primary navigation
- Replace `SimplifiedShellConfig` tool-picker with lane-organized navigation
- Decide the index route landing behavior
- Determine whether to extend `@hbc/shell` or compose navigation from existing primitives
- Preserve alert badge in the new navigation structure
- Preserve alert and probe polling on root mount

### Prompt 04 — Workflow lane page scaffolds
- Create empty-state page shells for unimplemented lanes (Setup, Validation, SharePoint, Entra)
- Use `HbcSmartEmptyState` pattern consistent with existing `ErrorLogPage`
- Each scaffold should clearly state what the lane will contain and which phase delivers it

### Prompt 05 — Rehome existing surfaces
- Move `ProvisioningOversightPage` to Runs / History lane (`/runs`)
- Move `OperationalDashboardPage` to Health / Alerts lane (`/health`)
- Move `SystemSettingsPage` to Standards / Config lane (`/config`)
- Move `ErrorLogPage` to Error / Audit lane (`/errors`)
- Add redirect routes from old paths to new paths
- Verify `?projectId=` cross-app deep links work through redirects
- Verify permission gating preserved on all routes

### Prompt 06 — Operator entry points and context handoff
- Add basic operator entry points that leverage existing admin API capabilities
- Wire Phase 4 retrieval APIs into accessible surfaces where scoped
- Ensure cross-app context handoff continues through route changes

### Prompt 07 — Docs alignment
- Update `apps/admin/README.md` with new route table and lane model
- Update `current-state-map.md` with Phase 5 artifacts
- Update any affected reference docs

### Prompt 08 — Validation and exit reconciliation
- Run full verification suite
- Create exit reconciliation confirming acceptance criteria

---

## Minimum factual findings (confirmed against live code 2026-04-03)

1. **The current admin shell is a simplified tool-picker shell.** Confirmed — `root-route.tsx` uses `ShellLayout` in `mode="simplified"` with 4 `toolPickerItems`.
2. **The current route set is limited to 4 pages.** Confirmed — `routes.ts` exports `[indexRoute, errorLogRoute, provisioningRoute, dashboardRoute]`.
3. **`ProvisioningOversightPage` is the strongest current run-oriented workflow page.** Confirmed — 758 lines, 5 admin actions, 4 tabs, detail modal, complexity gating.
4. **`OperationalDashboardPage` is observability/queue-oriented, not a full operator-console landing shell.** Confirmed — 295 lines, queue health + alerts + probes.
5. **`SystemSettingsPage` is dominated by access-control / approval authority configuration.** Confirmed — 756 lines, primarily `AdminAccessControlPage` and `ApprovalAuthorityTable`.
6. **`ErrorLogPage` is deferred and placeholder-based.** Confirmed — 51 lines, `HbcSmartEmptyState` only.
7. **`@hbc/features-admin` is an admin-intelligence package, not the shell owner.** Confirmed — `packages/features/admin/README.md` explicitly states boundary.
8. **`@hbc/shell` is the canonical shell-ownership package.** Confirmed — `packages/shell/README.md` explicitly states shell composition authority.

---

## Cross-references

- [End-state plan — Phase 5](../admin-spfx-it-control-center-end-state-plan.md) — 8 workflow lanes, deliverables, exit criteria
- [Target architecture](../admin-spfx-target-architecture.md) — 4-layer model with SPFx as operator console
- [Phase 5 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md) — objectives, acceptance criteria, non-goals
- [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md) — capability-to-layer ownership
- [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) — 10 locked decisions
- [Phase 4 exit reconciliation](../phase-04/admin-spfx-phase-4-exit-reconciliation.md) — backend APIs available for Phase 5
- [Exception-path audit](../../../reviews/phase-5-admin-exception-path-audit.md) — cross-app routing findings
- [Recovery boundary report](../../../reviews/phase-5-admin-recovery-boundary-and-authorization-report.md) — action classification
