# ADR-0014: Fluent Tokens Over HBC Constants for Theme-Responsive Surfaces

**Status:** Accepted
**Date:** 2026-03-07
**Blueprint Reference:** §1d, §2c
**Foundation Plan Reference:** PH4.3 §3.1 | PH4B.10 §13
**Decision References:** D-PH4C-26, D-PH4C-27

## Context

PH4C.13 audit confirmed shell and page content surfaces were still using static `HBC_SURFACE_LIGHT`
constant values in Griffel `makeStyles`. Griffel compiles those values into static CSS at build
runtime, so styles do not adapt when `FluentProvider` switches office/light, office/dark, or
field mode themes.

Critical symptom: `WorkspacePageShell` title and related content surfaces retained light-mode text
and surface assumptions in dark contexts, reducing readability and violating PH4C accessibility and
theme-contract requirements.

## Decision

Adopt a split strategy for PH4C.13:

1. Use Fluent `tokens.*` for office/content surfaces that must react at runtime to `FluentProvider`.
2. Keep explicit `isFieldMode` class variants where field palette intentionally diverges and uses
   `HBC_SURFACE_FIELD` constants.

### Enforced Mapping Rules

- `HBC_SURFACE_LIGHT['text-primary']` -> `tokens.colorNeutralForeground1`
- `HBC_SURFACE_LIGHT['text-muted']` -> `tokens.colorNeutralForeground3`
- `HBC_SURFACE_LIGHT['surface-0/1/2']` -> `tokens.colorNeutralBackground1/2/3*`
- `HBC_SURFACE_LIGHT['border-default']` -> `tokens.colorNeutralStroke1`
- `HBC_PRIMARY_BLUE` (interactive office controls) -> `tokens.colorBrandBackground` / `tokens.colorBrandForeground1`
- `HBC_ACCENT_ORANGE` may remain fixed for explicit brand accents (active rail marker)

### Exceptions (Intentionally Static)

- Dark header chrome (`HBC_DARK_HEADER`, `HBC_HEADER_TEXT`, `HBC_HEADER_ICON_MUTED`)
- Semantic status colors (`HBC_STATUS_*`, `HBC_CONNECTIVITY.*`)
- Field-specific dropdown/flyout variant surfaces (`HBC_SURFACE_FIELD`) controlled by `isFieldMode`

## Consequences

### Positive

1. Content surfaces now respond to runtime theme transitions without recompilation.
2. Office and field contexts preserve intended contrast and readability.
3. Token usage is aligned with FluentProvider theme propagation rules.
4. Brand/header invariants stay explicit and stable.

### Constraints

1. Engineers must avoid introducing new `HBC_SURFACE_LIGHT` references in theme-responsive surface styles.
2. Field-mode variant classes must remain explicit where palette divergence is intentional.
3. Reviews must treat hardcoded surface hex/HBC light constants as regressions for adaptive surfaces.

## Validation

- [x] WorkspacePageShell migrated to Fluent tokens for title/context/shimmer/fab
- [x] HbcSidebar content surface colors migrated to Fluent tokens
- [x] HbcUserMenu, HbcProjectSelector, HbcToolboxFlyout office classes migrated to Fluent tokens
- [x] Field-mode dropdown/flyout classes kept on `HBC_SURFACE_FIELD`
- [x] Group C header chrome audited (no `HBC_SURFACE_LIGHT` usage)
- [x] Group D bottom nav audited (no `HBC_SURFACE_LIGHT` usage)
- [x] Theme responsiveness tests added and executed for PH4C.13

## References

- `docs/architecture/plans/PH4C.13-Hardcoded-Token-Replacement.md`
- `packages/ui-kit/src/WorkspacePageShell/index.tsx`
- `packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx`
- `packages/ui-kit/src/HbcAppShell/HbcUserMenu.tsx`
- `packages/ui-kit/src/HbcAppShell/HbcProjectSelector.tsx`
- `packages/ui-kit/src/HbcAppShell/HbcToolboxFlyout.tsx`
