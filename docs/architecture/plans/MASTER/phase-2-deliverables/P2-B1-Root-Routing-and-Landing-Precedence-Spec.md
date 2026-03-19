# P2-B1: Root Routing and Landing Precedence Spec

| Field | Value |
|---|---|
| **Doc ID** | P2-B1 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Specification |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead; changes require review by Architecture and Platform |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §7, §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [runway-definition §3](../../../reference/work-hub/runway-definition.md); `root-route.tsx`; `workspace-routes.ts`; `redirectMemory.ts`; `ShellCore.tsx` |

---

## Specification Statement

Phase 2 transitions the PWA default landing from `/project-hub` to `/my-work` (Personal Work Hub) for approved first-release cohorts. This specification locks the landing precedence chain, role-based landing resolution, redirect memory contract, return navigation behavior, and route implementation requirements. The redirect memory and post-auth navigation infrastructure already exist and are preserved — Phase 2 changes the landing *destination*, not the landing *mechanism*.

---

## Spec Scope

### This specification governs

- Root route (`/`) behavior and the `/project-hub` → `/my-work` transition
- The 3-priority landing precedence chain
- Role-based landing path resolution (`resolveRoleLandingPath()`)
- Executive team-mode landing behavior
- Redirect memory contract (documenting existing implementation)
- Return navigation contract (back-to-hub behavior)
- Low-work landing stability
- SPFx landing constraints
- `/my-work` route implementation requirements

### This specification does NOT govern

- PWA/SPFx lane ownership — see [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md)
- Hub state persistence and return-memory beyond routing — see P2-B2
- Freshness, refresh, and staleness trust — see P2-B3
- Cross-device shell behavior — see P2-B4
- Operating-model invariants — see [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md)
- Work-item ranking within the hub — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Landing precedence** | The ordered chain of rules that determines where a user lands after authentication or when navigating to the root URL |
| **Redirect memory** | A TTL-governed mechanism that captures the user's intended destination before auth redirect and restores it after successful authentication |
| **Role landing path** | The default route for a user based on their resolved `@hbc/auth` roles, determined by `resolveRoleLandingPath()` |
| **Return navigation** | The path a user follows to return to the Personal Work Hub from a workspace or domain surface |
| **Cohort-gated landing** | A rollout mechanism where only approved first-release cohorts receive the `/my-work` default landing; other users retain the previous default until rollout expands |

---

## 1. Current-State vs Target-State Landing

| Concern | Current State (Wave 0) | Phase 2 Target |
|---|---|---|
| **Root route (`/`)** | Hard redirect to `/project-hub` | Redirect to role-based landing path (§3) |
| **Standard user landing** | `/project-hub` | `/my-work` (Personal Work Hub, `teamMode: 'personal'`) |
| **Executive user landing** | `/leadership` | `/my-work` (Personal Work Hub, `teamMode: 'my-team'` default with personal toggle) |
| **Administrator landing** | `/admin` | `/admin` (unchanged) |
| **Post-auth Priority 1** | Redirect memory restore | Redirect memory restore (unchanged) |
| **Post-auth Priority 2** | `resolveRoleLandingPath()` → role-specific | `resolveRoleLandingPath()` → updated role mapping (§3) |
| **Post-auth Priority 3** | Implicit (no explicit fallback) | Default `/my-work` |
| **`/my-work` route** | Does not exist | New route wired to `HbcMyWorkFeed` |
| **Low-work behavior** | N/A | Stay on `/my-work` with smart empty-state (P2-A1 §4) |
| **Redirect memory** | Fully implemented | Preserved as-is (§5) |

### Current Implementation References

| Component | File | Lines |
|---|---|---|
| Index route (`/` → `/project-hub`) | `apps/pwa/src/router/workspace-routes.ts` | 41–48 |
| Post-auth navigation | `apps/pwa/src/router/root-route.tsx` | 57–77 |
| `resolveRoleLandingPath()` | `packages/shell/src/ShellCore.tsx` | 102–110 |
| Redirect memory | `packages/shell/src/redirectMemory.ts` | Full file |

---

## 2. Landing Precedence Chain

The landing precedence chain determines where a user lands. It is evaluated in strict priority order — the first match wins.

| Priority | Rule | Mechanism | Phase 2 Change |
|---|---|---|---|
| **P1** | **Redirect memory** — If the user was redirected to auth from a specific page, return them there | `restoreRedirectTarget({ runtimeMode: 'pwa' })` in `root-route.tsx` | No change — existing implementation preserved |
| **P2** | **Role-based landing** — When user is at root (`/`), resolve their role-appropriate landing path | `resolveRoleLandingPath(resolvedRoles)` in `ShellCore.tsx` | Updated role mapping (§3) |
| **P3** | **Default** — If no redirect memory and no role-specific override, land at Personal Work Hub | Fallback in `resolveRoleLandingPath()` | Changed from `/project-hub` to `/my-work` |

### Precedence Invariants

- P1 (redirect memory) ALWAYS takes precedence when a valid, non-expired record exists. Role-based landing never overrides a user's intended destination.
- P2 (role-based landing) only fires when the user is at root (`/` or empty path). Direct navigation to any valid route is never intercepted.
- P3 (default) only fires when no higher-priority rule matches.
- The precedence chain is the same for all users — role differences are expressed in P2's resolution table, not in the chain structure.

---

## 3. Role-Based Landing Resolution

### Current Implementation (Wave 0)

```
resolveRoleLandingPath(resolvedRoles):
  Administrator → '/admin'
  Executive     → '/leadership'
  (default)     → '/project-hub'
```

### Phase 2 Target

```
resolveRoleLandingPath(resolvedRoles):
  Administrator → '/admin'
  Executive     → '/my-work'  (with teamMode: 'my-team')
  (default)     → '/my-work'  (with teamMode: 'personal')
```

### Resolution Table

| Role | Landing Path | Team Mode | Feed Behavior |
|---|---|---|---|
| `Administrator` | `/admin` | N/A | Admin workspace (unchanged) |
| `Executive` | `/my-work` | `my-team` (default), personal toggle available | Hybrid landing — team portfolio view first, with personal toggle |
| Multi-role (includes `Administrator`) | `/admin` | N/A | Administrator takes precedence |
| Multi-role (includes `Executive`, not `Administrator`) | `/my-work` | `my-team` | Executive takes precedence |
| Standard (all other roles) | `/my-work` | `personal` | Personal work feed |

### Resolution Rules

- Role precedence order: `Administrator` > `Executive` > default. The first match in this order determines the landing path.
- `resolveRoleLandingPath()` remains the single source of landing resolution. No parallel role-routing logic is permitted.
- Role resolution uses `@hbc/auth` resolved roles — no custom role logic outside the auth package.

---

## 4. Executive Team-Mode Landing

Executive-role users receive a hybrid landing experience at `/my-work`:

| Aspect | Specification |
|---|---|
| **Default team mode** | `my-team` — team portfolio view showing items owned by direct reports |
| **Toggle** | Personal/team toggle available in the feed header; switching between `personal` and `my-team` modes |
| **State persistence** | Last-selected team mode is preserved in session state for the current session |
| **Route representation** | Team mode is conveyed via query parameter or feed component state, not a separate route. The route remains `/my-work` |
| **Delegated-by-me mode** | Available as an additional toggle/filter. Not the default landing mode for any role |

### Team-Mode Landing Invariants

- Executive users land in team mode by default, but personal mode is always one toggle away.
- The toggle does NOT change the route — it changes the feed query (`teamMode` parameter).
- Team-mode landing does NOT create a separate dashboard experience. It uses the same operating-layer structure as personal mode (per P2-A1 §5.3).

---

## 5. Redirect Memory Contract

The redirect memory system is **fully implemented** and requires no Phase 2 changes. This section documents the existing implementation as locked specification.

**Reference implementation:** `packages/shell/src/redirectMemory.ts`

### 5.1 API Surface

| Function | Purpose |
|---|---|
| `rememberRedirectTarget({ pathname, runtimeMode, now?, ttlMs? })` | Persist redirect intent before auth redirect |
| `captureIntendedDestination({ pathname, runtimeMode, now?, ttlMs? })` | Convenience wrapper for `rememberRedirectTarget` used by guard surfaces |
| `restoreRedirectTarget({ runtimeMode, now? })` | Restore redirect intent if path, mode, and expiry checks pass |
| `resolvePostGuardRedirect({ runtimeMode, fallbackPath, now?, isTargetAllowed? })` | Combined restore-or-fallback resolution |
| `clearRedirectMemory()` | Clear from both runtime and sessionStorage |
| `isSafeRedirectPath(pathname)` | Validate against open-redirect attacks |

### 5.2 Safety Properties

| Property | Implementation |
|---|---|
| **TTL expiry** | Default 5 minutes; configurable via `ttlMs` parameter |
| **Mode validation** | Records captured in PWA mode are only restored in PWA mode (and vice versa for SPFx) |
| **Path safety** | Paths must start with `/`, must not start with `//`, must not contain `://` |
| **Storage redundancy** | Dual-layer: in-memory (`inMemoryRedirectRecord`) + `sessionStorage` |
| **Deduplication** | Overwriting existing records is safe; no duplicate chain logic |
| **Cleanup** | Records are cleared on restore, expiry, or mode mismatch |

### 5.3 Redirect Memory Invariants

- Redirect memory is the **highest-priority** landing rule. No role-based or default landing may override a valid redirect memory record.
- Redirect memory is consumed on use — after restoration, the record is cleared.
- Expired records are silently discarded and treated as absent.
- Cross-mode records (e.g., PWA record restored in SPFx) are silently discarded.

---

## 6. Return Navigation Contract

After navigating from the Personal Work Hub to a workspace or domain surface, users must be able to return to the hub.

### 6.1 Return Mechanisms

| Mechanism | Implementation | Always Available |
|---|---|---|
| **Shell nav item** | "My Work" item in the sidebar navigation (`@hbc/shell` nav config) | Yes — always visible in PWA shell |
| **Browser back** | Standard browser history navigation | Yes |
| **Return link** | "Back to My Work" affordance on workspace pages | Recommended for primary workspace surfaces |

### 6.2 Return Behavior

- Returning to `/my-work` MUST restore the user's last feed state (team mode, scroll position, filter context) to the extent supported by session state.
- The feed MUST refresh on return to reflect any domain mutations made at the source surface (per [interaction-contract §4](../../../reference/work-hub/interaction-contract.md)).
- Return navigation MUST NOT bypass the hub and redirect directly to another surface (per P2-A1 §1.2 — no redirect on low-work).

### 6.3 Context Handoff

When navigating from hub to workspace:
- Every work item carries `context.href` — a deep link to the authoritative source surface.
- The shell preserves routing history so browser back works correctly.
- The workspace surface receives the context needed to display the relevant record.

When returning from workspace to hub:
- The hub re-renders with current feed data (refresh on return).
- Session-state-preserved preferences (team mode, filters) are restored.
- Detailed return-memory and state persistence rules are governed by P2-B2.

---

## 7. Low-Work Landing Stability

Per P2-A1 §1.2 (Hub Stability Invariants):

**Landing at `/my-work` is permanent regardless of task queue depth.**

| Rule | Specification |
|---|---|
| **No conditional redirect** | The router MUST NOT check task queue depth and redirect to `/project-hub` or another surface when the queue is light |
| **No lazy loading gate** | The `/my-work` route MUST NOT gate on data availability — it loads immediately and shows loading/empty states as needed |
| **Empty state** | Low-work states show smart empty-state guidance via `@hbc/smart-empty-state` (per P2-A1 §4.3) |
| **Default home** | `/my-work` is the default home for all non-admin roles in all states: high-work, low-work, offline, degraded |

---

## 8. SPFx Landing Constraints

Per P2-B0 (Lane Ownership and Coexistence Rules):

| Constraint | Rule |
|---|---|
| **No default-host takeover** | SPFx MUST NOT adopt `/my-work` as a default landing in Phase 2 |
| **No competing home** | SPFx companion surface provides summary and light actions, not a full home experience |
| **Launch-to-PWA** | SPFx companion may include a "Open in HB Intel" affordance that launches the PWA at `/my-work` |
| **Shared route semantics** | Route semantics (`/my-work`, `/project-hub`, etc.) are shared vocabulary but only the PWA implements them as actual routes |

---

## 9. Route Implementation Requirements

Phase 2 requires the following route changes to implement this specification:

### 9.1 New `/my-work` Route

| Requirement | Specification |
|---|---|
| **Route path** | `/my-work` |
| **Route file** | `apps/pwa/src/router/workspace-routes.ts` |
| **Page component** | New page component that renders `HbcMyWorkFeed` from `@hbc/my-work-feed` |
| **Auth guard** | Protected route — requires authenticated session (same as other workspace routes) |
| **Feed props** | Pass `teamMode` from query parameter or resolved role context |

### 9.2 Updated Index Route

| Requirement | Specification |
|---|---|
| **Current behavior** | `/ → redirect('/project-hub')` |
| **Target behavior** | `/ → redirect(resolveRoleLandingPath(resolvedRoles))` |
| **Implementation** | Replace hard-coded `/project-hub` redirect with role-aware resolution |

### 9.3 Updated `resolveRoleLandingPath()`

| Requirement | Specification |
|---|---|
| **File** | `packages/shell/src/ShellCore.tsx` |
| **Change** | Update default return from `'/project-hub'` to `'/my-work'`; update Executive from `'/leadership'` to `'/my-work'` |
| **Backward compatibility** | `/project-hub` route remains valid and accessible via direct navigation; it is no longer the default landing |

### 9.4 Shell Navigation Update

| Requirement | Specification |
|---|---|
| **Nav config** | Add "My Work" nav item to `packages/shell/src/module-configs/nav-config.ts` |
| **Badge** | Wire `HbcMyWorkBadge` into the PWA shell header |
| **Position** | "My Work" nav item should appear first (or prominently) in the sidebar |

### 9.5 `/project-hub` Preservation

| Requirement | Specification |
|---|---|
| **Route** | `/project-hub` remains a valid route |
| **Navigation** | Users can still navigate to `/project-hub` via sidebar nav or direct URL |
| **Default** | It is no longer the default landing — `/my-work` replaces it as the home surface |

---

## 10. Acceptance Gate References

P2-B1 contributes evidence for two Phase 2 acceptance gates:

### Default Home Gate

| Field | Value |
|---|---|
| **Pass condition** | Approved first-release cohorts land in PWA Personal Work Hub by steady-state default |
| **Evidence required** | Route/landing spec (this document), implemented route behavior, test coverage |
| **Primary owner** | Experience / Shell |

### Continuity Gate

| Field | Value |
|---|---|
| **Pass condition** | Redirect memory, return memory, and context restoration are trustworthy |
| **Evidence required** | Persistence contract (P2-B2), navigation test scenarios |
| **Primary owner** | Experience / Shell |

P2-B1 provides the routing specification for the Default home gate. The Continuity gate is shared with P2-B2 (state persistence).

---

## 11. Locked Decisions

The following decisions from Phase 2 §16 are locked and directly govern routing:

| Decision | Locked Resolution | P2-B1 Consequence |
|---|---|---|
| Full Personal Work Hub ownership | PWA first | `/my-work` is a PWA route; SPFx does not own a competing home route |
| Elevated-role landing | Hybrid — personal work first, then team / delegated / portfolio attention | Executive lands at `/my-work` with `teamMode: 'my-team'` default |
| Low-work default | Stay on Personal Work Hub with smart empty-state | No conditional redirect from `/my-work` |
| Return behavior | Strong context memory | Redirect memory preserved; return nav always available |
| Rollout posture | Targeted pilot / phased rollout first | `resolveRoleLandingPath()` may be cohort-gated in implementation |
| Multi-role default | Primary active role context | Role precedence: Administrator > Executive > default |

---

## 12. Policy Precedence

| Deliverable | Relationship to P2-B1 |
|---|---|
| **P2-B0** — Lane Ownership | P2-B1 implements the lane model's landing column: PWA owns default landing, SPFx has no default-host takeover |
| **P2-A1** — Operating Model Register | P2-B1 respects the no-redirect-on-low-work invariant and role-based visibility model |
| **P2-B2** — Hub State Persistence | P2-B2 extends this spec with state persistence for team mode, scroll position, and filter context on return |
| **P2-B3** — Freshness and Staleness Trust | P2-B3 governs how feed data freshness is handled after landing; P2-B1 governs getting the user to the right landing point |
| **P2-B4** — Cross-Device Shell Behavior | P2-B4 addresses how this landing behavior adapts across desktop and tablet contexts |

If a downstream deliverable conflicts with this specification, this specification takes precedence for routing, landing precedence, and redirect memory behavior.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §7, §10.2](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
