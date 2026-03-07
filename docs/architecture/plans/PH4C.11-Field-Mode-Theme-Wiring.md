# PH4C.11 — Field Mode Theme Wiring (Comprehensive)

**Phase:** 4C | **Task:** 4C.11
**Concern:** Field Mode toggle non-functional; partial/inconsistent theme application across all
shell surfaces, all workspace apps, and all SPFx webpart roots.
**Locked Decisions:** D-PH4C-21, D-PH4C-22, D-PH4C-23, D-PH4C-13 (D-13 OS preference)
**Parent plan:** `PH4C-UI-Design-Completion-Plan.md`
**Locked references:** Blueprint §1d, §2c | Foundation Plan PH4.16 §Step 6 | PH4B.10 §13
**Depends on:** PH4C.10
**Blocks:** PH4C.12, PH4C.13
**Status:** PENDING

---

## Problem Statement

`useFieldMode()` is a plain `useState`-backed hook with no React Context and no Zustand
integration. Every component tree node that calls it — including every app `App.tsx` entry point
— receives an **independent, isolated state instance**. When the user toggles Field Mode inside
`HbcUserMenu`, `toggleFieldMode` writes to `localStorage` and updates only that instance's local
state. All other `FluentProvider` roots (one per app, one in `HbcAppShell`) never observe the
change.

The canonical wrapper `useHbcTheme()` in `packages/ui-kit/src/theme/useHbcTheme.ts` is a thin
pass-through (`return useFieldMode()`) — it does not add shared state. Every consumer therefore
suffers from the same isolation.

### Confirmed broken call-sites (full codebase audit 2026-03-07)

| File | Line | Direct call | Problem |
|------|------|-------------|---------|
| `packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx` | 84 | `useFieldMode()` | Creates Instance A; owns one `FluentProvider` |
| `packages/ui-kit/src/HbcAppShell/HbcHeader.tsx` | 105 | `useFieldMode()` | Creates Instance B; toggle fires here but never reaches A |
| `packages/ui-kit/src/WorkspacePageShell/index.tsx` | 268 | `useFieldMode()` | Creates Instance C; FAB/command-bar switching diverges |
| `packages/ui-kit/src/theme/useDensity.ts` | 34 | `useFieldMode()` | Creates Instance D; density tier can diverge from displayed theme |
| `packages/ui-kit/src/HbcDataTable/index.tsx` | 355 | `useFieldMode()` | Creates Instance E; table density and chrome can diverge |
| `apps/accounting/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root; never updates on toggle |
| `apps/admin/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/business-development/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/estimating/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/human-resources/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/leadership/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/operational-excellence/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/project-hub/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root (SPFx webpart) |
| `apps/quality-control-warranty/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/risk-management/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/safety/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root |
| `apps/hb-site-control/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Independent root (field-mode auto-detect app) |
| `apps/dev-harness/src/App.tsx` | — | manual `isDark` + `useHbcTheme()` + `<FluentProvider>` | Local `isDark` state conflicts with field mode |
| `apps/pwa/src/App.tsx` | — | `useHbcTheme()` + `<FluentProvider>` | Production PWA root; never updates on toggle |

### Secondary consumers — safe after context fix (read-only, no own FluentProvider)

These call `useHbcTheme()` for display only. Once `useHbcTheme()` reads from context, they will
automatically receive live updates without code changes:

- `packages/ui-kit/src/HbcAppShell/HbcUserMenu.tsx:154`
- `packages/ui-kit/src/HbcAppShell/HbcProjectSelector.tsx:123`
- `packages/ui-kit/src/HbcAppShell/HbcToolboxFlyout.tsx:71`
- `packages/ui-kit/src/HbcCommandPalette/index.tsx:234`

---

## Solution Architecture

```
HbcThemeProvider  ← calls useFieldMode() ONCE — single source of truth
  ├── HbcThemeContext.Provider  ← broadcasts full UseFieldModeReturn to all descendants
  └── FluentProvider theme={resolvedTheme}  ← single Fluent root per application tree
        └── <children>
              ├── HbcAppShell  (layout only — no longer owns FluentProvider)
              │     ├── HbcHeader  → useHbcTheme() reads context
              │     └── HbcSidebar / HbcBottomNav
              ├── WorkspacePageShell  → useHbcTheme() reads context
              ├── HbcDataTable  → useHbcTheme() reads context
              └── useDensity  → useHbcTheme() reads context
```

### Invariants after this task

1. `useFieldMode()` is called **exactly once** per application tree — inside `HbcThemeProvider`.
2. `useHbcTheme()` reads **from context**, never from an independent `useState`.
3. Every application root (`App.tsx`) wraps its provider hierarchy in `<HbcThemeProvider>` — no
   standalone `<FluentProvider theme={resolvedTheme}>` in any `App.tsx`.
4. `HbcAppShell` is a layout-only component — no `FluentProvider`, no `useFieldMode`.
5. Zero stray `import … useFieldMode` calls exist outside `HbcThemeContext.tsx` and
   `useFieldMode.ts` itself.

---

## Step-by-Step Implementation

### Step 1 — Create `HbcThemeContext.tsx`

**File:** `packages/ui-kit/src/HbcAppShell/HbcThemeContext.tsx` *(new file)*

Create a React context whose value shape is `UseFieldModeReturn` (already exported from
`useFieldMode.ts`). The file exports:

- `HbcThemeContext` — the context object with a `null` sentinel default that triggers a clear
  error message when consumed outside a provider.
- `HbcThemeProvider` — the provider component that:
  1. Calls `useFieldMode()` exactly once.
  2. Provides the state object via `<HbcThemeContext.Provider>`.
  3. Renders `<FluentProvider theme={fieldModeState.resolvedTheme}>` as the single Fluent root
     wrapping `{children}`.

Sketch:
```tsx
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { useFieldMode } from './hooks/useFieldMode.js';
import type { UseFieldModeReturn } from './hooks/useFieldMode.js';

export const HbcThemeContext = React.createContext<UseFieldModeReturn | null>(null);

export const HbcThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fieldModeState = useFieldMode();
  return (
    <HbcThemeContext.Provider value={fieldModeState}>
      <FluentProvider theme={fieldModeState.resolvedTheme}>
        {children}
      </FluentProvider>
    </HbcThemeContext.Provider>
  );
};
```

### Step 2 — Update `useHbcTheme.ts` to read from context

**File:** `packages/ui-kit/src/theme/useHbcTheme.ts` *(modify)*

Replace `return useFieldMode()` with `useContext(HbcThemeContext)`. Throw a descriptive error when
called outside a provider.

```tsx
export function useHbcTheme(): UseHbcThemeReturn {
  const ctx = React.useContext(HbcThemeContext);
  if (!ctx) {
    throw new Error(
      '[HBC] useHbcTheme must be called inside a <HbcThemeProvider>. ' +
      'Wrap your application root with <HbcThemeProvider>.'
    );
  }
  return ctx;
}
```

Remove the `import { useFieldMode }` import. Add `import { HbcThemeContext }` from
`'../HbcAppShell/HbcThemeContext.js'`.

### Step 3 — Update `HbcAppShell.tsx` — remove owned `FluentProvider` and `useFieldMode`

**File:** `packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx` *(modify)*

1. Remove `import { FluentProvider } from '@fluentui/react-components'`.
2. Remove `import { useFieldMode }` — replace the call `const { mode: appMode, resolvedTheme } = useFieldMode()` with `const { mode: appMode } = useHbcTheme()`.
3. Remove the `<FluentProvider theme={resolvedTheme}>` wrapper in the JSX return — the layout
   `<div>` becomes the root element.
4. Add `import { useHbcTheme }` from `'../theme/useHbcTheme.js'`.

### Step 4 — Update `HbcHeader.tsx` — replace direct `useFieldMode()` call

**File:** `packages/ui-kit/src/HbcAppShell/HbcHeader.tsx` *(modify)*

Line 105: `const { isFieldMode, toggleFieldMode } = useFieldMode()`
→ `const { isFieldMode, toggleFieldMode } = useHbcTheme()`

Replace `import { useFieldMode }` with `import { useHbcTheme }` from `'../theme/useHbcTheme.js'`.

### Step 5 — Update `WorkspacePageShell/index.tsx` — replace direct `useFieldMode()` call

**File:** `packages/ui-kit/src/WorkspacePageShell/index.tsx` *(modify)*

Line 268: `const { isFieldMode, mode } = useFieldMode()`
→ `const { isFieldMode, mode } = useHbcTheme()`

Replace `import { useFieldMode } from '../HbcAppShell/hooks/useFieldMode.js'` with
`import { useHbcTheme } from '../theme/useHbcTheme.js'`.

### Step 6 — Update `useDensity.ts` — replace direct `useFieldMode()` call

**File:** `packages/ui-kit/src/theme/useDensity.ts` *(modify)*

Line 34: `const { mode } = useFieldMode()`
→ `const { mode } = useHbcTheme()`

Replace `import { useFieldMode }` from `'../HbcAppShell/hooks/useFieldMode.js'` with
`import { useHbcTheme }` from `'./useHbcTheme.js'`.

### Step 7 — Update `HbcDataTable/index.tsx` — replace direct `useFieldMode()` call

**File:** `packages/ui-kit/src/HbcDataTable/index.tsx` *(modify)*

Line 355: `const { isFieldMode } = useFieldMode()`
→ `const { isFieldMode } = useHbcTheme()`

Replace `import { useFieldMode }` with `import { useHbcTheme }` from `'../theme/useHbcTheme.js'`.

### Step 8 — Update all 19 app `App.tsx` entry points (all apps + PWA)

All app roots follow the same broken template. Replace the isolated pattern with `HbcThemeProvider`.

**Before (broken — identical across all apps):**
```tsx
import { FluentProvider, useHbcTheme } from '@hbc/ui-kit';

export function App(): React.ReactNode {
  const { resolvedTheme } = useHbcTheme();
  return (
    <FluentProvider theme={resolvedTheme}>
      {/* children */}
    </FluentProvider>
  );
}
```

**After (correct):**
```tsx
import { HbcThemeProvider } from '@hbc/ui-kit';

export function App(): React.ReactNode {
  return (
    <HbcThemeProvider>
      {/* same children */}
    </HbcThemeProvider>
  );
}
```

**Apply to every app — no exceptions:**

| # | File | Notes |
|---|------|-------|
| 1 | `apps/accounting/src/App.tsx` | Standard pattern |
| 2 | `apps/admin/src/App.tsx` | Standard pattern |
| 3 | `apps/business-development/src/App.tsx` | Standard pattern |
| 4 | `apps/estimating/src/App.tsx` | Standard pattern |
| 5 | `apps/human-resources/src/App.tsx` | Standard pattern |
| 6 | `apps/leadership/src/App.tsx` | Standard pattern |
| 7 | `apps/operational-excellence/src/App.tsx` | Standard pattern |
| 8 | `apps/project-hub/src/App.tsx` | SPFx webpart root — standard pattern |
| 9 | `apps/quality-control-warranty/src/App.tsx` | Standard pattern |
| 10 | `apps/risk-management/src/App.tsx` | Standard pattern |
| 11 | `apps/safety/src/App.tsx` | Standard pattern |
| 12 | `apps/hb-site-control/src/App.tsx` | Field-mode auto-detect app — `HbcThemeProvider` calls `useFieldMode()` which reads the `data-hbc-app="hb-site-control"` marker already set in `main.tsx`; no change to `main.tsx` required |
| 13 | `apps/dev-harness/src/App.tsx` | **Additionally** remove the local `isDark` state variable and the manual `isDark ? hbcDarkTheme : resolvedTheme` override — `HbcThemeProvider` handles this |
| 14 | `apps/pwa/src/App.tsx` | Production PWA root — critical; also wraps `MsalGuard` and `RouterProvider` inside `HbcThemeProvider` |

### Step 9 — SPFx webpart considerations

Each SPFx webpart is rendered into its own DOM root by SharePoint. The pattern after Step 8 is
correct for webparts: each `App.tsx` renders its own `<HbcThemeProvider>` which calls
`useFieldMode()` once. Each webpart manages its own field mode state independently, reading from
`localStorage` key `hbc-field-mode` — all webparts on a page therefore share the same persisted
preference (since they share the same browser localStorage origin) and will initialize consistently.

No changes to any `main.tsx` SPFx bootstrap files are required.

### Step 10 — Update `packages/ui-kit/src/index.ts` exports

Add to the public package exports:

```ts
export { HbcThemeProvider, HbcThemeContext } from './HbcAppShell/HbcThemeContext.js';
```

Verify `useHbcTheme` remains exported from both `packages/ui-kit/src/index.ts` and the
`@hbc/ui-kit/theme` entry point.

### Step 11 — Update Storybook preview

**File:** `packages/ui-kit/.storybook/preview.tsx` *(modify)*

Replace any standalone `<FluentProvider>` wrapper in the preview decorator with
`<HbcThemeProvider>`. Any story that renders `HbcAppShell` with its own `FluentProvider` wrapper
must remove the standalone wrapper and let `HbcThemeProvider` own it.

### Step 12 — Write unit and integration tests

**File:** `packages/ui-kit/src/__tests__/HbcThemeContext.test.tsx` *(new)*

Required test cases:

1. `HbcThemeProvider` renders children without errors.
2. `useHbcTheme()` returns `isFieldMode = false` in default (office) state.
3. Calling `toggleFieldMode()` updates `isFieldMode = true` for **all** consumers in the same tree.
4. Two sibling components calling `useHbcTheme()` receive identical values after a toggle.
5. `useHbcTheme()` throws a descriptive error when called outside `HbcThemeProvider`.
6. `HbcUserMenu` toggle invocation propagates to a `HbcDataTable` sibling in the same tree
   (integration — confirms single context instance, no divergence).

---

## Verification Commands

```bash
# 1. Confirm zero stray direct useFieldMode imports outside permitted files
grep -rn "useFieldMode" \
  packages/ui-kit/src \
  apps \
  --include="*.ts" --include="*.tsx" \
  | grep -v "HbcThemeContext.tsx" \
  | grep -v "useFieldMode.ts"
# Expected: no output

# 2. Confirm zero standalone FluentProvider theme= in any App.tsx
grep -rn "FluentProvider" apps --include="App.tsx"
# Expected: no output

# 3. Confirm all app App.tsx files import HbcThemeProvider
grep -rn "HbcThemeProvider" apps --include="App.tsx" | wc -l
# Expected: 14

# 4. Full build — zero TypeScript errors
pnpm turbo run build --filter=@hbc/ui-kit
pnpm turbo run build --filter="./apps/*"

# 5. Unit tests
pnpm turbo run test --filter=@hbc/ui-kit

# 6. Manual validation in dev-harness
pnpm --filter=dev-harness dev
# Open http://localhost:5173 → PWA Preview
# Toggle Field Mode in user menu → all chrome elements (sidebar, header, dropdown) update
# Refresh page → field mode preference persists from localStorage
```

---

## Definition of Done

- [ ] `HbcThemeContext.tsx` created; exports `HbcThemeContext` and `HbcThemeProvider`.
- [ ] `useHbcTheme.ts` reads from context; throws on missing provider.
- [ ] `HbcAppShell.tsx` no longer imports `FluentProvider` or calls `useFieldMode`.
- [ ] `HbcHeader.tsx` calls `useHbcTheme()` (not `useFieldMode()`).
- [ ] `WorkspacePageShell/index.tsx` calls `useHbcTheme()`.
- [ ] `useDensity.ts` calls `useHbcTheme()`.
- [ ] `HbcDataTable/index.tsx` calls `useHbcTheme()`.
- [ ] All 14 app `App.tsx` files use `<HbcThemeProvider>` — no standalone `FluentProvider`.
- [ ] `dev-harness/src/App.tsx` local `isDark` state removed.
- [ ] `HbcThemeProvider` and `HbcThemeContext` exported from `@hbc/ui-kit`.
- [ ] Storybook preview uses `HbcThemeProvider`.
- [ ] Unit tests pass (propagation, isolation, error throw).
- [ ] `grep useFieldMode` confirms zero stray imports outside context + hook files.
- [ ] `grep FluentProvider apps --include="App.tsx"` returns empty.
- [ ] `pnpm turbo run build` passes with zero errors.
- [ ] ADR created: `docs/architecture/adr/0013-hbc-theme-context.md`.

---

## ADR Note

Create `docs/architecture/adr/0013-hbc-theme-context.md` documenting the decision to use React
Context (not Zustand) for field mode state propagation. Rationale: field mode state is purely
presentational and tree-scoped; Fluent `FluentProvider` must sit at the React tree root and
receives a resolved theme object synchronously; Zustand is appropriate for cross-tree domain
state, not for `FluentProvider` integration that requires a single, authoritative root instance.

<!-- IMPLEMENTATION PROGRESS & NOTES
Status: PENDING — Full codebase audit completed 2026-03-07
Affected files confirmed: 5 ui-kit source files + 14 app App.tsx files (13 workspace apps + pwa)
Audit found: HbcProjectSelector, HbcToolboxFlyout also use useHbcTheme() — safe (read-only, auto-fixed by context)
ADR needed: 0013-hbc-theme-context.md
Next: Begin Step 1 (HbcThemeContext.tsx creation) after PH4C.10 complete
-->
