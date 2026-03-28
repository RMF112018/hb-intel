# Phase 3 Project Hub Routing — Repo-Truth Validation Report

**Date:** 2026-03-28
**Scope:** Validate prior audit findings about PWA Project Hub routing against current repo truth before any routing refactor begins.
**Authority:** Runtime code and route registration (Tier 1), current-state-map (Tier 1), Phase 3 master plan (Tier 2).

## 1. Validated Findings Matrix

### Finding 1: "PWA treats Project Hub as a flat workspace page"

**Status: REJECTED**

**Repo evidence:** `apps/pwa/src/router/workspace-routes.ts` lines 180–232 register three distinct routes:
- `project-hub` — portfolio root with search param validation and loader-based entry resolution
- `project-hub/$projectId` — project-scoped control center with access validation
- `project-hub/$projectId/$section` — section detail (health, reports, financial)

Each route has its own `beforeLoad` guard, dedicated `loader` function, and distinct component wrapper. The route tree is a canonical three-level hierarchy, not a flat page.

**Why rejected:** The implementation already matches the target canonical route family structure. This finding was either written before the routing was implemented or describes an earlier state that has since been superseded.

**Delivery significance:** No routing refactor needed for the route topology itself. Prompt 02 should focus on module depth and section expansion, not route restructuring.

---

### Finding 2: "Current route is not yet modeled as /project-hub, /project-hub/{projectId}, /project-hub/{projectId}/{section}"

**Status: REJECTED**

**Repo evidence:** The exact routes exist in `workspace-routes.ts`:
```
projectHubRoute:        path: 'project-hub'
projectHubProjectRoute: path: 'project-hub/$projectId'
projectHubSectionRoute: path: 'project-hub/$projectId/$section'
```

`projectHubRouting.ts` (lines 56, 69–71, 73–76) defines supported sections (`health`, `reports`, `financial`), the `buildProjectHubPath()` helper, and `isSupportedProjectHubSection()` validator. Unsupported sections redirect to the project control center.

**Why rejected:** All three route levels are registered, parameterized, guarded, and loader-resolved. The canonical URL model exists.

**Delivery significance:** None for route structure. Future work is section expansion (adding more supported sections as modules become ready), not route creation.

---

### Finding 3: "ProjectHubPage behaves primarily as a portfolio summary/table page"

**Status: PARTIALLY CONFIRMED**

**Repo evidence:** `apps/pwa/src/pages/ProjectHubPage.tsx` contains three distinct components:
- `ProjectHubPortfolioPage` (lines 99–224) — search, filter, sort, summary cards, data table. This IS a portfolio summary/table.
- `ProjectHubControlCenterPage` (lines 226–448) — project-scoped surface with section routing (`financial` → FinancialControlCenter, `reports` → ReportsBaselineAudit + ReportsSummary, default → ProjectOperatingSurface with card composition and executive review controls).
- `ProjectHubNoAccessPage` (lines 450–482) — smart empty state for access failures.

**What is confirmed:** The portfolio root view (`/project-hub` with 2+ projects) is a summary/table page.

**What is rejected:** The claim that ProjectHubPage _only_ behaves this way. The control center and section views are distinct runtime surfaces with different behavior.

**Delivery significance:** The portfolio view is complete for its current scope. The control center exists but module depth is Phase 3's primary expansion target.

---

### Finding 4: "Project identity is not yet enforced through the route as canonical source of truth"

**Status: REJECTED**

**Repo evidence:**
- `packages/shell/src/contextReconciliation.ts` implements P3-B1 §7: route always wins. When `routeProjectId !== storeProjectId`, the store syncs to the route silently.
- `projectHubRouting.ts` lines 103–154: `resolveProjectHubProjectEntry()` takes the raw `$projectId` route param, normalizes it via `@hbc/data-access`, validates access, and redirects to the canonical ID if needed (slug/number → UUID normalization).
- `ProjectHubPage.tsx` line 66–85: `syncProjectStore()` calls `reconcileProjectContext()` on every render, enforcing route authority.
- `packages/shell/src/projectRouteContext.ts` provides `resolveProjectRouteContext()` which determines redirect requirements and access denial from the route param.

**Why rejected:** Route-canonical project identity is implemented end-to-end: route param → normalization → validation → store reconciliation → render.

**Delivery significance:** None. The contract is implemented and tested.

---

### Finding 5: "Portfolio root behavior and project-scoped behavior are not yet separated"

**Status: REJECTED**

**Repo evidence:**
- Portfolio root: `projectHubRoute` (line 180) → `resolveProjectHubRootEntry()` → `ProjectHubPortfolioPage` component. Manages its own state via `projectHubPortfolioState.ts` (search, filter, sort, scroll). Syncs store with null active project.
- Project-scoped: `projectHubProjectRoute` (line 198) → `resolveProjectHubProjectEntry()` → `ProjectHubControlCenterPage`. Syncs store with the active project. Renders section-specific surfaces.
- No-access: Separate `ProjectHubNoAccessPage` for three failure modes.

These are separate loader functions, separate component functions, separate state management, and separate store synchronization logic.

**Why rejected:** The separation is complete at route, loader, component, and state levels.

**Delivery significance:** None for separation. Module composition within the control center is the expansion target.

---

### Finding 6: "Project context continuity across launches, refreshes, and same-section project switching is not yet fully implemented"

**Status: REJECTED**

**Repo evidence:**
- **Per-project return memory:** `packages/shell/src/stores/projectReturnMemory.ts` — localStorage-backed, 7-day TTL, LRU-pruned (50 max entries). API: `saveReturnMemory()`, `getReturnMemory()`, `clearReturnMemory()`.
- **Smart same-section switching:** `packages/shell/src/projectSwitching.ts` — `resolveProjectSwitch()` implements P3-B1 §5: tries same section in target, falls back to project home if section unavailable.
- **Portfolio state persistence:** `packages/shell/src/stores/projectHubPortfolioState.ts` — persists search, filter, sort, scroll position to localStorage. Restored on return.
- **Project store persistence:** `packages/shell/src/stores/projectStore.ts` — active project persisted to localStorage via zustand middleware.
- **Context reconciliation on refresh:** `contextReconciliation.ts` restores route authority on page load.
- **Root-route project selector:** `root-route.tsx` lines 115–143 — `handleProjectSelect()` uses `resolveProjectHubSwitchTarget()` for smart cross-project navigation.

**Why rejected:** All four continuity dimensions (launch, refresh, project switching, portfolio state) have implementations with persistence, reconciliation, and test coverage.

**Delivery significance:** None for the continuity contract. SPFx per-project return-memory is explicitly deferred to later (P3-B1 §4 notes PWA-only first release).

---

### Finding 7: "Phase 3 planning documents define a stronger canonical routing model than current runtime"

**Status: PARTIALLY CONFIRMED**

**Repo evidence:**
- The Phase 3 master plan (04_Phase-3 lines defining 11 always-on core modules) defines module-level depth far beyond current implementation. Current sections: `health`, `reports`, `financial`. Target: Financial, Schedule, Constraints, Permits, Safety, Reports, QC, Closeout, Startup, Subcontract Readiness, Warranty.
- The routing infrastructure (`$section` route, `isSupportedProjectHubSection()` validator) already supports section expansion by adding strings to the supported set.
- Cross-lane handoff (P3-G2) and canvas governance (P3-C1) define behaviors not yet implemented.

**What is confirmed:** Phase 3 plans define significantly more module depth and cross-lane behavior than what currently exists. The _routing model_ itself is largely implemented, but the _module surfaces_ those routes serve are MVP.

**What is rejected:** The implication that the routing _architecture_ needs redesign. The architecture supports the target; the gap is module content.

**Delivery significance:** HIGH — but the gap is module implementation within the existing route structure, not route refactoring.

---

### Finding 8: "SPFx should remain a companion lane launching deeper flows into PWA"

**Status: CONFIRMED**

**Repo evidence:**
- P3-G1 (Lane Capability Matrix) explicitly defines: "PWA is robust first-class Project Hub product; SPFx is broad operational project-site companion."
- The matrix identifies specific "Launch-to-PWA" capabilities: Buyout Savings multi-step, PER annotation, file ingestion, scenario branching, advanced config.
- `packages/shell/src/spfxProjectContext.ts` resolves site-URL → projectId for SPFx lane.
- Current SPFx apps use the shell web part → IIFE bundle model (confirmed by the estimating fix in prior prompt).

**Why confirmed:** The dual-lane model is locked in governance, and the PWA route structure is the canonical routing authority. SPFx resolves project context from site URL but does not define its own route hierarchy.

**Delivery significance:** SPFx work should consume shared module surfaces from `@hbc/features-project-hub` without duplicating PWA routing logic.

---

### Finding 9: "Codebase contains enough primitives to support routing refactor without new architecture"

**Status: CONFIRMED**

**Repo evidence (primitives inventory):**

| Primitive | Package | Status |
|-----------|---------|--------|
| Route-canonical project identity | `@hbc/shell` (projectRouteContext) | Implemented, tested |
| Project store with persistence | `@hbc/shell` (projectStore) | Implemented |
| Context reconciliation (route wins) | `@hbc/shell` (contextReconciliation) | Implemented, tested |
| Smart same-section switching | `@hbc/shell` (projectSwitching) | Implemented, tested |
| Per-project return memory (LRU) | `@hbc/shell` (projectReturnMemory) | Implemented, tested |
| Portfolio state persistence | `@hbc/shell` (projectHubPortfolioState) | Implemented |
| Deep-link parameter parsing | `@hbc/shell` (deepLinkHandler) | Implemented, tested |
| Nav store with route sync (D-04) | `@hbc/shell` (navStore) | Implemented, tested |
| Shell core orchestration | `@hbc/shell` (ShellCore) | Implemented |
| Session state / offline queue | `@hbc/session-state` | Implemented |
| Auth guards (beforeLoad) | `apps/pwa` (route-guards) | Implemented |
| Project canvas governance | `@hbc/project-canvas` | v0.0.1, mature |
| Health spine foundation | `@hbc/features-project-hub` | v0.1.90, active |
| Smart empty state | `@hbc/smart-empty-state` | Implemented |

**Why confirmed:** The routing, context, switching, reconciliation, persistence, and shell primitives are all implemented and tested. No new architectural invention is needed.

**Delivery significance:** Phase 3 implementation can proceed by composing existing primitives, expanding the supported section set, and building module surfaces.

---

## 2. Current Route Topology

### Registered Routes (Project Hub family)

```
/project-hub                        → ProjectHubPortfolioPage (2+ projects)
                                    → redirect to /project-hub/{id} (1 project)
                                    → ProjectHubNoAccessPage (0 projects)

/project-hub/$projectId             → ProjectHubControlCenterPage (default section)
                                    → ProjectHubNoAccessPage (invalid/unauthorized)
                                    → redirect to canonical ID (slug/number normalization)

/project-hub/$projectId/$section    → ProjectHubControlCenterPage (section-specific)
                                    → redirect to /project-hub/$projectId (unsupported section)
```

### Supported Sections

Currently: `health`, `reports`, `financial` (defined in `projectHubRouting.ts` line 56).

### Default Redirects

| Condition | Behavior |
|-----------|----------|
| Single project at `/project-hub` | Redirect to `/project-hub/{projectId}` |
| Non-canonical project ID | Redirect to canonical UUID route |
| Unsupported section | Redirect to project control center |
| Unauthenticated | Redirect to `/` |

### Shell Active Workspace Identification

`activateWorkspace('project-hub')` is called in `beforeLoad` for all three Project Hub routes. The nav store tracks `activeWorkspace` and syncs it from the router pathname via `startNavSync()` (D-04 pattern). The `ProjectPicker` component in the header only renders when `activeWorkspace === 'project-hub'` and `availableProjects.length > 1`.

---

## 3. Current Project Context Model

### Route Params

- `$projectId` — extracted by TanStack Router from URL, passed to loader functions
- `$section` — optional section param, validated against supported set
- Search params: `action`, `view`, `reviewArtifactId`, `returnTo`, `source` (validated by `validateProjectHubSearch()`)

### Store State

- `useProjectStore.activeProject` — persisted to localStorage (`hbc-project-store`)
- `useProjectStore.availableProjects` — populated by loader, not persisted
- `useNavStore.activeWorkspace` — set to `'project-hub'` by route beforeLoad

### Session / Local Persistence

| Key | Contents | TTL |
|-----|----------|-----|
| `hbc-project-store` | Active project object | Indefinite |
| `hbc-project-return-{projectId}` | Last path + query params per project | 7 days |
| `hbc-project-return-index` | LRU index of return memory entries | Indefinite (pruned to 50) |
| `hbc-project-hub-portfolio-state` | Search, filter, sort, scroll position | Indefinite |

### Deep-Link Behavior

`parseDeepLinkParams()` in `packages/shell/src/deepLinkHandler.ts` extracts `projectId`, `module`, `action`, `view`, `reviewArtifactId`, `returnTo`, `source` from URL. `buildTargetPathFromDeepLink()` constructs the module path.

### Conflict Resolution: Who Wins?

**Route always wins.** `reconcileProjectContext()` (P3-B1 §7) compares `routeProjectId` against `storeProjectId`. On mismatch, the store syncs silently to the route. No redirect based on store-carried identity. No user prompt. The previous project ID is preserved for return-memory capture.

---

## 4. Gap Analysis Against Target Canonical Routing

### Portfolio Root Behavior

| Aspect | Current | Target | Gap |
|--------|---------|--------|-----|
| Multi-project portfolio table | Implemented | Same | None |
| Single-project auto-redirect | Implemented | Same | None |
| Zero-project empty state | Implemented | Same | None |
| Search/filter/sort persistence | Implemented | Same | None |
| Scroll restoration | Implemented | Same | None |

### Project-Scoped Control Center

| Aspect | Current | Target | Gap |
|--------|---------|--------|-----|
| Route-canonical project identity | Implemented | Same | None |
| Default section (operating surface) | Implemented | Canvas-first with mandatory core tiles | **Module depth** |
| Financial section | Implemented (FinancialControlCenter) | Full depth per P3-E4 | **Module expansion** |
| Reports section | Implemented (baseline audit + summary) | Full governed reporting per P3-E9 | **Module expansion** |
| Health section | Implemented (route exists) | Full health spine per P3-D2 | **Module expansion** |
| Schedule section | Not implemented | Full depth per P3-E5 | **New section** |
| Constraints section | Not implemented | Full depth per P3-E6 | **New section** |
| Permits section | Not implemented | Full depth per P3-E7 | **New section** |
| Safety section | Not implemented | Full depth per P3-E8 | **New section** |
| QC section | Not implemented | Baseline-visible per P3-E15 | **New section** |
| Closeout section | Not implemented | Full depth per P3-E10 | **New section** |
| Startup section | Not implemented | Full depth per P3-E11 | **New section** |
| Subcontract Readiness section | Not implemented | Full depth per P3-E13 | **New section** |
| Warranty section | Not implemented | Layer 1 per P3-E14 | **New section** |

### Same-Section Project Switching

| Aspect | Current | Target | Gap |
|--------|---------|--------|-----|
| Smart same-section resolution | Implemented | Same | None |
| Return memory per project | Implemented | Same | None |
| Section accessibility check | Implemented | Same | None |
| Project-home fallback | Implemented | Same | None |

### Durable Launch/Relaunch

| Aspect | Current | Target | Gap |
|--------|---------|--------|-----|
| Project store persistence | Implemented | Same | None |
| Return memory (7-day TTL) | Implemented | Same | None |
| Context reconciliation on refresh | Implemented | Same | None |
| Redirect memory capture (pre-auth) | Implemented | Same | None |

### SPFx Launch Compatibility

| Aspect | Current | Target | Gap |
|--------|---------|--------|-----|
| SPFx site-URL → projectId resolution | Implemented (`spfxProjectContext.ts`) | Same | None |
| Launch-to-PWA for complex flows | Not yet implemented | P3-G1 defines specific capabilities | **Handoff contracts** |
| Shared module surfaces | `@hbc/features-project-hub` exists | Both lanes consume | **Module depth** |

### Invalid/Unauthorized Project Handling

| Aspect | Current | Target | Gap |
|--------|---------|--------|-----|
| Zero projects | Smart empty state | Same | None |
| Project not found | Smart empty state | Same | None |
| Project unavailable | Smart empty state | Same | None |
| Slug/number normalization redirect | Implemented | Same | None |

---

## 5. Implementation Prerequisites

The routing refactor described in the original audit is **not needed**. The route topology, context model, switching behavior, and persistence primitives are all implemented.

What Phase 3 Prompt 02 actually needs before proceeding with **module expansion**:

### Already Satisfied

- Route helpers: `buildProjectHubPath()`, `isSupportedProjectHubSection()`, `resolveProjectHubSwitchTarget()`
- Layout boundaries: `ProjectHubPortfolioPage`, `ProjectHubControlCenterPage`, `ProjectHubNoAccessPage`
- Project resolver: `resolveProjectRouteContext()`, `resolveProjectHubProjectEntry()`
- Shell contracts: `reconcileProjectContext()`, `resolveProjectSwitch()`, nav store sync
- Continuity storage: `projectReturnMemory`, `projectHubPortfolioState`, project store persistence
- Test fixtures: `projectHubRouting.test.ts` (10 tests), `ProjectHubPage.test.tsx` (4 tests), shell test suite (28 files)

### Needed for Module Expansion

1. **Expand supported sections set** — add section strings to `SUPPORTED_PROJECT_HUB_SECTIONS` in `projectHubRouting.ts`
2. **Module surface components** — build or bind `@hbc/features-project-hub` module surfaces into control center section rendering
3. **Canvas governance** — implement P3-C1 mandatory core tile family for default control center view
4. **Spine publication** — wire health, activity, work queue, related-items spines into control center layout
5. **Launch-to-PWA contracts** — define SPFx → PWA handoff URLs for capabilities marked "Launch-to-PWA" in P3-G1

---

## 6. File-by-File Implementation Map

### Files That Need NO Changes for Route Structure

| File | Reason |
|------|--------|
| `apps/pwa/src/router/workspace-routes.ts` | Route topology complete |
| `apps/pwa/src/router/route-guards.ts` | Guards sufficient |
| `apps/pwa/src/router/root-route.tsx` | Shell integration complete |
| `apps/pwa/src/router/index.ts` | Router factory unchanged |
| `packages/shell/src/stores/projectStore.ts` | Store contract complete |
| `packages/shell/src/stores/projectReturnMemory.ts` | Return memory complete |
| `packages/shell/src/stores/projectHubPortfolioState.ts` | Portfolio state complete |
| `packages/shell/src/contextReconciliation.ts` | Reconciliation complete |
| `packages/shell/src/projectSwitching.ts` | Switching complete |
| `packages/shell/src/projectRouteContext.ts` | Route context complete |
| `packages/shell/src/deepLinkHandler.ts` | Deep-link parsing complete |

### Files That Will Need MODIFICATION for Module Expansion

| File | Change |
|------|--------|
| `apps/pwa/src/router/projectHubRouting.ts` | Add new section strings to `SUPPORTED_PROJECT_HUB_SECTIONS` |
| `apps/pwa/src/pages/ProjectHubPage.tsx` | Add section rendering branches in `ProjectHubControlCenterPage` for new modules |
| `apps/pwa/src/router/workspace-config.ts` | Add sidebar items for new Project Hub sections |
| `packages/shell/src/module-configs/nav-config.ts` | Add nav items for new module sections |

### Files That Will Need CREATION for Module Depth

| File (approximate path) | Purpose |
|--------------------------|---------|
| `apps/pwa/src/pages/project-hub/ScheduleSection.tsx` | Schedule module surface |
| `apps/pwa/src/pages/project-hub/ConstraintsSection.tsx` | Constraints module surface |
| `apps/pwa/src/pages/project-hub/PermitsSection.tsx` | Permits module surface |
| `apps/pwa/src/pages/project-hub/SafetySection.tsx` | Safety module surface |
| `apps/pwa/src/pages/project-hub/CloseoutSection.tsx` | Closeout module surface |
| `apps/pwa/src/pages/project-hub/StartupSection.tsx` | Startup module surface |
| `apps/pwa/src/pages/project-hub/SubcontractReadinessSection.tsx` | Subcontract readiness surface |
| `apps/pwa/src/pages/project-hub/WarrantySection.tsx` | Warranty module surface |
| `apps/pwa/src/pages/project-hub/QCSection.tsx` | QC module surface |

These section components will primarily compose surfaces exported from `@hbc/features-project-hub`.

### Files That Can Be LEFT UNTOUCHED

All shell primitives, session-state, auth, data-access, and routing infrastructure files.

### Files That Should Be RETIRED

None identified. No dead code or superseded implementations found in the routing layer.

---

## 7. Delivery Risks and Conflict Points

### Risk 1: Audit Misalignment (HIGH — now mitigated)

The original audit findings are largely incorrect about current repo truth. If Prompt 02 proceeds based on the audit without this validation, it would waste effort re-implementing existing infrastructure. This report mitigates the risk.

### Risk 2: Section Expansion Coordination (MEDIUM)

Adding 8+ new sections requires coordination between:
- `projectHubRouting.ts` (section validation)
- `ProjectHubControlCenterPage` (section rendering)
- `@hbc/features-project-hub` (module surface exports)
- `workspace-config.ts` / `nav-config.ts` (sidebar/nav items)

A single missed addition creates a redirect loop (unsupported section → control center → user clicks section → unsupported section).

### Risk 3: Control Center Complexity Growth (MEDIUM)

`ProjectHubControlCenterPage` is currently 222 lines with 3 section branches. Adding 8+ sections will require either a section registry pattern or a large switch/map. Recommend extracting a section resolver.

### Risk 4: SPFx Handoff Ambiguity (LOW)

P3-G1 identifies specific "Launch-to-PWA" capabilities but no handoff URL contract exists yet. This doesn't block PWA work but will need definition before SPFx companion depth.

### Risk 5: Test Coverage for New Sections (LOW)

Existing test patterns in `projectHubRouting.test.ts` and `ProjectHubPage.test.tsx` provide clear templates. Each new section should follow the same patterns.

### Risk 6: Canvas Governance (MEDIUM)

P3-C1 defines mandatory core tile families for the project home view. The current default control center renders `ProjectOperatingSurface` with card composition. Canvas governance needs to be layered onto this surface before module expansion fills all sections.

---

## 8. Recommended Go/No-Go Decision

**GO — Prompt 02 can proceed immediately.**

No blockers exist. The routing infrastructure is implemented, tested, and aligned with the Phase 3 target model. The original audit findings are superseded by current repo truth.

**Prompt 02 should be reframed:** Instead of a "routing refactor," it should focus on:
1. Module section expansion (adding supported sections and their surface components)
2. Canvas governance (mandatory core tile families on the default control center view)
3. Spine wiring (health, activity, work queue, related-items into the control center layout)
4. Launch-to-PWA handoff contracts (for SPFx companion depth)

The route topology, project context model, switching behavior, and persistence primitives are production-ready and should not be redesigned.
