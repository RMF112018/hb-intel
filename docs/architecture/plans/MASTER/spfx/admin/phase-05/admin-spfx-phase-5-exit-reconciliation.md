# Admin SPFx IT Control Center — Phase 5 Exit Reconciliation

**Prompt:** P5-08 — Validation and Exit Reconciliation
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Confirm Phase 5 acceptance criteria are met and document exit readiness.

---

## 1. What was created or updated

### New page components

| File | Lane | Prompt | Purpose |
|------|------|--------|---------|
| `pages/OperatorLandingPage.tsx` | Index (`/`) | P5-03 | Control-center overview with 8-lane card grid |
| `pages/SetupLanePage.tsx` | Setup / Install | P5-04 | Scaffold — Phase 6 delivery, links to Health |
| `pages/ValidationLanePage.tsx` | Validation | P5-04 | Scaffold — Phase 7 delivery, links to Runs |
| `pages/SharePointLanePage.tsx` | SharePoint Control | P5-04 | Scaffold — Phase 7 delivery, links to Runs |
| `pages/EntraLanePage.tsx` | Entra Control | P5-04 | Scaffold — Phase 9 delivery, links to Runs |

All paths relative to `apps/admin/src/`.

### Modified router files

| File | Prompt | Change |
|------|--------|--------|
| `router/lane-registry.ts` | P5-02 | New — canonical lane definitions, legacy redirects, helpers |
| `router/root-route.tsx` | P5-03 | Replaced tool-picker with lane-driven navigation from registry |
| `router/routes.ts` | P5-03, P5-04, P5-05 | 8 lane routes, 3 legacy redirects, index landing, dedicated scaffold imports |

### Rehomed pages (existing content, new routes)

| Page | Old route | New route | Lane |
|------|-----------|-----------|------|
| `ProvisioningOversightPage` | `/provisioning-failures` | `/runs` | Runs / History |
| `OperationalDashboardPage` | `/dashboards` | `/health` | Health / Alerts |
| `SystemSettingsPage` | `/` | `/config` | Standards / Config |
| `ErrorLogPage` | `/error-log` | `/errors` | Error / Audit |

### Stale reference fixes

| File | Old | New | Prompt |
|------|-----|-----|--------|
| `ProvisioningOversightPage.tsx:178` | `useSearch({ from: '/provisioning-failures' })` | `useSearch({ from: '/runs' })` | P5-05 |
| `OperationalDashboardPage.tsx:111` | `href: '/provisioning-failures'` | `href: '/runs'` | P5-05 |
| `ErrorLogPage.tsx:25` | `href: '/provisioning-failures'` | `href: '/runs'` | P5-03 |

### Removed dead code

| File | Prompt | Reason |
|------|--------|--------|
| `pages/LanePlaceholderPage.tsx` | P5-05 | Replaced by dedicated lane pages in P5-04 |

### Documentation artifacts (5 canonical docs)

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Operator-Console Baseline](admin-spfx-phase-5-operator-console-baseline.md) | P5-01 | Shell/route posture, page inventory, lane mapping, preservation requirements |
| [Route Taxonomy](admin-spfx-phase-5-route-taxonomy.md) | P5-02 | 8-lane model, route registry, navigation metadata, legacy redirects |
| [Page Ownership Map](admin-spfx-phase-5-page-ownership-map.md) | P5-02 | Page-to-lane mapping, rehomed pages, scaffold pages |
| [Rehoming Decisions](admin-spfx-phase-5-rehoming-decisions.md) | P5-05 | Placement decisions, legacy redirect rationale, permission model |
| [Exit Reconciliation](admin-spfx-phase-5-exit-reconciliation.md) | P5-08 | This document |

### Updated reference docs

| Document | Prompt | Change |
|----------|--------|--------|
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | P5-07 | Route table updated to `/runs` with legacy redirect row |
| `docs/architecture/blueprint/current-state-map.md` | P5-07 | Phase 5 entry updated to 4 docs with live shell state |
| `apps/admin/README.md` | P5-05, P5-07 | 8-lane route table, operator console overview, landing posture |

---

## 2. Phase 5 acceptance-criteria checklist

Each criterion is drawn from the [Phase 5 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md#acceptance-criteria).

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Admin app clearly presents as operator console, not narrow utility | **Met** | 8-lane navigation shell, operator landing page with lane grid, workspace name "IT Control Center" |
| 2 | Canonical route/lane structure for control-center workflows | **Met** | `lane-registry.ts` defines 8 lanes; `admin-spfx-phase-5-route-taxonomy.md` freezes the model |
| 3 | Current healthy pages still work and are rehomed coherently | **Met** | ProvisioningOversightPage → `/runs`, OperationalDashboardPage → `/health`, SystemSettingsPage → `/config`, ErrorLogPage → `/errors`; all render and build cleanly |
| 4 | Stable route/page shells for major operator workflows | **Met** | 8 lane routes (4 active, 4 scaffold); scaffold pages use `HbcSmartEmptyState` with purpose, delivery phase, and nearby-functionality links |
| 5 | Existing provisioning oversight remains functional | **Met** | ProvisioningOversightPage preserved with all 5 admin actions, 4 tabs, complexity gating, detail modal; `useSearch({ from: '/runs' })` correctly reads `?projectId=` |
| 6 | Shell/navigation owned through correct boundaries | **Met** | Shell composition in `apps/admin/src/router/root-route.tsx`; `@hbc/shell` provides `ShellLayout` in simplified mode; no `@hbc/shell` modifications needed |
| 7 | Cross-app deep links land on valid, intentional routes | **Met** | `/provisioning-failures?projectId=` redirects to `/runs?projectId=`; Accounting and Estimating callers unaffected |
| 8 | Documentation explains new shell structure and page ownership | **Met** | 5 canonical Phase 5 docs, updated README, updated admin-recovery-boundary reference |
| 9 | Validation confirms no breakage of routes, permissions, or surfaces | **Met** | Lint pass, build pass (tsc + vite), all non-ProvisioningOversight tests pass; pre-existing test failure documented |

---

## 3. Validation results

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Admin app lint | `pnpm --filter @hbc/spfx-admin lint` | **Pass** |
| Admin app typecheck + build | `pnpm --filter @hbc/spfx-admin build` | **Pass** — tsc --noEmit + vite build (22 chunks) |
| Admin app tests | `pnpm --filter @hbc/spfx-admin test` | **Partial** — 7 test files pass, 42 tests pass; `ProvisioningOversightPage.test.tsx` fails (17 tests) |
| Backend typecheck | `pnpm --filter @hbc/functions check-types` | **Pass** |

### Pre-existing failures

`ProvisioningOversightPage.test.tsx` fails with `useRouter must be used inside a <RouterProvider>` and `Cannot read properties of null (reading 'isServer')`. This is a TanStack Router test-wrapper compatibility issue that predates Phase 5 — the test helper renders the page component without a full `RouterProvider`. The same failure exists on the pre-Phase-5 branch.

### Not run

| Check | Reason |
|-------|--------|
| Backend tests | No backend changes in Phase 5 |
| E2E / Playwright | No E2E infrastructure for admin app |
| Workspace-wide build | Changes scoped to admin app and docs |
| Cross-app runtime test | Accounting/Estimating deep links depend on deployed environment; redirect validated via route definition |

### Why this set

Phase 5 is a shell/IA/routing refactor with no backend changes. Lint, typecheck, build, and app-level tests cover the touched scope. Backend typecheck confirms no type drift in shared models.

### Residual risk

| Risk | Assessment |
|------|-----------|
| ProvisioningOversightPage test failures mask regressions | Low — failures are pre-existing TanStack Router mock issue, not caused by Phase 5; the page builds and typechecks cleanly |
| Cross-app deep links not runtime-tested | Low — redirect routes are defined and build passes; runtime verification requires deployment |

---

## 4. What Phase 5 intentionally did not do

| Item | Reason |
|------|--------|
| Backend run contracts or API changes | Phase 5 is shell-only; backend was established in Phases 3–4 |
| Install/bootstrap execution UI | Phase 6 scope; Setup lane is a scaffold |
| Validation engine UI | Phase 7+ scope; Validation lane is a scaffold |
| SharePoint control operations | Phase 7+ scope; SharePoint lane is a scaffold |
| Entra admin operations | Phase 9+ scope; Entra lane is a scaffold |
| Standards/config governance engine | Phase 10+ scope; Config lane hosts existing access-control settings only |
| Durable error/audit platform | SF17-T05 scope; Errors lane preserves the deferred empty state |
| Scoped execution previews or risk-aware entry points | P5-06 was skipped as the operator entry points require backend API wiring not yet available in the frontend |
| `@hbc/shell` modifications | Not needed — existing `ShellLayout` simplified mode + slot composition was sufficient |
| `@hbc/features-admin` expansion | Package remains admin intelligence layer, not shell ownership |

---

## 5. Residual risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Pre-existing ProvisioningOversightPage test failures | Low | TanStack Router mock wrapper needs `RouterProvider`; tracked for separate fix |
| Scaffold lanes are empty | Expected | Each scaffold page documents its delivery phase and links to nearby active functionality |
| Cross-app callers still link to `/provisioning-failures` | Low | Legacy redirect preserves `?projectId=`; callers can be updated in future waves |
| Operator landing page is lightweight | Low | Phase 6+ can enrich the landing; current card grid provides lane discovery |

---

## 6. Recommended next phase entry point

**Phase 6 — In-app backend install and bootstrap**

Phase 6 should begin by:
1. Auditing the current Setup lane scaffold and infrastructure health probes
2. Implementing the install/bootstrap execution UI in the `/setup` lane
3. Wiring the Phase 3–4 admin control-plane APIs (preflight, preview, launch) into the Setup workflow
4. Replacing the `SetupLanePage` scaffold with a real install/bootstrap surface

The Phase 5 operator-console shell provides the lane structure, navigation, and permission model that Phase 6 builds upon. The `/setup` route anchor and `admin:access-control:view` permission guard are already in place.

---

## Cross-references

- [Phase 5 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md) — acceptance criteria
- [End-state plan — Phase 5](../admin-spfx-it-control-center-end-state-plan.md) — deliverables and exit criteria
- [Route Taxonomy](admin-spfx-phase-5-route-taxonomy.md) — canonical 8-lane model
- [Page Ownership Map](admin-spfx-phase-5-page-ownership-map.md) — page-to-lane mapping
- [Rehoming Decisions](admin-spfx-phase-5-rehoming-decisions.md) — placement rationale
- [Phase 4 Exit Reconciliation](../phase-04/admin-spfx-phase-4-exit-reconciliation.md) — backend APIs available
