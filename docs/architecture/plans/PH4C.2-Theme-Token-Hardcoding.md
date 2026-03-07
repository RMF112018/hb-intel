# Phase 4C Task 2 – Theme Token Hardcoding Remediation

**Version:** 1.0 (Token Replacement, CSS Variables, Dual-Theme Support)
**Purpose:** This document defines the complete implementation steps to replace all hardcoded color and style values in HbcDataTable and HbcConnectivityBar with semantic CSS variables that support both light and dark (Field Mode) themes. This addresses MEDIUM-severity audit findings F-03, F-04, F-05, and F-02.
**Audience:** Implementation agents, UI engineers, design system maintainers, QA specialists
**Implementation Objective:** Deliver zero hardcoded color values in UI Kit components with full token compliance across both light and dark themes, dual-theme validation, and reference documentation.

---

## Prerequisites

This task has ONE hard prerequisite:

**PH4C.7 (Shimmer Shared Utility Module) must be completed FIRST**

The shimmer overlay pattern requires the shared shimmer module created in PH4C.7. PH4C.2 depends on:
- `packages/ui-kit/src/shared/shimmer.ts` exists and exports shimmer overlay patterns
- Theme definitions include shimmer-related CSS variables

**Verification command (run BEFORE starting PH4C.2):**
```bash
# Verify shimmer module exists
ls -la packages/ui-kit/src/shared/shimmer.ts && echo "✓ Shimmer module ready"

# Verify it exports expected functions
grep -E "export.*shimmer|export.*overlay" packages/ui-kit/src/shared/shimmer.ts && echo "✓ Exports verified"

# Verify theme definitions have shimmer variables (will be updated in this task)
grep -n "hbc-surface" packages/ui-kit/src/theme.ts | head -3 && echo "✓ Theme file accessible"
```

**If any verification fails, STOP and complete PH4C.7 first.**

---

## 4C.2 Theme Token Hardcoding Remediation Implementation

### Task 4C.2a: HbcDataTable Shimmer Overlay Opacity Token (F-03)

**Context:** HbcDataTable uses a hardcoded `rgba(255,255,255,0.85)` opacity for the shimmer loading overlay. This value is white-based and fails in Field Mode (dark theme where the overlay should be dark). (D-PH4C-07, D-PH4C-08, F-03)

#### 4C.2.1 Create CSS Variable in hbcLightTheme

1. Open `packages/ui-kit/src/theme.ts`
2. Locate the `hbcLightTheme` object definition
3. Add a new CSS variable for shimmer surface opacity:
   ```typescript
   // D-PH4C-07: Token replacement for shimmer overlay opacity (F-03)
   hbcLightTheme: {
     // ... existing theme properties ...
     '--hbc-surface-2-alpha': 'rgba(255, 255, 255, 0.85)',
     // ... rest of theme ...
   }
   ```
4. Place this variable in a logical grouping with other surface/overlay tokens
5. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variable defined in hbcLightTheme.

#### 4C.2.2 Create CSS Variable in hbcFieldTheme (Dark Mode)

1. In the same `theme.ts` file, locate the `hbcFieldTheme` object
2. Add the same CSS variable with a dark-mode appropriate value:
   ```typescript
   // D-PH4C-07: Dark mode equivalent for shimmer overlay
   hbcFieldTheme: {
     // ... existing theme properties ...
     '--hbc-surface-2-alpha': 'rgba(20, 20, 20, 0.85)',
     // ... rest of theme ...
   }
   ```
3. Use a dark color (`rgba(20, 20, 20, ...)`) that provides opacity overlay effect in dark backgrounds
4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variable defined in both hbcLightTheme and hbcFieldTheme with appropriate values.

#### 4C.2.3 Replace Hardcoded Shimmer Opacity in HbcDataTable

1. Open `packages/ui-kit/src/HbcDataTable/index.tsx`
2. Search for `rgba(255,255,255,0.85)` or similar hardcoded opacity values
3. Find the shimmer overlay CSS/style application (usually a `makeStyles` return, inline style, or CSS class)
4. Replace the hardcoded value with the CSS variable:

   **Before:**
   ```typescript
   const shimmerOverlay = {
     backgroundColor: 'rgba(255, 255, 255, 0.85)',
     // ... other styles
   };
   ```

   **After:**
   ```typescript
   const shimmerOverlay = {
     backgroundColor: 'var(--hbc-surface-2-alpha)',
     // ... other styles
   };
   ```

5. If the opacity is applied via a CSS class in `HbcDataTable.module.css`, update the CSS file instead:
   ```css
   .shimmerOverlay {
     background-color: var(--hbc-surface-2-alpha);
   }
   ```

6. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** Hardcoded shimmer opacity replaced with CSS variable.

#### 4C.2.4 Test Shimmer in Light Mode

1. Open Storybook to the HbcDataTable story
2. Trigger loading state to display shimmer overlay (if Storybook has a loading control, set it to true)
3. Verify shimmer overlay appears as a white semi-transparent layer (light mode)
4. Overlay should not be too opaque or too transparent (target: 85% opaque)
5. Screenshot or document appearance

**Expected output:** Shimmer appears correct in light mode with appropriate opacity.

#### 4C.2.5 Test Shimmer in Field Mode (Dark Theme)

1. In Storybook, switch to Field Mode / dark theme (theme toggle control)
2. Trigger loading state to display shimmer overlay
3. Verify shimmer overlay appears as a dark semi-transparent layer (dark mode)
4. Overlay opacity should be 85% (same as light mode parameter)
5. Overlay should be visually distinct but not too dark (readability must be maintained)
6. Screenshot or document appearance

**Expected output:** Shimmer appears correct in dark mode with dark overlay that maintains readability.

#### 4C.2.6 Verify No Hardcoded Shimmer Values Remain

1. Search the entire HbcDataTable implementation for any remaining `rgba(255,255,` patterns:
   ```bash
   grep -n "rgba(255,255," packages/ui-kit/src/HbcDataTable/index.tsx
   ```
2. Also search for `rgba(255,` (missing comma syntax variant):
   ```bash
   grep -n "rgba(255," packages/ui-kit/src/HbcDataTable/index.tsx
   ```
3. If any matches are found, replace them with the CSS variable
4. Verify grep returns zero results

**Expected output:** Zero hardcoded `rgba(255,255,...` values in HbcDataTable.

---

### Task 4C.2b: HbcDataTable Stale/Fresh Border Tokens (F-04)

**Context:** HbcDataTable uses `wrapperStale` and `wrapperFresh` border styles that directly reference `HBC_SURFACE_LIGHT['border-default']`. This breaks in Field Mode because the `HBC_SURFACE_LIGHT` object is light-only. (D-PH4C-07, D-PH4C-08, F-04)

#### 4C.2.7 Create CSS Variable in hbcLightTheme

1. Open `packages/ui-kit/src/theme.ts`
2. Locate the `hbcLightTheme` object
3. Add a new CSS variable for default border color:
   ```typescript
   // D-PH4C-07: Token replacement for stale/fresh border (F-04)
   '--hbc-border-default': '#D1D5DB',
   ```
   (Use the existing light border color from `HBC_SURFACE_LIGHT['border-default']` if available, otherwise use a standard light gray)
4. Place in a logical border color grouping
5. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variable defined in hbcLightTheme.

#### 4C.2.8 Create CSS Variable in hbcFieldTheme (Dark Mode)

1. In the same `theme.ts` file, locate `hbcFieldTheme`
2. Add the same CSS variable with a dark-mode appropriate value:
   ```typescript
   // D-PH4C-07: Dark mode equivalent for border color
   '--hbc-border-default': '#4B5563',
   ```
   (Use a dark gray appropriate for dark theme borders)
3. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variable defined in both hbcLightTheme and hbcFieldTheme.

#### 4C.2.9 Replace HBC_SURFACE_LIGHT Reference in HbcDataTable Stale/Fresh Wrappers

1. Open `packages/ui-kit/src/HbcDataTable/index.tsx`
2. Find the `wrapperStale` and `wrapperFresh` style definitions (search for "wrapperStale" and "wrapperFresh")
3. Locate the line that references `HBC_SURFACE_LIGHT['border-default']`:

   **Before:**
   ```typescript
   const wrapperStale = {
     borderColor: HBC_SURFACE_LIGHT['border-default'],
     // ... other styles
   };

   const wrapperFresh = {
     borderColor: HBC_SURFACE_LIGHT['border-default'],
     // ... other styles
   };
   ```

   **After:**
   ```typescript
   const wrapperStale = {
     borderColor: 'var(--hbc-border-default)',
     // ... other styles
   };

   const wrapperFresh = {
     borderColor: 'var(--hbc-border-default)',
     // ... other styles
   };
   ```

4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** wrapperStale and wrapperFresh use CSS variable instead of HBC_SURFACE_LIGHT reference.

#### 4C.2.10 Test Stale/Fresh Borders in Light Mode

1. In Storybook, render HbcDataTable with rows marked as "stale" and "fresh" (if applicable)
2. Verify borders appear in light gray (#D1D5DB or similar)
3. Borders should be subtle but visible
4. Screenshot or document appearance

**Expected output:** Stale/fresh borders appear correct in light mode.

#### 4C.2.11 Test Stale/Fresh Borders in Field Mode (Dark Theme)

1. Switch Storybook to Field Mode / dark theme
2. Verify borders appear in dark gray (#4B5563 or similar)
3. Borders should be visible against dark background
4. Screenshot or document appearance

**Expected output:** Stale/fresh borders appear correct in dark mode.

---

### Task 4C.2c: HbcDataTable Responsibility Row Background Token (F-05)

**Context:** HbcDataTable uses `trResponsibility` (row background) that references `HBC_SURFACE_LIGHT['responsibility-bg']`. This breaks in Field Mode. (D-PH4C-07, D-PH4C-08, F-05)

#### 4C.2.12 Create CSS Variable in hbcLightTheme

1. Open `packages/ui-kit/src/theme.ts`
2. Locate the `hbcLightTheme` object
3. Add a new CSS variable for responsibility row background:
   ```typescript
   // D-PH4C-07: Token replacement for responsibility row background (F-05)
   '--hbc-responsibility-bg': '#EFF6FF',
   ```
   (Use a light blue or appropriate light color for responsibility highlighting; adjust based on existing `HBC_SURFACE_LIGHT['responsibility-bg']` value)
4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variable defined in hbcLightTheme.

#### 4C.2.13 Create CSS Variable in hbcFieldTheme (Dark Mode)

1. In the same `theme.ts` file, locate `hbcFieldTheme`
2. Add the same CSS variable with a dark-mode appropriate value:
   ```typescript
   // D-PH4C-07: Dark mode equivalent for responsibility row background
   '--hbc-responsibility-bg': '#1E3A5F',
   ```
   (Use a dark blue or appropriate dark color for dark theme)
3. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variable defined in both themes.

#### 4C.2.14 Replace HBC_SURFACE_LIGHT Reference in HbcDataTable trResponsibility

1. Open `packages/ui-kit/src/HbcDataTable/index.tsx`
2. Find the `trResponsibility` style definition (search for "trResponsibility")
3. Locate the line that references `HBC_SURFACE_LIGHT['responsibility-bg']`:

   **Before:**
   ```typescript
   const trResponsibility = {
     backgroundColor: HBC_SURFACE_LIGHT['responsibility-bg'],
     // ... other styles
   };
   ```

   **After:**
   ```typescript
   const trResponsibility = {
     backgroundColor: 'var(--hbc-responsibility-bg)',
     // ... other styles
   };
   ```

4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** trResponsibility uses CSS variable instead of HBC_SURFACE_LIGHT reference.

#### 4C.2.15 Test Responsibility Rows in Light Mode

1. In Storybook, render HbcDataTable with responsibility-marked rows (if applicable)
2. Verify row background appears in light blue (#EFF6FF or similar)
3. Background should be subtle and not interfere with text readability
4. Screenshot or document appearance

**Expected output:** Responsibility rows appear correct in light mode.

#### 4C.2.16 Test Responsibility Rows in Field Mode (Dark Theme)

1. Switch Storybook to Field Mode / dark theme
2. Verify row background appears in dark blue (#1E3A5F or similar)
3. Background should be visible and match the light mode intent
4. Screenshot or document appearance

**Expected output:** Responsibility rows appear correct in dark mode.

---

### Task 4C.2d: HbcConnectivityBar Hardcoded Colors (F-02)

**Context:** HbcConnectivityBar uses hardcoded `color: '#FFFFFF'` and `border: 'rgba(255,255,255,0.55)'` in the actionButton style. These fail in dark themes. (D-PH4C-07, D-PH4C-08, F-02)

#### 4C.2.17 Create Semantic CSS Variables in hbcLightTheme

1. Open `packages/ui-kit/src/theme.ts`
2. Locate the `hbcLightTheme` object
3. Add CSS variables for action button styling on dark/contrast backgrounds:
   ```typescript
   // D-PH4C-07: Token replacement for ConnectivityBar action button (F-02)
   '--hbc-text-on-dark': '#FFFFFF',
   '--hbc-text-on-dark-alpha': 'rgba(255, 255, 255, 0.55)',
   ```
4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variables defined in hbcLightTheme.

#### 4C.2.18 Create Semantic CSS Variables in hbcFieldTheme (Dark Mode)

1. In the same `theme.ts` file, locate `hbcFieldTheme`
2. Add the same CSS variables with dark-mode appropriate values:
   ```typescript
   // D-PH4C-07: Dark mode equivalent for ConnectivityBar action button
   '--hbc-text-on-dark': '#1F2937',
   '--hbc-text-on-dark-alpha': 'rgba(31, 41, 55, 0.55)',
   ```
   (Use dark text for dark mode, adjusting the alpha for appropriate contrast)
3. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** CSS variables defined in both themes.

#### 4C.2.19 Replace Hardcoded Colors in HbcConnectivityBar

1. Open `packages/ui-kit/src/HbcAppShell/HbcConnectivityBar.tsx`
2. Find the actionButton style definition (search for "actionButton" or hardcoded `#FFFFFF`)
3. Locate the lines with hardcoded colors:

   **Before:**
   ```typescript
   const actionButton = {
     color: '#FFFFFF',
     border: 'rgba(255,255,255,0.55)',
     // ... other styles
   };
   ```

   **After:**
   ```typescript
   const actionButton = {
     color: 'var(--hbc-text-on-dark)',
     border: `1px solid var(--hbc-text-on-dark-alpha)`,
     // ... other styles
   };
   ```

4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** HbcConnectivityBar action button uses CSS variables instead of hardcoded colors.

#### 4C.2.20 Test ConnectivityBar in Light Mode

1. In Storybook or dev-harness, render HbcConnectivityBar
2. Verify text color is white (#FFFFFF)
3. Verify border appears with appropriate opacity
4. Test interactive action button (if present)
5. Screenshot or document appearance

**Expected output:** ConnectivityBar appears correct in light mode.

#### 4C.2.21 Test ConnectivityBar in Field Mode (Dark Theme)

1. Switch to Field Mode / dark theme
2. Verify text color appears as dark gray (#1F2937)
3. Verify border appears with appropriate opacity
4. Interactive elements should remain accessible
5. Screenshot or document appearance

**Expected output:** ConnectivityBar appears correct in dark mode with appropriate contrast.

#### 4C.2.22 Verify No Remaining HBC_SURFACE_LIGHT References in HbcDataTable

1. Run grep to search for any remaining direct HBC_SURFACE_LIGHT references in HbcDataTable:
   ```bash
   grep -n "HBC_SURFACE_LIGHT\[" packages/ui-kit/src/HbcDataTable/index.tsx
   ```
2. If any matches are found:
   - Identify the property being referenced (e.g., `['border-color']`, `['background']`)
   - Create a new CSS variable for it (following the pattern from tasks 4C.2.1–4C.2.21)
   - Replace the reference with the CSS variable
3. Repeat until grep returns zero results
4. Expected output: Zero HBC_SURFACE_LIGHT references in HbcDataTable

**Expected output:** No hardcoded HBC_SURFACE_LIGHT references remain in HbcDataTable.

---

## Success Criteria Checklist

### Shimmer Overlay (F-03)
- [ ] CSS variable `--hbc-surface-2-alpha` created in hbcLightTheme with light value
- [ ] CSS variable `--hbc-surface-2-alpha` created in hbcFieldTheme with dark value
- [ ] HbcDataTable shimmer overlay uses `var(--hbc-surface-2-alpha)`
- [ ] Shimmer appears correct in light mode (white overlay)
- [ ] Shimmer appears correct in dark mode (dark overlay)
- [ ] Grep confirms zero `rgba(255,255,` in HbcDataTable

### Stale/Fresh Borders (F-04)
- [ ] CSS variable `--hbc-border-default` created in hbcLightTheme
- [ ] CSS variable `--hbc-border-default` created in hbcFieldTheme
- [ ] wrapperStale and wrapperFresh use `var(--hbc-border-default)`
- [ ] Borders appear correct in light mode (light gray)
- [ ] Borders appear correct in dark mode (dark gray)
- [ ] Grep confirms zero `HBC_SURFACE_LIGHT['border-default']` in HbcDataTable

### Responsibility Row Background (F-05)
- [ ] CSS variable `--hbc-responsibility-bg` created in hbcLightTheme
- [ ] CSS variable `--hbc-responsibility-bg` created in hbcFieldTheme
- [ ] trResponsibility uses `var(--hbc-responsibility-bg)`
- [ ] Row background appears correct in light mode (light blue)
- [ ] Row background appears correct in dark mode (dark blue)
- [ ] Grep confirms zero `HBC_SURFACE_LIGHT['responsibility-bg']` in HbcDataTable

### ConnectivityBar Hardcoded Colors (F-02)
- [ ] CSS variables `--hbc-text-on-dark` and `--hbc-text-on-dark-alpha` created in hbcLightTheme
- [ ] CSS variables created in hbcFieldTheme with dark values
- [ ] HbcConnectivityBar actionButton uses CSS variables instead of hardcoded values
- [ ] Button text appears correct in light mode (white)
- [ ] Button text appears correct in dark mode (dark)
- [ ] Grep confirms zero hardcoded `#FFFFFF` in HbcConnectivityBar

### Overall
- [ ] Build succeeds: `pnpm turbo run build --filter=@hbc/ui-kit` with zero warnings
- [ ] Tests pass: `pnpm turbo run test --filter=@hbc/ui-kit`
- [ ] No hardcoded values remain in HbcDataTable (grep verification)
- [ ] All components tested in both light and dark themes
- [ ] Reference documentation created

---

## Verification Commands

```bash
# Build verification
pnpm turbo run build --filter=@hbc/ui-kit

# Type-check
pnpm turbo run check-types --filter=@hbc/ui-kit

# Tests
pnpm turbo run test --filter=@hbc/ui-kit

# Lint
pnpm turbo run lint --filter=@hbc/ui-kit

# Verify shimmer prerequisite
ls packages/ui-kit/src/shared/shimmer.ts && echo "✓ Shimmer module exists"

# Verify CSS variables in theme
grep -n "\-\-hbc-surface-2-alpha\|\-\-hbc-border-default\|\-\-hbc-responsibility-bg\|\-\-hbc-text-on-dark" packages/ui-kit/src/theme.ts

# Verify no hardcoded values in HbcDataTable
grep -E "rgba\(255,255,.*\)|HBC_SURFACE_LIGHT\[" packages/ui-kit/src/HbcDataTable/index.tsx

# Verify no hardcoded values in HbcConnectivityBar
grep -E "#FFFFFF|rgba\(255,255,255" packages/ui-kit/src/HbcAppShell/HbcConnectivityBar.tsx

# Build Storybook for manual testing
pnpm turbo run build:storybook --filter=dev-harness
```

**Expected outputs:**
- All build, type-check, lint commands exit with code 0
- All tests pass
- CSS variables present in theme.ts
- Zero hardcoded values in grep results
- Storybook builds successfully

---

## PH4C.2 Progress Notes

Track progress of each implementation step. Update status as work progresses.

### Task 4C.2a: Shimmer Overlay Opacity

- 4C.2.1 [PENDING] — Create `--hbc-surface-2-alpha` in hbcLightTheme
- 4C.2.2 [PENDING] — Create `--hbc-surface-2-alpha` in hbcFieldTheme
- 4C.2.3 [PENDING] — Replace hardcoded shimmer opacity in HbcDataTable
- 4C.2.4 [PENDING] — Test shimmer in light mode
- 4C.2.5 [PENDING] — Test shimmer in Field Mode
- 4C.2.6 [PENDING] — Verify no hardcoded shimmer values remain

### Task 4C.2b: Stale/Fresh Border Tokens

- 4C.2.7 [PENDING] — Create `--hbc-border-default` in hbcLightTheme
- 4C.2.8 [PENDING] — Create `--hbc-border-default` in hbcFieldTheme
- 4C.2.9 [PENDING] — Replace HBC_SURFACE_LIGHT reference in wrapperStale/wrapperFresh
- 4C.2.10 [PENDING] — Test borders in light mode
- 4C.2.11 [PENDING] — Test borders in Field Mode

### Task 4C.2c: Responsibility Row Background

- 4C.2.12 [PENDING] — Create `--hbc-responsibility-bg` in hbcLightTheme
- 4C.2.13 [PENDING] — Create `--hbc-responsibility-bg` in hbcFieldTheme
- 4C.2.14 [PENDING] — Replace HBC_SURFACE_LIGHT reference in trResponsibility
- 4C.2.15 [PENDING] — Test responsibility rows in light mode
- 4C.2.16 [PENDING] — Test responsibility rows in Field Mode

### Task 4C.2d: ConnectivityBar Hardcoded Colors

- 4C.2.17 [PENDING] — Create `--hbc-text-on-dark` and `--hbc-text-on-dark-alpha` in hbcLightTheme
- 4C.2.18 [PENDING] — Create variables in hbcFieldTheme
- 4C.2.19 [PENDING] — Replace hardcoded colors in HbcConnectivityBar
- 4C.2.20 [PENDING] — Test ConnectivityBar in light mode
- 4C.2.21 [PENDING] — Test ConnectivityBar in Field Mode
- 4C.2.22 [PENDING] — Verify no HBC_SURFACE_LIGHT references remain

---

## Verification Evidence Template

### Theme Token Replacement Evidence

| Token | Light Value | Dark Value | Theme File Updated | Build Status | Date |
|-------|-------------|-----------|------------------|-----|------|
| `--hbc-surface-2-alpha` | rgba(255,255,255,0.85) | rgba(20,20,20,0.85) | [PENDING] | [PENDING] | — |
| `--hbc-border-default` | #D1D5DB | #4B5563 | [PENDING] | [PENDING] | — |
| `--hbc-responsibility-bg` | #EFF6FF | #1E3A5F | [PENDING] | [PENDING] | — |
| `--hbc-text-on-dark` | #FFFFFF | #1F2937 | [PENDING] | [PENDING] | — |
| `--hbc-text-on-dark-alpha` | rgba(255,255,255,0.55) | rgba(31,41,55,0.55) | [PENDING] | [PENDING] | — |

### Component Testing Evidence

| Component | Feature | Light Mode | Dark Mode | Axe Scan | Date |
|-----------|---------|-----------|----------|----------|------|
| HbcDataTable | Shimmer overlay | [PENDING] | [PENDING] | [PENDING] | — |
| HbcDataTable | Stale/fresh borders | [PENDING] | [PENDING] | [PENDING] | — |
| HbcDataTable | Responsibility rows | [PENDING] | [PENDING] | [PENDING] | — |
| HbcConnectivityBar | Action button | [PENDING] | [PENDING] | [PENDING] | — |

---

**End of PH4C.2 – Theme Token Hardcoding Remediation**

<!-- IMPLEMENTATION PROGRESS & NOTES
PH4C.2 task file created: 2026-03-07
Four major token replacement tasks:
1. Shimmer overlay opacity (F-03, D-PH4C-07/08)
2. Stale/fresh border tokens (F-04, D-PH4C-07/08)
3. Responsibility row background (F-05, D-PH4C-07/08)
4. ConnectivityBar hardcoded colors (F-02, D-PH4C-07/08)
Status: READY FOR IMPLEMENTATION
Prerequisites: PH4C.7 (Shimmer module) MUST be completed first
Expected duration: 4–5 hours
All components require dual-theme testing (light + dark/Field Mode)
-->
