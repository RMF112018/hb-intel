# 02B — Homepage-Safe UI-Kit Usage Guide

## Purpose

Define exactly how homepage webparts consume `@hbc/ui-kit` so Prompt-03+ implementation stays bundle-conscious, accessible, and governance-compliant.

## Allowed Entry Points

- `@hbc/ui-kit/homepage` — default visual and contract surface for homepage webparts.
- `@hbc/ui-kit/theme` — token-only use when additional styling aliases are required.
- `@hbc/ui-kit/icons` — icon-only imports for homepage-specific composition needs.

## Prohibited Patterns

- Direct homepage imports from `@hbc/ui-kit` full entry point.
- Shell recreation through `@hbc/ui-kit/app-shell` in homepage webpart tiles.
- New homepage primitives created outside `@hbc/ui-kit` when they are reusable visual patterns.

## Primitive and Wrapper Guidance

- Use homepage primitives from `@hbc/ui-kit/homepage` for webpart composition.
- Create homepage wrappers only when repeated composition logic is needed across multiple homepage webparts.
- Keep wrappers thin: no domain business logic, no ad hoc token systems, no shell behavior.

## Motion, Density, and Accessibility Rules

- Light-theme-first behavior is required for homepage surfaces.
- Reduced-motion behavior must be respected (`prefers-reduced-motion: reduce`) for all animated affordances.
- Critical information must never be hover-only.
- Focus-visible states are mandatory on interactive controls.
- Homepage defaults to `comfortable` density with touch-target minimums aligned to `HBC_DENSITY_TOKENS`.

## Implementation Boundary

- This guide governs homepage webparts in the `hb-webparts` stream only.
- It does not replace broader `ui-kit` platform rules; it narrows them for constrained homepage usage.

## Prompt-02 Closure Check

- Allowed and prohibited import patterns are explicit.
- Accessibility and reduced-motion constraints are represented in both docs and shared contract code.
- Downstream prompts can consume a stable rule set without reinterpreting `ui-kit` policy.
