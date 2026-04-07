# Phase 1B — Featured/Recent Kudos and Priority Truth Table

> **Status:** Canonical featured/recent selection and priority logic for the People & Culture webpart.
> **Governing architecture:** `00_Architecture/People_Culture_Kudos_Merged_Architecture.md`
> **Visibility rules:** `phase-1B/phase-1B-visibility-approval-and-aging-rules.md`
> **Content model:** `phase-1A/phase-1A-merged-content-model.md`

---

## Featured Kudos Selection

### Rule

The **featured Kudos** is the single most prominent recognition item displayed in the Kudos Module spotlight area.

Selection logic:

1. Start with all homepage-visible approved Kudos (filtered by the visibility rules in the companion document)
2. If any visible item has `isPinned = true`, the **most recently approved pinned item** becomes featured
3. If no pinned items, the **most recently approved visible item** becomes featured
4. If zero visible items, the featured slot is empty — show the Kudos empty state with Give Kudos CTA

### Featured selection pseudocode

```
function selectFeaturedKudos(visibleItems):
  if visibleItems is empty:
    return null

  pinned = visibleItems.filter(item => item.isPinned === true)

  if pinned is not empty:
    return pinned.sort(by approvedDate descending)[0]

  return visibleItems.sort(by approvedDate descending)[0]
```

### Featured slot rules

- Exactly **0 or 1** featured item at any time
- The featured item is **not duplicated** in the recent headlines list
- If the featured item is unpinned or ages off, the next eligible item automatically promotes to featured
- No manual "feature this" editorial action exists — featured is always computed from the sort rules above

---

## Recent Kudos Headlines Selection

### Rule

The **recent Kudos headlines** are the compact recognition items displayed below or beside the featured spotlight.

Selection logic:

1. Start with all homepage-visible approved Kudos (same filtered set as featured selection)
2. Remove the featured item from the set
3. Sort remaining items by: pinned first, then `approvedDate` descending
4. Take the first **3 to 6** items

### Recent headlines selection pseudocode

```
function selectRecentKudosHeadlines(visibleItems, featuredItem, maxHeadlines = 6):
  if featuredItem is null:
    return []

  remaining = visibleItems.filter(item => item.id !== featuredItem.id)

  sorted = remaining.sort(by:
    1. isPinned descending (pinned first)
    2. approvedDate descending
  )

  return sorted.slice(0, maxHeadlines)
```

### Headlines display rules

- Minimum: **3** items (if fewer than 3 available, show all available)
- Maximum: **6** items
- If zero remaining items after featured selection, show no headlines section (featured-only state is valid)
- `maxHeadlines` should be a configurable constant (default: 6), not a webpart property

---

## Combined Kudos Module Display States

| Visible Items | Featured | Headlines | Module State |
|---------------|----------|-----------|--------------|
| 0 | Empty | Empty | Empty state with Give Kudos CTA |
| 1 | 1 item | None | Featured-only — no headlines section |
| 2–4 | 1 item | 1–3 items | Featured + partial headlines |
| 5–7 | 1 item | 4–6 items | Featured + full headlines |
| 8+ | 1 item | 6 items (capped) | Featured + capped headlines + View All Kudos CTA |

---

## Band A — Announcement Priority Truth Table

Band A uses a deterministic sort that resolves every possible tie.

### Sort key sequence

| Priority | Field | Direction | Notes |
|----------|-------|-----------|-------|
| 1 | `isPinned` | `true` first | Pinned items always appear above unpinned |
| 2 | `priorityOverride` | Ascending (lower = higher) | Items without override sort after items with one |
| 3 | `publishDate` | Descending (newest first) | Natural recency |
| 4 | `personName` | Ascending (alphabetical) | Final tie-break — deterministic for identical dates |

### Truth table: Band A sort examples

| isPinned | priorityOverride | publishDate | personName | Rank |
|----------|-----------------|-------------|------------|------|
| true | 1 | 2026-04-05 | Adams | 1 |
| true | — | 2026-04-03 | Baker | 2 |
| false | 1 | 2026-04-07 | Clark | 3 |
| false | 2 | 2026-04-06 | Davis | 4 |
| false | — | 2026-04-07 | Evans | 5 |
| false | — | 2026-04-07 | Foster | 6 |
| false | — | 2026-04-04 | Grant | 7 |

### Display truncation

After sorting, take the first **4** items maximum. Items beyond 4 are not rendered.

---

## Kudos Module — Priority Truth Table

The Kudos module uses a two-stage selection: featured (1 item) then recent headlines (up to 6).

### Featured sort key sequence

| Priority | Field | Direction | Notes |
|----------|-------|-----------|-------|
| 1 | `isPinned` | `true` first | Pinned items take the spotlight |
| 2 | `approvedDate` | Descending (newest first) | Most recently approved wins |

### Recent headlines sort key sequence (after featured removal)

| Priority | Field | Direction | Notes |
|----------|-------|-----------|-------|
| 1 | `isPinned` | `true` first | Remaining pinned items appear at top of headlines |
| 2 | `approvedDate` | Descending (newest first) | Recency determines order |
| 3 | `headline` | Ascending (alphabetical) | Final tie-break |

### Truth table: Kudos selection example

Given 5 visible approved items:

| id | isPinned | approvedDate | headline | Selection |
|----|----------|-------------|----------|-----------|
| K1 | true | 2026-04-06 | "Team Alpha" | **Featured** (pinned + most recent pinned) |
| K2 | true | 2026-04-02 | "Great Q1" | Headline #1 (pinned) |
| K3 | false | 2026-04-07 | "Ship day" | Headline #2 (most recent unpinned) |
| K4 | false | 2026-04-05 | "Bug blitz" | Headline #3 |
| K5 | false | 2026-04-03 | "Onboarding" | Headline #4 |

---

## Band B — Priority Truth Table

Band B uses simple date-proximity sorting with no editorial overrides.

### Sort key sequence

| Priority | Field | Direction | Notes |
|----------|-------|-----------|-------|
| 1 | `celebrationDate` | Ascending (soonest first) | Closest upcoming celebration wins |
| 2 | `personName` | Ascending (alphabetical) | Deterministic tie-break for same-day celebrations |

### Display truncation

After sorting, take the first **8** items maximum. Items beyond 8 are not rendered.

---

## Cross-Region Hierarchy Determinism

### Render order is fixed

The three regions always render in this order regardless of content:

1. **Band A** (or collapsed if empty)
2. **Kudos Module**
3. **Band B**

No content-based promotion moves items between regions. A Kudos item never appears in Band A. An announcement never appears in Band B. The regions are structurally independent.

### Visual weight hierarchy is fixed

- **Band A** is the most editorial (larger cards, more detail)
- **Kudos Module** is the most engaging (spotlight + headlines + CTAs)
- **Band B** is the most compact (small tiles, dense grid)

This hierarchy is maintained at all breakpoints and all content-volume states.

### Empty-state hierarchy

| Band A State | Kudos State | Band B State | Result |
|-------------|-------------|-------------|--------|
| Has items | Has items | Has items | Full three-region display |
| Empty | Has items | Has items | Band A collapsed, Kudos + Band B render |
| Has items | Empty | Has items | Band A renders, Kudos shows empty + CTA, Band B renders |
| Has items | Has items | Empty | Band A + Kudos render, Band B shows minimal state |
| Empty | Empty | Has items | Band A collapsed, Kudos empty + CTA, Band B renders |
| Empty | Has items | Empty | Band A collapsed, Kudos renders, Band B minimal state |
| Has items | Empty | Empty | Band A renders, Kudos empty + CTA, Band B minimal state |
| Empty | Empty | Empty | Band A collapsed, Kudos empty + CTA, Band B minimal state |

In the all-empty case, the webpart still renders — the Kudos Give Kudos CTA and Band B minimal state ensure the surface never fully disappears.

---

## What This Phase Excludes

- No adapter implementation — selection logic is specified here, built in Phase 2
- No UI implementation — display states and layouts are built in Phase 3+
- No package changes
