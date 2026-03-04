# ADR-0027: UI Field Mode (Dark Theme) Implementation

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.14.4
**References:** PH4.14-UI-Design-Plan.md §14.4, PH4-UI-Design-Plan.md §14 & §20, Blueprint §1d

## Context

The HB Intel platform is used both in office environments and on construction jobsites where sunlight readability is critical. A "Field Mode" dark theme was designed to provide high-contrast surfaces optimized for outdoor use. The hook (`useFieldMode`), theme objects (`hbcLightTheme` / `hbcFieldTheme`), and Storybook decorator already existed, but the application shell lacked full integration.

## Decision

1. **FluentProvider at HbcAppShell level** — Wraps all shell children so every Fluent v9 component receives the correct theme tokens automatically. This mirrors the Storybook decorator pattern.

2. **Dynamic `<meta name="theme-color">`** — The `useFieldMode` hook updates the browser's theme-color meta tag on toggle (Light: `#FFFFFF`, Field: `#0F1419`), ensuring mobile browser chrome blends with the app surface.

3. **HbcUserMenu inline style conditionals** — The dropdown uses the existing `isFieldMode` prop to derive background, text, and border colors at render time. Inline styles are used for theme-conditional values since Griffel classes are static.

4. **Status colors remain identical in both themes** — Green `#00C896`, red `#FF4D4D`, amber `#FFB020`, info `#3B9FFF` were already designed for high contrast on both light and dark backgrounds (PH4.3 §3.1).

## Consequences

- All Fluent v9 primitives inside the shell automatically respond to theme changes
- Mobile browsers display matching chrome color on both iOS and Android
- The user menu dropdown is fully readable in both themes
- Zero breaking changes — existing light-mode behavior is preserved
- Field mode header uses `#0A0E14` (deeper/cooler than the light-mode `#1E1E1E` header)
