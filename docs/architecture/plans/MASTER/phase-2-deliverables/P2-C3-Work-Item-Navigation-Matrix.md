# P2-C3: Work-Item Navigation Matrix

| Field | Value |
|---|---|
| **Doc ID** | P2-C3 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Specification |
| **Owner** | Experience / Shell + Product |
| **Update Authority** | Experience lead; changes require review by Product and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §9.3, §9.4, §10.3, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md); [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md); [interaction-contract §4–§5](../../../reference/work-hub/interaction-contract.md); [runway-definition §4](../../../reference/work-hub/runway-definition.md) |

---

## Specification Statement

Work items do not all open the same way. This specification defines the four locked destination patterns, maps each first-release source to its navigation behavior, establishes deep-link construction rules, specifies SPFx companion action boundaries, and documents fallback and return-continuity behavior. Navigation is governed by item type and source — not by user preference or lane position.

---

## Spec Scope

### This specification governs

- The four destination patterns for work-item navigation
- Per-source navigation pattern assignment
- Action type classification (navigation, feed mutation, domain mutation)
- Deep-link construction rules (`context.href`)
- SPFx companion action boundaries
- Project significance rule for Project Hub escalation
- Fallback behavior for missing or invalid deep links
- Return continuity from domain surfaces to hub

### This specification does NOT govern

- Ranking or scoring of items — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Source tranche classification — see [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md)
- Handoff criteria matrix (detailed project-significance scoring) — see P2-C4
- Notification-to-work signal mapping — see [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Destination pattern** | One of four approved navigation behaviors that determine where a user goes when acting on a work item |
| **Deep-link** | A relative-path URL (`context.href`) that navigates directly to the authoritative domain surface for a work item |
| **Preview** | A summary view of a work item (inline card or panel) shown before full navigation to the domain surface |
| **Project Hub escalation** | Navigation to Project Hub for work that is materially project-coordination-oriented |
| **Light action** | A single-step interaction that does not require multi-step workflow context (approved for SPFx companion) |
| **Project significance** | The degree to which a work item is project-coordination-oriented vs personal-action-oriented, determining whether it routes to Project Hub |

---

## 1. Four Destination Patterns

Phase 2 locks four allowed navigation patterns for work items. Every item type MUST use one or more of these patterns.

### Pattern 1: Direct Deep-Link

| Aspect | Specification |
|---|---|
| **Behavior** | Click/tap navigates directly to the authoritative domain surface via `context.href` |
| **When used** | Item has a known source surface and the user has `canOpen: true` |
| **Implementation** | `<a href={item.context.href}>` or `router.navigate({ to: item.context.href })` |
| **Example** | Provisioning request → `/accounting/requests/req-42` |

### Pattern 2: Preview/Summary First, Then Domain Open

| Aspect | Specification |
|---|---|
| **Behavior** | Item expands to show a summary card or detail panel; user then clicks "Open" to navigate to domain surface |
| **When used** | Item benefits from context preview before full navigation (e.g., complex workflow state) |
| **Implementation** | Inline expansion or reasoning drawer shows lifecycle, ranking reason, then "Open" action deep-links |
| **Example** | Health pulse item → preview shows project health metrics → "Open in Project Hub" |

### Pattern 3: Escalation into Project Hub

| Aspect | Specification |
|---|---|
| **Behavior** | Item navigates to Project Hub when the work is materially project-coordination-oriented |
| **When used** | Item passes the project significance rule (§6) |
| **Implementation** | `context.href` points to Project Hub route with project context |
| **Example** | Project-linked health pulse → `/project-hub/projects/{projectId}` |

### Pattern 4: Light In-Place Action

| Aspect | Specification |
|---|---|
| **Behavior** | User completes a single-step action without leaving the current surface |
| **When used** | Action is simple enough to complete in-place (e.g., acknowledge, dismiss) |
| **Implementation** | Feed mutation via `useMyWorkActions` — action modifies feed state without navigation |
| **Example** | Mark-read, acknowledge handoff, defer item |

### Pattern Rules

- Every work item MUST support at least Pattern 1 (direct deep-link) when `canOpen: true`.
- Pattern 4 (light in-place action) is the only pattern approved for SPFx companion (per P2-B0 first-release doctrine).
- Patterns are not mutually exclusive — an item may support deep-link AND light in-place actions.
- No additional destination patterns may be introduced without Architecture-lead approval.

---

## 2. Source Navigation Matrix

Each first-release source maps to its approved destination patterns:

| Source | Module Key | Primary Pattern | Secondary Patterns | Deep-Link Target |
|---|---|---|---|---|
| **Provisioning** | `provisioning` | Direct deep-link | Light action (mark-read, defer) | `/accounting/requests/{requestId}` or `/project-setup/new?mode=clarification-return&requestId={id}` |
| **Estimating Bid Readiness** | `estimating-bid-readiness` | Direct deep-link | Light action (mark-read, defer) | Estimating bid readiness view |
| **BD Score Benchmark** | `bd-score-benchmark` | Direct deep-link | Light action (mark-read, defer) | Business Development score dashboard |
| **BD Strategic Intelligence** | `bd-strategic-intelligence` | Direct deep-link | Light action (mark-read, defer) | Intelligence entry detail view |
| **Project Hub Health Pulse** | `project-hub-health-pulse` | Direct deep-link | Preview + Project Hub escalation | Project Hub health pulse view or `/project-hub/projects/{projectId}` |
| **Admin Escalations** | `admin` | Direct deep-link | Light action (mark-read) | Admin provisioning oversight page |

### Navigation Matrix Notes

- All sources support Pattern 1 (direct deep-link) as their primary navigation.
- All sources support Pattern 4 (light in-place actions) for feed mutations.
- Only **Project Hub Health Pulse** uses Pattern 2 (preview) and Pattern 3 (Project Hub escalation) — its items are project-coordination-oriented and may benefit from context preview.
- Notification-sourced items (P2-C2) navigate to the same deep-link targets as their BIC counterparts, using `actionUrl` from the notification event.

---

## 3. Action Type Classification

Three categories of actions exist. Each has distinct navigation and state implications.

**Reference:** [interaction-contract §5](../../../reference/work-hub/interaction-contract.md)

### 3.1 Navigation Actions

| Action | Modifies Feed State | Navigates | Permission | Examples |
|---|---|---|---|---|
| `open` | No | Yes — via `context.href` | `canOpen: true` | Open work item in domain surface |
| `view` | No | Yes | `canOpen: true` | View detail (same as open) |

### 3.2 Feed Mutations

| Action | Modifies Feed State | Navigates | Permission | Offline-Capable |
|---|---|---|---|---|
| `mark-read` | Yes — `isUnread: false` | No | `canAct: true` | Yes |
| `defer` | Yes — moves to `deferred` lane | No | `canAct: true` | Yes |
| `undefer` | Yes — returns to source lane | No | `canAct: true` | Yes |
| `pin-today` | Yes — elevates to `now` priority | No | `canAct: true` | Yes |
| `pin-week` | Yes — elevates to `soon` priority | No | `canAct: true` | Yes |
| `waiting-on` | Yes — moves to `waiting-blocked` | No | `canAct: true` | Yes |

### 3.3 Domain Mutations

| Behavior | Specification |
|---|---|
| **Where they happen** | At the source surface, NOT in the feed |
| **Feed impact** | Indirect — feed refreshes on return to reflect source changes |
| **Examples** | Approve request, retry provisioning, update score, acknowledge handoff |
| **Permission** | Governed by domain surface, not by feed `canAct` |

### 3.4 Classification Invariants

- Navigation actions are always available when `canOpen: true` — no additional permission check needed.
- Feed mutations are available when `canAct: true` — they modify feed state only, not domain data.
- Domain mutations are NOT feed actions — the hub does not own domain state (per [interaction-contract §4](../../../reference/work-hub/interaction-contract.md)).

---

## 4. Deep-Link Construction Rules

### 4.1 `context.href` Requirements

| Requirement | Rule |
|---|---|
| **Format** | Relative path starting with `/` (e.g., `/accounting/requests/req-42`) |
| **Cross-surface** | Same path resolves on PWA and SPFx (each surface adds its own origin) |
| **Source** | Set by the source adapter during item mapping |
| **Stability** | Must remain valid for the lifetime of the work item |
| **Query parameters** | Use `buildActionUrl(path, params)` for consistent formatting |

### 4.2 Per-Source Deep-Link Templates

| Source | URL Template | Parameters |
|---|---|---|
| Provisioning (request) | `/accounting/requests/{requestId}` | `requestId` from `context.recordId` |
| Provisioning (clarification) | `/project-setup/new?mode=clarification-return&requestId={id}` | `requestId`, `mode` |
| Estimating | `/estimating/bid-readiness/{pursuitId}` | `pursuitId` from `context.recordId` |
| BD Score Benchmark | `/business-development/scores/{pursuitId}` | `pursuitId` from `context.recordId` |
| BD Strategic Intelligence | `/business-development/intelligence/{entryId}` | `entryId` from `context.recordId` |
| Project Hub Health | `/project-hub/health/{projectId}` | `projectId` from `context.projectId` |
| Admin Escalations | `/admin/provisioning` | None — overview page |

### 4.3 Cross-App Navigation

When items link to a different app surface (e.g., provisioning item linking to accounting app), the URL uses the cross-app URL pattern from `apps/*/src/utils/crossAppUrls.ts`. The `getAdminAppUrl()` pattern serves as the template for constructing cross-workspace deep links.

---

## 5. SPFx Companion Action Boundaries

Per [P2-B0 First-Release Lane Doctrine](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

### 5.1 Approved SPFx Actions

| Action | Approved | Type |
|---|---|---|
| View count summary | ✅ | Display only |
| View limited item list | ✅ | Display only |
| `mark-read` | ✅ | Light action (single step) |
| Open in PWA (launch) | ✅ | Navigation to PWA |
| `defer` | ❌ | Requires hub context — PWA only |
| `pin-today` / `pin-week` | ❌ | Requires hub context — PWA only |
| `waiting-on` | ❌ | Requires hub context — PWA only |
| Domain mutations | ❌ | Requires domain surface — PWA only |

### 5.2 SPFx Navigation Rule

When an SPFx companion item needs deeper interaction:
- Show "Open in HB Intel" affordance
- Launch the PWA at the item's `context.href`
- SPFx MUST NOT attempt to render domain surfaces inline

### 5.3 SPFx Action Invariants

- SPFx companion supports only Pattern 4 (light in-place action) and "launch to PWA" navigation.
- SPFx MUST NOT implement Pattern 1, 2, or 3 — deeper workflow happens in PWA.
- The same `IMyWorkPermissionState` governs what actions are available; SPFx further restricts the set.

---

## 6. Project Significance Rule

Per Phase 2 Plan §9.4, work items are routed using a project significance rule:

### 6.1 Routing Decision

| Work Character | Destination | Rule |
|---|---|---|
| **Materially project-coordination-oriented** | Route toward Project Hub | Work that requires project-level context, cross-team coordination, or project-scoped decision-making |
| **Materially personal-action-oriented** | Remain in Personal Work Hub | Work that is owned by the user personally and can be completed without project-level context |

### 6.2 Per-Source Significance Assessment

| Source | Default Significance | Rationale |
|---|---|---|
| **Provisioning** | Personal-action | User acts on a specific request; project context is secondary |
| **Estimating Bid Readiness** | Personal-action | User reviews bid readiness for a specific pursuit |
| **BD Score Benchmark** | Personal-action | User reviews scoring for a specific pursuit |
| **BD Strategic Intelligence** | Personal-action | User reviews intelligence for a specific entry |
| **Project Hub Health Pulse** | **Project-coordination** | Health pulse is inherently about project-level status |
| **Admin Escalations** | Personal-action | Admin acts on specific failed provisioning |

### 6.3 Project Significance Invariants

- The project significance rule applies to navigation *destination*, not to feed *ranking*.
- Items that route to Project Hub MUST have a return path that preserves user context (per P2-B2 §6).
- Project Hub does NOT absorb Personal Work Hub work — it receives only project-coordination-oriented items (Phase 2 Plan §9.4).
- Detailed project-significance scoring criteria are defined in P2-C4.

---

## 7. Fallback and Error Behavior

### 7.1 Missing `context.href`

| Scenario | Behavior |
|---|---|
| `context.href` is `undefined` or empty | Item title is not a link; "Open" action is disabled; `canOpen` set to `false` |
| `context.href` is present but route doesn't exist | Standard 404 handling by the PWA router |

### 7.2 Permission Denial

| Scenario | Behavior |
|---|---|
| `canOpen: false` | "Open" action disabled; `cannotActReason` shown as tooltip (per P2-A3 §2.3) |
| `canAct: false` | Feed mutation actions disabled; navigation actions still available if `canOpen: true` |

### 7.3 Broken Deep Links

| Scenario | Behavior |
|---|---|
| Domain surface moved or renamed | Source adapter must update `context.href` on next feed refresh |
| Cross-app URL unavailable | Show error state with "Surface unavailable" message; offer return to hub |

---

## 8. Return Continuity

### 8.1 Hub-to-Domain-to-Hub Flow

Per [P2-B2 §6](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md):

1. User clicks "Open" on a work item → navigates to domain surface via `context.href`
2. User performs domain actions (approve, reject, update) at the source surface
3. User returns to hub via shell nav, browser back, or "Back to My Work" link
4. Hub restores team mode, filters, scroll position from session-state drafts
5. Feed refreshes to reflect domain mutations made in step 2

### 8.2 Return Invariants

- Domain mutations are reflected in the feed on refresh — the hub does not poll the domain surface in real-time.
- Return navigation MUST NOT redirect away from `/my-work` (per P2-A1 §1.2).
- Context handoff uses standard browser history and shell navigation — no custom return-stack management needed.

---

## 9. Team Mode Navigation

Navigation behavior is identical across all team modes:

| Aspect | Personal Mode | Team Mode | Delegated Mode |
|---|---|---|---|
| Deep-link target | Same `context.href` | Same `context.href` | Same `context.href` |
| `canOpen` | Per item permission | Per item permission | Per item permission |
| `canAct` (feed mutations) | Per item permission | **Read-only** (manager view) | **Read-only** (delegator view) |
| Domain surface behavior | Full interaction | Full interaction (if manager navigates) | Full interaction (if delegator navigates) |

### Team Mode Navigation Note

When a manager views team items and clicks "Open", they navigate to the same domain surface. Whether they can act at the domain surface depends on the domain's own permission model, not on the feed's `canAct` flag.

---

## 10. Acceptance Gate Reference

P2-C3 contributes evidence for the Handoff gate:

| Field | Value |
|---|---|
| **Gate** | Handoff gate |
| **Pass condition** | Project-significant work routes correctly to Project Hub and returns cleanly |
| **Evidence required** | Navigation matrix (this document), handoff criteria (P2-C4), navigation review, scenario tests |
| **Primary owner** | Product + Project surfaces |

---

## 11. Locked Decisions

| Decision | Locked Resolution | P2-C3 Consequence |
|---|---|---|
| Work-item navigation | **Varies by item type** | Per-source navigation matrix with 4 destination patterns |
| Project Hub handoff rule | **Use a project significance rule** | Project-coordination-oriented work routes to Project Hub |
| SPFx action model | **Light actions only** | SPFx companion limited to Pattern 4 + PWA launch |

---

## 12. Spec Precedence

| Deliverable | Relationship to P2-C3 |
|---|---|
| **P2-B0** — Lane Ownership | P2-C3 implements the lane model's "Item completion" and "Project/Domain handoff" rows with navigation patterns |
| **P2-C1** — Source Tranche Register | P2-C3 maps each P2-C1 source to its navigation patterns |
| **P2-C2** — Notification Mapping | Notification-sourced items use the same deep-link targets via `actionUrl` |
| **P2-C4** — Handoff Criteria Matrix | P2-C4 provides detailed project-significance scoring that P2-C3's escalation pattern (Pattern 3) uses |
| **P2-B2** — State Persistence | P2-B2 governs return-continuity state capture/restore referenced in §8 |

If a downstream deliverable introduces navigation behavior that conflicts with this specification, this specification takes precedence for destination patterns and SPFx boundaries.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §9.3, §9.4, §10.3](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
