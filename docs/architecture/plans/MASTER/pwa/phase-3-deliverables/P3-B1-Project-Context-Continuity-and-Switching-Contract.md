# P3-B1: Project Context Continuity and Switching Contract

| Field | Value |
|---|---|
| **Doc ID** | P3-B1 |
| **Phase** | Phase 3 |
| **Workstream** | B — Project context continuity and switching |
| **Document Type** | Contract |
| **Owner** | Experience / Shell Team + Project Hub platform owner |
| **Update Authority** | Experience lead; changes require review by Architecture and Platform |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 3 Plan §4.2–§4.3, §14 Workstream B](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [P2-B2](../phase-2-deliverables/P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); [P2-E2](../phase-2-deliverables/P2-E2-Project-Anchor-and-Context-Scope-Policy.md); [PH7.2 Routes & Shell](../../ph7-project-hub/PH7-ProjectHub-2-Routes-Shell.md); `projectStore.ts`; `redirectMemory.ts`; `workspace-routes.ts` |

---

## Contract Statement

This contract establishes the canonical Project Hub route model, project context model, project switching behavior, project-scoped return-memory rules, portfolio-root continuity rules, deep-link and refresh handling, and context mismatch reconciliation for Phase 3 Project Hub.

This is a consolidated contract covering all three Workstream B deliverable concerns: **project context model** (P3-B1), **project switching behavior** (P3-B2), and **context restoration and mismatch reconciliation** (P3-B3).

Phase 3 uses a **hybrid project context model with hard rules** (Phase 3 plan §4.2):

- The **URL/route is canonical** for addressable project identity.
- Shell, store, and session layers may carry **enriched working context** (last valid page, filters, draft state, return-memory).
- Enriched context **cannot silently override** the route-carried project identity.
- On mismatch, the **route/URL wins** unless the user explicitly initiates a project switch.

**Repo-truth audit — 2026-03-24.** The current repo has a Zustand `projectStore` persisting `activeProject` to localStorage, a callback-driven `ProjectPicker` used by route-owned switching, a `BackToProjectHub` component that returns Project Hub users to the canonical `/project-hub` portfolio root, parameterized PWA Project Hub routes, per-project return-memory, and separate portfolio-root continuity state. `redirectMemory` remains scoped only to post-auth redirect restoration. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The route-canonical project identity model and its authority over enriched context
- The project context carrier model (what data travels with project context and where it lives)
- Project switching behavior (smart same-section model)
- Per-project return-memory (storage, TTL, restoration rules)
- Deep-link, refresh, reopen, and handoff launch behavior
- Context mismatch reconciliation rules (route vs store vs session)
- Cross-lane project context consistency requirements

### This contract does NOT govern

- Project registry identity, activation, or site association — see [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md)
- Project membership and module visibility — see [P3-A2](P3-A2-Membership-Role-Authority-Contract.md)
- Canvas-first project home composition — see P3-C deliverables
- Personal Work Hub return-memory and state persistence — see [P2-B2](../phase-2-deliverables/P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)
- Project anchor in personal work context — see [P2-E2](../phase-2-deliverables/P2-E2-Project-Anchor-and-Context-Scope-Policy.md)
- Post-auth redirect memory (login flow) — governed by `redirectMemory.ts` in `@hbc/shell`

---

## Definitions

| Term | Meaning |
|---|---|
| **Route-canonical identity** | The `projectId` carried in the URL/route path that is the authoritative source of which project the user is viewing |
| **Enriched context** | Working state carried in store, session, or cache layers that supplements route-canonical identity (e.g., last page per project, filters, draft state) |
| **Project switching** | The user-initiated action of changing from one project to another within Project Hub |
| **Smart same-section model** | The switching behavior where the system tries to keep the user on the equivalent in-project section in the target project |
| **Per-project return-memory** | A record of the last valid page visited within a specific project, tracked by `projectId` |
| **Context mismatch** | A state where the route-carried `projectId` differs from the store-carried `activeProject` |
| **Handoff launch** | Navigation from an external surface (Personal Work Hub, notification, SPFx companion) into a specific project context |
| **Deep link** | A URL that targets a specific project and optionally a specific page/record within that project |
| **Context restoration** | The process of rebuilding enriched context after a page refresh, tab reopen, or session restore |
| **Portfolio root** | The unscoped, permission-aware `/project-hub` landing surface for oversight and project launch; a meaningful operating surface, not a thin selector |
| **Control Center** | The canonical project-scoped Project Hub route at `/project-hub/{projectId}`; the canvas-first project home for a specific authorized project |
| **Portfolio state restoration** | Restoring prior portfolio-root filters, search, sort, and scroll position when the user returns to `/project-hub` from a project-scoped route |

---

## 1. Current-State Reconciliation

### 1.1 Project context runtime

| Artifact | Location | Status | Key detail |
|---|---|---|---|
| `projectStore` | `packages/shell/src/stores/projectStore.ts` | **Live** | Zustand store; persists `activeProject: IActiveProject \| null` to localStorage (`'hbc-project-store'`); `availableProjects` not persisted |
| `ProjectPicker` | `packages/shell/src/ProjectPicker/index.tsx` | **Live** | Selection surface; callback-driven and consumed by route-owned switching in Project Hub |
| `BackToProjectHub` | `packages/shell/src/BackToProjectHub/index.tsx` | **Live** | Returns project-scoped Project Hub views to the canonical `/project-hub` portfolio root |
| `projectHubPortfolioState` | `packages/shell/src/stores/projectHubPortfolioState.ts` | **Live** | Portfolio-root continuity for filters, search, sort, and scroll; separate from project-scoped return-memory |
| `redirectMemory` | `packages/shell/src/redirectMemory.ts` | **Live** | Post-auth redirect restoration; sessionStorage with 5-minute TTL; NOT per-project return memory |

### 1.2 Routing

| Artifact | Location | Status | Key detail |
|---|---|---|---|
| PWA `project-hub` route | `apps/pwa/src/router/workspace-routes.ts` | **Live** | Unscoped Project Hub portfolio root at `/project-hub` plus canonical project-scoped routes at `/project-hub/{projectId}` and `/project-hub/{projectId}/{section}` |
| PWA `projectHubRouting` seam | `apps/pwa/src/router/projectHubRouting.ts` | **Live** | Route-resolution seam for canonicalization, root-entry branching, same-section switching targets, and invalid-section fallback |
| PWA `provisioning/$projectId` | same file | **Live** | Parameterized non-Project-Hub route; extracts `projectId` from params |
| PH7 route plan | `ph7-project-hub/PH7-ProjectHub-2-Routes-Shell.md` | **Historical input** | Route split and membership-validation intent now materially implemented in the live PWA route layer |
| SPFx routes | `apps/project-hub/src/router/` | **Live** | Simplified shell; no `$projectId` param; no site-URL-to-projectId resolution |

### 1.3 Gaps

| Gap | Classification |
|---|---|
| No `$projectId` in PWA project-hub URL | **Resolved — implemented** |
| No per-project return-memory | **Resolved — implemented** |
| No smart same-section switching | **Resolved — implemented** |
| No context mismatch reconciliation | **Resolved — implemented** |
| No SPFx site-URL-to-projectId resolution | **Controlled evolution** — P3-A1 §4.3 defines the lookup contract |
| `projectStore` uses `IActiveProject` (6 fields) | **Controlled evolution** — P3-A1 §2.3 defines migration to canonical registry record |

---

## 2. Route-Canonical Project Identity

### 2.1 Authority rule

The URL/route is the **canonical authority** for which project the user is viewing. This rule is non-negotiable (Phase 3 plan §4.2).

| Context layer | Authority level | Purpose |
|---|---|---|
| **URL/route** `$projectId` | **Canonical** — always authoritative | Addressable project identity; shareable, bookmarkable, refreshable |
| **Store** (`projectStore.activeProject`) | **Enriched** — convenience cache | Quick access for components; drives UI chrome (project name in header) |
| **Session** (per-project return-memory) | **Enriched** — user preference | Last-page tracking for return-to-project and switching |
| **Draft state** (`@hbc/session-state`) | **Enriched** — work-in-progress | Unsaved edits, queued operations scoped to a project |

### 2.2 Route format

The PWA MUST adopt the `$projectId`-parameterized route pattern defined in PH7.2, with a distinct unscoped root:

```
/project-hub/                      → Portfolio root
/project-hub/$projectId/           → Project Control Center
/project-hub/$projectId/financial   → Financial module
/project-hub/$projectId/schedule    → Schedule module
/project-hub/$projectId/constraints → Constraints module
/project-hub/$projectId/permits     → Permits module
/project-hub/$projectId/safety      → Safety module
/project-hub/$projectId/reports     → Reports module
```

The `$projectId` in all canonical routes MUST be the canonical `projectId` (UUID) from the project registry (P3-A1).

Direct-navigation rules are binding:

1. For users with access to multiple projects, explicit navigation to `/project-hub` MUST land on the portfolio root first.
2. Multi-project explicit navigation to `/project-hub` MUST NOT silently reopen the last active project.
3. For users with access to exactly one project, explicit navigation to `/project-hub` SHOULD immediately canonicalize to `/project-hub/{projectId}` for that sole authorized project.
4. Explicit deep links to `/project-hub/{projectId}` MUST always land directly in that authorized project's Control Center or requested in-project section.
5. `/project-hub` is not a thin selector and not a full cross-project command center. It is a governed portfolio oversight + launch surface.

**Transitional dual-key inbound handling:** Inbound links or launch parameters may use `projectNumber` as the project key (e.g., via legacy deep links, external references, or cross-surface handoffs). The router MUST:

1. Detect when a `projectNumber` is presented in place of a `projectId` (e.g., via `?projectNumber=` query parameter or a non-UUID route segment).
2. Resolve the `projectNumber` to `projectId` via registry lookup (P3-A1 §3.4).
3. Redirect to the canonical `projectId`-based route before rendering.
4. All newly generated links, shared-spine queries, cross-lane handoffs, and internal state MUST use `projectId` after resolution. `projectNumber` is an inbound alias only.

This normalization ensures that all internal project context, store state, and downstream consumers operate on `projectId` exclusively regardless of the inbound key used.

### 2.3 SPFx project identity resolution

In the SPFx lane, project identity is resolved from the SharePoint site context:

1. Read the current site URL from the SPFx page context.
2. Look up the site URL in the project registry's site associations (P3-A1 §4.3).
3. If found, use the associated `projectId` as canonical project identity.
4. Seed the project store only after the canonical `projectId` has been confirmed from the registry record.
5. If not found, display an appropriate error/guidance state in-shell — do NOT fabricate project context.

SPFx initialization order is therefore fixed:

1. Bootstrap auth and host context.
2. Resolve `siteUrl -> registry record -> canonical projectId`.
3. Seed project-scoped shell/store state.
4. Render project content.

The SPFx lane MUST NOT render project-scoped module content ahead of step 2.

---

## 3. Project Context Carrier Model

### 3.1 What travels with project context

| Data | Storage | Scope | Persistence | Cleared when |
|---|---|---|---|---|
| `projectId` (canonical) | URL route param | Per-page | URL state | User navigates away from project |
| `activeProject` record | `projectStore` (Zustand + localStorage) | Global singleton | Across page loads | `clear()` called, or user selects different project |
| Per-project return-memory | Dedicated store (see §4) | Per `projectId` | localStorage with TTL | TTL expires, or user clears history |
| Portfolio-root continuity state | Dedicated store (see §4.6) | Unscoped `/project-hub` root | sessionStorage or localStorage | User clears state, TTL expires, or root state becomes invalid |
| Module-level view state (filters, sort, tab) | URL query params (preferred) or module store | Per-page or per-session | URL state or sessionStorage | Page navigation or session end |
| Draft state (unsaved edits) | `@hbc/session-state` (IndexedDB) | Per `projectId` + record | Across sessions | Draft saved, discarded, or expired |

### 3.2 Store synchronization rule

When a route with `$projectId` loads:

1. Resolve `projectId` from the route parameter.
2. If `projectStore.activeProject.id !== projectId`:
   - Fetch the project record from the registry.
   - Call `setActiveProject(record)` to update the store.
3. If the project is not found in the registry, render the Project Hub in-shell not-available state using `@hbc/smart-empty-state`.
4. If the user is not authorized for that project (per P3-A2), render the Project Hub in-shell no-access state using `@hbc/smart-empty-state`.

The store is **synchronized to the route**, not the other way around. The store MUST NOT drive route navigation silently.

---

## 4. Per-Project Return-Memory

### 4.1 Purpose

Per-project return-memory tracks the last valid page a user visited within each project, enabling:
- return-to-project continuity when the user revisits a specific project-scoped route,
- in-project continuity after refresh, reopen, or other project-scoped restoration flows,
- and smart switching support only where the selected same-section route remains valid.

Per-project return-memory MUST NOT be used to override explicit navigation to the unscoped `/project-hub` portfolio root.

### 4.2 Return-memory record

```
IProjectReturnMemory
├── projectId: string (canonical project identity)
├── lastPath: string (relative path within the project, e.g., '/financial')
├── lastVisitedAt: string (ISO 8601 timestamp)
├── lastQueryParams: Record<string, string> | null (optional — preserved filter/sort state)
└── validUntil: string (ISO 8601 — TTL expiration)
```

### 4.3 Storage rules

| Property | Value |
|---|---|
| **Storage location** | localStorage, keyed per `projectId` |
| **Key format** | `hbc-project-return-${projectId}` |
| **TTL** | 7 days from `lastVisitedAt` |
| **Maximum entries** | 50 most-recently-visited projects; older entries pruned on write |
| **Cleared on** | TTL expiration, explicit clear, or project deactivation/removal from registry |

### 4.4 Write rules

- Return-memory MUST be updated on every successful project-scoped page navigation.
- Return-memory MUST NOT be updated for error pages, access-denied pages, or redirect-in-progress states.
- Return-memory MUST NOT store sensitive data (no record content, no draft data — only the path).

### 4.5 Read rules

- Return-memory is consulted during project switching (§5) and return-to-project navigation.
- If the stored `lastPath` resolves to an unauthorized or invalid page for the target project, fall back to that project's Control Center.
- Expired return-memory (past `validUntil`) MUST be treated as absent.
- Explicit navigation to `/project-hub` MUST bypass project return-memory entirely.

### 4.6 Portfolio-root continuity

The unscoped `/project-hub` route has its own continuity model that is separate from project return-memory.

| State element | Requirement |
|---|---|
| Filters | Restore when the user explicitly returns to `/project-hub` from a project-scoped route |
| Search | Restore prior search text on return to `/project-hub` |
| Sort | Restore prior sort order on return to `/project-hub` |
| Scroll position | Restore prior scroll position on return to `/project-hub` |

Rules:

- Portfolio-root continuity applies only to `/project-hub`.
- Portfolio-root continuity MUST NOT silently navigate the user into a project-scoped route.
- "Back to Portfolio" SHOULD restore prior portfolio-root state whenever that state is still valid.
- If the stored portfolio-root state is invalid or expired, `/project-hub` still renders the portfolio root with default state rather than switching to a project route.

---

## 5. Project Switching Contract

### 5.1 Smart same-section model

When a user switches from Project A to Project B from within a project-scoped route, the system MUST use the following precedence:

| Priority | Behavior | Condition |
|---|---|---|
| 1 | **Same section in target project** | The equivalent in-project section exists and the user has access |
| 2 | **Target project Control Center** | Fallback — always valid for any authorized project member |

### 5.2 Same-page resolution

"Same section" means the same module path segment or in-project surface:
- User is on `/project-hub/{projectA}/financial` → try `/project-hub/{projectB}/financial`
- User is on `/project-hub/{projectA}/safety` → try `/project-hub/{projectB}/safety`

If the target section is **unavailable** (module not enabled for target project), **unauthorized** (user lacks module access per P3-A2), or **invalid** (no such module for the project's lifecycle state), fall back to the target project's Control Center.

### 5.3 Switching execution

1. User selects Project B in the `ProjectPicker` or equivalent UI.
2. Save return-memory for current project (Project A) at the current page.
3. Resolve target page using the precedence in §5.1.
4. Navigate either to the same valid target section in Project B or to `/project-hub/${projectB.projectId}`.
5. Route resolution triggers store synchronization (§3.2).

### 5.4 Switching constraints

- Switching MUST be an **explicit user action** — the system MUST NOT silently switch projects.
- Switching MUST NOT lose unsaved draft state in the current project. If a draft exists, the system SHOULD warn the user before switching.
- Switching MUST NOT require a full page reload — it is a client-side route transition.

### 5.5 Back to Portfolio

"Back to Portfolio" is a first-class Project Hub navigation control for returning from a project-scoped route to the unscoped `/project-hub` root.

Rules:

- The control navigates to `/project-hub`, not to an arbitrary prior project.
- The control SHOULD restore prior portfolio-root continuity state per §4.6.
- The control MUST NOT depend on browser-back behavior to preserve Project Hub continuity.
- Returning to the portfolio root MUST NOT silently reopen the project the user just left.

---

## 6. Deep-Link, Refresh, and Reopen Behavior

### 6.1 Deep-link handling

A deep link is any URL that targets a specific project and optionally a specific page:

```
/project-hub/{projectId}                → Project Control Center
/project-hub/{projectId}/financial      → Financial module
/project-hub/{projectId}/permits?status=active  → Permits with filter
```

Deep links MUST be handled as follows:

1. Extract `projectId` from the route.
2. Validate the project exists in the registry (P3-A1).
3. Validate the user has access (P3-A2).
4. Synchronize the store (§3.2).
5. Render the requested page.
6. Update return-memory for this project.

If the project does not exist, the system MUST render a dedicated Project Hub not-available state in-shell using `@hbc/smart-empty-state`.

If the user lacks access, the system MUST render a dedicated Project Hub no-access state in-shell using `@hbc/smart-empty-state`.

If the module or page segment is invalid but the user is authorized for the project, the system MUST fall back only to that project's Control Center. It MUST NOT redirect to another project, reopen a prior project, or redirect to an unrelated workspace.

### 6.2 Page refresh behavior

On page refresh (F5 / browser reload):

1. The URL is the canonical authority — re-resolve everything from the URL.
2. Re-fetch the project record from the registry.
3. Re-validate membership.
4. Restore page state from URL query parameters for project-scoped routes, or restore portfolio-root continuity state for `/project-hub` when applicable.
5. Draft state is restored from `@hbc/session-state` if available.
6. Return-memory is NOT consulted to override the explicit route — the user is already on the page they requested.

### 6.3 Tab reopen / session restore behavior

When a browser tab is reopened or restored:

1. The URL is canonical — follow the same flow as page refresh (§6.2).
2. `projectStore` may rehydrate from localStorage — this is a convenience cache, not authority.
3. If `projectStore.activeProject.id` does not match the URL `$projectId`, the store is re-synchronized from the URL (§3.2).
4. Reopened `/project-hub` tabs for multi-project users MUST reopen the portfolio root, not the last active project.

### 6.4 Handoff launch behavior

When a user arrives at a Project Hub page from an external surface (Personal Work Hub, notification, SPFx companion):

1. The target URL is canonical — process as a deep link (§6.1).
2. Save return-memory for the previously active project (if any).
3. The handoff source MAY include a `returnTo` query parameter for return navigation.
4. Return navigation from the handoff should use the `returnTo` parameter if present, otherwise fall back to standard return behavior.

Explicit handoffs to `/project-hub/{projectId}` MUST land directly in the authorized target project. They MUST NOT be intercepted by portfolio-root restoration or by prior-project memory.

---

## 7. Context Mismatch Reconciliation

### 7.1 Mismatch definition

A context mismatch occurs when the route-carried `projectId` differs from the store-carried `projectStore.activeProject.id`.

### 7.2 Resolution rule

**The route always wins.** On any mismatch:

1. The route `$projectId` is treated as authoritative.
2. The store is re-synchronized to match the route (§3.2).
3. The user is NOT prompted or warned about the mismatch — it is resolved silently.
4. The previous `activeProject` return-memory is preserved (the user may return to it).

If the explicit route is `/project-hub`, the portfolio root is authoritative for multi-project users. Store-carried project context MUST NOT reopen the last active project over that explicit root route.

### 7.3 Mismatch causes

| Cause | Expected? | Resolution |
|---|---|---|
| User pasted/bookmarked a URL for a different project | Yes | Route wins; store syncs |
| User used browser back/forward to a different project's page | Yes | Route wins; store syncs |
| Deep link from notification or work item | Yes | Route wins; store syncs |
| Stale localStorage from previous session | Yes | Route wins; store syncs |
| Bug or race condition | No | Route wins; store syncs (self-healing) |

### 7.4 Prohibited behaviors

- The system MUST NOT redirect the user based on store-carried project identity when it conflicts with the URL.
- The system MUST NOT show content for `projectStore.activeProject` when the URL specifies a different project.
- The system MUST NOT prompt the user to "confirm" which project they want when the URL is unambiguous.

---

## 8. Cross-Lane Project Context Consistency

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same project identity.** Given a navigation to the same project, both lanes MUST resolve the same `projectId`, `projectNumber`, and `projectName`.
2. **Same membership validation.** Both lanes MUST apply the same access eligibility rules (P3-A2 §6).
3. **Same module availability.** Both lanes MUST show the same set of accessible modules for a given user and project (P3-A2 §4).
4. **Route authority applies per lane.** PWA uses URL route params; SPFx uses site-URL resolution. Both are route-canonical within their lane.
5. **Per-project return-memory is PWA-only in first release.** SPFx does not maintain per-project return-memory due to the site-scoped navigation model. This is a lane-appropriate difference, not an inconsistency.
6. **Handoff between lanes preserves project identity.** A `?projectId=` query parameter or equivalent mechanism MUST be used for cross-lane handoff so project identity is preserved across lane launches.
7. **Portfolio-root semantics are PWA-specific.** Cross-project and multi-project entry lands on the PWA portfolio root at `/project-hub`; SPFx remains project-site scoped and may launch to that root when users need cross-project scope.

---

## 9. Repo-Truth Reconciliation Notes

1. **`projectStore` uses `IActiveProject` — controlled evolution**
   The current store persists `activeProject: IActiveProject | null` with 6 fields. Phase 3 requires migration to the canonical registry record type (P3-A1 §2.1, ~24 fields). The store pattern is **compliant** but the type requires extension. P3-A1 §2.3 defines backward-compatibility requirements.

2. **PWA Project Hub route split is live — compliant**
   Repo truth now separates the meaningful unscoped portfolio root at `/project-hub` from the canonical project-scoped Control Center at `/project-hub/{projectId}`. Multi-project direct entry stays on the portfolio root first, single-project direct entry canonicalizes immediately, and invalid project sections fall back only within the same authorized project. Classified as **compliant**. Canvas-first adoption for the project-scoped Control Center remains governed separately by P3-C1 and P3-C3.

3. **Per-project return-memory and portfolio-root continuity both exist — compliant**
   Repo truth now includes per-project return-memory for project-scoped routes and a separate portfolio-root continuity store for filters, search, sort, and scroll. The `redirectMemory` module remains scoped only to post-auth redirect restoration. Classified as **compliant**.

4. **`BackToProjectHub` now implements canonical Back to Portfolio behavior — compliant**
   Repo truth now uses `BackToProjectHub` as the Project Hub project-scoped return control. In Project Hub context it renders Back to Portfolio and navigates to the canonical unscoped root at `/project-hub` without query-param project selection. This is **compliant** with the locked root-versus-project doctrine and does not change the separate cross-lane handoff requirements in §8.6.

5. **`ProjectPicker` is now route-owned and aligned to the switching doctrine — compliant**
   Repo truth now uses `ProjectPicker` as a callback-driven selection surface while route-aware switching is enforced by the PWA shell and `resolveProjectSwitch()`. Same-section switching with target-project Control Center fallback, first-class Back to Portfolio behavior, and explicit-root protection for `/project-hub` are now live. Classified as **compliant**.

6. **SPFx has no site-URL-to-projectId resolution — controlled evolution**
   The SPFx project hub does not resolve project identity from the SharePoint site URL. P3-A1 §4.3 defines the lookup contract; this contract (§2.3) specifies the resolution flow. Classified as **controlled evolution**.

7. **PH7.2 route membership check pattern — compliant, requires formalization**
   PH7.2 defines a `beforeLoad` membership check using `project.teamMemberUpns.includes(user.upn)`. This is functionally correct and consistent with the access validation step in §6.1. Phase 3 must formalize this using the P3-A2 eligibility rules rather than raw UPN array checks.

8. **`redirectMemory` is a separate concern — compliant**
   The existing `redirectMemory` module handles post-auth redirect restoration and is scoped to the login flow. It is not per-project return-memory. Both mechanisms coexist without conflict: `redirectMemory` handles "where was I going before login?", per-project return-memory handles "where was I in this project last time?". Classified as **compliant — no overlap**.

---

## 10. Acceptance Gate Reference

**Gate:** Cross-lane contract gates — context component (Phase 3 plan §18.1)

| Field | Value |
|---|---|
| **Pass condition** | Route-canonical project identity, explicit portfolio-root vs Control Center semantics, smart same-section switching with Control Center fallback, project-scoped return-memory, portfolio-root state restoration, Back to Portfolio behavior, and in-shell no-access/not-available handling work in both lanes as applicable |
| **Evidence required** | P3-B1 (this document), route-parameterized project URLs, store synchronization implementation, project return-memory implementation, portfolio-root continuity implementation, smart switching tests, Back to Portfolio tests, cross-lane handoff tests, no-access/not-available rendering tests, mismatch reconciliation tests |
| **Primary owner** | Experience / Shell + Project Hub platform owner |

---

## 11. Policy Precedence

This contract establishes the **project context continuity foundation** that downstream Phase 3 deliverables must conform to:

| Deliverable | Relationship to P3-B1 |
|---|---|
| **P3-A1** — Project Registry and Activation Contract | Provides `projectId` and `siteUrl` used for route-canonical identity and SPFx site resolution |
| **P3-A2** — Membership / Role Authority Contract | Provides access eligibility rules applied during context resolution (§3.2, §6.1) |
| **P3-A3** — Shared Spine Publication Contract Set | Must use `projectId` from route-canonical context for all spine queries |
| **P3-C1** — Project Canvas Governance Note | Must operate within the route-canonical project context |
| **P3-G1** — PWA / SPFx Capability Matrix | Must respect cross-lane context consistency rules (§8) |
| **P3-G2** — Cross-Lane Navigation and Handoff Map | Must use the handoff launch pattern defined in §6.4 |
| **P3-H1** — Acceptance Checklist | Must include context continuity gate evidence |
| **Any implementation artifact** | Must treat URL/route as canonical project identity; store as enriched convenience |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-22
**Governing Authority:** [Phase 3 Plan §4.2–§4.3](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
