# Leadership-as-View Model

**Purpose:** Define how leadership-facing visibility is delivered through role-aware Personal Work Hub views rather than a standalone leadership application.
**Date:** 2026-03-15
**Governing decision:** Roadmap v1.1 (2026-03-15) — Leadership value is delivered through role-aware visibility within the Personal Work Hub and Project Hub.

---

## 1. Principle

Leadership is a **supported audience**, not a standalone app-wave dependency. Leadership value is delivered through:
- role-specific Work Hub view projections,
- role-aware summary cards,
- portfolio-level attention surfaces,
- and drill-ins to Project Hub or downstream operational views.

The existing `@hbc/spfx-leadership` and `@hbc/features-leadership` packages remain as implementation containers for these role-aware surfaces. They do not constitute a separate app family in the delivery roadmap.

---

## 2. Role-Specific Work Hub Views

The Personal Work Hub supports three team modes (per `IMyWorkQuery.teamMode`):

| Team Mode | Who Sees It | What It Shows |
|-----------|------------|---------------|
| `personal` | All users (default) | Items the user personally owns or needs to act on |
| `delegated-by-me` | Any user who has delegated work | Items the user delegated to others |
| `my-team` | Executive role users | Items owned by the user's direct reports |

### Executive Landing

When an Executive role user lands on the Work Hub:
- Default view: `teamMode: 'my-team'` — team portfolio view
- Toggle available to switch between personal and team views
- Team feed result (`IMyWorkTeamFeedResult`) includes leadership-relevant counts:

| Count | Purpose |
|-------|---------|
| `totalCount` | Total items across the team |
| `agingCount` | Items that have been active beyond expected duration |
| `blockedCount` | Items in `blocked` state requiring intervention |
| `escalationCandidateCount` | Items that may need leadership attention |

---

## 3. Role-Aware Summary Cards

Leadership summary cards are compositions of `@hbc/ui-kit` primitives rendered with team-mode data. They are NOT leadership-specific components.

### Portfolio-level counts

| Card | Data Source | Display |
|------|-----------|---------|
| Team workload | `totalCount` from team feed | Total active items across direct reports |
| Aging items | `agingCount` from team feed | Items exceeding expected resolution time |
| Blocked items | `blockedCount` from team feed | Items requiring intervention or escalation |
| Escalation candidates | `escalationCandidateCount` | Items that ranking algorithm has flagged |

### Source breakdown

Items grouped by `sourceModule` to show work distribution:
- Provisioning: N active items
- Estimating: N active items
- Business Development: N active items
- Project Hub: N active items

---

## 4. Portfolio-Level Attention Surfaces

### Team feed panel

The team feed panel shows items sorted by:
1. Blocked status (blocked items first)
2. Age (oldest active items next)
3. Escalation candidacy
4. Standard ranking score

### Escalation surfacing

Items are escalation candidates when:
- `isBlocked: true` AND age > threshold
- Priority is `now` AND no action taken within expected window
- `rankingReason.primaryReason` indicates overdue or dependency impact

The `rankingReason` field provides explainability — leadership can see WHY an item needs attention.

### Project-linked grouping

Items with `context.projectId` can be grouped for a project portfolio view:
- Group by project → show per-project item counts and blocked items
- Drill into a project to see all team work items for that project

### Complexity gating

| Tier | What Leadership Sees |
|------|---------------------|
| Essential | Summary counts only (total, aging, blocked) |
| Standard | Full item list with state, owner, expected action |
| Expert | Full item list with ranking reason, lifecycle preview, source metadata |

---

## 5. Drill-Ins to Operational Views

Leadership users drill from the Work Hub into operational surfaces using existing navigation:

| Drill Path | How It Works |
|-----------|-------------|
| Team item → source workspace | "Open" action on any team item navigates via `context.href` to the relevant workspace |
| Project portfolio → Project Hub | Filter by `projectId`, then navigate to Project Hub workspace |
| Department view → department workspace | Filter by `sourceModule`, then navigate to Estimating, BD, etc. |
| Escalation → admin surface | Failed provisioning items link to Admin oversight page |

Navigation uses existing `context.href` deep links. No separate leadership routing is needed.

---

## 6. What Leadership Does NOT Get

- No standalone leadership application in the delivery roadmap
- No leadership-specific item class or adapter in `@hbc/my-work-feed`
- No leadership-only notification events
- No separate leadership dashboard outside the Work Hub
- No leadership-specific data model — the same `IMyWorkItem` and `IMyWorkFeedResult` serve all roles

---

## 7. Wave 1 Implementation Path

| Step | Deliverable | Depends On |
|------|------------|------------|
| 1 | Wire `HbcMyWorkFeed` with `teamMode: 'my-team'` in the leadership workspace | Work Hub landing route |
| 2 | Implement `IMyWorkTeamFeedResult` projections in the aggregation pipeline | Already designed in `aggregateFeed.ts` |
| 3 | Update `resolveRoleLandingPath()` to route Executive to Work Hub with team-mode default | PWA router update |
| 4 | Compose portfolio summary cards from `@hbc/ui-kit` primitives | `HbcMyWorkTile` with team-mode counts |
| 5 | Add project-linked grouping in the team feed panel | `IMyWorkQuery.projectId` filtering |

---

## Related Documents

- [Work Hub Runway Definition](./runway-definition.md) — overall scope and entry behavior
- [Work Hub Publication Model](./publication-model.md) — how workflows publish into the feed
- [Work Hub Interaction Contract](./interaction-contract.md) — data and interaction rules
- [Unified Blueprint §7.1](../../architecture/blueprint/HB-Intel-Unified-Blueprint.md) — locked UX doctrine
- [Roadmap v1.1 §10](../../architecture/blueprint/HB-Intel-Dev-Roadmap.md) — Leadership reframing note
