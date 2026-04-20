# P2-B1: Root Routing and Landing Precedence Spec

| Field | Value |
|---|---|
| **Doc ID** | P2-B1 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Specification |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead; changes require review by Architecture and Platform |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §7, §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md); [P2-A3](P2-A3-Work-Item-Explainability-and-Visibility-Rules.md); [runway-definition §3](../../../reference/work-hub/runway-definition.md); `root-route.tsx`; `workspace-routes.ts`; `redirectMemory.ts`; `ShellCore.tsx` |

---

## Specification Statement

Phase 2 introduces `/my-work` as the new PWA default landing for **approved first-release cohorts**. This specification locks the landing precedence chain, resolver authority, phased-rollout behavior, role-based landing defaults, redirect memory contract, return navigation behavior, and route implementation requirements.

Phase 2 changes the landing **destination** for approved cohorts, but it does **not** replace the existing redirect-memory mechanism. During rollout, users **outside** the approved cohort retain the current-state landing defaults until the cohort gate enables the new home for them.

**Repo-truth audit — 2026-03-20.** The full redirect memory API (§7.1, six functions) is implemented in `packages/shell/src/redirectMemory.ts` and exported from `@hbc/shell` with signatures and safety properties matching this spec exactly. The §4.1 legacy fallback mapping is correctly implemented in `resolveRoleLandingPath()`. All five §11 implementation requirements are confirmed as controlled-evolution gaps, not pre-existing violations: no shared landing resolver exists; no cohort gate integration exists; `resolveRoleLandingPath()` is currently called as a standalone authority; the index route hard-codes `/project-hub`; no "My Work" shell nav item exists. All five gaps are anticipated by the §1 table and the Current-State Reconciliation Note. Specific change sites documented at §1.

---

## Spec Scope

### This specification governs

- Root route (`/`) behavior and phased transition from `/project-hub` to `/my-work`
- The landing precedence chain and its single policy authority
- Shared shell-level landing resolution service requirements
- Role-based landing defaults
- Cohort-gated rollout behavior
- Redirect memory contract
- Return navigation contract
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
- Explainability and visibility constraints for elevated-role views — see [P2-A3](P2-A3-Work-Item-Explainability-and-Visibility-Rules.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Landing precedence** | The ordered chain of rules that determines where a user lands after authentication or when navigating to the root URL |
| **Redirect memory** | A TTL-governed mechanism that captures the user's intended destination before auth redirect and restores it after successful authentication |
| **Role landing path** | The role-derived landing path returned by the shared landing resolver after role precedence is applied |
| **Landing resolver service** | The shared shell-level authority that resolves landing decisions for both auth/bootstrap and route surfaces |
| **Cohort gate** | The explicit feature-flag / cohort-service decision that determines whether the new `/my-work` home is enabled for a specific user |
| **Legacy fallback** | The preserved current-state default landing returned for users outside the approved rollout cohort |
| **Return navigation** | The path a user follows to return to the Personal Work Hub from a workspace or domain surface |

---

## 1. Current-State vs Target-State Landing

| Concern | Current State (Repo Truth) | Phase 2 Target | Phased Rollout Rule |
|---|---|---|---|
| **Root route (`/`)** | Hard redirect pathing still resolves to current defaults | Landing resolved by shared shell-level resolver service | Shared resolver returns legacy or new landing based on cohort gate |
| **Standard user landing** | `/project-hub` | `/my-work` | `/my-work` only when cohort-enabled; otherwise `/project-hub` |
| **Executive user landing** | `/leadership` | `/my-work` **personal-first** | `/my-work` personal-first only when cohort-enabled; otherwise `/leadership` |
| **Administrator landing** | `/admin` | `/admin` | Unchanged |
| **Post-auth Priority 1** | Redirect memory restore | Redirect memory restore | Unchanged |
| **Post-auth Priority 2** | Role-based landing | Role + cohort-aware landing via shared resolver | Same shared resolver governs both rollout states |
| **Post-auth Priority 3** | Implicit current defaults | Explicit default mapping within shared resolver | Legacy defaults preserved when cohort-disabled |
| **`/my-work` route** | Not yet implemented as a live route | New PWA route wired to Personal Work Hub | Not used as default unless cohort-enabled |
| **Low-work behavior** | N/A | Stay on `/my-work` with smart empty-state | Applies whenever `/my-work` is enabled |
| **Redirect memory** | Implemented | Preserved as-is | Preserved as-is |

### Current-State Reconciliation Note

This document is a **target-state specification** layered on top of repo truth. It intentionally distinguishes current implementation from required Phase 2 behavior. Any implementation tasks described below are **required changes**, not claims that the route, nav, badge, or landing flow are already live.

**Live change sites confirmed by 2026-03-20 audit:**

- **Hard-coded `/project-hub` redirect** — `apps/pwa/src/router/workspace-routes.ts` line 46: `throw redirect({ to: '/project-hub' })`. This is the current index-route behavior §11.3 targets for replacement.
- **Standalone `resolveRoleLandingPath()` call** — `apps/pwa/src/router/root-route.tsx` lines 69–76 call `resolveRoleLandingPath(resolvedRoles)` directly as the landing policy authority with no cohort awareness. This is the §11.4 / §2.1 change site. A secondary call site exists in `packages/shell/src/ShellCore.tsx` line 166 (`const landingPath = resolveRoleLandingPath(resolvedRoles)`) — both must be governed by the shared resolver once it exists.
- **No cohort gate** — no feature-flag or cohort-service abstraction exists anywhere in the monorepo. Required before the §6 rollout contract can be operative.
- **No `resolveLandingDecision()` or equivalent** — the §2.2 recommended resolver contract has no current implementation counterpart in `@hbc/shell` or any workspace package.
- **No `my-work` nav item** — `WORKSPACE_IDS` in `packages/shell/src/types.ts` contains no `my-work` entry; no equivalent sidebar or nav config exists in `apps/pwa`.

---

## 2. Single Landing Authority

Landing behavior is governed by **one shared shell-level landing resolver service**. No route, component, or host surface may implement parallel landing-policy branching.

### 2.1 Authority Rule

| Rule | Requirement |
|---|---|
| **Single source of truth** | A shared shell-level resolver/service is the sole policy authority for landing precedence |
| **Allowed callers** | `root-route` / auth-bootstrap and the index-route surface may call the shared resolver |
| **Disallowed pattern** | Duplicated role/cohort/redirect branching in multiple route files or host-specific logic |
| **Permitted helper** | `resolveRoleLandingPath()` may remain as an internal helper, but only if it is called by the shared resolver and does not become a second policy authority |

### 2.2 Required Resolution Shape

The shared resolver must evaluate:

1. Redirect memory  
2. Role precedence  
3. Cohort status  
4. Default landing result

Recommended contract shape:

```ts
resolveLandingDecision({
  resolvedRoles,
  runtimeMode,
  redirectTarget,
  cohortStatus,
}): {
  pathname: string;
  landingMode: 'legacy' | 'phase-2';
  teamMode?: 'personal' | 'delegated-by-me' | 'my-team';
}
```

The exact type name may vary, but the architectural rule does not: **one resolver, one policy contract, many callers**.

---

## 3. Landing Precedence Chain

The landing precedence chain is evaluated in strict priority order. The **first valid match wins**.

| Priority | Rule | Mechanism | Phase 2 Requirement |
|---|---|---|---|
| **P1** | **Redirect memory** — if a valid, non-expired redirect record exists, return the user to the intended destination | Shared resolver consumes `restoreRedirectTarget({ runtimeMode: 'pwa' })` or equivalent | No change — highest priority remains locked |
| **P2** | **Role + cohort-aware landing** — when no redirect memory exists, resolve role-appropriate landing and apply cohort gate | Shared landing resolver service | New shared authority required |
| **P3** | **Default within resolved mode** — if no special override exists, return the default landing for the user's effective rollout state | Shared landing resolver service | Explicit, not implicit |

### Precedence Invariants

- Redirect memory **always** takes precedence when a valid record exists.
- Direct navigation to any valid non-root route is **never** intercepted by landing-default logic.
- Role logic and cohort logic are both evaluated inside the shared resolver, not in parallel surfaces.
- The precedence chain is the same for all users; role differences and rollout differences are expressed in the resolver table, not by changing the chain itself.

---

## 4. Role-Based Landing Resolution

### 4.1 Legacy Fallback Mapping (users outside approved `/my-work` cohort)

```txt
Administrator → '/admin'
Executive     → '/leadership'
(default)     → '/project-hub'
```

### 4.2 Phase 2 Target Mapping (users inside approved `/my-work` cohort)

```txt
Administrator → '/admin'
Executive     → '/my-work'   (personal-first)
(default)     → '/my-work'
```

### 4.3 Resolution Table

| User State | Landing Path | Default Team Mode | Notes |
|---|---|---|---|
| `Administrator` | `/admin` | N/A | Unchanged in all rollout states |
| `Executive`, cohort-disabled | `/leadership` | N/A | Preserved current-state fallback during rollout |
| `Executive`, cohort-enabled | `/my-work` | `personal` | Elevated-role landing is personal-first |
| Multi-role including `Administrator` | `/admin` | N/A | Administrator precedence remains highest |
| Multi-role including `Executive`, cohort-disabled | `/leadership` | N/A | Legacy current-state fallback |
| Multi-role including `Executive`, cohort-enabled | `/my-work` | `personal` | Executive precedence applies after administrator exclusion |
| Standard role, cohort-disabled | `/project-hub` | N/A | Legacy default preserved |
| Standard role, cohort-enabled | `/my-work` | `personal` | New home enabled |

### 4.4 Resolution Rules

- Role precedence order remains: `Administrator` > `Executive` > default.
- The cohort gate does **not** replace role logic; it selects whether role resolution returns the **legacy mapping** or the **Phase 2 mapping**.
- `resolveRoleLandingPath()` may continue to exist as a helper only if it is governed by the shared resolver and reflects both rollout tables correctly.
- No custom role interpretation outside `@hbc/auth` is permitted.

---

## 5. Executive and Elevated-Role Landing

Executive and elevated-role users land at `/my-work` **personal-first** when the cohort gate enables the Phase 2 home for them.

| Aspect | Specification |
|---|---|
| **Default first view** | Personal runway / personal operating view |
| **Secondary views** | Team, delegated, blended, or portfolio-oriented views remain available as governed secondary modes |
| **Default `teamMode`** | `personal` |
| **Route representation** | Secondary mode changes remain on `/my-work`; mode is conveyed via query parameter and/or feed state, not a separate route |
| **Team-mode availability** | Allowed where supported by the feed contract and entitlement rules |
| **First-release constraint** | Team-first landing is not permitted in first release |

### Elevated-Role Invariants

- Elevated-role landing is **personal work first**, then broader oversight modes.
- The first screen for an Executive user is **not** a team-first dashboard.
- Secondary team-oriented views must respect P2-A3 visibility and explainability limits and must not assume org-chart / entitlement completeness beyond what first release explicitly supports.
- No elevated-role mode may create a competing home outside `/my-work`.

---

## 6. Cohort-Gated Rollout Contract

Phase 2 rollout is governed by an **explicit feature-flag / cohort service**.

### 6.1 Authority

| Rule | Requirement |
|---|---|
| **Source of truth** | Explicit feature-flag / cohort service |
| **What the cohort service decides** | Whether the new `/my-work` default landing is enabled for the current user |
| **What role logic decides** | Which home path to return within the user's enabled rollout state |
| **What is prohibited** | Implicit rollout by role alone, environment/build alone, or duplicate route-level feature checks |

### 6.2 Rollout Semantics

- The cohort gate is evaluated **inside** the shared landing resolver.
- Users outside the cohort preserve current-state defaults until enabled.
- Users inside the cohort receive the new Phase 2 home behavior.
- Cohort enablement may be gradual, targeted, and reversible without changing role semantics.

### 6.3 Legacy Fallback Rule

For users outside the approved `/my-work` cohort, the resolver returns the current-state default:

- `Administrator` → `/admin`
- `Executive` → `/leadership`
- everyone else → `/project-hub`

This fallback is locked for the rollout phase and is not subject to local interpretation by individual route implementers.

---

## 7. Redirect Memory Contract

The redirect memory system remains **preserved**. Phase 2 changes destination defaults, not redirect-memory authority.

**Reference implementation:** `packages/shell/src/redirectMemory.ts`

### 7.1 API Surface

| Function | Purpose |
|---|---|
| `rememberRedirectTarget({ pathname, runtimeMode, now?, ttlMs? })` | Persist redirect intent before auth redirect |
| `captureIntendedDestination({ pathname, runtimeMode, now?, ttlMs? })` | Convenience wrapper for guard surfaces |
| `restoreRedirectTarget({ runtimeMode, now? })` | Restore redirect intent if path, mode, and expiry checks pass |
| `resolvePostGuardRedirect({ runtimeMode, fallbackPath, now?, isTargetAllowed? })` | Restore-or-fallback resolution |
| `clearRedirectMemory()` | Clear from runtime and session storage |
| `isSafeRedirectPath(pathname)` | Validate redirect safety |

### 7.2 Safety Properties

| Property | Implementation Requirement |
|---|---|
| **TTL expiry** | Default 5 minutes unless intentionally changed by governed code |
| **Mode validation** | PWA records restore only in PWA mode; cross-mode records are discarded |
| **Path safety** | Must reject unsafe redirect patterns |
| **Storage redundancy** | In-memory + session-backed redundancy remains acceptable |
| **Cleanup** | Records are cleared on restore, expiry, or mode mismatch |

### 7.3 Redirect Memory Invariants

- Redirect memory is the **highest-priority** landing rule.
- Redirect memory is **consumed on use**.
- Expired or invalid records are silently discarded and treated as absent.
- Cohort logic and role logic **never** override a valid redirect record.

---

## 8. Return Navigation Contract

After navigating from Personal Work Hub to a workspace or domain surface, users must be able to return to the hub without losing trust in their context.

### 8.1 Return Mechanisms

| Mechanism | Current-State Status | Target-State Requirement |
|---|---|---|
| **Shell nav item** | Not yet a guaranteed live route affordance in current repo truth | Add governed “My Work” navigation entry in the PWA shell |
| **Browser back** | Standard browser behavior | Must remain functional |
| **Return link** | Surface-dependent | Recommended on major workspace pages |

### 8.2 Return Behavior

- Returning to `/my-work` should restore the user's last supported hub state to the extent governed by P2-B2.
- The feed must refresh on return so mutations performed in authoritative domain surfaces are reflected.
- Return navigation must not bypass the hub because the queue is light or empty.

### 8.3 Context Handoff

When navigating hub → workspace:

- Each work item provides `context.href` or equivalent deep-link context
- Router history is preserved
- Workspace surface receives sufficient context to display the authoritative record

When navigating workspace → hub:

- The hub re-renders against current feed state
- Supported session-state preferences are restored
- Persistence beyond routing is governed by P2-B2

---

## 9. Low-Work Landing Stability

Per P2-A1 hub stability invariants:

**Landing at `/my-work` remains stable regardless of queue depth whenever the user is cohort-enabled for the Phase 2 home.**

| Rule | Specification |
|---|---|
| **No conditional redirect** | The router must not redirect a cohort-enabled `/my-work` user to `/project-hub`, `/leadership`, or another surface because the queue is light |
| **No lazy-load gate** | `/my-work` must not wait on queue depth to render its route shell |
| **Empty state** | Low-work states use governed smart empty-state guidance |
| **Default home stability** | Once `/my-work` is the enabled home for a user, high-work, low-work, offline, and degraded states still resolve to `/my-work` |

---

## 10. SPFx Landing Constraints

Per P2-B0 lane-ownership rules:

| Constraint | Rule |
|---|---|
| **No default-host takeover** | SPFx must not adopt `/my-work` as a default landing in Phase 2 |
| **No competing home** | SPFx companion experiences may summarize and link, but do not become the full home surface |
| **Launch-to-PWA** | SPFx may provide “Open in HB Intel” or equivalent launch affordance to the PWA `/my-work` route |
| **Shared vocabulary, not shared authority** | Route semantics may be shared conceptually, but Phase 2 default landing authority remains with the PWA shell |

The shared landing resolver/service may support multiple callers, but it does not transfer host ownership of the default landing to SPFx.

---

## 11. Route Implementation Requirements

Phase 2 requires the following implementation changes.

### 11.1 Shared Landing Resolver Service

| Requirement | Specification |
|---|---|
| **New authority** | Introduce or formalize a shared shell-level landing resolver/service |
| **Consumers** | `root-route` / auth-bootstrap and index-route surfaces must call this shared resolver |
| **Policy inputs** | Roles, runtime mode, redirect target, cohort status |
| **Policy outputs** | Final pathname and, where applicable, initial hub mode metadata |
| **No-go rule** | No duplicated role/cohort branching in separate route files |

### 11.2 New `/my-work` Route

| Requirement | Specification |
|---|---|
| **Route path** | `/my-work` |
| **Host** | PWA |
| **Page component** | Personal Work Hub page wired to `@hbc/my-work-feed` and adjacent governed packages |
| **Auth** | Protected route |
| **Initial mode** | Personal-first by default; secondary modes governed by hub controls |

### 11.3 Updated Root and Index Behavior

| Requirement | Specification |
|---|---|
| **Root behavior** | Root/auth surfaces use the shared landing resolver instead of hard-coded role/path branching |
| **Index behavior** | Index route may remain as a thin fallback caller to the shared resolver |
| **Disallowed pattern** | Hard-coded `/project-hub` redirect as final steady-state landing logic |

### 11.4 Updated Role Mapping Helper

| Requirement | Specification |
|---|---|
| **Helper status** | `resolveRoleLandingPath()` may remain only as a subordinate helper |
| **Required behavior** | Must support both legacy fallback mapping and Phase 2 target mapping under shared resolver control |
| **No authority drift** | It must not become a second independently maintained policy engine |

### 11.5 Shell Navigation Update

| Requirement | Specification |
|---|---|
| **Nav config** | Add governed “My Work” nav item to the PWA shell |
| **Badge** | Wire hub-related badge affordance where approved |
| **Target-state wording** | These are implementation requirements, not claims that current repo truth already provides them |

### 11.6 `/project-hub` Preservation

| Requirement | Specification |
|---|---|
| **Route remains valid** | `/project-hub` remains a valid route |
| **Legacy fallback** | It remains the default for non-admin, non-executive users outside the rollout cohort |
| **Post-rollout role** | It remains accessible as a workspace surface after `/my-work` becomes default for enabled users |

---

## 12. Acceptance Gate References

P2-B1 contributes evidence for the following Phase 2 acceptance gates.

### Default Home Gate

| Field | Value |
|---|---|
| **Pass condition** | Approved first-release cohorts land in PWA Personal Work Hub by steady-state default |
| **Evidence required** | Resolver spec, implemented route behavior, cohort-gated rollout behavior, test coverage |
| **Primary owner** | Experience / Shell |

### Continuity Gate

| Field | Value |
|---|---|
| **Pass condition** | Redirect memory, return memory, and context restoration remain trustworthy |
| **Evidence required** | Redirect-memory preservation, persistence contract, navigation test scenarios |
| **Primary owner** | Experience / Shell |

### Rollout Control Gate

| Field | Value |
|---|---|
| **Pass condition** | Users outside approved cohorts preserve current-state defaults during phased rollout |
| **Evidence required** | Explicit cohort-service contract, resolver tests, fallback-path tests |
| **Primary owner** | Experience / Shell + Platform |

---

## 13. Locked Decisions Applied

| Decision | Locked Resolution | Consequence in P2-B1 |
|---|---|---|
| **Executive / elevated-role landing** | Personal Work Hub, personal-first | Executive no longer lands team-first |
| **Landing authority** | Shared shell-level resolver/service | Root and index surfaces call one policy source |
| **Rollout posture** | Explicit feature-flag / cohort-service control | `/my-work` default is gated, not assumed globally live |
| **Legacy fallback** | Preserve exact current-state role defaults outside the cohort | `Administrator → /admin`, `Executive → /leadership`, others → `/project-hub` |
| **Low-work default** | Stay on Personal Work Hub with smart empty-state | No conditional redirect away from `/my-work` once enabled |
| **SPFx coexistence** | No default-host takeover | PWA remains owner of default landing |

---

## 14. Policy Precedence

| Deliverable | Relationship to P2-B1 |
|---|---|
| **P2-B0** — Lane Ownership | P2-B1 enforces the landing portion of PWA-first ownership |
| **P2-A1** — Operating Model Register | P2-B1 respects the no-redirect-on-low-work invariant |
| **P2-A2** — Ranking / Lane Policy | P2-B1 sets landing posture; P2-A2 governs in-hub prioritization and mode behavior |
| **P2-A3** — Explainability / Visibility | P2-B1 prevents team-first Executive landing from outrunning first-release visibility constraints |
| **P2-B2** — Hub State Persistence | Extends return-memory and state-restoration behavior |
| **P2-B3** — Freshness and Staleness Trust | Governs trust after landing, not which landing is chosen |
| **P2-B4** — Cross-Device Shell Behavior | Adapts the landing experience across device contexts without changing the landing authority |

If a downstream deliverable conflicts with this specification on routing, rollout gating, or landing precedence, this specification takes precedence.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §7, §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
