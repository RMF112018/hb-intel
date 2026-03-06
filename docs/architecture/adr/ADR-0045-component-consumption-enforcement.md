# ADR-0045: Component Consumption Enforcement

**Status:** Accepted
**Date:** 2026-03-06
**Phase:** Phase 4b.11
**Deciders:** HB Intel Engineering Team
**References:**
- PH4B.11-UI-Design-Plan.md §14 (tasks 4b.11.1–4b.11.5)
- PH4B-UI-Design-Plan.md v1.2 §§2, 14, 16, 17 (binding decision D-10)
- PH4B-UI-Design-Audit-Remeditation-Plan.md (F-017)
- HB-Intel-Blueprint-V4.md §1d
- ADR-0034 (audit remediation — original plugin extraction)

## Context

The HB Intel Design System (ui-kit) provides a comprehensive component library that wraps Fluent UI React v9 with HBC-specific behavior, tokens, and conventions. However, without enforcement, developers in the `apps/` workspaces could bypass ui-kit and import directly from `@fluentui/react-components`, leading to:

- Inconsistent visual appearance across workspaces
- Missing accessibility behaviors built into HBC wrappers
- Token drift (hardcoded colors/spacing instead of design tokens)
- Layout inconsistency (pages without WorkspacePageShell or layout variants)
- Manual navigation state management instead of router-derived active state

Prior to this ADR, the ESLint plugin (`@hb-intel/eslint-plugin-hbc`) contained only 2 rules: `enforce-hbc-tokens` (hex detection) and `no-direct-buttons-in-content` (D-03). No enforcement rules were configured in any `apps/` workspace. There were 46+ direct `@fluentui/react-components` imports across the codebase.

## Decision

### 1. Implement 10 binding enforcement rules

The ESLint plugin was expanded from 2 to 11 rules (10 spec + 1 existing D-03), each mapped to a binding design decision:

| Rule | Decision | Severity (apps) | Enforcement |
|------|----------|-----------------|-------------|
| `no-direct-fluent-import` | D-10 | error | Blocks `@fluentui/*` imports |
| `enforce-hbc-tokens` | D-05 | error | Detects hardcoded hex colors |
| `require-workspace-page-shell` | D-01 | error | Requires WorkspacePageShell in *Page.tsx |
| `no-manual-nav-active` | D-04 | error | Blocks setActiveNavItem() calls |
| `no-raw-form-elements` | D-07 | error | Blocks raw `<input>`, `<select>`, `<textarea>` |
| `require-layout-variant` | D-02 | error | Requires `layout` prop on WorkspacePageShell |
| `no-inline-styles` | D-10 | warn | Discourages inline style props |
| `no-inline-feedback` | D-08 | warn | Discourages raw Alert/MessageBar |
| `no-page-breakpoints` | D-09 | warn | Discourages manual media queries |
| `no-direct-spinner` | D-06 | warn | Discourages direct Spinner usage |
| `no-direct-buttons-in-content` | D-03 | warn | (Existing) Actions via shell prop |

### 2. Dual severity model

- **`apps/` workspaces:** All 11 rules active. 6 at `error` (CI-blocking), 5 at `warn` (advisory).
- **`packages/ui-kit/`:** Most rules disabled (`off`) since ui-kit IS the Fluent UI wrapper layer. Only `enforce-hbc-tokens` remains at `warn` for internal token hygiene.

### 3. Plugin package renamed

Package renamed from `@hbc/eslint-plugin-hbc` to `@hb-intel/eslint-plugin-hbc` to match the project namespace convention. Plugin name in configs: `@hb-intel/hbc`.

### 4. Fluent UI passthrough re-exports

Added re-exports of commonly used Fluent primitives (`FluentProvider`, `Text`, `Card`, `CardHeader`, `Badge`, `Button`, `Switch`, `Spinner`, `TabList`, `Tab`, `tokens`) from `@hbc/ui-kit` so apps can consume them without violating `no-direct-fluent-import`.

### 5. CI enforcement

The existing `pnpm turbo run lint` step in `.github/workflows/ci.yml` automatically enforces all error-level rules. No CI changes were needed — the lint gate was already in place.

## Alternatives Considered

1. **TypeScript path aliases only:** Would prevent imports at compile time but wouldn't enforce architectural patterns (shell usage, layout variants, token compliance).
2. **Manual code review:** Doesn't scale and is error-prone.
3. **All rules at error level:** Would create too many CI-blocking warnings for inline styles, which are sometimes acceptable in prototype/demo code.

## Consequences

- **Positive:** Any page that passes CI mechanically complies with all 10 binding design decisions.
- **Positive:** New developers cannot introduce Fluent UI bypasses without CI failing.
- **Positive:** The Phase 4b completion criteria §17 guarantee is now mechanically true.
- **Negative:** Warn-level rules (inline styles, spinners, breakpoints) require team discipline until full remediation.
- **Migration:** All 46+ existing `@fluentui/react-components` imports in apps/ were remediated to use `@hbc/ui-kit`.
