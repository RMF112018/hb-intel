# Phase 06 — Overlay Composition Proof

## 1. Composition Proof Summary

### How the all-platforms layer fits into the launcher hierarchy

The all-platforms overlay is the 5th functional surface in the launcher composition, additive to the 4 established regions:

```
LauncherCompositionShell
  ├─ 1. Command band (LauncherCommandBand)
  │     └─ "All Platforms" button → opens overlay
  ├─ 2. Body: Flagship stage + Utility rail (2fr / 1fr)
  ├─ 3. Workflow shelves (LauncherWorkflowShelves)
  └─ 4. All-platforms overlay (LauncherAllPlatformsOverlay)
       ├─ Sticky header: title + search input + close button
       └─ Scrollable body: category-grouped LauncherIndexRow list
```

### 3-tier card hierarchy + overlay index

| Tier | Component | Context | Logo | Min width |
|------|-----------|---------|------|-----------|
| **1 — Flagship** | `LauncherFlagshipCard` | Featured stage | 56px | 240px grid |
| **2 — Shelf** | `LauncherShelfCard` | Workflow shelves | 40px | 180px grid |
| **3 — Index** | `LauncherIndexRow` | All-platforms overlay | 32px | Single-column list |

The overlay does not introduce a 4th card tier — it uses Tier 3 rows within a panel context. The flagship stage and workflow shelves remain visible beneath the overlay (non-modal, `aria-modal="false"`).

### What the overlay adds

- **Breadth** — unshelved/unfeatured platforms are now discoverable
- **Search** — live filtering against name, aliases, descriptor, category
- **Category browsing** — alphabetically grouped inventory with counts
- **Direct launch** — every row is a clickable `<a>` with ExternalLink icon

### What the overlay does NOT do

- Does not replace the curated homepage hierarchy
- Does not become a full-page directory or faux app
- Does not use flagship cards or shelf cards (Tier 3 only)
- Does not compete visually with the Signature Hero

## 2. Entry-Point Behavior

### How the user reaches the full inventory

1. User sees the "All Platforms" button in the command band (right section)
2. Button fires `onAllPlatforms` callback → sets `overlayOpen = true`
3. `AnimatePresence` mounts `OverlayContent` with motion entrance (opacity/y spring, 150ms)
4. Search input auto-focuses after 50ms delay
5. Full platform index is shown, grouped by category

### How the user returns to the main launcher

| Trigger | Mechanism |
|---------|-----------|
| **Close button** | `onClick → onClose → overlayOpen = false` |
| **Escape key** | `document.addEventListener('keydown')` |
| **Click outside** | Backdrop `onClick` |
| **AnimatePresence exit** | Motion exit animation (150ms), then unmount |

Search state clears on close (component unmounts). On re-open, the overlay starts fresh with empty search and full index.

## 3. Known Limitations

### Intentionally deferred to Phase 07 or later

| Limitation | Phase | Description |
|-----------|-------|-------------|
| **Responsive overlay** | Phase 07 | Desktop 60vh max-height. Tablet/mobile may need full-screen sheet or adjusted layout. |
| **Command band search wiring** | Phase 08 | The command band's search input is still a read-only placeholder. Could open the overlay or perform inline filtering. |
| **Arrow key navigation** | Future | No up/down arrow key navigation between index rows. Users rely on Tab. |
| **Debounced search** | Future | Filtering is synchronous on each keystroke. Acceptable for <100 platforms. |
| **Search highlighting** | Future | Matched text in results is not visually highlighted. |
| **Focus trap** | Future | Non-modal overlay doesn't trap focus. Focus can Tab out of the overlay. |
| **Favorites in overlay** | Future | No favorite/pin toggle on index rows. |
| **Logo asset deployment** | Ops | All cards (flagship, shelf, index) use Lucide fallback until SVG assets deployed. |
| **Overlay scroll position** | Future | Doesn't reset scroll position on re-open after data change. |

## 4. Documentation Updates

### Files updated during Phase 06

| File | Prompt | Change |
|------|--------|--------|
| `LauncherAllPlatformsOverlay.tsx` | P06-01, P06-02, P06-03 | Created (P06-01), refined with motion/sticky header/search placeholder (P06-02), activated live search (P06-03) |
| `LauncherIndexRow.tsx` | P06-01 | Created — Tier 3 compact row with 32px logo container |
| `ToolLauncherWorkHub.tsx` | P06-01, P06-02 | Added overlay state, wired command band button, switched to `isOpen` prop pattern |

### Phase 06 deliverables

| Document | Prompt |
|----------|--------|
| `phase-06-overlay-contract.md` | P06-01 |
| `phase-06-overlay-surface-notes.md` | P06-02 |
| `phase-06-overlay-search-and-interaction-notes.md` | P06-03 |
| `phase-06-overlay-composition-proof.md` | P06-04 |
| `phase-06-completion-notes.md` | P06-04 |

### What later phases inherit

- **Phase 07 (Responsive):** The overlay uses `maxHeight: '60vh'` — responsive work should evaluate mobile/tablet sheet behavior
- **Phase 08 (Search):** The overlay's `matchesPlatform()` and `filterIndex()` functions can be reused or extended for command-band search
- **Phase 09 (Packaging):** The overlay is entirely local to `apps/hb-webparts` — no shared-kit promotion needed
