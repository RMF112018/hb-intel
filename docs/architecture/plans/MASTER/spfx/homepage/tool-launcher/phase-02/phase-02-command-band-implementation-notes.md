# Phase 02 — Command Band Implementation Notes

## 1. Outer Shell Structure

### What was introduced

The `LauncherCompositionShell` outer container was refined from Phase 02-01 to:
- Add a **premium outer container** with padding (16px), subtle border, card-radius border-radius, and semi-transparent white background — making the launcher read as a discrete product surface within the Utility zone rather than a collection of loose regions
- Remove the command band's inline styling from the shell — the command band now owns its own visual treatment via `LauncherCommandBand`
- Increase inter-region gap from `xl` (12px) to `2xl` (16px) for breathing room between the command band and the body regions

### Why

The outer container treatment makes the launcher visually self-contained within the Utility zone. Without it, the command band and body regions appeared as unrelated elements on a shared background. The container creates hierarchy — the launcher is one product surface with internal regions, not several unrelated components.

## 2. Command Band Behavior in Skeleton Form

### What is live now

| Affordance | Implementation | Status |
|-----------|---------------|--------|
| **Title** ("Work Hub") | Static `<h3>` with 0.88rem font, 650 weight | Live — renders always |
| **Supporting line** | Dynamic: shows platform count + tagline when count available, tagline-only fallback | Live — data-driven |
| **Search placeholder** | Read-only `<input>` with `Search` Lucide icon, `tabIndex={-1}` | Visual skeleton — not interactive |
| **All Platforms button** | `<button>` with `disabled` when no `onAllPlatforms` callback | Skeleton — click handler deferred |
| **Need Help button** | `<button>` with `disabled` when no `onNeedHelp` callback | Skeleton — click handler deferred |

### What is deferred

| Affordance | Deferred to | Reason |
|-----------|-------------|--------|
| Search behavior (platform name, alias, keyword matching) | Phase 08 | Search contract and discovery model not yet implemented |
| All Platforms overlay/drawer | Phase 06 | Overlay contract and launcher index model not yet defined |
| Need Help navigation | Future phase | Requires support-owner routing and help-link resolution |
| Favorites toggle | Phase 04 | Utility rail contract not yet implemented |
| Request Access action | Future phase | Requires access-request destination wiring |

### Accessibility

- Command band uses `role="toolbar"` with `aria-label` for landmark identification
- Search input has `aria-label="Search platforms (coming soon)"` to communicate deferred state
- Action buttons have descriptive `aria-label` attributes
- Disabled buttons are semantically `disabled` rather than hidden — preserves the affordance model for screen readers

## 3. Data Assumptions

### Fields consumed by the command band

| Data point | Source | Required |
|-----------|--------|----------|
| Platform count | `listPlatforms.length` passed as `platformCount` prop | Optional — fallback to tagline-only |

### Fields not yet consumed (deferred)

| Data point | Phase | Purpose |
|-----------|-------|---------|
| `LauncherPlatformRecord.aliases` | Phase 08 | Search matching |
| `LauncherPlatformRecord.support.helpUrl` | Future | "Need Help" navigation |
| `LauncherPlatformRecord.support.accessRequestUrl` | Future | "Request Access" navigation |
| `LauncherPlatformRecord.favoriteEligible` | Phase 04 | Favorites toggle |

The command band currently depends on **no normalized launcher fields** directly — only the platform count derived from the overall list. This is intentional: the band is a product identity surface first, not a data-driven rendering surface.

## 4. Empty / Partial-Data Posture

| Scenario | Behavior |
|----------|----------|
| `platformCount` is 0 or undefined | Supporting line shows tagline only ("Launch the systems your team uses every day") |
| `platformCount` is 1 | Supporting line shows "1 platform · Launch the systems your team uses every day" |
| `supportingLine` override provided | Overrides the automatic platform-count-based line |
| `onAllPlatforms` not provided | "All Platforms" button renders as `disabled` — visible but non-interactive |
| `onNeedHelp` not provided | "Need Help" button renders as `disabled` — visible but non-interactive |
| Title not provided | Defaults to "Work Hub" |
| All props omitted | Renders complete band with defaults — title, tagline, search placeholder, disabled buttons |

The command band never suppresses itself entirely. As long as the launcher is rendering live data, the band appears. This is correct: the band is the product identity for the launcher surface.

## 5. Follow-On Hooks for Later Phases

| Hook | Phase | What it enables |
|------|-------|-----------------|
| `onAllPlatforms` callback prop | Phase 06 | Wire to All Platforms overlay/drawer open action |
| `onNeedHelp` callback prop | Future | Wire to help navigation or support panel |
| `readOnly` removed from search input | Phase 08 | Enable live search with platform name/alias/keyword matching |
| `tabIndex={-1}` removed from search | Phase 08 | Make search input keyboard-focusable |
| Additional action buttons (Favorites, Request Access) | Phase 04+ | Add as the utility rail contract expands |

The component's prop interface (`LauncherCommandBandProps`) is already structured to accept these callbacks. Later phases wire callbacks without changing the structural composition.
