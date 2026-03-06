# ADR-0047: Menu and Overlay Theme Adaptation (Phase 4b.13)

**Status:** Accepted  
**Date:** 2026-03-06  
**Phase:** Phase 4b.13  
**Deciders:** HB Intel Engineering Team  
**References:**
- PH4B.13-C-UI-Design-Plan.md §4
- PH4B-C-UI-Design-Plan.md (D-12, §11 Remediation Gates)
- PH4B-UI-Design-Plan.md v1.2 (D-01 through D-10 binding baseline)
- HB-Intel-Blueprint-V4.md §1d

## Context

March 2026 post-audit validation identified a critical P1 contrast regression: key shell overlays were using light-only styles (including hard-coded white backgrounds) even when the application was operating in dark/Field Mode. This violated the new remediation binding decision D-12 requiring all overlay surfaces to inherit the active `FluentProvider` theme.

## Decision

Phase 4b.13 enforces D-12 by making overlay surfaces theme-adaptive and removing light-only hard-coded styles from targeted shell surfaces:

1. `HbcProjectSelector` dropdown and item surfaces now derive from mode-aware theme tokens via `useHbcTheme()`.
2. `HbcUserMenu` dropdown, menu item, divider, and toggle surfaces now resolve from provider theme context with a provider-first field-mode fallback path for compatibility.
3. `HbcToolboxFlyout` surface and text now resolve from active theme tokens.
4. `HbcCommandPalette` overlay now uses runtime theme variables sourced from active mode tokens, replacing static `HBC_SURFACE_LIGHT` styling across dialog chrome.
5. `HbcAppShell.stories.tsx` now includes deterministic dark/Field overlay verification stories to prevent recurrence.

## Verification Evidence (2026-03-06)

- `pnpm turbo run build`: pass
- `pnpm turbo run lint`: pass
- `pnpm turbo run check-types`: pass
- `pnpm --filter @hbc/ui-kit build-storybook`: pass
- `pnpm --filter @hbc/ui-kit test-storybook --url http://127.0.0.1:6006`: pass
- `apps/pwa` verification: overlay surfaces (Project Picker, User Menu, Toolbox, Command Palette) render with mode-correct contrast in office/light and dark/Field contexts.

## Consequences

- Overlay theming behavior is now mechanically aligned with D-12 across critical shell interactions.
- Future regressions are easier to detect through explicit Storybook dark/Field verification variants.
- Remaining remediation phases (4b.14+) can proceed without carrying this P1 contrast blocker.

## Addendum — System Theme Awareness Follow-up (D-13, 2026-03-06)

### Context

After the D-12 overlay remediation, a follow-up 4b.13 requirement (plan v1.2) identified that office mode was still not honoring OS `prefers-color-scheme`. The theme hook path defaulted to light mode unless Field Mode was enabled.

### Follow-up Decision

Keep ADR-0047 as the umbrella 4b.13 record and append D-13 implementation evidence:

1. `hbcDarkTheme` is now a full dark-office theme object (no longer an alias to `hbcFieldTheme`).
2. `useFieldMode` now delegates internal `useAppTheme` logic that resolves:
   - `field` theme when Field Mode is active,
   - `dark` or `light` in office mode from live OS `prefers-color-scheme`.
3. The hook now returns `resolvedTheme` for direct `FluentProvider` consumption.
4. `HbcAppShell` and root app providers (PWA + SPFx + hb-site-control) consume `resolvedTheme`, removing hard-coded light-theme roots.
5. `HbcAppShell.stories.tsx` includes deterministic light/dark/field verification variants with `matchMedia` simulation for D-13.

### Follow-up Verification Evidence (2026-03-06)

- `pnpm turbo run build lint check-types`: pass (warnings only, no errors).
- `pnpm --filter @hbc/ui-kit build-storybook`: pass.
- `pnpm --filter @hbc/ui-kit test-storybook --url http://127.0.0.1:6008`: pass (54 suites, 363 tests).
- `pnpm e2e`: pass (25 passed, 4 skipped).
- Manual acceptance: office mode now tracks OS light/dark preference; Field Mode continues to force field theme.
