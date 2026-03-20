# P2-D1: Role-to-Hub Entitlement Matrix

| Field | Value |
|---|---|
| **Doc ID** | P2-D1 |
| **Phase** | Phase 2 |
| **Workstream** | D — Role Governance, Analytics Expansion, and Personalization |
| **Document Type** | Governance Policy |
| **Owner** | Auth / Architecture + Experience / Shell |
| **Update Authority** | Architecture lead; changes require review by Auth lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §10.4, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1 §5](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A3 §5](P2-A3-Work-Item-Explainability-and-Visibility-Rules.md); [P2-B1 §3](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md); [leadership-visibility-model](../../../reference/work-hub/leadership-visibility-model.md); `roleMapping.ts`; `ShellCore.tsx` |

---

## Policy Statement

All Personal Work Hub entitlements — landing path, team modes, zone access, card eligibility, visibility scope, and personalization permissions — are derived from `@hbc/auth` resolved roles. This matrix is the single authoritative mapping from roles to hub entitlements. No parallel role-checking logic, custom role enums, or entitlement systems outside `@hbc/auth` are permitted.

---

## Policy Scope

### This policy governs

- Canonical role vocabulary and resolution pipeline
- Per-role entitlements across all hub dimensions
- Team mode eligibility by role
- Zone access and card set eligibility by role
- SPFx companion visibility scope by role
- Personalization permissions by role
- Multi-role precedence rules
- Role-governance enforcement rules

### This policy does NOT govern

- Adaptive layout zone composition — see P2-D2
- Analytics card governance — see P2-D3
- Delegated and team lane governance — see P2-D4
- Personalization policy and saved-view rules — see P2-D5
- Ranking coefficients — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Root routing mechanics — see [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Resolved role** | A canonical role name (`Administrator`, `Executive`, `Member`) assigned to a user by `@hbc/auth` role resolution during authentication |
| **Entitlement** | A hub capability or visibility scope granted to a user based on their resolved roles |
| **Team mode** | A feed query projection (`personal`, `delegated-by-me`, `my-team`) that determines which items the user sees |
| **Zone** | A page region in the Personal Work Hub: primary (task runway), secondary (analytics/oversight), tertiary (quick actions/tools) |
| **Card set** | The collection of secondary/tertiary card types available to a role for hub composition |
| **Multi-role precedence** | The order in which roles are evaluated when a user holds multiple roles |

---

## 1. Canonical Role Vocabulary

### 1.1 Role Definitions

Three canonical roles are defined in `@hbc/auth`:

| Role | Resolution Criteria | Source |
|---|---|---|
| `Administrator` | User has `isSiteAdmin: true` OR is a member of the `HB-Intel-Admins` provider group | `packages/auth/src/roleMapping.ts` |
| `Executive` | User is a member of the `HB-Intel-Executives` provider group | `packages/auth/src/roleMapping.ts` |
| `Member` | Default fallback — assigned when no other role applies | `packages/auth/src/roleMapping.ts` |

### 1.2 Resolution Pipeline

1. MSAL authentication produces an `AdapterIdentityPayload`
2. `mapIdentityToAppRoles()` extracts provider hints (`isSiteAdmin`, `providerGroupRefs`)
3. Canonical role names are assigned to `resolvedRoles: string[]`
4. Stored in `NormalizedAuthSession.resolvedRoles` via `useAuthStore()`
5. Consumed by `resolveRoleLandingPath()` and hub components via `useAuthSessionSummarySelector()`

### 1.3 Role Vocabulary Invariants

- These three roles are the only recognized canonical roles for Phase 2.
- Adding a new role requires `@hbc/auth` package update, Architecture review, and P2-D1 matrix update.
- Role names are strings, not enums — extensible without type-system changes.
- A user may hold multiple roles (e.g., `['Administrator', 'Executive']`).

---

## 2. Role-to-Hub Entitlement Matrix

This is the central authoritative matrix. All entitlement decisions reference this table.

| Entitlement Dimension | Administrator | Executive | Member |
|---|---|---|---|
| **Landing path** | `/admin` | `/my-work` | `/my-work` |
| **Default team mode** | N/A (admin workspace) | `my-team` | `personal` |
| **`personal` mode** | Available (if navigates to `/my-work`) | ✅ Available | ✅ Available (default) |
| **`delegated-by-me` mode** | Available (if has delegations) | ✅ Available (if has delegations) | ✅ Available (if has delegations) |
| **`my-team` mode** | Available (if navigates to `/my-work`) | ✅ Available (default) | ❌ Not available |
| **Primary zone** | ✅ Visible | ✅ Visible | ✅ Visible |
| **Secondary zone** | ✅ Visible (role-aware cards) | ✅ Visible (team + analytics cards) | ✅ Visible (personal analytics cards) |
| **Tertiary zone** | ✅ Visible | ✅ Visible | ✅ Visible |
| **Team portfolio counts** | Available (if in my-team mode) | ✅ Available (`agingCount`, `blockedCount`, `escalationCandidateCount`) | ❌ Not available |
| **Complexity tiers** | All 3 tiers available | All 3 tiers available | All 3 tiers available |
| **SPFx companion: counts** | ✅ | ✅ | ✅ |
| **SPFx companion: summary cards** | ✅ | ✅ (includes team summary) | ✅ |
| **SPFx companion: limited item list** | ✅ | ✅ | ✅ |
| **SPFx companion: light actions** | ✅ (mark-read) | ✅ (mark-read) | ✅ (mark-read) |
| **Personalization: reorder cards** | ✅ (secondary/tertiary) | ✅ (secondary/tertiary) | ✅ (secondary/tertiary) |
| **Personalization: save view preferences** | ✅ | ✅ | ✅ |
| **Personalization: choose from card set** | ✅ (admin + general cards) | ✅ (team + general cards) | ✅ (general cards) |
| **Reasoning drawer access** | ✅ (own items) | ✅ (own + team items) | ✅ (own items) |
| **Team item visibility** | Read-only (if in my-team mode) | ✅ Read-only (default in my-team mode) | ❌ Not available |
| **Act on team items** | Only if also the item owner | Only if also the item owner | N/A |

---

## 3. Landing Path by Role

Consolidated from [P2-B1 §3](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md):

| Role | Landing Path | Team Mode | Feed Behavior |
|---|---|---|---|
| `Administrator` | `/admin` | N/A | Admin workspace (unchanged) |
| `Executive` | `/my-work` | `my-team` default, personal toggle | Hybrid: team portfolio first, personal available |
| `Member` | `/my-work` | `personal` | Personal work feed |
| Multi-role (`Administrator` + `Executive`) | `/admin` | N/A | Administrator takes precedence |
| Multi-role (`Executive` + `Member`) | `/my-work` | `my-team` | Executive takes precedence |

### Landing Invariant

`resolveRoleLandingPath()` in `packages/shell/src/ShellCore.tsx` is the single source of landing resolution. No other component may independently resolve landing paths from roles.

---

## 4. Team Mode Eligibility

| Team Mode | Eligibility | Default For |
|---|---|---|
| `personal` | All roles | `Member` |
| `delegated-by-me` | All roles with active delegations | None (available as toggle) |
| `my-team` | `Executive` role only | `Executive` |

### Eligibility Rules

- `my-team` is restricted to users with `Executive` in their `resolvedRoles`. No other role gets team-mode access.
- `delegated-by-me` is available to any user who has delegated work — it is not role-gated, it is data-gated.
- If an `Executive` user's role is revoked, `my-team` mode becomes unavailable on next session. Persisted team-mode draft (P2-B2) is validated against current role on restore.
- `Administrator` users who navigate to `/my-work` can access `personal` and `my-team` (if also `Executive`), but their default landing is `/admin`.

---

## 5. Zone Access by Role

Per [P2-A1 §1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) (Invariant Operating Rules):

| Zone | Access Rule |
|---|---|
| **Primary zone** | All roles — invariant, always visible, cannot be removed or displaced |
| **Secondary zone** | All roles — visible with role-appropriate card set |
| **Tertiary zone** | All roles — visible with role-appropriate quick actions |

### Zone Invariant

The primary zone is not role-gated — every user who reaches `/my-work` sees the personal work runway. Role differences are expressed through card set availability in secondary/tertiary zones, not through zone visibility.

---

## 6. Card Set Eligibility

Secondary and tertiary zone cards are drawn from role-appropriate card sets:

| Card Category | Administrator | Executive | Member |
|---|---|---|---|
| **Personal work runway cards** | ✅ | ✅ | ✅ |
| **Personal analytics cards** | ✅ | ✅ | ✅ |
| **Team portfolio summary cards** | Available (if Executive) | ✅ | ❌ |
| **Aging/blocked/escalation cards** | Available (if Executive) | ✅ | ❌ |
| **Admin oversight cards** | ✅ | ❌ | ❌ |
| **Quick action shortcuts** | ✅ | ✅ | ✅ |
| **Recent context cards** | ✅ | ✅ | ✅ |

### Card Set Rules

- Card availability is determined by `resolvedRoles` at hub render time.
- Users may choose from their eligible card set for secondary/tertiary zones (per P2-D5 personalization rules).
- Users MUST NOT see cards outside their entitlement — the card registry checks role eligibility.
- Detailed card governance (which specific cards exist, their data sources, and composition rules) is defined in P2-D3.

---

## 7. Complexity Gating

The three complexity tiers from `@hbc/complexity` are available to **all roles**:

| Tier | Available To | What It Shows |
|---|---|---|
| `Essential` | All roles | Summary counts, basic item list, simple staleness label |
| `Standard` | All roles | Full item list with state/owner/action, source counts |
| `Expert` | All roles | Full list + ranking reason, lifecycle preview, per-source health |

### Gating Invariant

Complexity tiers are user-preference-driven, not role-gated. An `Executive` in `Essential` mode sees simplified counts just like a `Member` in `Essential` mode. The difference is in *what data* is available (team portfolio counts are Executive-only), not in *how detailed* the display is.

---

## 8. SPFx Companion Visibility by Role

Per [P2-B0 First-Release Lane Doctrine](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

| Visibility | Administrator | Executive | Member |
|---|---|---|---|
| Personal work counts | ✅ | ✅ | ✅ |
| Summary cards | ✅ | ✅ | ✅ |
| Limited item list | ✅ | ✅ | ✅ |
| Team portfolio summary | Available (if Executive) | ✅ | ❌ |
| Light actions (mark-read) | ✅ | ✅ | ✅ |
| "Open in HB Intel" launch | ✅ | ✅ | ✅ |

### SPFx Invariant

SPFx companion visibility is a subset of PWA visibility for the same role — SPFx never shows more than PWA would show. Team summary on SPFx is restricted to `Executive` role, matching the PWA entitlement.

---

## 9. Personalization Permissions by Role

Per [P2-A1 §1.3](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) (Personalization Boundaries):

| Permission | Administrator | Executive | Member |
|---|---|---|---|
| Reorder secondary/tertiary cards | ✅ | ✅ | ✅ |
| Resize cards within governed limits | ✅ | ✅ | ✅ |
| Choose from role-eligible card set | ✅ | ✅ | ✅ |
| Save view preferences | ✅ | ✅ | ✅ |
| Remove primary zone | ❌ | ❌ | ❌ |
| Surface cards outside entitlement | ❌ | ❌ | ❌ |
| Turn home into freeform dashboard | ❌ | ❌ | ❌ |

### Personalization Invariant

Personalization permissions are the same for all roles — the boundaries are universal (P2-A1 §1.3). The only role-dependent aspect is which cards are available in the eligible set (§6). Detailed personalization rules are defined in P2-D5.

---

## 10. Multi-Role Precedence

When a user holds multiple roles, precedence determines landing and entitlement resolution:

| Precedence | Role | Effect |
|---|---|---|
| 1 (highest) | `Administrator` | Lands at `/admin`; all admin-specific entitlements apply |
| 2 | `Executive` | Lands at `/my-work` with `my-team`; team portfolio entitlements apply |
| 3 (default) | `Member` | Lands at `/my-work` with `personal`; standard entitlements apply |

### Multi-Role Rules

- Landing uses highest-precedence role. An `Administrator` + `Executive` user lands at `/admin`.
- Entitlements are **additive** — a user with both `Administrator` and `Executive` roles has admin cards AND team portfolio cards available when they navigate to `/my-work`.
- Team mode eligibility is determined by the presence of `Executive` in `resolvedRoles`, regardless of precedence — an `Administrator` who is also `Executive` can access `my-team` mode.
- Per Phase 2 §16 locked decision: "Multi-role default: Primary active role context."

---

## 11. Role-Governance Enforcement

### 11.1 Enforcement Rules

| Rule | Specification |
|---|---|
| **Single source** | All entitlement decisions MUST reference `resolvedRoles` from `@hbc/auth` |
| **No parallel logic** | No component may create its own role-checking, role-mapping, or entitlement logic outside the auth package |
| **No custom enums** | Role names are strings from `@hbc/auth`; no feature-local role enums or constants |
| **Landing resolution** | `resolveRoleLandingPath()` in `ShellCore.tsx` is the single landing resolver |
| **Team mode check** | Team mode eligibility checks `resolvedRoles.includes('Executive')` — no custom role inference |

### 11.2 Compliance Verification

To verify role-governance compliance:
1. Search the codebase for role string literals outside `@hbc/auth` and `@hbc/shell` — none should exist
2. Verify all team-mode checks reference `resolvedRoles` from the auth store
3. Verify no component creates local role definitions, role constants, or role enums
4. Verify `resolveRoleLandingPath()` remains the only landing resolver

---

## 12. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Role-governance gate |
| **Pass condition** | Role behavior is enforced from `@hbc/auth` rules and not parallel custom logic |
| **Evidence required** | Entitlement matrix (this document), role validation, review signoff |
| **Primary owner** | Auth / Architecture |

### Gate Evidence

- Canonical role vocabulary defined and limited to 3 roles ✓
- Entitlement matrix maps every hub dimension to `resolvedRoles` ✓
- Enforcement rules prohibit parallel role logic ✓
- Compliance verification steps documented ✓
- Signoff: pending Architecture and Auth lead review

---

## 13. Locked Decisions

| Decision | Locked Resolution | P2-D1 Consequence |
|---|---|---|
| Multi-role governance source | **`@hbc/auth` role definitions** | All entitlements derive from `resolvedRoles` |
| Multi-role default | **Primary active role context** | Highest-precedence role determines landing |
| Role-context switching | **Hybrid — preserve last context, otherwise infer best fit** | Team mode persists in session; validated against role on restore |
| Delegated/team lanes | **Limited and only for eligible elevated roles** | `my-team` restricted to `Executive` |
| Analytics scope | **Expand by role elevation, governed by `@hbc/auth` role definitions** | Team portfolio cards available only to `Executive` |

---

## 14. Policy Precedence

| Deliverable | Relationship to P2-D1 |
|---|---|
| **P2-A1** — Operating Model Register | P2-D1 maps roles to the invariant zones and visibility model defined in P2-A1 |
| **P2-A3** — Explainability Rules | P2-D1 confirms the role-based entitlement rules in P2-A3 §5 |
| **P2-B1** — Root Routing Spec | P2-D1 consolidates the landing path table from P2-B1 §3 |
| **P2-D2** — Adaptive Layout | P2-D2 must respect zone access rules defined here |
| **P2-D3** — Analytics Card Governance | P2-D3 must respect card set eligibility defined here |
| **P2-D4** — Delegated/Team Governance | P2-D4 must respect team mode eligibility defined here |
| **P2-D5** — Personalization Policy | P2-D5 must operate within personalization permissions defined here |

If a downstream deliverable introduces role-based behavior that conflicts with this matrix, this matrix takes precedence.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §10.4, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
