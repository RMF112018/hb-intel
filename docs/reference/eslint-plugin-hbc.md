# ESLint Plugin HBC — Reference

**Package:** `@hb-intel/eslint-plugin-hbc`
**Plugin name:** `@hb-intel/hbc`
**Version:** 1.0.0
**Phase:** PH4B.11 — Component Consumption Enforcement
**ADR:** [ADR-0045](../architecture/adr/ADR-0045-component-consumption-enforcement.md)

## Overview

Custom ESLint plugin that mechanically enforces the HB Intel Design System's binding decisions (D-01 through D-10). Ensures all `apps/` workspaces consume UI components exclusively through `@hb-intel/ui-kit`.

## Rules Reference

### Error-level rules (CI-blocking)

#### `@hb-intel/hbc/no-direct-fluent-import` (D-10)
Disallows direct imports from any `@fluentui/*` package. All Fluent UI components must be consumed through `@hb-intel/ui-kit`.

**AST strategy:** `ImportDeclaration` — checks `source.value` starts with `@fluentui/`.

#### `@hb-intel/hbc/enforce-hbc-tokens` (D-05)
Detects hardcoded hex color values (`#RGB`, `#RRGGBB`, `#RRGGBBAA`) in string literals. Use design tokens from `@hb-intel/ui-kit/theme`.

**AST strategy:** `Literal` — matches `/#[0-9A-Fa-f]{3,8}\b/`.

#### `@hb-intel/hbc/require-workspace-page-shell` (D-01)
Requires files matching `*Page.tsx` to import `WorkspacePageShell`. Ensures all workspace pages have consistent shell chrome.

**AST strategy:** `ImportDeclaration` + `Program:exit` — filename heuristic with import check.

#### `@hb-intel/hbc/no-manual-nav-active` (D-04)
Disallows `setActiveNavItem()` calls. Navigation active state is automatically derived from the router.

**AST strategy:** `CallExpression` — detects direct and member expression calls.

#### `@hb-intel/hbc/no-raw-form-elements` (D-07)
Disallows raw HTML form elements (`<input>`, `<select>`, `<textarea>`). Use `HbcTextField`, `HbcSelect` from ui-kit.

**AST strategy:** `JSXOpeningElement` — checks element name against forbidden set.

#### `@hb-intel/hbc/require-layout-variant` (D-02)
Requires `layout` prop on every `<WorkspacePageShell>` element. Valid values: `dashboard`, `list`, `form`, `detail`, `landing`.

**AST strategy:** `JSXOpeningElement` — checks for `layout` attribute presence.

### Warn-level rules (advisory)

#### `@hb-intel/hbc/no-inline-styles` (D-10)
Warns on `style={{ }}` props in JSX. Prefer Griffel `makeStyles` or ui-kit component props.

#### `@hb-intel/hbc/no-inline-feedback` (D-08)
Warns on raw `Alert`, `MessageBar` components. Use `HbcToast`, `HbcBanner`, or shell feedback.

#### `@hb-intel/hbc/no-page-breakpoints` (D-09)
Warns on manual `@media` queries, `window.innerWidth`, `matchMedia`. Use layout system and `useIsMobile`/`useIsTablet`.

#### `@hb-intel/hbc/no-direct-spinner` (D-06)
Warns on direct `<Spinner>` or `<HbcSpinner>` usage. Use `WorkspacePageShell` `isLoading` prop.

#### `@hb-intel/hbc/no-direct-buttons-in-content` (D-03)
Warns on `HbcButton`/`Button` as direct children of `WorkspacePageShell`. Pass actions via the `actions` prop.

## Workspace Configuration

### apps/ (full enforcement)
All 11 rules active — 6 at `error`, 5 at `warn`.

### packages/ui-kit/ (permissive)
Most rules disabled since ui-kit wraps Fluent UI internally. Only `enforce-hbc-tokens` at `warn`.

## File Structure

```
packages/eslint-plugin-hbc/
├── package.json
├── README.md
├── src/
│   ├── index.js              # Barrel export
│   └── rules/
│       ├── no-direct-fluent-import.js
│       ├── enforce-hbc-tokens.js
│       ├── no-inline-styles.js
│       ├── require-workspace-page-shell.js
│       ├── no-manual-nav-active.js
│       ├── no-inline-feedback.js
│       ├── no-raw-form-elements.js
│       ├── require-layout-variant.js
│       ├── no-page-breakpoints.js
│       ├── no-direct-spinner.js
│       └── no-direct-buttons-in-content.js
└── tests/
    └── rules/
        └── *.test.js          # RuleTester-based tests (10 files)
```
