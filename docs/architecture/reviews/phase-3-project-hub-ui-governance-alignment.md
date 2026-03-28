# Phase 3 Project Hub UI Governance Alignment

**Date:** 2026-03-28
**Version:** 0.13.15
**Scope:** Bring Project Hub UI surfaces under `@hbc/ui-kit` governance and doctrine, eliminating ad hoc styling, raw form elements, and inline pixel values.

## 1. UI Governance Audit Summary

### Divergences found and resolved

| Divergence | Location | Governing Rule | Resolution |
|------------|----------|----------------|------------|
| Raw `<input>` element | `ProjectHubPage.tsx:222` | D-07 (no-raw-form-elements) | Replaced with `HbcTextField` (controlled mode) |
| Raw `<select>` elements (2) | `ProjectHubPage.tsx:231,243` | D-07 (no-raw-form-elements) | Replaced with `HbcSelect` (controlled mode, `HbcSelectOption[]` options) |
| 15+ inline `style={}` props | `ProjectHubPage.tsx` throughout | D-10 (no-inline-styles) | Replaced with Griffel `makeStyles` using `@hbc/ui-kit/theme` spacing/radius tokens |
| Hardcoded pixel values (`12px`, `16px`, `24px`, `200px`, `220px`, `260px`) | `ProjectHubPage.tsx` throughout | D-05 (enforce-hbc-tokens) | All values expressed via `HBC_SPACE_XS`, `HBC_SPACE_SM`, `HBC_SPACE_MD`, `HBC_SPACE_LG` token arithmetic |
| Raw `<label>` wrappers | `ProjectHubPage.tsx:139,148,160` | D-07 implied | Eliminated — `HbcTextField` and `HbcSelect` render their own `<Field>` wrapper with proper label association |

### @hbc/ui-kit dependencies used

| Component / Token | Import Path | Usage |
|-------------------|-------------|-------|
| `HbcTextField` | `@hbc/ui-kit` | Search input (controlled mode) |
| `HbcSelect` | `@hbc/ui-kit` | Status filter, sort selector (controlled mode) |
| `HbcSelectOption` | `@hbc/ui-kit` (type) | Options for `HbcSelect` |
| `makeStyles` | `@griffel/react` | All layout styles (portfolio filter bar, card grids, section spacing, header slot, etc.) |
| `HBC_SPACE_XS` (4px) | `@hbc/ui-kit/theme` | Fine spacing (label gaps, intra-token arithmetic) |
| `HBC_SPACE_SM` (8px) | `@hbc/ui-kit/theme` | Small spacing (filter bar gaps, card body padding) |
| `HBC_SPACE_MD` (16px) | `@hbc/ui-kit/theme` | Standard spacing (grid gaps, padding, margins) |
| `HBC_SPACE_LG` (24px) | `@hbc/ui-kit/theme` | Section spacing (table top margin, section breaks) |

### No ui-kit extensions required

All governance patterns were satisfiable with existing `@hbc/ui-kit` components and `@hbc/ui-kit/theme` tokens. No new components, tokens, or patterns were added to the kit.

### Doctrine clarification

The `HbcTextField` and `HbcSelect` components support a controlled mode (value + onChange) outside of `HbcForm` context via their `ControlledTextField` / `ControlledSelect` internal paths. This mode is appropriate for filter controls that are not part of a form submission workflow.

## 2. Files Changed

| File | Change |
|------|--------|
| `apps/pwa/src/pages/ProjectHubPage.tsx` | Replaced all inline styles with Griffel `makeStyles` using HBC tokens; replaced raw `<input>` with `HbcTextField`; replaced raw `<select>` (x2) with `HbcSelect`; added `STATUS_FILTER_OPTIONS` and `SORT_OPTIONS` constants; added `makeStyles` and token imports |
| `apps/pwa/src/pages/ProjectHubPage.test.tsx` | Updated portfolio state restoration test to use `getByRole('textbox', { name: /search/i })` selector aligned to `HbcTextField` rendering |
| `apps/pwa/package.json` | Version bump 0.13.14 → 0.13.15 |

## 3. Before/After Reasoning

### Form elements (D-07)

**Before:** Raw `<input>` and `<select>` elements with manual `aria-label` and `<label>` wrappers. No density awareness, no theme integration, no Fluent field validation infrastructure.

**After:** `HbcTextField` and `HbcSelect` in controlled mode. These render Fluent `<Field>` + `<Input>` / `<Combobox>` with proper label association (`aria-labelledby`), density tier support via `useFormDensity()`, and validation infrastructure available when needed.

### Inline styles (D-10, D-05)

**Before:** 15+ inline `style={}` props with hardcoded pixel values (`gap: 12`, `marginBottom: 16`, `padding: '0 16px 12px'`, `gap: 16`, `marginTop: 24`, etc.).

**After:** Two Griffel `makeStyles` blocks (`usePortfolioStyles`, `useControlCenterStyles`) with all values derived from `HBC_SPACE_*` token constants. Styles are static, SSR-safe, and theme-aware via Griffel's runtime.

## 4. Remaining Intentional Deviations

| Deviation | Justification | Tracking |
|-----------|---------------|----------|
| `TODO: resolve from auth context` (line 320) | Layout family resolver currently hardcodes `role: 'project-manager'`. Real auth → project-role resolution is a prerequisite for canvas wiring, not a UI governance gap. | Documented in canvas-wiring-validation.md prerequisites |
| Layout-family surfaces use mock spine hooks | Work queue, next moves, and activity hooks return mock data. This is a data-wiring gap, not a UI governance gap. | Documented in canvas-wiring-validation.md §4 |

## 5. Verification

- **Tests:** 162/162 pass (12 test files), zero regressions
- **Lint (ProjectHubPage.tsx):** 0 errors, 1 warning (pre-existing TODO comment)
- **D-07:** Zero raw form element violations
- **D-10:** Zero inline style violations
- **D-05:** Zero hardcoded pixel violations
