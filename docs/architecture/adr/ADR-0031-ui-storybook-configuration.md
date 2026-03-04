# ADR-0031: Storybook Configuration & WCAG 2.2 AA Testing

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.17
**Deciders:** HB Intel Engineering Team

## Context

Phase 4.15 established Storybook compliance across all 30+ core component stories with the 4 required exports (Default, AllVariants, FieldMode, A11yTest). Phase 4.16 finalized the @hbc/ui-kit package at V2.1. However, several shell sub-component and layout stories were missing required exports, the preview background color did not match spec, and no automated WCAG testing was configured for CI.

## Decisions

### 1. Preview Background Correction

The light theme background in `.storybook/preview.tsx` is updated from `#FFFFFF` to `#FAFBFC` to match the HB Intel Design System specification. This ensures stories render against the correct surface color.

### 2. WCAG 2.2 AA Automated Testing via addon-a11y

Global `parameters.a11y` is added to the preview configuration with:
- `color-contrast` and `target-size` rules explicitly enabled
- `runOnly` tags: `wcag2a`, `wcag2aa`, `wcag22aa`, `best-practice`

This enforces WCAG 2.2 AA compliance checking on every story in the Storybook UI accessibility panel.

### 3. Custom Viewport Presets

Two HB Intel-specific viewport presets are added:
- **Field Tablet** (1024x768) — primary field device form factor
- **Field Mobile** (390x844) — iPhone 14 Pro equivalent

These complement the default Storybook viewports for responsive testing.

### 4. Storybook Test Runner for CI

`@storybook/test-runner` with `axe-playwright` integration is added to enable automated accessibility testing in CI pipelines. The test runner:
- Injects axe-core into every story via `preVisit`
- Runs WCAG 2.2 AA checks via `postVisit`
- Produces detailed HTML reports for violations

### 5. Story Export Standardization (Shell & Layout)

All shell sub-component stories (HbcHeader, HbcSidebar, HbcConnectivityBar, HbcAppShell) and layout stories (DetailLayout, CreateUpdateLayout, ToolLandingLayout) now export the 4 required variants: Default, AllVariants, FieldMode, A11yTest. This brings them in line with the core component story standard established in Phase 4.15.

## Consequences

- Every story in the ui-kit now has consistent 4-export structure for design review and QA
- WCAG 2.2 AA violations are surfaced automatically in both Storybook UI and CI
- The Storybook build failure (`@storybook/react-vite` 8.x + Vite 6.x incompatibility) is a pre-existing issue tracked separately; it does not affect `storybook dev` or the test runner
- Field viewport presets enable consistent responsive testing across the team
