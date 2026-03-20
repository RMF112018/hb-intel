# P2-E1: Multi-Role Context Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-E1 |
| **Phase** | Phase 2 |
| **Workstream** | E — Multi-Role Context, Rollout, and Validation |
| **Document Type** | Governance Policy |
| **Owner** | Auth / Architecture + Experience / Shell |
| **Update Authority** | Architecture lead; changes require review by Auth lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §10.5, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-D1 §10](P2-D1-Role-to-Hub-Entitlement-Matrix.md); [P2-B1 §3](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md); [P2-D4](P2-D4-Delegated-and-Team-Lane-Governance-Note.md); [P2-B2 §2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); `roleMapping.ts` |

---

## Policy Statement

Users may hold multiple `@hbc/auth` roles simultaneously. This policy defines how multi-role users experience the Personal Work Hub: their landing is determined by their highest-precedence role, their entitlements are the additive union of all held roles, and their role context is preserved across sessions using a hybrid approach — last-selected preferences are retained when still valid, otherwise the system infers the best fit. All multi-role behavior is derived from the `resolvedRoles` array in `@hbc/auth` — no parallel role inference exists.

---

## Policy Scope

### This policy governs

- How multiple roles are resolved for a single user
- Active role context and precedence rules
- Additive entitlement model for multi-role users
- Role-context switching and preference preservation
- Landing behavior for multi-role combinations
- Team mode eligibility for multi-role users
- Session persistence of role context
- No-parallel-role-logic enforcement

### This policy does NOT govern

- Single-role entitlement definitions — see [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md)
- Root routing mechanics — see [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md)
- Team lane governance — see [P2-D4](P2-D4-Delegated-and-Team-Lane-Governance-Note.md)
- Project anchor and context scope — see P2-E2
- Pilot cohort selection — see P2-E5

---

## Definitions

| Term | Meaning |
|---|---|
| **Multi-role user** | A user whose `resolvedRoles` array contains more than one canonical role (e.g., `['Administrator', 'Executive']`) |
| **Active role context** | The primary role that determines landing path and default team mode. Determined by precedence order |
| **Role precedence** | The fixed evaluation order for landing resolution: `Administrator` > `Executive` > `Member` |
| **Additive entitlements** | The union of entitlements from all held roles — a multi-role user gets everything each individual role would get |
| **Role-context switching** | The user's ability to move between role-specific views (e.g., switching from admin workspace to personal work hub) |
| **Hybrid preservation** | The approach where the system preserves the user's last-selected context when still valid for their current roles, and infers the best fit when it's not |

---

## 1. Multi-Role Resolution

### 1.1 Resolution Pipeline

`@hbc/auth` resolves roles from identity during authentication:

| Step | Action | Source |
|---|---|---|
| 1 | MSAL authentication produces `AdapterIdentityPayload` | Auth adapter (MSAL, SPFx, Mock) |
| 2 | `mapIdentityToAppRoles()` extracts role indicators | `packages/auth/src/roleMapping.ts` |
| 3 | Canonical role names added to `resolvedRoles: string[]` | Role mapping logic |
| 4 | Stored in `NormalizedAuthSession.resolvedRoles` | Auth store |
| 5 | Consumed by shell, hub, and all role-aware components | `useAuthStore()` / `useAuthSessionSummarySelector()` |

### 1.2 Resolution Rules

| Indicator | Role Added |
|---|---|
| `isSiteAdmin: true` | `Administrator` |
| Member of `HB-Intel-Admins` provider group | `Administrator` |
| Member of `HB-Intel-Executives` provider group | `Executive` |
| No other indicators match | `Member` (default fallback) |

### 1.3 Valid Multi-Role Combinations

| Combination | `resolvedRoles` | Occurrence |
|---|---|---|
| Administrator only | `['Administrator']` | Site admins without executive role |
| Executive only | `['Executive']` | Executives without admin access |
| Member only | `['Member']` | Standard users |
| Administrator + Executive | `['Administrator', 'Executive']` | Site admins who are also executives |
| Administrator + Member | `['Administrator', 'Member']` | Site admins (Member is implicit) |
| Executive + Member | `['Executive', 'Member']` | Executives (Member is implicit) |
| All three | `['Administrator', 'Executive', 'Member']` | Site admin executives |

Note: `Member` is the default fallback — in practice, multi-role users are typically `Administrator + Executive` or `Administrator + Member`.

---

## 2. Active Role Context

### 2.1 Primary Role Determines Landing

The highest-precedence role in `resolvedRoles` determines the user's landing path. This is the **active role context** for landing purposes.

| Active Role Context | Landing Path | Default Team Mode |
|---|---|---|
| `Administrator` (highest precedence) | `/admin` | N/A (admin workspace) |
| `Executive` (second precedence) | `/my-work` | `my-team` |
| `Member` (default) | `/my-work` | `personal` |

### 2.2 Active Context vs Available Context

The active role context determines *where the user lands*. But all held roles contribute to *what the user can access*:

| Aspect | Governed By |
|---|---|
| **Landing path** | Highest-precedence role (active context) |
| **Card set** | Union of all role-eligible card sets |
| **Team modes** | Union of all role-eligible team modes |
| **Zone access** | Union (all zones available to all roles) |
| **SPFx visibility** | Union of all role-eligible SPFx cards |

---

## 3. Multi-Role Precedence

Per [P2-D1 §10](P2-D1-Role-to-Hub-Entitlement-Matrix.md):

| Precedence | Role | Landing Effect |
|---|---|---|
| 1 (highest) | `Administrator` | Lands at `/admin` |
| 2 | `Executive` | Lands at `/my-work` with `my-team` |
| 3 (default) | `Member` | Lands at `/my-work` with `personal` |

### Precedence Rules

- Precedence applies **only to landing path resolution** — it does not restrict entitlements.
- An `Administrator + Executive` user lands at `/admin` but retains Executive entitlements (team mode, team cards) when navigating to `/my-work`.
- Precedence is evaluated in `resolveRoleLandingPath()` — the first matching role in precedence order determines the path.

---

## 4. Additive Entitlements

Multi-role users receive the **union** of all role-eligible entitlements:

### 4.1 Entitlement Union Examples

| User Roles | Cards Available | Team Modes | Landing |
|---|---|---|---|
| `['Administrator']` | Personal analytics + admin oversight + utility | `personal`, `delegated-by-me` | `/admin` |
| `['Executive']` | Personal analytics + team portfolio + utility | `personal`, `delegated-by-me`, `my-team` | `/my-work` (team) |
| `['Member']` | Personal analytics + utility | `personal`, `delegated-by-me` | `/my-work` (personal) |
| `['Administrator', 'Executive']` | Personal analytics + admin oversight + team portfolio + utility | `personal`, `delegated-by-me`, `my-team` | `/admin` |
| `['Administrator', 'Executive', 'Member']` | All card categories | All team modes | `/admin` |

### 4.2 Additive Invariants

- Entitlements are **never subtracted** by role combination — holding `Administrator` does not remove `Executive` entitlements.
- The card registry checks all entries in `resolvedRoles`, not just the highest-precedence role.
- Team mode eligibility checks `resolvedRoles.includes('Executive')`, not the active role context for landing.

---

## 5. Role-Context Switching

Per Phase 2 §16 locked decision: **"Hybrid — preserve sensible/relevant last context, otherwise infer best fit."**

### 5.1 Switching Behavior

| Scenario | Behavior |
|---|---|
| **Administrator navigates to `/my-work`** | Hub loads with last-saved team mode (if valid for roles); if no saved mode and user has Executive role, defaults to `my-team`; otherwise `personal` |
| **User returns to `/admin` from `/my-work`** | Admin workspace loads normally; hub state preserved in session drafts for next `/my-work` visit |
| **User's role changes mid-session** (rare) | On next navigation, validate saved preferences against current `resolvedRoles`; discard invalid preferences |
| **User logs out and back in** | All drafts cleared on logout (P2-B2 §8); landing starts fresh from role precedence |

### 5.2 Hybrid Preservation Rules

| Rule | Specification |
|---|---|
| **Preserve when valid** | If the user's saved team mode is still valid for their current roles, restore it |
| **Infer when invalid** | If the saved team mode is no longer valid (e.g., Executive role removed, saved mode was `my-team`), infer best fit: fall back to `personal` |
| **Preserve card arrangement** | Saved card arrangement is role-validated on restore; ineligible cards are silently removed (P2-D5 §4.4) |
| **No forced context** | The system does not force a multi-role user into a specific context — it presents the best fit and lets them switch |

---

## 6. Landing by Multi-Role

Consolidated from [P2-B1 §3](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md):

| Role Combination | Landing Path | Default Team Mode | Rationale |
|---|---|---|---|
| `Administrator` only | `/admin` | N/A | Admin workspace is the primary surface |
| `Executive` only | `/my-work` | `my-team` | Personal Work Hub with team portfolio |
| `Member` only | `/my-work` | `personal` | Personal Work Hub |
| `Administrator + Executive` | `/admin` | N/A (admin workspace); `my-team` when visiting `/my-work` | Admin precedence; Executive entitlements preserved |
| `Administrator + Member` | `/admin` | N/A; `personal` when visiting `/my-work` | Admin precedence |
| `Executive + Member` | `/my-work` | `my-team` | Executive precedence |
| All three | `/admin` | N/A; `my-team` when visiting `/my-work` | Admin precedence; all entitlements |

### Landing Invariant

`resolveRoleLandingPath()` is the single landing resolver. No component may bypass it to create role-specific landing behavior.

---

## 7. Team Mode for Multi-Role Users

| User Has Role | `personal` | `delegated-by-me` | `my-team` |
|---|---|---|---|
| `Administrator` only | ✅ (from `/my-work`) | ✅ (if has delegations) | ❌ |
| `Executive` only | ✅ | ✅ (if has delegations) | ✅ (default) |
| `Member` only | ✅ (default) | ✅ (if has delegations) | ❌ |
| `Administrator + Executive` | ✅ | ✅ (if has delegations) | ✅ (via Executive role) |
| `Executive + Member` | ✅ | ✅ (if has delegations) | ✅ (default) |

### Team Mode Resolution for Multi-Role

- `my-team` availability is determined by `resolvedRoles.includes('Executive')` — not by the active role context.
- An `Administrator + Executive` user can access `my-team` mode when they navigate to `/my-work`, even though their landing is `/admin`.
- Default team mode on first visit follows the highest-precedence hub-landing role: if `Executive` is present, default is `my-team`.

---

## 8. Session Persistence of Role Context

Per [P2-B2 §2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md):

| Preference | Draft Key | TTL | Validation |
|---|---|---|---|
| Last-selected team mode | `hbc-my-work-team-mode` | 16h | Validated against current `resolvedRoles` on restore |
| Card arrangement | `hbc-my-work-card-arrangement` | 30 days | Ineligible cards silently removed on restore |
| Filter context | `hbc-my-work-filter-state` | 8h | No role validation needed (filters are content-based) |

### Persistence Rules

- All hub state is persisted to `@hbc/session-state` IndexedDB drafts — not to the auth session.
- On restore, team mode is checked: if saved mode requires a role the user no longer has, the mode is discarded and the system infers best fit.
- Card arrangement is checked: cards for roles the user no longer has are silently removed; remaining layout is preserved.
- Logout clears all hub drafts (P2-B2 §8.1).

---

## 9. No Parallel Role Logic

Per [P2-D1 §11](P2-D1-Role-to-Hub-Entitlement-Matrix.md) (Role-Governance Enforcement):

### Enforcement Rules

| Rule | Specification |
|---|---|
| **Single source** | All role checks reference `resolvedRoles` from `@hbc/auth` |
| **No custom enums** | No feature-local role constants, enums, or role-name strings outside `@hbc/auth` |
| **No inference** | Components do not infer roles from behavior (e.g., "user has team items, must be Executive") — role checks are explicit |
| **No elevation** | No mechanism to grant a user role-level entitlements without the corresponding `resolvedRoles` entry |
| **Audit path** | All role-based behavior can be traced to `resolvedRoles` → entitlement check → UI behavior |

### Multi-Role Compliance

For multi-role scenarios specifically:
- The union of entitlements is computed from `resolvedRoles`, not from a custom "effective role" concept.
- No component creates a "combined role" or "super role" abstraction — each entitlement check individually tests `resolvedRoles.includes(roleName)`.
- Role precedence for landing is computed in `resolveRoleLandingPath()` only — nowhere else.

---

## 10. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Role-governance gate |
| **Pass condition** | Role behavior is enforced from `@hbc/auth` rules and not parallel custom logic |
| **P2-E1 evidence** | Multi-role resolution uses `resolvedRoles` only (§1); no parallel role logic (§9); additive entitlements from auth roles (§4) |
| **Primary owner** | Auth / Architecture |

P2-E1 contributes to the same gate as P2-D1. Together they provide complete evidence that all role behavior — single-role and multi-role — is derived from `@hbc/auth`.

---

## 11. Locked Decisions

| Decision | Locked Resolution | P2-E1 Consequence |
|---|---|---|
| Multi-role governance source | **`@hbc/auth` role definitions** | All multi-role behavior from `resolvedRoles` |
| Multi-role default | **Primary active role context** | Highest-precedence role determines landing |
| Role-context switching | **Hybrid — preserve sensible/relevant last context, otherwise infer best fit** | Saved preferences validated against current roles; invalid preferences inferred |
| Delegated/team lanes | **Limited and only for eligible elevated roles** | `my-team` available to multi-role users only if `Executive` is in their role set |

---

## 12. Policy Precedence

| Deliverable | Relationship to P2-E1 |
|---|---|
| **P2-D1** — Role-to-Hub Entitlement Matrix | P2-E1 extends P2-D1's single-role matrix to multi-role combinations; additive union model |
| **P2-B1** — Root Routing Spec | P2-E1 consolidates the multi-role landing table from P2-B1 §3 |
| **P2-D4** — Delegated/Team Governance | P2-E1 specifies team mode availability for multi-role users |
| **P2-D5** — Personalization Policy | P2-E1 confirms role-context persistence uses P2-D5 saved-view mechanism |
| **P2-B2** — State Persistence | P2-E1 role-context persistence uses P2-B2 draft storage with role validation |
| **P2-E2** — Project Anchor Policy | P2-E2 defines how project context interacts with role context for multi-role users |

If a downstream deliverable introduces multi-role behavior that conflicts with this policy, this policy takes precedence.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §10.5, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
