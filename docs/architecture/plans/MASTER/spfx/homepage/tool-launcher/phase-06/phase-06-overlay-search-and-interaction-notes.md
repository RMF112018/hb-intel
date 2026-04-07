# Phase 06 — Overlay Search and Interaction Notes

## 1. Search Approach

### How broad inventory matching works

The overlay filters platforms using a `matchesPlatform()` function that performs case-insensitive substring matching against 4 normalized fields from `LauncherPlatformRecord`:

| Field | Type | Example match for query "bamboo" |
|-------|------|----------------------------------|
| `name` | `string` | "**Bamboo**HR" |
| `aliases` | `string[]` | Any alias containing "bamboo" |
| `descriptor` | `string?` | "People records..." — no match |
| `category` | `string?` | "People & Payroll" — no match |

### Matching rules

- **Case-insensitive:** query and field values are both lowercased before comparison
- **Substring:** `includes()` — "adp" matches "ADP" and "ADP Workforce Now"
- **Any-field:** match on any of the 4 fields qualifies the platform
- **All-aliases:** each alias is checked independently — match on any one qualifies
- **Empty query:** returns the full unfiltered index

### Filtering and re-grouping

When the user types a query:
1. Each category group's platforms are filtered by `matchesPlatform()`
2. Groups with zero matching platforms are suppressed
3. The filtered `LauncherPlatformIndex` is rendered with the same category headings
4. Category headings show the filtered count (not total)

### No raw SharePoint field access

The search function operates entirely on `LauncherPlatformRecord` fields (already normalized by the Phase 01 seam). No raw field names like `AliasesKeywords` or `ShortDescriptor` appear in the search logic.

### Title updates during search

When searching, the overlay title changes from "All Platforms (N)" to "N results" (or "N result" for singular). This provides immediate feedback without a separate results-count element.

## 2. Focus / Dismissal Model

### Open behavior

| Step | What happens |
|------|-------------|
| User clicks "All Platforms" in command band | `overlayOpen` set to `true` in `ToolLauncherWorkHub` |
| `AnimatePresence` mounts `OverlayContent` | Motion entrance: opacity 0→1, y -8→0 over 150ms |
| After 50ms delay | Search input auto-focused via `searchRef.current.focus()` |
| User can immediately type | Search query filters live |

The 50ms focus delay ensures the motion animation doesn't steal focus during entrance.

### Close behavior

| Trigger | What happens |
|---------|-------------|
| Close button clicked | `onClose()` → `overlayOpen` set to `false` |
| Escape key pressed | `onClose()` via document `keydown` listener |
| Backdrop clicked | `onClose()` via backdrop `onClick` |
| `AnimatePresence` exit | Motion exit: opacity 1→0, y 0→-8 over 150ms, then unmount |

### Search state on close

Search query is cleared on close because `OverlayContent` unmounts (state is local to the component). On re-open, the search input starts empty and the full index is shown.

### No-results state

When search yields zero matches:
- Body shows "No platforms matching '{query}'" centered message
- Title shows "0 results"
- Category headings are all suppressed
- Search input remains focused and editable

### No-data state (empty index)

When the platform index has zero groups (no active platforms):
- Body shows "No platforms available" centered message
- Search input is still rendered but filtering against an empty set

## 3. Accessibility Notes

### Keyboard behavior

| Key | Context | Action |
|-----|---------|--------|
| `Escape` | Anywhere in overlay | Closes overlay |
| `Tab` | Standard | Moves focus between search input, close button, and index row links |
| `Enter` / `Space` | On close button | Closes overlay |
| `Enter` | On index row link | Navigates to platform |

### ARIA attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Overlay container | `role` | `dialog` |
| Overlay container | `aria-label` | `"All Platforms"` |
| Overlay container | `aria-modal` | `"false"` (non-modal — launcher visible beneath) |
| Search input | `aria-label` | `"Search all platforms"` |
| Close button | `aria-label` | `"Close all platforms"` |
| Each index row | `aria-label` | `"Launch {name}"` |
| Backdrop | `aria-hidden` | `"true"` |

### Host safety

- Overlay uses inline positioning (`position: relative` with z-index), not `position: fixed` to viewport — respects SharePoint's scroll context
- Backdrop is `position: fixed` but only for click-outside dismissal — it's transparent/near-transparent
- `aria-modal="false"` — does not trap focus or block screen reader access to the page
- Motion gated by `usePrefersReducedMotion()`

## 4. Deferred Refinement

| Item | Phase | Description |
|------|-------|-------------|
| **Arrow key navigation** | Future | No up/down arrow key navigation between index rows. Users rely on Tab. |
| **Debounced search** | Future | Filtering is synchronous on each keystroke. Acceptable for <100 platforms but may need debouncing for larger inventories. |
| **Search highlighting** | Future | Matched text in results is not highlighted. Name/descriptor render without emphasis on matched substring. |
| **Command band search** | Phase 08 | The command band's search input is still read-only. Phase 08 should wire it to the same search logic or open the overlay. |
| **Responsive overlay** | Phase 07 | Desktop 60vh max-height. Mobile/tablet may need full-screen sheet. |
| **Focus trap** | Future | Non-modal overlay doesn't trap focus. Focus can leave the overlay via Tab. Acceptable for inline panel but may need refinement for accessibility audit. |
| **Search history / recent queries** | Future | No persistence of search queries. |
