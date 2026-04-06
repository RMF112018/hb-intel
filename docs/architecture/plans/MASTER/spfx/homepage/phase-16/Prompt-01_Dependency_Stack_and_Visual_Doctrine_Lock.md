# Prompt 01 — Dependency Stack and Visual Doctrine Lock

## Objective

Force a clear visual-doctrine reset and install the dependency foundation required to escape the current design box.

## Hard Position

Do not treat Fluent UI as the default visual language for homepage work.

You may continue to use Fluent for:
- host-safe interoperability
- token consumption where useful
- focus and accessibility alignment
- specific low-level utility integration

But you must not allow Fluent-like cards, buttons, badges, or inputs to define the premium homepage experience.

## Required Dependency Review

Perform a repo-truth review and, where compatible with the build and packaging model, explicitly introduce or confirm the following packages for homepage premiumization:

- `motion` or `framer-motion`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-separator`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-scroll-area`
- `embla-carousel-react`
- `class-variance-authority`
- `clsx`

## Dependency Intent

### `motion` or `framer-motion`
Use for high-quality, restrained motion:
- reveal choreography
- CTA micro-interactions
- premium state transitions
- subtle layered hero motion
- hover and focus refinement

### `lucide-react`
Use for a coherent, premium iconography system.
Do not use placeholder initials as pseudo-icons.

### `@floating-ui/react`
Use for:
- premium anchored overlays
- command affordances
- search suggestions
- richer launcher interactions
- high-quality tooltips and contextual menus

### `@radix-ui/*`
Use selectively for robust accessible primitives:
- slot composition
- separators
- tooltips
- scroll-area or content rails

### `embla-carousel-react`
Use only if a premium horizontal rail, spotlight shelf, or curated content band materially benefits from it.

### `class-variance-authority` + `clsx`
Use to manage premium visual variants cleanly across new shared primitives.

## Required Deliverables

1. update the relevant workspace and package manifests
2. document which packages are adopted and why
3. document which packages are rejected and why
4. define a clear rule set that prevents fallback to generic Fluent-shaped UI patterns

## Hard Rules

- Do not re-read files that are still within your active context or memory.
- Do not say “Fluent is already sufficient.”
- Do not keep the old visual doctrine intact.
- Do not add dependencies without using them to materially change the visual outcome.
