# Phase 08 — Refinement Proof

## Search Contract Validation

### Search field coverage

The `launcherSearch.ts` contract matches against 6 normalized fields from `LauncherPlatformRecord`:

| # | Field | Type | Example match for "bamboo" |
|---|-------|------|---------------------------|
| 1 | `name` | `string` | "**Bamboo**HR" |
| 2 | `aliases` | `string[]` | Any alias containing "bamboo" |
| 3 | `descriptor` | `string?` | Descriptor text containing "bamboo" |
| 4 | `category` | `string?` | Category name containing "bamboo" |
| 5 | `workflowShelf` | `string?` | Shelf name containing "bamboo" |
| 6 | `support.supportOwnerName` | `string?` | Owner name containing "bamboo" |

### Search preparation

- `prepareForSearch()` pre-computes a lowercased `searchText` string by joining all 6 fields with spaces
- `prepareAllForSearch()` maps an entire record array, called once per data refresh via `useMemo`
- Missing optional fields produce empty strings in the concatenation — no runtime errors
- `matchesQuery()` performs a single `includes()` check against the pre-computed `searchText`

### Dual search surfaces

| Surface | Location | Behavior |
|---------|----------|----------|
| **Command band search** | Inline in launcher header | Top 6 suggestions dropdown with keyboard nav; Escape/blur dismisses |
| **Overlay search** | All Platforms panel | Full inventory filter with category grouping; re-groups filtered results |

Both surfaces use the same `launcherSearch.ts` contract. The command band uses `matchesQuery()` directly; the overlay uses `filterIndexByQuery()` which builds a Set of matching keys.

## Suggestion Behavior Rules

### Command band suggestions

| Rule | Behavior |
|------|----------|
| **Trigger** | Any non-empty query |
| **Max results** | 6 |
| **Match display** | Platform name + category tag + ExternalLink icon |
| **No-match** | "No platforms matching '{query}'" in dropdown |
| **Keyboard** | ArrowDown/Up cycles (wraps), Enter launches active, Escape dismisses + clears |
| **Blur** | 150ms delayed dropdown dismiss (allows click on suggestion) |
| **ARIA** | `role="combobox"` + `role="listbox"` + `role="option"` with `aria-selected` |
| **Mobile** | Search hidden — users use overlay via "All Platforms" button |

### Overlay search

| Rule | Behavior |
|------|----------|
| **Trigger** | Any non-empty query in overlay search input |
| **Results** | Category-grouped index rows (no limit — full inventory) |
| **No-match** | "No platforms matching '{query}'" centered in body |
| **Title feedback** | "All Platforms (N)" → "N results" during search |
| **Focus** | Auto-focus search input on overlay open (50ms delay) |

## Personalization Posture

Favorites and recents are **explicitly deferred** (P08-03). Rationale:
- No reliable persistence mechanism in the SharePoint host context
- `localStorage` is per-browser/per-origin and brittle
- Search (command band + overlay) already addresses the quick-access use case
- Brittle favorites worse than no favorites

Unblock criteria: user-preference Azure Function endpoint or SP User Profile custom property.

## Hierarchy Confirmation

After Phase 08 search work, the launcher hierarchy reads correctly:

1. **Command band** — compact identity bar with live search suggestions (search adds speed, doesn't dominate)
2. **Flagship stage** — featured platforms at primary visual weight with spring motion
3. **Utility rail** — 4-section support surface (notices, help, access, contacts)
4. **Workflow shelves** — categorized secondary platforms with medium-weight cards
5. **All-platforms overlay** — expandable full inventory with search, accessible via command band button

Search suggestions dismiss on blur/escape — they don't persist over the flagship stage. The overlay is additive (opened on demand, closed on escape/backdrop/button). Neither search surface replaces the launcher's curated hierarchy.

## Accessibility Confirmation

| Feature | Status |
|---------|--------|
| Command band ARIA combobox | `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-autocomplete="list"` |
| Suggestion listbox | `role="listbox"` with `role="option"` per suggestion, `aria-selected` tracking |
| Keyboard navigation | ArrowDown/Up, Enter, Escape — predictable and standard |
| Overlay dialog | `role="dialog"`, `aria-label="All Platforms"`, `aria-modal="false"` |
| Reduced motion | All spring animations gated by `usePrefersReducedMotion()` |
| Responsive tiers | 3 tiers (mobile/tablet/desktop) via `useResponsiveTier()` — search hidden on mobile |
| Focus management | Search input auto-focus on overlay open; command band input focus returns on Escape |

## Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Logo assets not deployed** | Medium | All cards use Lucide fallback until SVGs deployed to HBCentral |
| **Audience not wired from SPFx** | Medium | `activeAudience` prop exists but not extracted from SP user profile |
| **No favorites/recents** | Low | Deferred with rationale; search serves quick-access use case |
| **Search not debounced** | Low | Synchronous filtering; acceptable for <100 platforms |
| **No search highlighting** | Low | Matched text not visually emphasized in results |
| **Overlay not focus-trapped** | Low | Non-modal; focus can Tab out. Acceptable for inline panel. |
| **Bundle size** | Low | 509 KB (up from 475 KB at Phase 01 start). 34 KB across 8 phases — proportional. |
