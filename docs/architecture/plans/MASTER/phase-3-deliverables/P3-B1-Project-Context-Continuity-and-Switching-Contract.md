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

This contract establishes the canonical project context model, project switching behavior, per-project return-memory rules, deep-link and refresh handling, and context mismatch reconciliation for Phase 3 Project Hub.

This is a consolidated contract covering all three Workstream B deliverable concerns: **project context model** (P3-B1), **project switching behavior** (P3-B2), and **context restoration and mismatch reconciliation** (P3-B3).

Phase 3 uses a **hybrid project context model with hard rules** (Phase 3 plan §4.2):

- The **URL/route is canonical** for addressable project identity.
- Shell, store, and session layers may carry **enriched working context** (last valid page, filters, draft state, return-memory).
- Enriched context **cannot silently override** the route-carried project identity.
- On mismatch, the **route/URL wins** unless the user explicitly initiates a project switch.

**Repo-truth audit — 2026-03-20.** The current repo has a Zustand `projectStore` persisting `activeProject` to localStorage, a `ProjectPicker` dropdown for switching, and a `BackToProjectHub` component using `?projectId=` query parameters for cross-surface handoff. The PWA `project-hub` route is non-parameterized (no `$projectId` in URL). PH7.2 plans define a `$projectId/_layout.tsx` route pattern with membership validation. No per-project return-memory exists. The `redirectMemory` module handles only post-auth redirect restoration. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The route-canonical project identity model and its authority over enriched context
- The project context carrier model (what data travels with project context and where it lives)
- Project switching behavior (smart same-page model)
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
| **Smart same-page model** | The switching behavior where the system tries to keep the user on the equivalent page/section in the target project |
| **Per-project return-memory** | A record of the last valid page visited within a specific project, tracked by `projectId` |
| **Context mismatch** | A state where the route-carried `projectId` differs from the store-carried `activeProject` |
| **Handoff launch** | Navigation from an external surface (Personal Work Hub, notification, SPFx companion) into a specific project context |
| **Deep link** | A URL that targets a specific project and optionally a specific page/record within that project |
| **Context restoration** | The process of rebuilding enriched context after a page refresh, tab reopen, or session restore |

---

## 1. Current-State Reconciliation

### 1.1 Project context runtime

| Artifact | Location | Status | Key detail |
|---|---|---|---|
| `projectStore` | `packages/shell/src/stores/projectStore.ts` | **Live** | Zustand store; persists `activeProject: IActiveProject \| null` to localStorage (`'hbc-project-store'`); `availableProjects` not persisted |
| `ProjectPicker` | `packages/shell/src/ProjectPicker/index.tsx` | **Live** | Dropdown component; calls `setActiveProject(project)` on selection; visible when `activeWorkspace === 'project-hub'` |
| `BackToProjectHub` | `packages/shell/src/BackToProjectHub/index.tsx` | **Live** | Constructs `${projectHubUrl}?projectId=${activeProject.id}` for cross-surface handoff |
| `redirectMemory` | `packages/shell/src/redirectMemory.ts` | **Live** | Post-auth redirect restoration; sessionStorage with 5-minute TTL; NOT per-project return memory |

### 1.2 Routing

| Artifact | Location | Status | Key detail |
|---|---|---|---|
| PWA `project-hub` route | `apps/pwa/src/router/workspace-routes.ts` | **Live** | Non-parameterized — no `$projectId` in URL |
| PWA `provisioning/$projectId` | same file | **Live** | First parameterized project route; extracts `projectId` from params |
| PH7 route plan | `ph7-project-hub/PH7-ProjectHub-2-Routes-Shell.md` | **Plan only** | Defines `$projectId/_layout.tsx` with membership check — not yet implemented |
| SPFx routes | `apps/project-hub/src/router/` | **Live** | Simplified shell; no `$projectId` param; no site-URL-to-projectId resolution |

### 1.3 Gaps

| Gap | Classification |
|---|---|
| No `$projectId` in PWA project-hub URL | **Controlled evolution** — PH7 route plan defines the target; implementation is Phase 3 scope |
| No per-project return-memory | **Controlled evolution** — this contract defines the target |
| No smart same-page switching | **Controlled evolution** — this contract defines the target |
| No context mismatch reconciliation | **Controlled evolution** — this contract defines the target |
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

The PWA MUST adopt the `$projectId`-parameterized route pattern defined in PH7.2:

```
/project-hub/$projectId/           → Project home
/project-hub/$projectId/financial   → Financial module
/project-hub/$projectId/schedule    → Schedule module
/project-hub/$projectId/constraints → Constraints module
/project-hub/$projectId/permits     → Permits module
/project-hub/$projectId/safety      → Safety module
/project-hub/$projectId/reports     → Reports module
/project-hub/                       → Project selector (no project context)
```

The `$projectId` MUST be the canonical `projectId` (UUID) from the project registry (P3-A1). The `projectNumber` MAY be accepted as an alias and resolved to `projectId` via registry lookup.

### 2.3 SPFx project identity resolution

In the SPFx lane, project identity is resolved from the SharePoint site context:

1. Read the current site URL from the SPFx page context.
2. Look up the site URL in the project registry's site associations (P3-A1 §4.3).
3. If found, use the associated `projectId` as canonical project identity.
4. If not found, display an appropriate error/guidance state — do NOT fabricate project context.

---

## 3. Project Context Carrier Model

### 3.1 What travels with project context

| Data | Storage | Scope | Persistence | Cleared when |
|---|---|---|---|---|
| `projectId` (canonical) | URL route param | Per-page | URL state | User navigates away from project |
| `activeProject` record | `projectStore` (Zustand + localStorage) | Global singleton | Across page loads | `clear()` called, or user selects different project |
| Per-project return-memory | Dedicated store (see §4) | Per `projectId` | localStorage with TTL | TTL expires, or user clears history |
| Module-level view state (filters, sort, tab) | URL query params (preferred) or module store | Per-page or per-session | URL state or sessionStorage | Page navigation or session end |
| Draft state (unsaved edits) | `@hbc/session-state` (IndexedDB) | Per `projectId` + record | Across sessions | Draft saved, discarded, or expired |

### 3.2 Store synchronization rule

When a route with `$projectId` loads:

1. Resolve `projectId` from the route parameter.
2. If `projectStore.activeProject.id !== projectId`:
   - Fetch the project record from the registry.
   - Call `setActiveProject(record)` to update the store.
3. If the project is not found in the registry, redirect to the project selector.
4. If the user is not a member (per P3-A2), redirect to the project selector or access-denied state.

The store is **synchronized to the route**, not the other way around. The store MUST NOT drive route navigation silently.

---

## 4. Per-Project Return-Memory

### 4.1 Purpose

Per-project return-memory tracks the last valid page a user visited within each project, enabling:
- Smart switching: when switching to a previously visited project, land on the last page instead of the home page.
- Return-to-project: when returning from Personal Work Hub or another workspace, restore project context.

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
- If the stored `lastPath` resolves to an unauthorized or invalid page for the target project, fall back to the project home page.
- Expired return-memory (past `validUntil`) MUST be treated as absent.

---

## 5. Project Switching Contract

### 5.1 Smart same-page model

When a user switches from Project A to Project B, the system MUST use the following precedence:

| Priority | Behavior | Condition |
|---|---|---|
| 1 | **Same page in target project** | The equivalent page exists and the user has access |
| 2 | **Return-memory page** | Return-memory exists for Project B and the stored page is valid/accessible |
| 3 | **Project home** | Fallback — always valid for any project member |

### 5.2 Same-page resolution

"Same page" means the same module path segment:
- User is on `/project-hub/{projectA}/financial` → try `/project-hub/{projectB}/financial`
- User is on `/project-hub/{projectA}/safety` → try `/project-hub/{projectB}/safety`

If the target page is **unavailable** (module not enabled for target project), **unauthorized** (user lacks module access per P3-A2), or **invalid** (no such module for the project's lifecycle state), fall back to Priority 2 or 3.

### 5.3 Switching execution

1. User selects Project B in the `ProjectPicker` or equivalent UI.
2. Save return-memory for current project (Project A) at the current page.
3. Resolve target page using the precedence in §5.1.
4. Navigate to `/project-hub/${projectB.projectId}/${targetPage}`.
5. Route resolution triggers store synchronization (§3.2).

### 5.4 Switching constraints

- Switching MUST be an **explicit user action** — the system MUST NOT silently switch projects.
- Switching MUST NOT lose unsaved draft state in the current project. If a draft exists, the system SHOULD warn the user before switching.
- Switching MUST NOT require a full page reload — it is a client-side route transition.

---

## 6. Deep-Link, Refresh, and Reopen Behavior

### 6.1 Deep-link handling

A deep link is any URL that targets a specific project and optionally a specific page:

```
/project-hub/{projectId}                → Project home
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

If the project does not exist or the user lacks access, redirect to the project selector with appropriate feedback.

### 6.2 Page refresh behavior

On page refresh (F5 / browser reload):

1. The URL is the canonical authority — re-resolve everything from the URL.
2. Re-fetch the project record from the registry.
3. Re-validate membership.
4. Restore the page state from URL query parameters (filters, sort, etc.).
5. Draft state is restored from `@hbc/session-state` if available.
6. Return-memory is NOT consulted — the user is already on the page they want.

### 6.3 Tab reopen / session restore behavior

When a browser tab is reopened or restored:

1. The URL is canonical — follow the same flow as page refresh (§6.2).
2. `projectStore` may rehydrate from localStorage — this is a convenience cache, not authority.
3. If `projectStore.activeProject.id` does not match the URL `$projectId`, the store is re-synchronized from the URL (§3.2).

### 6.4 Handoff launch behavior

When a user arrives at a Project Hub page from an external surface (Personal Work Hub, notification, SPFx companion):

1. The target URL is canonical — process as a deep link (§6.1).
2. Save return-memory for the previously active project (if any).
3. The handoff source MAY include a `returnTo` query parameter for return navigation.
4. Return navigation from the handoff should use the `returnTo` parameter if present, otherwise fall back to standard return behavior.

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
6. **Handoff between lanes preserves project identity.** A `?projectId=` query parameter or equivalent mechanism MUST be used for cross-lane handoff (consistent with existing `BackToProjectHub` pattern).

---

## 9. Repo-Truth Reconciliation Notes

1. **`projectStore` uses `IActiveProject` — controlled evolution**
   The current store persists `activeProject: IActiveProject | null` with 6 fields. Phase 3 requires migration to the canonical registry record type (P3-A1 §2.1, ~24 fields). The store pattern is **compliant** but the type requires extension. P3-A1 §2.3 defines backward-compatibility requirements.

2. **PWA `project-hub` route is non-parameterized — controlled evolution**
   The current PWA route at `'project-hub'` does not include `$projectId`. PH7.2 defines the target route pattern with `$projectId/_layout.tsx`. This contract (§2.2) specifies the target format. Classified as **controlled evolution**.

3. **No per-project return-memory exists — controlled evolution**
   No implementation of per-project return-memory was found in the repo. The `redirectMemory` module handles only post-auth redirect restoration and is scoped to the login flow. This contract (§4) defines the target. Classified as **controlled evolution**.

4. **`BackToProjectHub` uses query parameter handoff — compliant**
   The existing `BackToProjectHub` component constructs `${projectHubUrl}?projectId=${activeProject.id}` for cross-surface navigation. This pattern is **compliant** with the handoff launch behavior defined in §6.4 and the cross-lane handoff requirement in §8.6.

5. **`ProjectPicker` does not implement smart same-page switching — controlled evolution**
   The current `ProjectPicker` calls `setActiveProject(project)` but does not perform same-page resolution or return-memory consultation. The switching contract in §5 defines the target behavior. Classified as **controlled evolution**.

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
| **Pass condition** | Route-canonical project identity, smart switching, per-project return-memory, and handoff landing behavior work in both lanes |
| **Evidence required** | P3-B1 (this document), route-parameterized project URLs, store synchronization implementation, per-project return-memory implementation, smart switching tests, cross-lane handoff tests, mismatch reconciliation tests |
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

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 3 Plan §4.2–§4.3](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
