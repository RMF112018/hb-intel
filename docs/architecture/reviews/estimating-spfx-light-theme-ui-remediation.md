# Estimating SPFx Light Theme UI Remediation

> **Date**: 2026-03-29
> **Scope**: Dark/unstyled rendering fix for Estimating SPFx surface
> **Predecessor**: `estimating-spfx-validation-and-root-cause-report.md`

---

## 1. Root Causes

Two confirmed causes produced the dark/unstyled rendering in the SPFx-hosted Estimating app:

### Cause 1: OS Dark-Mode Fallthrough

`HbcThemeProvider` delegates to `useFieldMode()` which reads `prefers-color-scheme: dark` from the OS. When the user's OS prefers dark mode:
- `useFieldMode()` resolves `theme: 'dark'` and `resolvedTheme: hbcDarkTheme`
- `FluentProvider` receives dark tokens (`#111827`, `#0F172A` surfaces)
- The Estimating app renders with dark backgrounds inside SharePoint's light chrome

**File**: `packages/ui-kit/src/HbcAppShell/hooks/useFieldMode.ts:95-98`

### Cause 2: Hardcoded `:root` CSS Fighting Theme Tokens

`webpart.css` contained `color: #242424; background-color: #ffffff` on `:root`. These hardcoded values conflicted with Fluent theme tokens — when the theme resolved to dark, some surfaces used dark Fluent tokens while the root element forced light colors. This mismatch caused:
- Low-contrast text on dark backgrounds
- Tabs/buttons appearing unstyled (dark variant tokens on white background)
- Inconsistent visual posture across components

**File**: `apps/estimating/src/webpart.css:1`

---

## 2. Solution

### `HbcThemeProvider` `forceTheme` Prop

Added an optional `forceTheme?: 'light'` prop to `HbcThemeProvider`. When set, the provider overrides the auto-detected theme from `useFieldMode()` and always uses `hbcLightTheme`, regardless of OS dark-mode preference or field-mode detection.

This is the correct architectural location for theme enforcement:
- Theme governance stays in `@hbc/ui-kit` where it belongs
- The prop is typed to only accept `'light'` (no arbitrary theme bypass)
- All apps can opt in; only SPFx-hosted surfaces need it now
- The rest of the `useFieldMode()` state (mode, toggle) remains available for consumers that inspect it

### SPFx-Mode Light Theme Enforcement

In `App.tsx`, when `spfxContext` is present (SPFx-hosted runtime), `forceTheme="light"` is passed to `HbcThemeProvider`. In Vite dev mode (no SPFx context), the provider falls through to normal OS-preference theme resolution.

### CSS Hardcoded Color Removal

Removed `color: #242424; background-color: #ffffff` from `webpart.css`. All color/typography is now governed exclusively by Fluent tokens via `HbcThemeProvider` / `FluentProvider`. The CSS file retains structural layout rules only.

---

## 3. Files Changed

| File | Change |
|------|--------|
| `packages/ui-kit/src/HbcAppShell/HbcThemeContext.tsx` | Added `forceTheme?: 'light'` prop; overrides resolved theme when set |
| `apps/estimating/src/App.tsx` | Passes `forceTheme="light"` when `spfxContext` is present |
| `apps/estimating/src/webpart.css` | Removed hardcoded `color`/`background-color` from `:root` |
| `docs/architecture/reviews/estimating-spfx-light-theme-ui-remediation.md` | This document |

---

## 4. UI-Kit Doctrine Alignment

- All interactive elements (buttons, tabs, cards, banners, data tables) use `@hbc/ui-kit` components — confirmed via codebase audit
- No raw HTML buttons or Fluent imports bypassing ui-kit found in production code
- Theme tokens are the single source of truth for color — no hardcoded colors remain in CSS
- `forceTheme` prop follows the existing `HbcThemeProvider` pattern and does not introduce ad-hoc CSS workarounds
- The approach is consistent with ADR-0116 visual governance doctrine: theme is owned by `@hbc/ui-kit`, apps consume it

---

## 5. Component Conformance Audit

| Area | Status | Notes |
|------|--------|-------|
| Buttons (`HbcButton`) | Compliant | All interactive buttons use ui-kit |
| Cards (`HbcCard`) | Compliant | All cards use ui-kit |
| Data Tables (`HbcDataTable`) | Compliant | Coordinator queue uses ui-kit |
| Banners (`HbcBanner`) | Compliant | Error/warning/info use ui-kit |
| Page Shells (`WorkspacePageShell`) | Compliant | All pages use ui-kit shell |
| Status Badges (`HbcStatusBadge`) | Compliant | State display uses ui-kit |
| Empty States (`HbcSmartEmptyState`) | Compliant | Empty list uses ui-kit |
| Step Wizard (`HbcStepWizard`) | Compliant | New request flow uses ui-kit |
| Typography (`HbcTypography`) | Compliant | Headings use ui-kit |
| CSS colors | Fixed | Removed hardcoded values from webpart.css |
| Raw HTML elements | Clean | No raw buttons/tabs in production code |

---

## 6. Manual Validation Checklist (SharePoint-Hosted Runtime)

After deploying the updated `.sppkg`:

- [ ] Open the Estimating app page in SharePoint
- [ ] Verify the page renders with a light/white background (not dark)
- [ ] Verify text is dark-on-light with proper contrast
- [ ] Verify `HbcButton` elements render with blue fill (primary) or outlined (secondary)
- [ ] Verify `WorkspacePageShell` header renders with the HBC header background
- [ ] Verify `HbcDataTable` renders with light surface, visible borders, and readable text
- [ ] Verify `HbcBanner` error/warning states render with colored backgrounds
- [ ] Verify `HbcStatusBadge` pills render with colored backgrounds and legible text
- [ ] Verify `HbcStepWizard` steps render with visible step indicators
- [ ] Toggle OS dark mode on → verify the app STILL renders in light theme
- [ ] Verify no low-contrast or dark-background fragments appear anywhere
- [ ] Verify the overall visual quality is production-ready inside SharePoint chrome
