# Phase 3 Project Hub Canonical PWA Routing — Implementation Report

**Date:** 2026-03-28
**Version:** 0.13.12
**Scope:** Validate and strengthen the canonical PWA Project Hub route family, formalize the section registry for Phase 3 module expansion, extract a reusable project context hook, and expand routing test coverage.

## 1. Repo-Truth Adjustments

The Prompt 01 validation (phase-3-project-hub-routing-repo-truth-validation.md) confirmed that 6 of 9 audit findings were already implemented. This implementation adapted to that reality:

- **Route topology:** Already canonical. Three-level route family (`/project-hub`, `/project-hub/$projectId`, `/project-hub/$projectId/$section`) exists in `workspace-routes.ts` with dedicated loaders, guards, and component wrappers.
- **Portfolio/project surface split:** Already separate. `ProjectHubPortfolioPage`, `ProjectHubControlCenterPage`, `ProjectHubNoAccessPage` are distinct components.
- **Route-canonical project identity:** Already implemented via `resolveProjectRouteContext()` + `reconcileProjectContext()`.
- **Same-section switching:** Already implemented via `resolveProjectSwitch()` + `resolveProjectHubSwitchTarget()`.
- **Context durability:** Already implemented via per-project return memory, portfolio state persistence, and project store with localStorage.

No routing refactor was needed. The implementation focused on formalization, extensibility, and test coverage gaps.

## 2. Changes Made

### Formalized section registry (`apps/pwa/src/router/projectHubRouting.ts`)

Replaced the bare `Set(['health', 'reports', 'financial'])` with a typed `PROJECT_HUB_SECTION_REGISTRY` that maps each section to a slug and label. The `isSupportedProjectHubSection()` function now derives its validation set from the registry. This means Phase 3 module expansion requires only adding an entry to the registry — the route tree, section validation, and switch-target resolution all read from this single source.

### Extracted reusable project context hook (`apps/pwa/src/hooks/useProjectHubContext.ts`)

Created `useProjectHubContext()` to encapsulate the route-loader → project-store reconciliation pattern. All three Project Hub page components now use this hook instead of inline `syncProjectStore()` calls. The hook:
- Synchronizes available projects in the store
- Reconciles route-carried project identity with store state (P3-B1 §7: route always wins)
- Returns a typed `ProjectHubContext` for descendant rendering

### Updated ProjectHubPage to use the hook (`apps/pwa/src/pages/ProjectHubPage.tsx`)

Removed the inline `syncProjectStore` helper and replaced all three call sites with `useProjectHubContext()`. No behavioral change — same reconciliation logic, cleaner composition.

### Expanded routing test coverage (`apps/pwa/src/router/projectHubRouting.test.ts`)

Added 8 new tests (total 18, up from 10):
- Zero-projects root entry → no-access
- Financial section → valid project-scoped route
- Health section → valid project-scoped route
- Section registry contains all expected sections
- `isSupportedProjectHubSection` validates against registry
- `buildProjectHubPath` generates correct paths
- Project not in accessible list → no-access (normalization-level denial)
- Financial section preserved during cross-project switching

## 3. Behavioral Contract (Verified)

| Behavior | Status |
|----------|--------|
| `/project-hub` → portfolio root (multi-project) | Implemented, tested |
| `/project-hub` → auto-redirect (single project) | Implemented, tested |
| `/project-hub` → no-access (zero projects) | Implemented, tested |
| `/project-hub/:projectId` → control center | Implemented, tested |
| `/project-hub/:projectId/:section` → section view | Implemented, tested |
| Invalid project → in-shell no-access | Implemented, tested |
| Unsupported section → redirect to control center | Implemented, tested |
| Same-section project switching | Implemented, tested |
| Portfolio state continuity (search, filter, sort, scroll) | Implemented, tested |
| Route-canonical project identity (store syncs to route) | Implemented, tested |
| Per-project return memory (7-day TTL, LRU-50) | Implemented (shell package) |
| SPFx launch compatibility (deep-link, site-URL resolution) | Implemented (shell package) |

## 4. Known Follow-On Work

- **Module expansion:** Phase 3 modules (schedule, constraints, permits, safety, QC, closeout, startup, subcontract readiness, warranty) need entries added to `PROJECT_HUB_SECTION_REGISTRY` and section rendering branches in `ProjectHubControlCenterPage`.
- **Canvas governance:** P3-C1 mandatory core tile families for the default control center view.
- **Spine wiring:** Health, activity, work queue, related-items spines into control center layout.
- **Launch-to-PWA contracts:** SPFx → PWA handoff URLs for capabilities marked "Launch-to-PWA" in P3-G1.
- **Pre-existing lint errors:** 130 pre-existing lint errors across PWA (none in changed files); cleanup is a separate task.
- **Pre-existing TS errors:** `msal-init.ts` and `ProjectsPage.tsx` have pre-existing type errors unrelated to routing.
