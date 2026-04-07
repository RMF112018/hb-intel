# Phase 11D — Premium Primitives and Surface Layer: Summary

## Phase objective

Build or refine launcher-owned primitives so the rebuilt surface is coherent, premium, reusable, and maintainable. Convert the launcher from isolated component-level styling decisions into a stronger surface system using the doctrine-approved premium stack.

## What changed

### New files created

| File | Purpose |
|------|---------|
| `LauncherLogo.tsx` | Unified logo renderer replacing three duplicate implementations (`LogoContent`, `ShelfLogoContent`, `IndexLogoContent`). Parameterized by size preset (`hero`, `flagship`, `shelf`, `index`) with consistent container dimensions, icon sizes, and brand-tinted backgrounds. |
| `launcherTokens.ts` | Shared launcher tone colors and priority constants. Eliminates duplicate `BADGE_TONE_COLORS` / `NOTICE_TONE_COLORS` / `TONE_PRIORITY` maps across components. |
| `launcher-interactive.module.css` | CSS module providing pseudo-class interactive states (`:hover`, `:focus-visible`, `:active`) that inline styles cannot express. Eight class targets covering all launcher interactive surfaces. |
| `launcher-interactive.module.css.d.ts` | TypeScript declarations for the CSS module. |

### Primitives added or refactored

1. **LauncherLogo** — Single parameterized component with 4 size presets. Renders branded container + logo content (image/icon/monogram) with size-appropriate dimensions, padding, and colors. All three prior logo renderers removed.

2. **LAUNCHER_TONE_COLORS** — Unified tone-to-color map for notice badges and status indicators. Consumed by `LauncherFlagshipCard` and `LauncherUtilityRail`.

3. **LAUNCHER_TONE_PRIORITY** — Notice sort priority constants. Consumed by `LauncherUtilityRail`.

4. **CVA variant system** — `LauncherFlagshipCard` now uses `class-variance-authority` with `clsx` for hero/standard variant axis, layering CSS module interactive class onto the inline style base.

5. **CSS module interactive classes** — Eight classes providing proper hover, focus-visible, and active states across all launcher interactive elements:
   - `.flagshipCard` — hero/standard featured cards
   - `.shelfCard` — workflow shelf cards
   - `.indexRow` — overlay index rows
   - `.commandButton` — command band action buttons
   - `.commandSearchInput` — search inputs (command band + overlay)
   - `.suggestion` — search suggestion rows
   - `.utilityCtaLink` — utility rail CTA links
   - `.closeButton` — overlay close button

6. **Radix Separator** — Interleaved between utility rail sections for refined hierarchy with brand-tinted gradient styling.

### Components modified

| Component | Changes |
|-----------|---------|
| `LauncherFlagshipCard` | Uses `LauncherLogo`, `LAUNCHER_TONE_COLORS`, CVA+clsx, CSS module class. Removed `LogoContent` and 8 logo/monogram style objects. |
| `LauncherShelfCard` | Uses `LauncherLogo`, CSS module class. Removed `ShelfLogoContent` and 3 logo style objects. Removed inline `transition`. |
| `LauncherIndexRow` | Uses `LauncherLogo`, CSS module class. Removed `IndexLogoContent` and 3 logo style objects. Removed inline `transition`. |
| `LauncherCommandBand` | CSS module classes on buttons, search input, and suggestions. Removed inline `transition` declarations. |
| `LauncherAllPlatformsOverlay` | CSS module classes on search input and close button. Removed inline `transition` declarations. |
| `LauncherUtilityRail` | Uses `LAUNCHER_TONE_COLORS`/`LAUNCHER_TONE_PRIORITY`, CSS module class on CTA links, Radix Separator between sections. |

### Upstream change

`packages/ui-kit/src/homepage.ts` — Added `Separator` re-export from `@radix-ui/react-separator` (one line, follows existing re-export pattern for `motion`, `clsx`, `cva`).

## What remained launcher-local

- All inline `React.CSSProperties` style objects for base layout and visual treatment remain in each component. Only interactive state transitions moved to the CSS module.
- Card-level motion variants (`heroHover`, `standardHover`, `tapVariant`) remain in `LauncherFlagshipCard` — they handle transform/shadow animation via the motion library, complementing (not conflicting with) the CSS module's background/border hover states.
- Logo resolution chain (`resolveLogoAsset`, `resolvePlatformIcon`) remains unchanged in `launcherAssetResolution.ts` and `launcherIconResolution.ts`.

## What was extended in @hbc/ui-kit

One re-export addition: `Separator` from `@radix-ui/react-separator` via `@hbc/ui-kit/homepage`. No new components, types, or visual primitives were added to ui-kit.

## Why the resulting primitive layer is stronger

1. **No duplicate renderers** — Three near-identical logo renderers consolidated into one parameterized component.
2. **No duplicate constants** — Tone colors and priorities defined once, consumed everywhere.
3. **Real interactive states** — All launcher interactive elements now have proper `:hover`, `:focus-visible`, and `:active` CSS pseudo-class treatment instead of relying on browser defaults or transition declarations without targets.
4. **Reduced-motion safety** — CSS module includes a `@media (prefers-reduced-motion: reduce)` blanket disabling all transitions.
5. **CVA variant axis** — Flagship card variant selection is now explicit and documented via CVA schema.
6. **Section hierarchy** — Radix Separator between utility rail sections provides refined visual rhythm.
7. **Smaller surface area** — ~30 lines of duplicate code removed; style object count reduced across 3 components.
