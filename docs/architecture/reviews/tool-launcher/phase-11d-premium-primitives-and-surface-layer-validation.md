# Phase 11D — Premium Primitives and Surface Layer: Validation

## Validation scope

This validation covers the premium primitives and surface layer changes introduced in Phase 11D of the Tool Launcher rebuild.

## Build integrity

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | **Pass** — zero errors |
| ESLint (`eslint src/ --ext .ts,.tsx`) | **Pass** — zero errors |
| Production build (`vite build`) | **Pass** — 513.92 KB (from 514.29 KB prior) |
| ui-kit build (`tsc --project tsconfig.json`) | **Pass** — Separator re-export compiles cleanly |

## States and variants validated

### Focus-visible treatment
All launcher interactive elements now receive `outline: 2px solid #225391; outline-offset: 2px` on `:focus-visible` via the CSS module:
- Flagship cards (hero and standard)
- Shelf cards
- Index rows
- Command band buttons (All Platforms, Need Help)
- Search inputs (command band and overlay)
- Search suggestion rows (inset outline)
- Utility rail CTA links
- Overlay close button

### Hover states
- **Flagship cards** — CSS module provides `border-color` intensification; motion library provides scale/shadow animation. Properties do not conflict.
- **Shelf cards** — `background-color` shift to `rgba(34,83,145,0.06)` and `border-left-color` intensification on hover.
- **Index rows** — `background-color` shift to `rgba(34,83,145,0.04)` on hover.
- **Command buttons** — `background-color` and `border-color` shift on hover.
- **Search inputs** — `border-color` shift on hover; `border-color` + `box-shadow` ring on focus-visible.
- **Suggestions** — `background-color` shift on hover.
- **CTA links** — color darkens to `#1a4274` with underline on hover.
- **Close button** — `background-color` and `border-color` shift on hover.

### Active (press) states
- Shelf cards, index rows, and command buttons receive slightly intensified background on `:active`.
- Flagship cards use motion library `whileTap` for scale reduction (unchanged from 11B).

### Reduced-motion behavior
The CSS module includes a `@media (prefers-reduced-motion: reduce)` rule that disables all transitions on every interactive class. This complements the existing `usePrefersReducedMotion()` hook gating in motion-based components.

### Degraded states
- **Empty logo resolution** — LauncherLogo correctly renders icon fallback and monogram fallback for all 4 size presets.
- **Missing notice data** — Badge rendering remains suppressed when no notice is present.
- **Empty rail sections** — Sections with no data are suppressed; separators only render between visible sections.
- **Single-section rail** — Renders correctly without separators.
- **Empty overlay** — "No platforms available" state unchanged.
- **No search results** — "No platforms matching" state unchanged.

## Primitive consistency

| Primitive | Instances | Consistent? |
|-----------|-----------|-------------|
| LauncherLogo | 4 call sites (hero, flagship, shelf, index) | Yes — single component, parameterized by size preset |
| LAUNCHER_TONE_COLORS | 2 consumers (FlagshipCard, UtilityRail) | Yes — single source of truth |
| LAUNCHER_TONE_PRIORITY | 1 consumer (UtilityRail) | Yes — single source of truth |
| Interactive CSS classes | 8 classes across 6 components | Yes — consistent transition timing, focus ring, hover behavior |

## Regressions checked

- **Launch behavior** — `<a>` elements retain `href`, `target`, `rel` attributes unchanged.
- **Data seams** — `toolLauncherContracts.ts`, `toolLauncherNormalization.ts`, `useToolLauncherData.ts`, `launcherSearch.ts` untouched.
- **Composition shell** — `LauncherCompositionShell.tsx` untouched.
- **Root component** — `ToolLauncherWorkHub.tsx` untouched.
- **Icon/asset resolution** — `launcherIconResolution.ts`, `launcherAssetResolution.ts` untouched.
- **Accessibility basics** — All `aria-label`, `role`, `aria-selected`, `aria-expanded`, `aria-haspopup` attributes preserved.
- **Keyboard navigation** — Search dropdown keyboard handling (ArrowDown/Up, Enter, Escape) unchanged.

## Maintainability risks

1. **Inline + CSS module dual styling** — Interactive elements use both inline `React.CSSProperties` (for base layout) and CSS module classes (for pseudo-class states). This is intentional and documented, but future developers must understand the split. The CSS module comment header explains the pattern.
2. **CVA lightweight usage** — The CVA schema on `LauncherFlagshipCard` currently selects only the shared interactive class. As more variant-specific CSS classes are added in later phases, the CVA schema can grow naturally.

## Residual items for later phases

- **Phase 11E** — Search dropdown could benefit from `@floating-ui/react` for positioning (currently uses `position: absolute`).
- **Phase 11G** — Overlay could use `@radix-ui/react-scroll-area` for polished scrolling.
- **Phase 11H** — Keyboard focus treatment could add visible focus ring animations and contrast verification.
