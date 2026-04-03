# Admin SPFx IT Control Center — Phase 5 Page Ownership Map

**Prompt:** P5-02 — Route Taxonomy and Navigation Registry
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Map every current and scaffold page to its lane, route, and ownership status.

---

## 1. Rehomed pages (existing content, new route)

| Page component | Current route | New route | Lane | Ownership | Notes |
|---------------|--------------|-----------|------|-----------|-------|
| `ProvisioningOversightPage` | `/provisioning-failures` | `/runs` | Runs / History | Active — 758 lines, 5 admin actions, 4 tabs, detail modal, complexity gating | Cross-app `?projectId=` deep link preserved via redirect |
| `OperationalDashboardPage` | `/dashboards` | `/health` | Health / Alerts | Active — 295 lines, queue health, alert dashboard, infrastructure probes | Alert badge navigates here |
| `SystemSettingsPage` | `/` | `/config` | Standards / Config | Active — 756 lines, access control + approval authority configuration | No longer index route |
| `ErrorLogPage` | `/error-log` | `/errors` | Error / Audit | Placeholder — 51 lines, `HbcSmartEmptyState` | SF17-T05 deferred; serves as lane anchor |

---

## 2. Scaffold pages (new empty-state pages for Phase 5)

| Page component | Route | Lane | Delivers content in | Empty-state guidance |
|---------------|-------|------|--------------------|--------------------|
| `SetupPlaceholderPage` | `/setup` | Setup / Install | Phase 6 | "Backend install and bootstrap will be available here." |
| `ValidationPlaceholderPage` | `/validation` | Validation | Phase 7+ | "Pre-execution validation checks will be available here." |
| `SharePointPlaceholderPage` | `/sharepoint` | SharePoint Control | Phase 7+ | "SharePoint site and app catalog operations will be available here." |
| `EntraPlaceholderPage` | `/entra` | Entra Control | Phase 9+ | "Entra ID app registration and permission management will be available here." |

Scaffold pages use `HbcSmartEmptyState` from `@hbc/smart-empty-state`, consistent with the existing `ErrorLogPage` pattern.

---

## 3. Legacy redirects

| Old route | Target | Purpose |
|-----------|--------|---------|
| `/provisioning-failures` | `/runs` (preserving `?projectId=`) | Accounting/Estimating deep links |
| `/dashboards` | `/health` | Bookmarks and internal navigation |
| `/error-log` | `/errors` | Bookmarks and internal navigation |

These are redirect-only routes — no page components. They exist for backward compatibility and can be removed once all consumers (cross-app links, bookmarks) have been updated.

---

## 4. Index route

| Route | Behavior | Page component |
|-------|----------|---------------|
| `/` | Redirect to operator landing (target decided in Prompt 03) | None — redirect only |

---

## 5. Page file inventory after Phase 5

| File | Lane | Status |
|------|------|--------|
| `pages/ProvisioningOversightPage.tsx` | Runs / History | Preserved — rehomed to `/runs` |
| `pages/OperationalDashboardPage.tsx` | Health / Alerts | Preserved — rehomed to `/health` |
| `pages/SystemSettingsPage.tsx` | Standards / Config | Preserved — rehomed to `/config` |
| `pages/ErrorLogPage.tsx` | Error / Audit | Preserved — rehomed to `/errors` |
| `pages/SetupPlaceholderPage.tsx` | Setup / Install | New scaffold |
| `pages/ValidationPlaceholderPage.tsx` | Validation | New scaffold |
| `pages/SharePointPlaceholderPage.tsx` | SharePoint Control | New scaffold |
| `pages/EntraPlaceholderPage.tsx` | Entra Control | New scaffold |

---

## Cross-references

- [Route Taxonomy](admin-spfx-phase-5-route-taxonomy.md) — lane model and route registry
- [P5-01 Baseline](admin-spfx-phase-5-operator-console-baseline.md) — current page inventory
- Route registry implementation: `apps/admin/src/router/lane-registry.ts`
