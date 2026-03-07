# PH4C.13 — Hardcoded Token Replacement (Shell Chrome + Page Components)

**Phase:** 4C | **Task:** 4C.13
**Concern:** Shell chrome components and page-level components use static JS constant objects
(`HBC_SURFACE_LIGHT`, `HBC_DARK_HEADER`, `HBC_ACCENT_ORANGE`, etc.) in Griffel `makeStyles`
calls. These values are compiled to static CSS class names at build time and **never react to
`FluentProvider` theme changes** — including field mode and dark mode. Affected components remain
visually incorrect regardless of whether PH4C.11 wires up the theme context correctly.
**Locked Decisions:** D-PH4C-26, D-PH4C-27
**Parent plan:** `PH4C-UI-Design-Completion-Plan.md`
**Locked references:** Blueprint §1d, §2c | Foundation Plan PH4.3 §3.1 | PH4B.10 §13
**Depends on:** PH4C.11
**Status:** COMPLETE

---

## Problem Statement

Griffel `makeStyles` compiles CSS at build time. A style like:

```tsx
title: {
  color: HBC_SURFACE_LIGHT['text-primary'],   // '#1A1D23' — compiled to static CSS
}
```

produces a CSS class with `color: #1A1D23` that never changes at runtime. When `FluentProvider`
switches to the field/dark theme, Fluent's CSS custom properties (`--colorNeutralForeground1`,
etc.) update automatically — but Griffel classes using static hex strings do not.

The **page title** visible in the Project Hub screenshots is the most prominent symptom:
`WorkspacePageShell`'s `h1.title` uses `color: HBC_SURFACE_LIGHT['text-primary']` (`#1A1D23`,
near-black), which is imperceptible against the dark field mode background.

### Strategy

**Two complementary approaches** — applied per component based on semantics:

**A. Fluent `tokens.*` CSS variables** (preferred for most colours)
Replace static hex strings with Fluent design token CSS custom properties (e.g.,
`tokens.colorNeutralForeground1`). These are inserted by `FluentProvider` into the DOM as CSS
custom properties and update automatically when the theme changes. No conditional logic needed.

**B. Conditional `isFieldMode` prop styling** (for cases where the field palette diverges from
standard Fluent dark and both light/dark palette values are needed)
Use `const { isFieldMode } = useHbcTheme()` to select between office and field style class
variants inside `makeStyles`. Required for surfaces that use `HBC_SURFACE_FIELD` values that
differ from a standard Fluent dark theme (e.g., the deep navy `#0F1419` base).

### Token Mapping Reference

| HBC constant | Replacement token | Notes |
|---|---|---|
| `HBC_SURFACE_LIGHT['text-primary']` | `tokens.colorNeutralForeground1` | Primary text — adapts in both dark and field themes |
| `HBC_SURFACE_LIGHT['text-muted']` | `tokens.colorNeutralForeground3` | Muted/secondary text |
| `HBC_SURFACE_LIGHT['surface-0']` | `tokens.colorNeutralBackground1` | Page background |
| `HBC_SURFACE_LIGHT['surface-1']` | `tokens.colorNeutralBackground2` | Card / elevated surface |
| `HBC_SURFACE_LIGHT['surface-2']` | `tokens.colorNeutralBackground3` | Secondary surface |
| `HBC_SURFACE_LIGHT['border-default']` | `tokens.colorNeutralStroke1` | Default border |
| `HBC_SURFACE_LIGHT['border-focus']` | `tokens.colorCompoundBrandStroke` | Focus ring |
| `HBC_PRIMARY_BLUE` | `tokens.colorBrandBackground` | Brand primary action background |
| `HBC_ACCENT_ORANGE` | `tokens.colorPalettePumpkinBackground2` | Accent orange (CTA, FAB) |
| `HBC_DARK_HEADER` | *keep as static*  — header is intentionally always dark | Header bg is brand-fixed |
| `HBC_HEADER_TEXT` | *keep as static on icon colors inside the dark header* | Header icons always white |
| `HBC_HEADER_ICON_MUTED` | *keep as static inside dark header bg* | Muted icons in dark header |
| `HBC_SURFACE_FIELD['surface-*']` | Conditional `isFieldMode` variant class | Field navy palette differs from Fluent dark |
| `HBC_CONNECTIVITY.*` | *keep as static status colors* | Status colors are semantically fixed |
| `HBC_STATUS_COLORS.*` | *keep as static status colors* | Same reasoning |

**Key distinction:**
- **Header chrome** (`HbcHeader`, `HbcConnectivityBar`, `HbcBottomNav`): These components have a
  **fixed dark background** (`HBC_DARK_HEADER` / `#1E1E1E`) regardless of theme. Text and icon
  colors on top of that dark background (`HBC_HEADER_TEXT = #FFFFFF`, `HBC_HEADER_ICON_MUTED`)
  remain static and correct. No change needed for header chrome token values on icons/text.
- **Content surfaces** (`WorkspacePageShell`, `HbcSidebar`, dropdowns, flyouts): These **must
  respond** to theme changes. Surface backgrounds and text colors must use Fluent `tokens.*`.

---

## Comprehensive File Inventory (audit 2026-03-07)

### Group A — Content surface components (use Approach A: Fluent tokens)

#### 1. `WorkspacePageShell/index.tsx` ⚠️ HIGHEST PRIORITY

**Symptom:** Page title ("Project Hub") is near-invisible in field/dark mode — confirmed by user
screenshots. `h1.title` uses `color: HBC_SURFACE_LIGHT['text-primary']` = `#1A1D23` (near-black)
against a dark background.

**All affected style properties:**

| Style key | Current value | Replace with |
|-----------|---------------|-------------|
| `title.color` | `HBC_SURFACE_LIGHT['text-primary']` | `tokens.colorNeutralForeground1` |
| `projectContext.color` | `HBC_SURFACE_LIGHT['text-muted']` | `tokens.colorNeutralForeground3` |
| `shimmerBase.backgroundColor` | `HBC_SURFACE_LIGHT['surface-2']` | `tokens.colorNeutralBackground3` |
| `fab.backgroundColor` | `HBC_ACCENT_ORANGE` | `tokens.colorPalettePumpkinBackground2` |

Status color tokens in `errorCard` (`HBC_STATUS_RAMP_RED`, `HBC_STATUS_COLORS.error`) are
semantically fixed status colors — **do not change**.

#### 2. `HbcSidebar.tsx`

| Style key | Current value | Replace with |
|-----------|---------------|-------------|
| `root.backgroundColor` | `'#FFFFFF'` (inline hex) | `tokens.colorNeutralBackground1` |
| `root` border | `HBC_SURFACE_LIGHT['border-default']` | `tokens.colorNeutralStroke1` |
| `groupLabel.color` | `HBC_HEADER_ICON_MUTED` | `tokens.colorNeutralForeground3` |
| `groupLabelCollapsed` border | `HBC_SURFACE_LIGHT['border-default']` | `tokens.colorNeutralStroke1` |
| `navItem.color` | `HBC_SURFACE_LIGHT['text-primary']` | `tokens.colorNeutralForeground1` |
| `navItem:hover.backgroundColor` | `HBC_SURFACE_LIGHT['surface-2']` | `tokens.colorNeutralBackground3Hover` |
| `navItem:hover.color` | `HBC_PRIMARY_BLUE` | `tokens.colorBrandForeground1` |
| `navItemActive.backgroundColor` | `'#E8F1F8'` | `tokens.colorBrandBackground2` |
| `navItemActive.color` | `HBC_PRIMARY_BLUE` | `tokens.colorBrandForeground1` |
| `toggleButton.color` | `HBC_HEADER_ICON_MUTED` | `tokens.colorNeutralForeground3` |
| `toggleButton:hover.backgroundColor` | `HBC_SURFACE_LIGHT['surface-2']` | `tokens.colorNeutralBackground3Hover` |
| `navItemActive.borderLeftColor` | `HBC_ACCENT_ORANGE` | *keep — brand accent on active state is intentionally fixed* |

### Group B — Dropdown / flyout components (Approach B: conditional isFieldMode class)

These components render floating panels that sit on top of both light and dark surfaces. The
`HBC_SURFACE_FIELD` palette (deep navy) differs significantly from a standard Fluent dark theme.
Use `const { isFieldMode } = useHbcTheme()` to select between office and field variant classes.

#### 3. `HbcUserMenu.tsx`

Already has `dropdownOffice` / `dropdownField` class variants. Uses `HBC_SURFACE_LIGHT` and
`HBC_SURFACE_FIELD` conditional static values. Migration path:

Replace the static office-mode class values with Fluent tokens (Approach A), keep field-mode
class values as conditional overrides (Approach B):

| Style key | Office class → Fluent token | Field class → keep HBC_SURFACE_FIELD |
|-----------|------------------------------|---------------------------------------|
| `dropdownOffice.backgroundColor` | `tokens.colorNeutralBackground1` | `HBC_SURFACE_FIELD['surface-1']` |
| `dropdownOffice` border | `tokens.colorNeutralStroke1` | `HBC_SURFACE_FIELD['border-default']` |
| `menuItemOffice.color` | `tokens.colorNeutralForeground1` | `HBC_SURFACE_FIELD['text-primary']` |
| `menuItemOffice:hover.backgroundColor` | `tokens.colorNeutralBackground3Hover` | `HBC_SURFACE_FIELD['surface-2']` |
| `toggleOffice.backgroundColor` | `tokens.colorNeutralStroke1` | `HBC_SURFACE_FIELD['border-default']` |
| `dividerOffice.backgroundColor` | `tokens.colorNeutralStroke1` | `HBC_SURFACE_FIELD['border-default']` |

`HBC_PRIMARY_BLUE` on `trigger.backgroundColor` and `toggleActive.backgroundColor` → `tokens.colorBrandBackground` (Approach A).

#### 4. `HbcProjectSelector.tsx`

Same pattern as `HbcUserMenu` — already has `dropdownOffice`/`dropdownField` variants. Apply
identical Approach A/B split.

| Office styles | Replace with |
|--------------|-------------|
| `HBC_SURFACE_LIGHT['surface-0']` (dropdown bg) | `tokens.colorNeutralBackground1` |
| `HBC_SURFACE_LIGHT['border-default']` | `tokens.colorNeutralStroke1` |
| `HBC_SURFACE_LIGHT['text-primary']` (item text) | `tokens.colorNeutralForeground1` |
| `HBC_SURFACE_LIGHT['text-muted']` | `tokens.colorNeutralForeground3` |
| `HBC_SURFACE_LIGHT['surface-2']` (hover bg) | `tokens.colorNeutralBackground3Hover` |
| `HBC_HEADER_TEXT` (trigger text) | *keep — sits in dark header context* |
| `HBC_HEADER_ICON_MUTED` (chevron) | *keep — sits in dark header context* |

Field-mode class values using `HBC_SURFACE_FIELD` — keep (Approach B).

#### 5. `HbcToolboxFlyout.tsx`

| Office styles | Replace with |
|--------------|-------------|
| `HBC_SURFACE_LIGHT['surface-0']` | `tokens.colorNeutralBackground1` |
| `HBC_SURFACE_LIGHT['border-default']` | `tokens.colorNeutralStroke1` |
| `HBC_SURFACE_LIGHT['text-muted']` (section labels) | `tokens.colorNeutralForeground3` |

Field-mode class values using `HBC_SURFACE_FIELD` — keep (Approach B).
`HBC_HEADER_ICON_MUTED` on the toolbox icon — keep (dark header context).

### Group C — Header chrome components (static tokens correct as-is, verify only)

These components render on top of `HBC_DARK_HEADER` (`#1E1E1E`), which is intentionally always
dark regardless of theme. Icons and text rendered on the dark header are always white or muted-
white. **No token changes needed** for the header background or icon/text colors.

#### 6. `HbcHeader.tsx`

`HBC_DARK_HEADER` header background — **keep static**. Brand requirement: header always dark.
`HBC_HEADER_TEXT` logo fallback text — **keep static** (always on dark bg).
`HBC_HEADER_TEXT` M365 icon color — **keep static** (always on dark bg).

**Verify** no accidental `HBC_SURFACE_LIGHT` usage in content areas of the header.

#### 7. `HbcNotificationBell.tsx`

`HBC_HEADER_TEXT` icon color — **keep static** (always on dark header).
Verify no surface/content color usage.

#### 8. `HbcFavoriteTools.tsx`

`HBC_HEADER_TEXT` icon color — **keep static** (always on dark header).

#### 9. `HbcGlobalSearch.tsx`

`HBC_HEADER_ICON_MUTED` placeholder and icon colors — **keep static** (dark header context).

#### 10. `HbcCreateButton.tsx`

`HBC_ACCENT_ORANGE` background — **CTA button always orange by brand spec**. Keep static.
**No change needed.**

#### 11. `HbcConnectivityBar.tsx`

`HBC_CONNECTIVITY.online/syncing/offline` — these are semantic status indicator colors. They are
intentionally brand-fixed and must not adapt to theme. **Keep static.**

### Group D — Bottom navigation (mixed — partial update)

#### 12. `HbcBottomNav/index.tsx`

The bottom nav has a fixed dark background (`HBC_DARK_HEADER`), like the header. Item icon and
text colors on top of that dark background should remain static (`HBC_HEADER_ICON_MUTED`,
`HBC_ACCENT_ORANGE` for active state).

`HBC_DARK_HEADER` nav background — **keep static**. Bottom nav is always dark.
`HBC_ACCENT_ORANGE` active item indicator — **keep static**. Brand accent.
`HBC_HEADER_ICON_MUTED` inactive item icons — **keep static** (dark nav context).

**Verify** no `HBC_SURFACE_LIGHT` values bleed into the bottom nav.

---

## Step-by-Step Implementation

### Step 1 — Fix `WorkspacePageShell/index.tsx` (highest priority — resolves visible title bug)

**File:** `packages/ui-kit/src/WorkspacePageShell/index.tsx` *(modify)*

Add `import { tokens } from '@fluentui/react-components'`.

In `makeStyles`:

```tsx
title: {
  ...heading2,
  color: tokens.colorNeutralForeground1,  // was: HBC_SURFACE_LIGHT['text-primary']
  margin: '0',
},
projectContext: {
  fontSize: '0.75rem',
  color: tokens.colorNeutralForeground3,  // was: HBC_SURFACE_LIGHT['text-muted']
},
shimmerBase: {
  backgroundColor: tokens.colorNeutralBackground3,  // was: HBC_SURFACE_LIGHT['surface-2']
  // ... rest of shimmer unchanged
},
fab: {
  // ...
  backgroundColor: tokens.colorPalettePumpkinBackground2, // was: HBC_ACCENT_ORANGE
  // ...
},
```

Remove `HBC_SURFACE_LIGHT` and `HBC_ACCENT_ORANGE` from the imports in this file (verify no
other usages remain).

### Step 2 — Fix `HbcSidebar.tsx`

**File:** `packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx` *(modify)*

Add `import { tokens } from '@fluentui/react-components'`.

Apply the token replacements from the Group A inventory table above. Remove
`HBC_SURFACE_LIGHT`, `HBC_HEADER_ICON_MUTED`, `HBC_PRIMARY_BLUE` imports (verify
`HBC_ACCENT_ORANGE` still needed for active border — keep that import).

After this fix, the sidebar background, text, borders, and hover states all respond to the
`FluentProvider` theme while the active-item orange accent remains brand-fixed.

### Step 3 — Fix `HbcUserMenu.tsx` (office class values)

**File:** `packages/ui-kit/src/HbcAppShell/HbcUserMenu.tsx` *(modify)*

Add `import { tokens } from '@fluentui/react-components'`.

Replace all `HBC_SURFACE_LIGHT['*']` references in `*Office` variant classes with Fluent tokens
per the Group B inventory table. Replace `HBC_PRIMARY_BLUE` references with `tokens.colorBrandBackground`.
Keep all `HBC_SURFACE_FIELD['*']` references in `*Field` variant classes.

After this step, the user menu dropdown renders correctly in both office and field modes: office
mode uses Fluent-adaptive tokens; field mode uses the HBC navy surface palette.

### Step 4 — Fix `HbcProjectSelector.tsx` (office class values)

**File:** `packages/ui-kit/src/HbcAppShell/HbcProjectSelector.tsx` *(modify)*

Same approach as Step 3. Replace `HBC_SURFACE_LIGHT['*']` in office-mode classes with Fluent
tokens. Keep `HBC_SURFACE_FIELD` and header-context static values.

### Step 5 — Fix `HbcToolboxFlyout.tsx` (office class values)

**File:** `packages/ui-kit/src/HbcAppShell/HbcToolboxFlyout.tsx` *(modify)*

Same approach. Replace `HBC_SURFACE_LIGHT['surface-0']`, `['border-default']`,
`['text-muted']` in office classes with Fluent tokens.

### Step 6 — Verify Group C components (header chrome — no changes expected)

**Files:** `HbcHeader.tsx`, `HbcNotificationBell.tsx`, `HbcFavoriteTools.tsx`,
`HbcGlobalSearch.tsx`, `HbcCreateButton.tsx`, `HbcConnectivityBar.tsx`

Run a targeted audit grep on each file. Confirm:
- All token usages are in the context of the dark header background.
- No `HBC_SURFACE_LIGHT` colour is used for text, backgrounds, or borders in these files.
- No changes needed (static tokens are intentional for always-dark chrome).

```bash
grep -n "HBC_SURFACE_LIGHT\|HBC_SURFACE_FIELD" \
  packages/ui-kit/src/HbcAppShell/HbcHeader.tsx \
  packages/ui-kit/src/HbcAppShell/HbcNotificationBell.tsx \
  packages/ui-kit/src/HbcAppShell/HbcFavoriteTools.tsx \
  packages/ui-kit/src/HbcAppShell/HbcGlobalSearch.tsx \
  packages/ui-kit/src/HbcAppShell/HbcCreateButton.tsx \
  packages/ui-kit/src/HbcAppShell/HbcConnectivityBar.tsx
# Expected: no output (these files should not reference surface tokens)
```

### Step 7 — Verify Group D `HbcBottomNav` (no changes expected)

**File:** `packages/ui-kit/src/HbcBottomNav/index.tsx`

Confirm all token usages are in the dark nav context. No `HBC_SURFACE_LIGHT` references.

### Step 8 — Write tests verifying theme-responsive rendering

**File:** `packages/ui-kit/src/__tests__/ThemeResponsiveness.test.tsx` *(new)*

Required test cases:

1. `WorkspacePageShell` title rendered inside `HbcThemeProvider` in office mode: title has
   computed color matching Fluent light theme `colorNeutralForeground1` value.
2. `WorkspacePageShell` title rendered inside `HbcThemeProvider` in field mode (after toggle):
   title color updates to dark-theme `colorNeutralForeground1` value (light/white).
3. `HbcSidebar` background responds to `FluentProvider` theme change.
4. `HbcUserMenu` dropdown background uses Fluent token in office mode; uses `HBC_SURFACE_FIELD`
   value in field mode.

### Step 9 — Full visual regression in dev-harness

After implementation, open dev-harness PWA Preview and confirm all of the following:

1. Office mode (light): page title dark, sidebar light bg, menus light.
2. Toggle to field mode: page title turns light (near-white), sidebar turns dark, menus turn dark navy.
3. Toggle back to office: all elements revert correctly.
4. System dark mode (OS-level): page title and sidebar respond — `FluentProvider` dark theme
   activates via `resolvedTheme` from `HbcThemeProvider`.

---

## Verification Commands

```bash
# 1. Confirm WorkspacePageShell no longer uses HBC_SURFACE_LIGHT for text/surface
grep -n "HBC_SURFACE_LIGHT\|HBC_ACCENT_ORANGE" \
  packages/ui-kit/src/WorkspacePageShell/index.tsx
# Expected: no output (status colors HBC_STATUS_* are OK and separate)

# 2. Confirm HbcSidebar uses Fluent tokens for content surfaces
grep -n "tokens\." packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx | head -10
# Expected: multiple token references

# 3. Confirm HbcSidebar retains HBC_ACCENT_ORANGE for active border only
grep -n "HBC_ACCENT_ORANGE" packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx
# Expected: only navItemActive.borderLeftColor and navItemActiveIcon.color

# 4. Build
pnpm turbo run build --filter=@hbc/ui-kit

# 5. Unit tests
pnpm turbo run test --filter=@hbc/ui-kit

# 6. Visual confirmation in dev-harness (manual)
pnpm --filter=dev-harness dev
# Toggle field mode — confirm page title, sidebar, menus all respond visually
```

---

## Definition of Done

- [x] `WorkspacePageShell/index.tsx` title uses `tokens.colorNeutralForeground1`.
- [x] `WorkspacePageShell/index.tsx` projectContext uses `tokens.colorNeutralForeground3`.
- [x] `WorkspacePageShell/index.tsx` shimmerBase uses `tokens.colorNeutralBackground3`.
- [x] `HbcSidebar.tsx` background, border, text, hover all use Fluent tokens.
- [x] `HbcSidebar.tsx` active-item orange border kept as static brand accent.
- [x] `HbcUserMenu.tsx` office-mode class values use Fluent tokens; field-mode values unchanged.
- [x] `HbcProjectSelector.tsx` office-mode surface values use Fluent tokens.
- [x] `HbcToolboxFlyout.tsx` office-mode surface values use Fluent tokens.
- [x] Group C (header chrome) audit confirms no `HBC_SURFACE_LIGHT` in those files.
- [x] `HbcBottomNav` audit confirms no `HBC_SURFACE_LIGHT` in that file.
- [x] Unit tests for theme-responsive rendering pass.
- [x] Visual regression confirms: toggle field mode → page title and sidebar respond correctly.
- [x] `pnpm turbo run build` passes with zero TypeScript errors.
- [x] ADR created: `docs/architecture/adr/0014-fluent-tokens-over-hbc-constants.md`.

---

## ADR Note

Create `docs/architecture/adr/0014-fluent-tokens-over-hbc-constants.md` documenting the decision
to prefer Fluent `tokens.*` CSS custom properties over HBC static JS constant objects for all
theme-responsive surfaces. Rationale: Fluent tokens are CSS custom properties inserted by
`FluentProvider` — they update at runtime when the theme changes. HBC JS constants are
compile-time static values that cannot react to runtime theme transitions.

Exception: HBC brand constants (`HBC_DARK_HEADER`, `HBC_ACCENT_ORANGE`, `HBC_HEADER_TEXT`,
status colors) remain as-is for surfaces that are intentionally theme-invariant (always-dark
header chrome, brand CTA buttons, semantic status indicators).

<!-- IMPLEMENTATION PROGRESS & NOTES
Status: COMPLETE — PH4C.13 implemented 2026-03-07
2026-03-07: Step cluster 1-2 completed — WorkspacePageShell and HbcSidebar migrated to Fluent tokens for office/content surfaces; sidebar active accent intentionally retained as HBC_ACCENT_ORANGE (D-PH4C-26/D-PH4C-27).
2026-03-07: Step cluster 3-5 completed — HbcUserMenu, HbcProjectSelector, and HbcToolboxFlyout migrated with Approach B split: office classes now use Fluent tokens while field classes retain HBC_SURFACE_FIELD values.
2026-03-07: Step cluster 6-7 completed — Group C (header chrome) and Group D (HbcBottomNav) audits confirm no HBC_SURFACE_LIGHT usage.
2026-03-07: Step cluster 8 completed — theme responsiveness test suite added at packages/ui-kit/src/__tests__/ThemeResponsiveness.test.tsx (4/4 passing via vitest happy-dom run).
2026-03-07: Step cluster 9 + ADR completed — Storybook regression suite passed (54/54), and ADR authored at docs/architecture/adr/0014-fluent-tokens-over-hbc-constants.md.
Verification summary: pnpm turbo run build --filter=@hbc/ui-kit passed; pnpm --filter @hbc/ui-kit lint passed with pre-existing warnings (0 errors); pnpm --filter @hbc/ui-kit check-types passed; field-mode rendering confirmed by automated tests and Storybook regressions.
-->
