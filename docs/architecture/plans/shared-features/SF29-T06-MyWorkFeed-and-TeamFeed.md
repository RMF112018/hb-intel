# SF29-T06 - MyWork Feed and Team Feed

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01, L-02, L-04, L-05, L-06, L-07, L-09, L-10
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T04-T05

> **Doc Classification:** Canonical Normative Plan - SF29-T06 feed-surface task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Define the full queue-management surfaces and manager-oversight surfaces that project the same canonical item model used by launcher, badge, tile, and panel.

---

## Surface Contracts

- `HbcMyWorkFeed`
  - full workspace feed with grouping, filtering, search, sorting, and future saved-view compatibility
- `HbcMyWorkTeamFeed`
  - delegated-by-me, my-team, and escalation-candidate oversight surface
- `HbcMyWorkTile`
  - compact project-canvas projection with top urgent items and grouped counts
- `HbcMyWorkListItem`
  - canonical item renderer reused across tile, panel, feed, and team feed
- `HbcMyWorkReasonDrawer`
  - why-here, why-ranked, can/can't-act, what-next detail surface
- `HbcMyWorkSourceHealth`
  - expert diagnostic surface for partial sources, hidden superseded items, and freshness state
- `HbcMyWorkEmptyState`
  - role-aware caught-up and no-results guidance

---

## UI Composition Rule

Prefer reuse of:

- `HbcCard`
- `HbcEmptyState`
- `HbcStatusBadge`
- `HbcButton`
- `HbcPopover`
- `HbcTearsheet`
- `HbcTypography`
- `HbcCommandBar`
- `HbcDataTable` only where the full-feed density justifies table affordances

Tile, feed, team-feed grouping logic, reason-drawer content, and source-health projection remain SF29-specific.

---

## Behavior Requirements

- full feed supports grouping by priority, project, module, and owner where applicable
- feed and team feed must render the same canonical item shape; only grouping and oversight emphasis vary
- reason drawer must show:
  - why the item surfaced
  - why it is ranked here
  - what changed since last viewed
  - whether the user can act, and if not, why not
  - what dependency, workflow step, or record is next
- tile must remain compact and project-aware without redefining ranking logic
- team feed must never fork item truth from the personal feed

---

## Mobile and Field Rules

- mobile condensed view favors top-N urgent items, one-thumb actions, and reduced disclosure
- desktop feed may expose richer grouping/filter controls
- differences in layout must not change source truth, ranking, or count semantics

---

## Verification Commands

```bash
pnpm --filter @hbc/my-work-feed test -- feed
pnpm --filter @hbc/my-work-feed test -- team-feed
pnpm --filter @hbc/my-work-feed test -- reason-drawer
pnpm --filter @hbc/my-work-feed test -- tile
```
