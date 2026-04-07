# P01 — State Matrix: People & Culture Homepage Surface

**Date:** 2026-04-07
**Phase:** 11 / P01 — Information Architecture and Surface Blueprint

---

## Overview

Every state combination must produce a credible visual result. The surface must never show empty chrome, gaping whitespace, or broken layout at any content density.

**Principle:** Suppress empty regions entirely. Show a module-level empty state only when all regions are empty. Never show per-region empty-state placeholders on the homepage.

---

## State Definitions

| State | Definition |
|-------|-----------|
| **Empty** | Zero items after normalization (filtering, audience, date windows) |
| **Sparse** | 1-2 items in the region |
| **Healthy** | 3+ items, typical operating density |
| **Loading** | Data fetch in progress, no content yet |
| **Invalid** | Config is malformed, missing required fields, or normalizer throws |
| **Edit mode** | SharePoint page is in edit/authoring mode |

---

## Module-Level States

| State | Behavior |
|-------|----------|
| **Loading** | Render `HomepageLoadingState` at module level. No per-region skeletons. Single spinner with "Loading People & Culture..." label. |
| **All regions empty** | Render `HomepageEmptyState` at module level: title "People & Culture", description "Nothing to show right now — check back soon." No region chrome visible. |
| **Invalid config** | Render `HomepageEmptyState` with generic fallback. Log warning to console. Do not crash or show error details to end users. |
| **At least one region has data** | Render the module with only populated regions. Suppress empty regions entirely (see suppression rules). |

---

## Per-Scenario Matrix

| # | Scenario | Kudos | Announcements | Celebrations | Rendered Regions | Notes |
|---|----------|-------|---------------|--------------|-----------------|-------|
| 1 | **No data at all** | empty | empty | empty | Module-level empty state | Single empty-state message, no region chrome |
| 2 | **One kudos only** | 1 item (spotlight) | empty | empty | Kudos only | Spotlight renders as hero. No recent headlines section. No separator below. |
| 3 | **One announcement only** | empty | 1 item | empty | Announcements only | Single announcement card fills the module body. Module header still renders. |
| 4 | **Celebrations only** | empty | empty | 1+ items | Celebrations only | Avatar strip or tile grid renders alone under module header. |
| 5 | **One announcement + no kudos** | empty | 1 item | 0-N items | Announcements (+ Celebrations if populated) | Kudos region suppressed. Announcements lead. |
| 6 | **One kudos + no announcements** | 1 item | empty | 0-N items | Kudos (+ Celebrations if populated) | Kudos spotlight leads. Announcements suppressed. |
| 7 | **Healthy all regions** | 3+ items | 3+ items | 3+ items | All three regions | Full focal sequence: Kudos → Announcements → Celebrations |
| 8 | **Sparse kudos + healthy rest** | 1 item | 3+ items | 3+ items | All three regions | Kudos spotlight only (no recent headlines). Announcements and Celebrations render normally. |
| 9 | **Loading** | — | — | — | Module-level loading spinner | Single loading indicator, ARIA `role="status"` |
| 10 | **Invalid config** | — | — | — | Module-level empty state | Fallback to safe empty state. Console warning. |
| 11 | **Edit mode** | per data | per data | per data | Same as normal rendering | Surface renders normally in edit mode. SharePoint edit chrome wraps the webpart — the component does not add its own edit affordances. |
| 12 | **Narrow responsive stress** | per data | per data | per data | Same regions, compressed | Rail mode is the baseline. Below 280px: celebration avatars shrink to 24px, announcement badges hide, Kudos spotlight media hides. |

---

## Sparse-Data Visual Strategy

The surface must remain visually credible even with minimal content. The strategy is **elevation through composition**, not padding:

| Content Level | Strategy |
|---------------|----------|
| **1 item total** | That item becomes the module hero. Generous whitespace around it reads as intentional editorial restraint, not as a broken grid. |
| **2-3 items across regions** | Rendered regions stack tightly. The module feels compact and intentional — a brief, curated update rather than a half-empty dashboard. |
| **4+ items** | Normal density. All applicable regions render with their full layout. |

**Never:** Add filler content, stretch items to fill space, or show "no items" placeholders within a visible region. If a region has no items, it does not exist in the DOM.

---

## Edit-Mode Behavior

SharePoint edit mode wraps webparts in its own chrome (selection border, toolbar, move/delete handles). The People & Culture component:

- Renders its normal output inside the edit wrapper
- Does not add its own "edit this content" UI
- Does not change layout or hide content in edit mode
- Must not break if the webpart is moved to a different page section during editing
- Must gracefully handle the config being in a partially authored state (some fields filled, others default/empty)

---

## Responsive Stress Behavior

| Breakpoint | Adaptation |
|------------|-----------|
| **< 280px** | Emergency compression: Kudos spotlight hides media, shows text only. Celebration avatars shrink to 24px. Announcement type badges hide (text label remains). |
| **280-400px** | Rail mode (primary design target). Full rail composition as specified in Surface Blueprint. |
| **400-480px** | Rail mode with slightly more breathing room. No layout changes. |
| **> 480px** | Wide-mode adaptation triggers (see Surface Blueprint). |
