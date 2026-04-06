# P16-01 — Dependency Stack and Visual Doctrine Lock

## Purpose

This document records the dependency adoption decisions and visual doctrine rules for the Phase 16 design-breakout initiative. It is binding on all subsequent Phase 16 implementation prompts.

---

## Adopted Dependencies

Added to `packages/ui-kit/package.json` as production dependencies.

| Package | Version | Purpose | Bundle impact |
|---|---|---|---|
| `lucide-react` | ^0.475.0 | Coherent SVG icon system. Replaces Unicode-symbol/text-initials approach. | Tree-shakeable, ~1KB per icon imported |
| `clsx` | ^2.1.0 | Conditional class composition. | 2KB, zero dependencies |
| `class-variance-authority` | ^0.7.0 | Typed style variants for premium components. Pairs with clsx. | ~1KB, zero dependencies |
| `motion` | ^12.0.0 | Premium reveal, transition, and micro-interaction motion. Supports `prefers-reduced-motion` natively. | Tree-shakeable, import only what's used |
| `@radix-ui/react-separator` | ^1.1.0 | Accessible semantic separator primitive. | Tiny, headless |
| `@radix-ui/react-slot` | ^1.1.0 | Polymorphic slot composition for premium component patterns. | Tiny, headless |
| `@radix-ui/react-tooltip` | ^1.1.0 | Accessible tooltip primitive with floating positioning. | Includes @floating-ui as transitive |

## Deferred Dependencies

Not added now. Add only when a specific surface requires them.

| Package | Reason for deferral |
|---|---|
| `@floating-ui/react` | Tooltip and overlay needs are covered by Radix tooltip for now. Add when command overlays or search suggestions require standalone floating UI. |
| `@radix-ui/react-scroll-area` | No surface currently requires custom scroll areas. Add when a content rail or spotlight shelf needs it. |
| `embla-carousel-react` | Already a transitive dependency via Fluent UI. Add direct dependency only when a horizontal spotlight shelf is implemented. |

## Rejected Dependencies

None rejected outright. All evaluated packages are either adopted or deferred with clear adoption criteria.

---

## Visual Doctrine Rules

These rules are binding on all Phase 16 implementation work.

### Rule 1: Fluent UI is not the visual north star

Fluent UI may be used for:
- SPFx host-safe interoperability
- Token consumption where useful
- Focus and accessibility alignment
- Specific low-level utility integration (e.g., Griffel for shared components that predate the new system)

Fluent UI must NOT:
- Define the dominant homepage visual identity
- Serve as the default card, button, badge, or input treatment for homepage surfaces
- Be the reason a surface looks "enterprise standard" rather than "premium custom"

### Rule 2: Icons must use lucide-react

New homepage primitives and surface rebuilds must use `lucide-react` icons, not:
- Unicode symbols or text characters inside icon frames
- Text-initials (FI, HR, SF) as pseudo-icons
- Fluent UI icon components (which carry Fluent's visual identity)

Existing Phase 15 Unicode icons may remain until the surface is rebuilt in Phase 16.

### Rule 3: Variant-driven components use cva + clsx

New homepage-specific shared primitives must use `class-variance-authority` + `clsx` for variant management, not:
- Griffel `makeStyles` (which locks the component into Fluent's styling architecture)
- Inline style objects with conditional spreading
- Manual `className` string concatenation

This does not apply to existing ui-kit components that predate Phase 16 and are shared across non-homepage surfaces.

### Rule 4: Motion uses the `motion` package

Premium motion (reveal choreography, CTA micro-interactions, hover refinement, state transitions) must use the `motion` package, not:
- CSS transitions alone (which cannot express choreographed sequences)
- Custom `requestAnimationFrame` loops
- No-op motion (removing animation because "it's simpler")

All motion must respect `prefers-reduced-motion` (the `motion` package handles this natively).

### Rule 5: Tooltips and overlays use Radix primitives

Interactive overlays (tooltips, contextual menus, anchored panels) must use `@radix-ui/react-tooltip` or equivalent Radix primitives, not:
- Custom absolute-positioned `<div>` elements
- Fluent UI popover/tooltip components (which carry Fluent's visual identity)
- Title attributes as tooltip substitutes

### Rule 6: The homepage must feel custom-built

Every major homepage surface must feel intentionally designed for HB Central. The following patterns are prohibited in new Phase 16 work:
- Fluent-shaped card grids as the dominant layout
- Stock-looking buttons, badges, search inputs, or panels
- Thin borders, timid shadows, and polite layout rhythm as the primary surface definition
- Large empty gradient slabs with a button and a line of copy
- Surfaces where the only visual difference between zones is border color or background tint

---

## Verification

- `pnpm install` completed successfully (exit 0) with all 7 adopted packages resolved
- `@hbc/ui-kit` check-types: pass, build: pass
- `@hbc/spfx-hb-webparts` check-types: pass, build: pass (347 KB JS, no regression), lint: pass
- `@hbc/spfx-hb-shell-extension` check-types: pass, build: pass (147 KB JS), lint: pass, test: 29/29 pass
- No bundle size regression (deps are tree-shakeable and not yet consumed in source)

## Note on workspace installation

The `apps/dev-harness` package has a pre-existing workspace resolution issue with `@hbc/spfx-admin`. This required temporarily removing the reference during `pnpm install` to allow the lockfile resolver to process new dependencies. The reference was restored after installation. This issue predates Phase 16 and should be investigated independently.
