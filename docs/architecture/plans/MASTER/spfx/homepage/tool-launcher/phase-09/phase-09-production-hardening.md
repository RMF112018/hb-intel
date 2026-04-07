# Phase 09 — Production Hardening and Failure-State Sweep

## Code Change

### Audience-filter empty-state guard (P09-03)

**File:** `ToolLauncherWorkHub.tsx`

**Gap found:** If the live list has active platforms but audience filtering removes all of them, the previous code would render the composition shell with all regions returning null (no flagship, no rail, no shelves), leaving only the command band showing "0 platforms" — an awkward but not broken state.

**Fix:** Added a guard after `deriveToolLauncherPresentation()`: if `presentation.allPlatforms.length === 0`, show the `listEmpty` authoring message immediately instead of rendering an empty composition shell.

This is the only code change in Phase 09 — all other hardening was already in place from prior phases.

## Failure-State Coverage Matrix

### Data-layer failures (normalization boundary)

| Failure | Handling | Phase implemented |
|---------|----------|------------------|
| Missing `Title` | Record skipped | P01-02 |
| Missing `LaunchURL` | Record skipped | P01-02 |
| `IsActive` false | Record suppressed | P01-02 |
| Nullable boolean fields | Explicit defaults (true/false per field) | P01-02 |
| Nullable number fields | Default 999 | P01-02 |
| Invalid Choice enum values | Falls back to safe default | P01-02 |
| Expired notice (`NoticeExpiresOn` in past) | Notice suppressed | P01-02 |
| Malformed JSON response | Caught at list source boundary | P01-04 |
| Non-array `value` field | Treated as empty array | P01-04 |
| Non-object items in raw array | Guard skips them | P01-04 |
| Duplicate `platformKey` | Second occurrence skipped | P01-02 |
| Missing `PlatformKey` | Falls back to `slugify(Title)` | P01-02 |
| Audience filtering removes all platforms | Empty-state guard added | **P09-03** |

### Asset-layer failures (logo resolution)

| Failure | Handling | Phase implemented |
|---------|----------|------------------|
| Missing `logoAssetRef` | 5-step fallback chain | P03-03 |
| Missing manifest entry | Platform/category Lucide icon | P03-03 |
| Image `onError` (broken URL) | Lucide icon fallback, container preserved | P03-03 |
| Missing `darkLogoAssetRef` | Use light variant | P03-03 |
| Missing `PreferredLogoType` | Default `'official-wordmark'` | P01-02 |
| Logo SVG files not deployed | All cards use Lucide fallback | Documented |

### Component-layer failures (rendering)

| Failure | Handling | Phase implemented |
|---------|----------|------------------|
| Zero featured platforms | Flagship stage returns null | P02-01 |
| Zero platforms with workflowShelf | Shelves return null | P02-04 |
| Zero active notices | Notices section suppressed | P04-01 |
| Zero help/access/contact links | Respective rail sections suppressed | P04-01 |
| All rail sections empty | Entire rail returns null, body collapses | P04-01 |
| Empty overlay index | "No platforms available" empty state | P06-01 |
| Overlay search no matches | "No platforms matching" message | P06-03 |
| Command band search no matches | "No platforms matching" in dropdown | P08-02 |
| Missing descriptor on any card | Card renders name + CTA only | P02-03 |
| Missing category | Grouped under "Other" in index | P01-02 |

### Infrastructure-layer failures

| Failure | Handling | Phase implemented |
|---------|----------|------------------|
| REST fetch error (network/404/500) | Hook captures error → config fallback | P01-03 |
| No SPFx context | Hook returns undefined → config fallback | P01-03 |
| List not found on site | 404 error → config fallback | P01-04 |
| AbortController cleanup on unmount | Prevents state updates on unmounted component | P01-03 |
| Cache TTL (5 minutes) | Prevents repeated fetch failures | P01-03 |

### Interaction-layer failures

| Failure | Handling | Phase implemented |
|---------|----------|------------------|
| Overlay open during loading | Loading state prevents shell render | P01-03 |
| Escape key outside overlay | No-op (only registered when overlay mounted) | P06-02 |
| Blur on suggestion dropdown | 150ms delay allows click before dismiss | P08-02 |
| Reduced motion preference | All motion gated by `usePrefersReducedMotion()` | P03-01 |
| Mobile search hidden | Users use overlay via "All Platforms" button | P07-02 |

## Authoring Safety Confirmation

| Context | Behavior | Safe |
|---------|----------|------|
| Edit mode with data | Same as read mode (list-governed) | ✅ |
| Edit mode, empty list | `listEmpty` authoring message | ✅ |
| Edit mode, fetch error | Config fallback | ✅ |
| Minimally configured manifest | Sample grouped config renders | ✅ |
| Partially populated list | Each record's optional fields degrade independently | ✅ |
| All platforms filtered by audience | Empty-state guard (P09-03 fix) | ✅ |

## Keyboard-Only Validation

| Surface | Keyboard behavior | Status |
|---------|------------------|--------|
| Command band search | Tab to focus, type to filter, ArrowDown/Up, Enter, Escape | ✅ |
| Flagship cards | Tab to each `<a>`, Enter to navigate | ✅ |
| Shelf cards | Tab to each `<a>`, Enter to navigate | ✅ |
| Utility rail links | Tab to each `<a>`, Enter to navigate | ✅ |
| Overlay open | Tab to "All Platforms" button, Enter to open | ✅ |
| Overlay search | Auto-focus on open, type to filter | ✅ |
| Overlay close | Escape key or Tab to Close button | ✅ |
| Index rows | Tab to each `<a>`, Enter to navigate | ✅ |

## Known Limitations (remaining)

| Limitation | Severity | Notes |
|-----------|----------|-------|
| Logo SVGs not deployed | Medium | All cards use Lucide fallback until assets deployed to HBCentral |
| Audience not wired from SPFx user profile | Medium | `activeAudience` is a prop; SPFx mount doesn't extract audience |
| No favorites/recents | Low | Explicitly deferred (P08-03) |
| Overlay not focus-trapped | Low | Non-modal (`aria-modal="false"`); Tab can leave overlay |
| Search not debounced | Low | Acceptable for <100 platforms |
| No arrow-key navigation in overlay rows | Low | Users Tab between rows |
| Stale data during page session | Low | 5-minute cache TTL; no push/polling |
