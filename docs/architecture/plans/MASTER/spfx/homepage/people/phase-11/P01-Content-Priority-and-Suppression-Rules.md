# P01 — Content Priority and Suppression Rules

**Date:** 2026-04-07
**Phase:** 11 / P01 — Information Architecture and Surface Blueprint

---

## Content Priority

### Region Priority Order

Regions render in this fixed order when populated. The order does not change based on content density.

| Priority | Region | Justification |
|----------|--------|--------------|
| 1 | **Kudos Recognition** | Warmest, most participatory. Drives engagement through spotlight + celebrate actions. Most visually rich (media, attribution, counts). Leads with human warmth per remediation doctrine. |
| 2 | **Announcements** | Formal, time-sensitive. Promotions, new hires, and life events are high-impact organizational news. Second position preserves urgency without competing with engagement focus. |
| 3 | **Celebrations** | Lightest, most ambient. Birthdays and anniversaries are pleasant but routine. Dense, compact format suits the footer position. Closing with celebrations leaves a warm impression. |

### Within-Region Priority

**Kudos:**
1. Pinned items (manual editorial override)
2. Most recently approved
3. Highest celebrate count (tiebreaker)

**Announcements:**
1. Pinned items
2. Priority override value (if set by author)
3. Most recent publish date
4. Alphabetical by person name (final tiebreaker)

**Celebrations:**
1. Today's celebrations first
2. Then by date ascending through the week
3. Alphabetical by name within same date

---

## Suppression Rules

### Core Principle

An empty region does not render. No per-region empty-state placeholders appear on the homepage. The surface compresses to show only regions with live content.

### Region Suppression

| Condition | Behavior |
|-----------|----------|
| Region has 0 items after normalization | Region is **suppressed** — not rendered in DOM, no separator, no eyebrow label |
| Region has 1+ items | Region **renders** in its priority position |
| All regions have 0 items | Module-level `HomepageEmptyState` renders instead of any region content |

### Separator Suppression

Separators between regions follow a simple rule: **a separator renders only between two adjacent rendered regions.**

| Rendered regions | Separators |
|-----------------|------------|
| Kudos + Announcements + Celebrations | Separator after Kudos, separator after Announcements |
| Kudos + Celebrations (announcements suppressed) | Separator after Kudos only |
| Announcements only | No separators |
| Any single region | No separators |

### CTA Suppression

See `P01-CTA-Destination-Map.md` for full CTA visibility rules. Summary:

- "Give Kudos" in module header: visible whenever the module renders (even if Kudos region is suppressed — it's a participation prompt, not a region header)
- "View All Kudos" in header: visible only in wide mode AND when Kudos region has data
- "View all" footer: visible whenever the module renders
- "Celebrate" button: visible only when the Kudos spotlight renders
- Headline links: visible only when the corresponding item renders

### Element Suppression Within Regions

**Kudos:**
| Content | Behavior |
|---------|----------|
| 0 approved kudos | Entire region suppressed |
| 1 kudos (no recent headlines) | Spotlight only, no "recent" section, no "recent" label |
| 1+ kudos but no featured/pinned | Most recent becomes the spotlight |
| Spotlight item has no media | Text-only spotlight (no avatar placeholder — just omit the media area) |

**Announcements:**
| Content | Behavior |
|---------|----------|
| 0 announcements | Entire region suppressed |
| 1 announcement | Single card, no list chrome |
| Announcement has no summary | Headline-only card (same in both rail and wide) |
| Announcement has no CTA | Card is not clickable (static display) |

**Celebrations:**
| Content | Behavior |
|---------|----------|
| 0 celebrations this week | Entire region suppressed |
| 1-2 celebrations | Compact inline display (no strip/grid chrome — just the items) |
| Celebration has no avatar/media | Initial-letter placeholder circle (first letter of name, neutral background) |
| Anniversary with no year data | Show celebration type only, no year badge |

---

## Density Modes

The surface operates in three implicit density modes based on total item count across all regions. These are not user-selectable — they are automatic.

| Total items | Mode | Effect |
|-------------|------|--------|
| 0 | **Empty** | Module-level empty state |
| 1-3 | **Sparse** | Rendered regions fill available space generously. Reads as curated editorial restraint. |
| 4-8 | **Normal** | Standard spacing and layout. All applicable max-counts respected. |
| 9+ | **Dense** | Content is clipped at max-counts. Overflow indicated by "View all" footer. |

**Sparse mode is not a failure state.** The design must make 1-3 items feel intentional, not broken. This is achieved through generous spacing, editorial typography, and the warm Kudos accent — not by adding filler or showing "coming soon" placeholders.

---

## Normalization Gate

All suppression decisions happen **after** the normalizer runs. The normalizer (`normalizePeopleCultureMergedConfig`) handles:

- Audience filtering
- Date/persistence window filtering
- Approval status gating (Kudos)
- Current-week filtering (Celebrations)
- Sort ordering per within-region priority rules
- Max-count trimming

The component receives already-normalized data and applies suppression rules based purely on item counts per region. The component never re-filters or re-sorts.

---

## Summary Decision Table

| Question | Answer |
|----------|--------|
| Can an empty region show an empty-state placeholder? | **No** — suppress it entirely |
| Can the module show an empty state? | **Yes** — when all regions are empty |
| Does focal order change based on content? | **No** — Kudos → Announcements → Celebrations always |
| Can a region promote to a higher position if the above region is suppressed? | **Yes** — suppressed regions leave no gap; the next region moves up naturally |
| Does the module header show even with partial content? | **Yes** — always when at least one region has data |
| Does "Give Kudos" show even without Kudos content? | **Yes** — it's a participation prompt in the module header |
