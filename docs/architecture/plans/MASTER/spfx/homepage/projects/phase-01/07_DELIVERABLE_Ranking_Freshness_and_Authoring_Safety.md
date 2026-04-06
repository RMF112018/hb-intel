# Phase 07 Deliverable — Ranking, Freshness, and Authoring Safety

> **Phase:** 07 of 08
> **Status:** Complete
> **Date:** 2026-04-06
> **Scope:** Deterministic selection, freshness normalization, stale demotion, content completeness, authoring safety defaults
> **Governing docs:** Phase 01 anatomy freeze, UI Doctrine SPFx Governing Standard
> **Version:** 1.0.0.72

---

## A. Selection Logic Summary

### Version 1 editorial selection model

Project Spotlight uses a deterministic, editorial-first selection pipeline:

1. **Validation gate** — items must have non-empty `id`, `title`, and `summary` to enter the pipeline. Invalid items are silently excluded.

2. **Audience filter** — items with `audiences` are filtered by `activeAudience`. Items without audience constraints are always visible.

3. **Deterministic sort** — `byPriority` applies four tiebreakers in order:
   - `featured: true` items always sort first
   - Lower `order` values sort before higher values
   - More recently updated items sort before less recent (recency tiebreak via `freshness.updatedAt`)
   - Alphabetical title as the final stable tiebreaker

4. **Featured selection** — the first item after sorting becomes the featured project. If no item is explicitly marked `featured: true`, the highest-priority item is auto-promoted.

5. **Secondary selection** — remaining items fill the supporting rail, capped by `maxSecondaryItems` (default: 3).

6. **Stale demotion** — within the secondary rail, stale items are pushed to the end so fresh items get priority visibility in the limited rail space.

### Selection determinism guarantees

| Scenario | Behavior |
|----------|----------|
| One `featured: true` item | That item is always featured |
| Multiple `featured: true` items | Highest priority (order, recency, title) wins |
| No `featured: true` item | First by order/recency/title is auto-promoted |
| Tied order + recency | Alphabetical title breaks the tie |
| 0 valid items | Empty state via authoring governance |
| 1 valid item | Featured only, no supporting rail |
| 2+ valid items | Featured + up to `maxSecondaryItems` in rail |

---

## B. Fallback Behavior Summary

### Missing content handling

| Missing field | Featured behavior | Supporting tile behavior |
|---------------|-------------------|-------------------------|
| Image | Gradient placeholder with "Project Image" label | Empty gradient placeholder (no text) |
| Highlight headline | Omitted — title + summary still provide editorial weight | N/A (not shown in tiles) |
| Summary | Renders empty — `summary` is a validation gate, so this should not happen | N/A |
| Freshness | "Curated item" or "Live signal" label based on source | Falls back to location/sector metadata |
| Milestones | Metadata row omits milestone count | N/A |
| Status | Badge row omits status badge | Badge row omits status badge |
| Team members | Team strip not rendered | N/A |
| CTA | CTA area not rendered; "View all projects" header CTA also omitted | Tile rendered as non-linked div |
| Location/sector | Eyebrow falls back to "Featured Project" | Meta text falls back to freshness label |

### Content completeness tracking

Each normalized item receives a `contentCompleteness` tier:

| Tier | Criteria | Typical behavior |
|------|----------|------------------|
| `full` | Has image + headline + status | Renders all editorial zones |
| `partial` | Has 1-2 of image/headline/status | Renders available content, omits missing zones gracefully |
| `minimal` | Has none of image/headline/status | Title + summary only — still renders cleanly |

This field is available for future use (e.g., authoring warnings in edit mode) but does not currently drive visibility decisions — all valid items render regardless of completeness.

---

## C. Authoring Safety Summary

### Freshness normalization

Raw freshness data is normalized into human-friendly relative labels:

| Raw state | Resolved label |
|-----------|---------------|
| Updated < 1 hour ago | "Updated Just now" |
| Updated 1-23 hours ago | "Updated Nh ago" (e.g., "Updated 3h ago") |
| Updated yesterday | "Updated Yesterday" |
| Updated 2-30 days ago | "Updated N days ago" |
| Updated > 30 days ago | "Updated YYYY-MM-DD" |
| Stale (by age or expiry) | "Stale signal" |
| No `updatedAt`, source = live | "Live signal" |
| No `updatedAt`, source = curated | "Curated item" |

### Staleness detection

Items are marked stale when:
- `expiresAt` is in the past, OR
- `updatedAt` is older than `staleAfterHours` (default: 168 hours / 7 days)

Stale items receive:
- A "Stale" warning badge in both featured and supporting tile views
- Demotion to the end of the secondary rail (fresh items get priority)
- A `freshnessLabel` of "Stale signal"

### Authoring safety defaults

| Config field | Default | Source |
|--------------|---------|--------|
| `heading` | "Project and Portfolio Spotlight" | `DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG` |
| `maxSecondaryItems` | 3 | `DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG` |
| `staleAfterHours` | 168 (7 days) | `DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG` |

### Empty and error state governance

| State | Behavior |
|-------|----------|
| No items configured | Empty state: "No project spotlight items configured" |
| All items invalid (missing id/title/summary) | Empty state: "Project spotlight configuration is invalid" |
| All items filtered by audience | Empty state: "No project spotlight items configured" |
| Items present but no featured candidate | Empty state (should not happen — first valid item auto-promotes) |

---

## D. Reuse vs New Build Summary

### Enhanced (existing code)

| Asset | Location | Change |
|-------|----------|--------|
| `byPriority` | `operationalAwarenessConfig.ts` | Added recency tiebreak via `freshness.updatedAt` |
| `resolveFreshness` | `operationalAwarenessConfig.ts` | Relative time labels instead of raw ISO dates |
| `normalizeProjectPortfolioSpotlightConfig` | `operationalAwarenessConfig.ts` | Added `contentCompleteness` computation, stale demotion in secondary rail |
| Badge row (featured) | `ProjectPortfolioSpotlight.tsx` | Added "Stale" warning badge |
| Badge row (tile) | `ProjectPortfolioSpotlight.tsx` | Added "Stale" warning badge |

### Built new

| New code | Location | Why |
|----------|----------|-----|
| `relativeTimeLabel` | `operationalAwarenessConfig.ts` | Human-friendly freshness labels |
| `ContentCompleteness` type | `operationalAwarenessConfig.ts` | Tracks authored content quality |
| `contentCompleteness` field | `NormalizedProjectPortfolioSpotlightItem` | Drives future authoring safety UX |
| Stale demotion logic | `normalizeProjectPortfolioSpotlightConfig` | Pushes stale items to end of secondary rail |

---

## E. Validation Results

| Check | Result |
|-------|--------|
| `check-types` | Pass (0 errors) |
| `lint` | Pass (0 errors, 0 warnings) |
| `build` | Pass (467 KB JS, 22.5 KB CSS) |
| `test` | 13 pre-existing failures, 0 new failures |
| Deterministic featured selection | Yes — `featured: true` + order + recency + title |
| Deterministic supporting selection | Yes — sorted, stale-demoted, capped |
| Content fallbacks stable | Yes — missing image/headline/CTA/status degrade gracefully |
| Missing-field scenarios | Yes — validated per table in section B |
| Stale indicator | Yes — "Stale" badge on featured and tiles |
| Relative freshness labels | Yes — human-friendly time labels |
