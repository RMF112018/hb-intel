# Admin SPFx IT Control Center — Phase 5 Rehoming Decisions

**Prompt:** P5-05 — Rehome Existing Surfaces and Preserve Behavior
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document placement decisions for rehoming existing admin pages into the operator-console lane model.

---

## 1. Page placement summary

| Page | Old route | New route | Lane | Rationale |
|------|-----------|-----------|------|-----------|
| `ProvisioningOversightPage` | `/provisioning-failures` | `/runs` | Runs / History | Primary run-oriented workflow page; 5 admin actions, 4 tabs, complexity-gated detail modal |
| `OperationalDashboardPage` | `/dashboards` | `/health` | Health / Alerts | Observability surface — queue health, alert dashboard, infrastructure probes |
| `SystemSettingsPage` | `/` | `/config` | Standards / Config | Access control and approval authority are configuration/governance concerns |
| `ErrorLogPage` | `/error-log` | `/errors` | Error / Audit | Deferred placeholder preserved as lane anchor (SF17-T05) |

---

## 2. Access-control administration placement

**Decision:** Access-control administration and approval authority configuration remain together under the **Standards / Config** lane at `/config`.

**Rationale:**
- Access control and approval rules are configuration/governance concerns, not a standalone operator workflow
- `SystemSettingsPage` already owns both and is rehomed as a unit
- The end-state plan does not define a dedicated "Access Control" lane
- If this grows, it can split into sub-routes (e.g., `/config/access`, `/config/standards`) without changing the lane model

---

## 3. Legacy redirect rationale

Three legacy routes are preserved as redirects for backward compatibility:

| Legacy route | Target | Reason |
|-------------|--------|--------|
| `/provisioning-failures` | `/runs` (preserving `?projectId=`) | Accounting and Estimating deep-link to this path via `crossAppUrls.ts`. The redirect preserves search params so `?projectId=` context handoff continues to work. |
| `/dashboards` | `/health` | Internal bookmarks and any saved links |
| `/error-log` | `/errors` | Internal bookmarks and any saved links |

Cross-app callers (`apps/accounting`, `apps/estimating`) continue to link to `/provisioning-failures?projectId=...`. The legacy redirect handles the translation transparently. No changes to those apps are required.

---

## 4. Permission model

The permission model is **unchanged** after rehoming:

- All lane routes (except index) require `admin:access-control:view` or `*:*` wildcard
- The index route (`/`) intentionally omits the permission guard to prevent an infinite redirect loop
- All routes use the shared `adminBeforeLoad()` guard which calls `requireAdminAccessControl()` and sets `admin` as active workspace
- No permissions were broadened or narrowed by the route changes

---

## 5. Stale route references fixed

| File | Old reference | New reference | Impact |
|------|--------------|---------------|--------|
| `ProvisioningOversightPage.tsx:178` | `useSearch({ from: '/provisioning-failures' })` | `useSearch({ from: '/runs' })` | **Critical** — TanStack Router route reference must match actual route path for search param extraction |
| `OperationalDashboardPage.tsx:111` | `href: '/provisioning-failures'` | `href: '/runs'` | Empty-state primary action link |
| `ErrorLogPage.tsx:25` | `href: '/provisioning-failures'` | `href: '/runs'` | Fixed in P5-03 |

---

## 6. Dead code removed

`LanePlaceholderPage.tsx` — generic placeholder page created in P5-03 but replaced by dedicated lane pages (SetupLanePage, ValidationLanePage, SharePointLanePage, EntraLanePage) in P5-04. No remaining imports.

---

## Cross-references

- [Route Taxonomy](admin-spfx-phase-5-route-taxonomy.md) — canonical lane model
- [Page Ownership Map](admin-spfx-phase-5-page-ownership-map.md) — page-to-lane mapping
- [P5-01 Baseline](admin-spfx-phase-5-operator-console-baseline.md) — preservation requirements
