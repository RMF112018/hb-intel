# ADR-0030: @hbc/ui-kit V2.1 Package Finalization

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.16
**Deciders:** HB Intel Engineering Team

## Context

Phases 4.3–4.15 built all 35+ components, the theme system, ESLint enforcement, and Storybook compliance for the @hbc/ui-kit package. Phase 4.16 finalizes the package for V2.1 by addressing remaining gaps in configuration, theme utilities, and documentation.

## Decisions

### 1. Version Bump to 2.1.0

The package version is updated from 0.0.1 to 2.1.0 to align with the V2.1 Design System specification. This signals the completion of the component library and theme system.

### 2. Theme Hooks as Canonical Wrappers

Three canonical hooks are introduced in `@hbc/ui-kit/theme`:
- `useHbcTheme()` — wraps `useFieldMode` from HbcAppShell/hooks
- `useConnectivity()` — wraps `useOnlineStatus` from HbcAppShell/hooks
- `useDensity()` — new hook for density tier management

These provide stable import paths (`@hbc/ui-kit/theme`) decoupled from internal component structure. Consumers should prefer these canonical imports over deep imports.

### 3. Density Tier System

A three-tier density system is introduced:
- **compact** (32px rows) — mouse/trackpad input
- **comfortable** (40px rows) — default/mixed input
- **touch** (56px rows) — touch/coarse pointer input

Auto-detection uses `pointer: coarse` media query. Users can override via localStorage persistence. This supports construction field workers on tablets alongside office users on desktops.

### 4. Vite Library Build Configuration

A `vite.config.ts` is added for Storybook development and bundle analysis. The production build continues to use `tsc` for type-safe compilation. ECharts is separated into a manual chunk to keep the core bundle under 500KB.

### 5. Per-Component Documentation

27 markdown files in `docs/reference/ui-kit/` provide standardized documentation for every public component. Each file includes: overview, import path, props table, usage example, Field Mode behavior, accessibility notes, and SPFx constraints.

### 6. Subpath Exports

Package.json exports are extended with `./theme` and `./icons` subpaths, enabling:
```ts
import { useHbcTheme } from '@hbc/ui-kit/theme';
import { HbcLogo } from '@hbc/ui-kit/icons';
```

## Consequences

- All components have standardized reference documentation
- Theme hooks have a single canonical import path
- Density tiers enable responsive UI across device types
- Bundle analysis tooling is available via `pnpm analyze`
- No breaking changes — all additions are backward-compatible
