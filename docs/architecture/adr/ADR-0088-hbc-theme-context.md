# ADR-0013 — Hbc Theme Context As Single Theme Source

- Status: Accepted
- Date: 2026-03-07
- Deciders: UI Kit / Shell maintainers
- Related Decisions: D-PH4C-21, D-PH4C-22, D-PH4C-23, D-PH4C-13
- Related Plan: PH4C.11 Field Mode Theme Wiring

## Context

Field mode and theme resolution were previously created through independent `useFieldMode()` calls across app roots and shell components. This produced isolated local state instances and prevented theme changes from propagating consistently to every Fluent surface.

## Decision

Adopt a single React context source in `@hbc/ui-kit`:

- `HbcThemeProvider` calls `useFieldMode()` exactly once per app tree.
- `HbcThemeProvider` owns the single `FluentProvider` root per app tree.
- `useHbcTheme()` reads from `HbcThemeContext` and throws when used outside `HbcThemeProvider`.
- Direct `useFieldMode()` usage is removed from all theme consumers except the context provider and the hook implementation.

## Rationale

- Keeps Fluent theme resolution synchronous at the application root.
- Guarantees one authoritative mode/theme state object for every descendant.
- Preserves existing `useFieldMode` compatibility export while enforcing context propagation for active consumers.
- Matches PH4C.11 requirement that field mode toggle updates all chrome/data surfaces without reload.

## Consequences

- All app roots must wrap their provider trees with `HbcThemeProvider`.
- Components calling `useHbcTheme()` now require provider presence and fail fast with a descriptive error if missing.
- Storybook preview must use `HbcThemeProvider` to exercise production-equivalent theme wiring.
