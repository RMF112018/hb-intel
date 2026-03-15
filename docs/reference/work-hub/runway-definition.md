# Personal Work Hub — Runway Definition

**Purpose:** Master specification for the Personal Work Hub operating layer — scope, entry behavior, routing, navigation, and display hierarchy.
**Date:** 2026-03-15
**Governing doctrine:** Unified Blueprint §7.1 (locked Interview Decision 3) — "The first thing a user sees when opening HB Intel is oriented around their own work."
**Implementation primitive:** `@hbc/my-work-feed` (SF29, ADR-0115)

---

## 1. What Is the Personal Work Hub

The Personal Work Hub is the **primary UX layer** for HB Intel. It is not a separate application — it is a user-facing operating layer that spans the PWA shell and integrates with all workspace surfaces.

It answers the user's core question: **"What do I need to do right now?"**

The Work Hub is powered by `@hbc/my-work-feed`, which aggregates work items from all registered modules through three existing adapters (BIC, handoff, notification), normalizes them into a canonical model, ranks them deterministically, and presents them across a consistent display hierarchy.

---

## 2. Publication Categories

The Work Hub surfaces seven categories of personal work, each mapped to the existing My Work Feed model:

| User Category | Feed Implementation | Item Class | Lane | How Populated |
|---------------|-------------------|------------|------|---------------|
| **Waiting on Me** | BIC items where user is current owner + state `active` or `new` | `owned-action` | `do-now` | BIC adapter (weight 0.9) |
| **Waiting on Others** | Items where user is owner but state is `waiting` or `blocked` with external dependency | `owned-action` | `waiting-blocked` | BIC adapter with `isBlocked: true` |
| **Recent Activity** | Items sorted by `updatedAtIso` descending | Any class | Any lane | All adapters, query sorted by recency |
| **Important State Changes** | Notification events with `immediate` tier | `attention-item` | `do-now` | Notification adapter (weight 0.5) |
| **Escalations / Attention Needed** | BIC items with `isBlocked: true` or priority `now` | `owned-action` | `do-now` | BIC adapter, blocked subset |
| **Project-Linked Work** | Items filtered by `context.projectId` | Any class | Any lane | All adapters, query by `projectId` |
| **Notifications / Ownership Changes** | Notification adapter items + handoff adapter items | `attention-item`, `inbound-handoff` | `do-now` or `watch` | Notification + handoff adapters |

These categories are **query projections** over the same canonical model, not separate data stores.

---

## 3. User-Entry Behavior

### Default Landing

| Current State (Wave 0) | Wave 1 Target |
|------------------------|---------------|
| `/` redirects to `/project-hub` | `/` redirects to `/my-work` (Personal Work Hub) |

**Recommended implementation:** New `/my-work` route as the default PWA landing. This route renders `HbcMyWorkFeed` with the user's personal feed as the primary view.

### Role-Specific Entry

| Role | Landing Route | Feed Mode |
|------|--------------|-----------|
| Default (all users) | `/my-work` | Personal feed (`teamMode: 'personal'`) |
| Administrator | `/admin` | Admin workspace (existing) |
| Executive | `/my-work` | Team feed (`teamMode: 'my-team'`) |

### Post-Auth Navigation Flow

1. **Priority 1:** Redirect memory — if the user was redirected to auth from a specific page, return them there
2. **Priority 2:** Role-based landing — `resolveRoleLandingPath(resolvedRoles)` returns the appropriate route
3. **Priority 3:** Default — `/my-work`

**Reference:** `apps/pwa/src/router/root-route.tsx`

---

## 4. Cross-App Navigation

### Work Hub → Workspace

Every work item carries `context.href` — a deep link to the authoritative source surface. The "Open" action navigates to the workspace where the item lives:

| Item Source | Navigation Target |
|------------|-------------------|
| Provisioning request | Estimating or Accounting request detail page |
| Bid readiness signal | Estimating bid readiness view |
| Score benchmark action | Business Development score dashboard |
| Health pulse indicator | Project Hub health pulse view |
| Admin escalation | Admin provisioning oversight page |

### Workspace → Work Hub

Workspace surfaces include a "Back to My Work" affordance via shell navigation. The shell nav item for the Work Hub is always available in the sidebar.

### Project Drill-Down

Work Hub item → workspace page → project detail. Items with `context.projectId` can be grouped for a project-level view before drilling into specific workspace surfaces.

### Cross-App URL Pattern

Existing `getAdminAppUrl()` pattern in `apps/*/src/utils/crossAppUrls.ts` serves as the template for cross-workspace deep links.

---

## 5. Display Hierarchy

The Work Hub renders across five UI surfaces, all drawing from the same `IMyWorkFeedResult` computation (ADR-0115 D-07 — multi-surface count consistency):

| Surface | Component | Purpose | Count Source |
|---------|-----------|---------|-------------|
| Badge | `HbcMyWorkBadge` | Shell header — unread/actionable count | `unreadCount` or `nowCount` |
| Launcher | `HbcMyWorkLauncher` | Opens tile or panel; carries badge | Same as badge |
| Tile | `HbcMyWorkTile` | Compact summary — count breakdown | `IMyWorkFeedResult` counts |
| Panel | `HbcMyWorkPanel` | Slide-out with full item list | Full `items[]` |
| Full Feed | `HbcMyWorkFeed` | Dedicated `/my-work` page with filtering, search, team toggle | Full feed with `IMyWorkQuery` |

All surfaces share one computation. Badge count, panel count, and full feed count are guaranteed consistent.

---

## 6. Wave 1 Implementation Checklist

1. Create `/my-work` route in `apps/pwa/src/router/workspace-routes.ts`
2. Update `resolveRoleLandingPath()` to return `/my-work` as default
3. Wire `HbcMyWorkFeed` component at the `/my-work` route
4. Add "My Work" nav item to `packages/shell/src/module-configs/nav-config.ts`
5. Ensure all Wave 1 modules register their BIC modules at app bootstrap
6. Wire `HbcMyWorkBadge` into the PWA shell header
7. Implement team-mode projection for Executive role landing

---

## Related Documents

- [Work Hub Publication Model](./publication-model.md) — how workflows publish into the feed
- [Work Hub Interaction Contract](./interaction-contract.md) — data and interaction rules
- [Leadership Visibility Model](./leadership-visibility-model.md) — role-aware leadership views
- [Provisioning-to-Work-Hub Publication Contract](../provisioning/work-hub-publication-contract.md) — provisioning-specific publication
- [My Work Alignment Contract](../workflow-experience/my-work-alignment-contract.md) — provisional alignment contract
- [ADR-0115](../../architecture/adr/ADR-0115-my-work-feed-architecture.md) — architecture decisions
