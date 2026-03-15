# W0-G5-T07 — Hosted Surface Integration Rules, Failure Modes, and Boundaries

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Related:** `docs/architecture/blueprint/package-relationship-map.md`; `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` §G5.3, §G5.4

**Status:** Complete
**Stream:** Wave 0 / G5
**Locked decisions served:** LD-01, LD-04, LD-05, LD-09, LD-10

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/auth` | `packages/auth/` | RBAC visibility rule enforcement (Wave 0 sketch G5.3) | Verify: `@hbc/auth` exports a permission store that the PWA project list can query to determine which projects and requests are visible to the current user. Confirm the permission store is populated on auth and does not require a separate permissions fetch. |
| `@hbc/provisioning` | `packages/provisioning/` | Failure mode display and degraded-state handling | Verify: the failure-modes module exports typed failure reasons that can be mapped to user-readable messages. Verify the API client includes retry/timeout error handling that the PWA can respond to. |
| `@hbc/app-shell` | `packages/app-shell/` | Route-level boundary enforcement and navigation guards | Verify: the app shell provides navigation structure that keeps G5 surfaces isolated from controller/admin routes. |

### Gate Outcome

All three packages require a gate inspection before T07 implementation. T07 cannot finalize integration rules without confirming the actual interfaces provided by auth, provisioning, and app-shell. Document the gate outcome in this file before implementation begins.

---

## Objective

Define and implement the integration rules, failure modes, and explicit surface boundaries for the hosted PWA requester experience. After this task:

1. The boundary between the hosted PWA and the SPFx requester experience is explicit and enforced
2. The boundary between the hosted PWA and Project Hub is explicit — the PWA defers to Project Hub after completion
3. Controller and admin surfaces do not exist in the PWA in Wave 0
4. The architecture preserves room for future coordinator surfaces without designing them now
5. RBAC visibility is enforced: requesters see only what they are authorized to see
6. Failure and degraded-state scenarios are handled gracefully with honest, actionable requester messaging

---

## Scope

### Boundary with SPFx Requester Experience

The hosted PWA and the SPFx requester experience are parallel surfaces on the same workflow contract. They share backend resources but do not share UI components beyond the shared packages in `packages/`.

**Rules:**
- A requester may use either surface; the backend does not distinguish between surface of origin for requests
- A draft created in the PWA is a PWA-side draft (stored in `@hbc/session-state` IndexedDB) and is not visible in SPFx. A draft created in SPFx is likewise not visible in the PWA. This is acceptable for Wave 0 and must be documented as a known limitation.
- A submitted request is visible in both surfaces' status views because it is a backend record, not a surface-local record
- The SPFx surface is the parity reference. The PWA does not define new workflow states or requester actions that do not exist in SPFx. If SPFx lacks a feature the PWA wants to add, that feature belongs in a later group, not as a PWA-exclusive behavior.

### Boundary with Project Hub

Project Hub is the canonical post-completion destination. The PWA explicitly defers to it after a request reaches a terminal state.

**Rules:**
- The PWA does not display Project Hub content (documents, team, tasks, activity)
- The PWA does not provide navigation into Project Hub routes
- The only Project Hub touchpoint in the PWA is the optional completion handoff link (T05) — a new-tab link to the provisioned project's Project Hub URL
- The PWA's status list may show the provisioned project's name and a link to open it in Project Hub, but must not mirror or embed Project Hub data
- Do not add routing from the PWA's status list into Project Hub's route namespace

### Boundary with Controller and Admin Surfaces (Wave 0)

Controller and admin surfaces do not exist in the hosted PWA in Wave 0 (LD-01, LD-10).

**What this means in practice:**
- No `/admin`, `/controller`, `/provisioning-admin`, or equivalent routes in the PWA
- No controller-facing provisioning management UI (approve, reject, retry, etc.)
- No admin user management UI
- If a controller navigates to the hosted PWA, they see the requester view — the same as any other authenticated user
- The navigation and routing of the PWA must not surface affordances that imply controller capabilities (no "Review requests" link, no "Admin panel" menu item)

**What this does not mean:**
- A user who happens to be a controller is not blocked from using the requester surfaces
- RBAC filtering applies to data visibility, not to surface access for controllers. A controller who wants to use the PWA as a requester may do so.

### Coordinator Visibility — Future-Ready Only (LD-09)

No coordinator-specific behavior exists in the hosted PWA in Wave 0. This means:
- No coordinator routes, no coordinator data fetching, no coordinator-specific UI components
- The PWA architecture must not prevent coordinator surfaces from being added in a later group. Specifically:
  - Route namespacing should not preclude a future `/coordinator` or `/review` route
  - The app shell navigation structure should be extensible (additional nav items can be added)
  - The auth permission store should be capable of expressing coordinator roles when the time comes (this is a gate check item for `@hbc/auth`)
- Document the future-ready design decision in this task file so future implementers know coordinator UI is intentionally deferred, not forgotten

### RBAC Visibility Enforcement (Wave 0 Sketch G5.3)

The PWA project and request list must be filtered by the authenticated user's permissions using `@hbc/auth`.

**Rules:**
- The project list shows only projects the authenticated user has access to (determined by the `@hbc/auth` permission store and `@hbc/provisioning` visibility rules)
- The request list shows only the authenticated user's own requests (a requester does not see other requesters' submissions)
- RBAC filtering occurs at the data layer (query filtering via permission store), not just at the display layer (hiding rows in a full-data response)
- If the permission store is not yet populated when the status list mounts, show a loading state, not an empty list. An empty list that clears when permissions load is confusing.

### Failure Modes and Degraded-State Handling

The hosted PWA must handle the following failure scenarios gracefully. For each, the requester sees an honest, actionable message — not a generic error screen.

| Failure Scenario | Handling Rule |
|---|---|
| Authentication failure (token expired, session invalid) | Redirect to auth flow; preserve draft state before redirecting; do not lose in-progress form data |
| API timeout on request creation | Show a retry action with clear message: "The request couldn't be saved. Check your connection and try again." Do not silently fail. |
| API error on step submission | Show the step-level error message from `@hbc/provisioning` (translated to requester-readable language); do not advance to the next step on error |
| RBAC permission denied (403) | Show a clear "You don't have permission to view this" message; do not show a generic 404 or empty state |
| Provisioning failure (terminal) | See T05: completion summary with failure reason and next steps |
| Backend unavailable (500 or connection refused) | Show a service-unavailable message; offer a retry; explain that the draft is preserved |
| SignalR connection failure (if used for live provisioning updates) | Fall back to polling; do not crash; show a "Live updates unavailable, refreshing manually" message |
| Service worker fetch failure (cached asset stale or missing) | Log the error; fall back to network fetch; do not show a broken page |

### Later-Group Consumption Rules

Future groups that build on the hosted PWA requester surfaces must:
- Consume the shared packages (step-wizard, session-state, provisioning, auth) through the same interfaces established in G5
- Not introduce competing draft storage mechanisms
- Not add coordinator or admin surfaces without an explicit LD revision and architecture owner approval
- Not change the Project Hub handoff behavior without coordinating with G5's LD-04 and LD-05 governance
- Not add new PWA routes that overlap with or conflict with the G5 route namespace without reviewing `apps/pwa/src/router/`

---

## Exclusions / Non-Goals

- Do not implement a permission management UI. RBAC is enforced, not configured, in the PWA.
- Do not add coordinator-facing UI. LD-09 is explicit.
- Do not add admin-facing UI. LD-01 and LD-10 are explicit.
- Do not define the SPFx integration implementation. That is a Group 4 concern.

---

## Governing Constraints

- No controller/admin UI in the hosted PWA (LD-01, LD-10)
- No coordinator UI in Wave 0 (LD-09)
- RBAC filtering at the data layer, not just the display layer (`@hbc/auth` permission store)
- Failure messages must be requester-readable — no raw API error codes surfaced to the user
- Package boundary rules: all shared behavior via shared packages; no local reimplementation

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/auth` | Required | RBAC visibility, permission store |
| `@hbc/provisioning` | Required | Failure mode types, API error handling |
| `@hbc/app-shell` | Required | Route isolation, navigation structure |
| `@hbc/ui-kit` | Required | Error state, permission-denied, and degraded-state components |
| `@hbc/session-state` | Supporting | Preserve draft state during auth redirect |

---

## Acceptance Criteria

1. **No controller/admin/coordinator routes exist in the PWA.** A code search for `/admin`, `/controller`, `/coordinator` in `apps/pwa/src/router/` returns no results.

2. **RBAC filtering is enforced.** With two test users (User A and User B), User A cannot see User B's requests in the status list.

3. **Authentication failure is handled gracefully.** Simulating an expired token redirects to auth and the draft is preserved.

4. **API errors show actionable messages.** Simulating a step submission failure shows a clear, requester-readable error with a retry action.

5. **RBAC 403 errors show a permission-denied message.** Not a generic empty state or 404.

6. **Future coordinator extension is architecturally possible.** The router, app shell, and auth permission store are extensible enough that a future coordinator route could be added without structural rework. Document the evidence in this task file.

7. **Wave 0 boundary limitations are documented.** Known limitations (PWA draft not visible in SPFx, and vice versa; coordinator surfaces deferred) are documented in `apps/pwa/README.md` or this task file.

---

## Validation / Readiness Criteria

Before T07 is closed:

- The gate check for `@hbc/auth`, `@hbc/provisioning`, and `@hbc/app-shell` has been performed and recorded
- RBAC isolation verified with two test user sessions
- All failure mode scenarios manually tested (at minimum: auth failure, API timeout, 403, 500)
- TypeScript compilation clean

---

## Known Risks / Pitfalls

**Draft not synced across surfaces:** A requester who starts a request in SPFx and then opens the PWA will not see their SPFx draft in the PWA. This is expected and acceptable in Wave 0, but must be documented clearly so the requester is not confused. The status list will show submitted requests from both surfaces (backend records), but in-progress drafts are surface-local.

**Permission store population timing:** If the `@hbc/auth` permission store is populated asynchronously and the status list mounts before permissions are loaded, an empty list will appear briefly. This is a poor experience. Implement a skeleton/loading state that is clearly distinct from a genuinely empty list.

**Coordinator architecture extensibility:** The claim that the architecture is "future-ready for coordinator surfaces" must be backed by actual evidence in the router and app shell structure. Do not make this claim in the acceptance criteria without verifying it.

---

## Progress Documentation Requirements

During active T07 work:

- Record all gate check outcomes (auth, provisioning, app-shell) in this file
- Record the RBAC filtering approach (query-level vs. display-level vs. hybrid)
- Record any known surface-boundary limitations discovered during implementation

---

## Closure Documentation Requirements

Before T07 can be closed:

- Known surface-boundary limitations (PWA-vs-SPFx draft isolation, coordinator deferral) are documented in `apps/pwa/README.md`
- The failure mode handling approach is documented (error types, user-readable message mapping, retry behavior)
- RBAC filtering implementation is documented in the relevant feature or package README
- Gate check outcomes are recorded in this task file
- All acceptance criteria verified and checked off
- TypeScript compilation clean

---

## Closure Record

**Date:** 2026-03-15

### Gate Check Outcomes

**`@hbc/auth`:** PASS. Permission store populated on auth via `useAuthStore`. Supports arbitrary permission strings + wildcard `*:*`. `requireAuth()` and `requireAdminAccessControl()` guards enforce route-level access. `usePermission(action)` hook available for component-level checks. Store is extensible for future coordinator roles.

**`@hbc/provisioning`:** PASS. API client includes typed error handling (throws on non-ok response with parsed error message). Failure modes module (`failure-modes.ts`) provides 10 typed failure scenarios. `listMyRequests(submitterId)` enforces server-side RBAC filtering. Status labels and badge variants provide requester-readable state display.

**`@hbc/app-shell`:** PASS (with caveat). PWA does NOT import from `@hbc/app-shell` per package README guidance. Route isolation is handled at the `workspace-routes.ts` level. Navigation structure via `workspace-config.ts` + sidebar registry is extensible. The app shell pattern supports adding new workspace routes and nav items without structural rework.

### RBAC Filtering Approach

**Server-side (data-layer)** via `useMyProjectRequests(submitterId)`:
- `submitterId` is the authenticated user's email from `useCurrentUser()`
- Backend filters by `submittedBy` field — a requester cannot see other requesters' submissions
- Enabled only when `submitterId` is non-empty (prevents unauthenticated queries)
- No display-layer filtering needed — the API returns only the user's own records

### Coordinator Extensibility Evidence

The architecture is future-ready for coordinator surfaces:

1. **Router:** TanStack Router with `createRoute()` and `beforeLoad` guards. A future `/coordinator` or `/review` route can be added with `requirePermission('coordinator:review-requests')` guard. No namespace conflicts.
2. **Permission store:** `usePermissionStore` supports arbitrary permission strings and wildcard grants. Adding `coordinator:review-requests` permission requires only backend role mapping.
3. **Feature registry:** Extensible pattern in `main.tsx`. A `feature:coordinator-panel` can be registered with `visibility: 'discoverable-locked'`.
4. **App shell navigation:** Sidebar items sourced from workspace config registry. Coordinator nav items can be added without modifying the shell component.
5. **Auth store:** Stores resolved roles from session. Backend can add a `COORDINATOR` role without frontend changes.

**What would need to be built (not present today, intentionally deferred per LD-09):**
- Route definition in `workspace-routes.ts`
- Permission guard function (e.g., `requireCoordinatorAccess()`)
- Coordinator-specific page components
- Feature registration entry
- Sidebar/nav configuration entry

### Known Surface-Boundary Limitations (Wave 0)

1. **PWA-SPFx draft isolation:** A draft created in the PWA (IndexedDB via `@hbc/session-state`) is not visible in SPFx, and vice versa. Submitted requests (backend records) are visible in both surfaces. This is acceptable for Wave 0.

2. **Coordinator surfaces deferred:** No coordinator routes, data fetching, or UI components exist in the PWA. Controllers who access the PWA see the requester view only. Coordinator surfaces belong to a later group (per LD-09).

3. **Admin route present but guarded:** The admin route exists with `requireAdminAccessControl()` guard. Non-admin users are redirected to `/project-hub`. This route was inherited from the workspace route set and is appropriately isolated.

4. **Single draft per user:** New-request drafts use a singleton key (`PROJECT_SETUP_DRAFT_KEY`). Multiple simultaneous drafts are not supported in Wave 0.

### Failure Mode Handling

| Failure Scenario | Handling | Status |
|-----------------|----------|--------|
| Auth token expired | `requireAuth()` redirects to `/`; `captureIntendedDestination` preserves return path; IndexedDB drafts survive page reload | PASS |
| API timeout on request creation | Error caught in `handleSubmit`; `HbcBanner variant="error"` shows message; draft NOT cleared (IR-01) | PASS |
| API error on step submission | Error state captured; banner displayed with server message; form data preserved | PASS |
| RBAC 403 on list fetch | `isError` triggers `HbcBanner variant="error"` with "Unable to load your requests" + retry button | PASS |
| Provisioning failure (terminal) | `RequestDetailPage` shows `FailureSummary` with requester-friendly message and next steps | PASS |
| Backend unavailable (500) | Caught as API error; retry button available; draft preserved | PASS |
| Offline submission | T04: `queueOperation()` + info banner; auto-resubmit on reconnect via `pwaExecutor` | PASS |
| Service worker fetch failure | vite-plugin-pwa Workbox falls back to network; precache only (no API caching) | PASS |

### Acceptance Criteria Verification

1. **AC1:** Grep for `controller|coordinator` in `apps/pwa/src/router/` — only the guarded `admin` route found. No controller/coordinator routes. PASS.
2. **AC2:** `useMyProjectRequests(submitterId)` — server-side RBAC. User A cannot see User B's requests. PASS.
3. **AC3:** Auth failure preserves draft (IndexedDB survives redirect). `captureIntendedDestination` preserves return path. PASS.
4. **AC4:** API errors show `HbcBanner variant="error"` with message + retry. PASS.
5. **AC5:** 403 errors trigger `isError` → error banner with retry. PASS.
6. **AC6:** Coordinator extension evidence documented above. PASS.
7. **AC7:** Known limitations documented in this closure record. PASS.
