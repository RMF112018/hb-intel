# Phase 06 — Overlay Surface Notes

## 1. Overlay Shell Choice

### Pattern selected: anchored inline panel with motion entrance

The overlay renders as an inline `motion.div` with `role="dialog"` anchored within the launcher composition (in the `workflowShelves` region), not as a fixed-position modal or separate route.

### Why this fits SharePoint host constraints

| Constraint | How the overlay respects it |
|-----------|---------------------------|
| **No faux shell chrome** | The overlay is a content panel, not a nav shell or app frame |
| **No full-page takeover** | `aria-modal="false"` — the launcher and homepage remain visible; overlay has 60vh max-height |
| **Host-safe positioning** | Inline flow positioning (relative z-index), not fixed/absolute to viewport — respects SharePoint's own chrome and scroll context |
| **Dismissible** | Escape key, click-outside backdrop, and explicit Close button — three dismissal paths |
| **Premium but subordinate** | Subtle box-shadow, semi-transparent white background, standard border — not hero-scale treatment |

### Shell structure

```
<AnimatePresence>
  {isOpen && (
    <>
      <div backdrop />                           [fixed, click-outside dismissal]
      <motion.div role="dialog">                [inline, relative z-index]
        <div stickyHeader>                      [sticky top, white background]
          <h3> All Platforms (N) </h3>
          <input search placeholder />          [read-only, Phase 06-03 activates]
          <button> Close </button>
        </div>
        <div scrollBody>                        [overflowY: auto]
          {category groups → index rows}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Motion entrance/exit

- **Enter:** `opacity: 0, y: -8` → `opacity: 1, y: 0` over 150ms ease-out
- **Exit:** reverse of enter
- **Reduced motion:** skipped entirely via `usePrefersReducedMotion()`

## 2. Index-Row Surface Choice

### How the full inventory is rendered

Each platform renders as a `LauncherIndexRow` — a compact horizontal row (Tier 3):
- 32px logo container (smallest in hierarchy)
- Platform name (0.78rem/600)
- Optional descriptor (0.65rem, inline)
- Optional category tag badge (0.6rem, gray)
- ExternalLink icon (12px, muted)
- Whole-row `<a>` click target

### Why it stays subordinate to the flagship stage

| Differentiator | Flagship (Tier 1) | Index row (Tier 3) |
|---------------|-------------------|-------------------|
| Container | 56px logo, column layout | 32px logo, single-line row |
| Typography | 0.92rem / 650 | 0.78rem / 600 |
| Visual treatment | Card with border + padding + motion | Borderless row with hover |
| CTA | Explicit "Launch" row | Inline ExternalLink icon |
| Context | Homepage primary stage | Overlay secondary index |

The index row is intentionally the most compact form. It cannot be confused with a flagship card.

### Category grouping

Platforms are grouped by `category` from the normalized model. Each group has an uppercase heading showing `{category} ({count})`. Groups are sorted alphabetically. "Other" category collects platforms without a category.

## 3. State Model

### Open/close state

| State | Location | Trigger |
|-------|----------|---------|
| `overlayOpen` | `useState(false)` in `ToolLauncherWorkHub` | Command band "All Platforms" button |
| Open | `setOverlayOpen(true)` | `onAllPlatforms` callback from `LauncherCommandBand` |
| Close | `setOverlayOpen(false)` | Close button, Escape key, or click-outside backdrop |

### Rendering model

The overlay uses `isOpen` prop + `AnimatePresence` instead of conditional mounting:
- `isOpen={false}` → `AnimatePresence` renders nothing (no DOM)
- `isOpen={true}` → `AnimatePresence` mounts `OverlayContent` with enter animation
- `isOpen` transitions `true→false` → `AnimatePresence` plays exit animation then unmounts

### Focus management

- Overlay receives `tabIndex={-1}` and auto-focuses on mount via `useEffect` + `ref.focus()`
- Search input is `readOnly` with `tabIndex={-1}` — visual placeholder only (Phase 06-03 activates)
- Close button is keyboard-focusable and actionable

### Data flow

```
presentation.platformIndex → LauncherAllPlatformsOverlay.index
  → OverlayContent renders category groups
    → LauncherIndexRow per platform
```

No re-derivation on overlay open — the `platformIndex` is pre-computed by `deriveToolLauncherPresentation()` and stable for the render cycle.

## 4. Residual Debt

| Debt | Prompt/Phase | Description |
|------|-------------|-------------|
| **Search behavior** | Phase 06 Prompt 03 | Search input is read-only. Need to wire platform name/alias/keyword filtering. |
| **Keyboard navigation** | Phase 06 Prompt 03 | Arrow key navigation between rows, focus trap in overlay. |
| **Scroll position reset** | Future | Overlay doesn't reset scroll position on re-open after data change. |
| **Responsive overlay** | Phase 07 | Overlay uses 60vh max-height — tablet/mobile may need full-screen sheet. |
| **Featured badge in rows** | Future | Index rows don't indicate which platforms are featured. |
| **Support metadata in rows** | Future | No help/access links visible in index rows (available in utility rail). |
| **Logo asset deployment** | Ops | All rows use Lucide fallback until SVG logos deployed. |
