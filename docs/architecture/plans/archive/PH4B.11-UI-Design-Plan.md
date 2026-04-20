# HB-Intel — Phase 4b: UI Design Implementation Plan Task 11
### Comprehensive UI Kit + Shell Integration

**Version:** 1.0
**Date:** March 5, 2026
**Depends On:** Phase 4 (UI Kit component build — partially complete)
**Objective:** Deliver a fully wired UI Kit and Shell such that any page built to the system is guaranteed to render correctly according to HBC design specifications — with zero design decisions required from the page author.

---

## Table of Contents

1. [Objective & Success Criteria](#1-objective--success-criteria)
2. [Architectural Decisions (Binding Constraints)](#2-architectural-decisions-binding-constraints)
3. [Prerequisites & Audit Remediation](#3-prerequisites--audit-remediation)
4. [Phase 4b.1 — Build & Packaging Foundation](#4-phase-4b1--build--packaging-foundation)
5. [Phase 4b.2 — Shell Completion & WorkspacePageShell](#5-phase-4b2--shell-completion--workspacepageshell)
6. [Phase 4b.3 — Layout Variant System](#6-phase-4b3--layout-variant-system)
7. [Phase 4b.4 — Command Bar & Page Actions](#7-phase-4b4--command-bar--page-actions)
8. [Phase 4b.5 — Navigation & Active State](#8-phase-4b5--navigation--active-state)
9. [Phase 4b.6 — Theme & Token Enforcement](#9-phase-4b6--theme--token-enforcement)
10. [Phase 4b.7 — Data Loading & State Handling](#10-phase-4b7--data-loading--state-handling)
11. [Phase 4b.8 — Form Architecture](#11-phase-4b8--form-architecture)
12. [Phase 4b.9 — Notifications & Feedback](#12-phase-4b9--notifications--feedback)
13. [Phase 4b.10 — Mobile & Field Mode](#13-phase-4b10--mobile--field-mode)
14. [Phase 4b.11 — Component Consumption Enforcement](#14-phase-4b11--component-consumption-enforcement)
15. [Phase 4b.12 — Integration Verification & Acceptance](#15-phase-4b12--integration-verification--acceptance)
16. [Developer Playbook](#16-developer-playbook)
17. [Completion Criteria](#17-completion-criteria)

---

## 1. Objective & Success Criteria

### Primary Objective

Deliver a fully wired UI Kit and Shell such that **any page built to the system is guaranteed to render correctly according to HBC design specifications** — with zero design decisions required from the page author.

### What "Guaranteed to Render Correctly" Means

A page is guaranteed when all of the following are true without any effort from the page author:

- ✅ It appears inside the correct shell frame (header, sidebar, content area)
- ✅ It uses a named layout variant appropriate to its purpose
- ✅ Its action buttons appear in the correct command bar zone
- ✅ Its sidebar navigation item is highlighted automatically
- ✅ Its colors, spacing, and typography come from HBC design tokens only
- ✅ Its loading, empty, and error states render consistently
- ✅ Its forms follow the standard validation and submission pattern
- ✅ Its feedback (save, delete, error) triggers a consistent toast notification
- ✅ It adapts correctly between office desktop and field mobile contexts
- ✅ It uses only `@hb-intel/ui-kit` components — never raw HTML or direct Fluent UI imports

### Success Metrics

| Metric | Target |
|--------|--------|
| Pages using `WorkspacePageShell` | 100% of all workspace pages |
| Pages using a named layout variant | 100% |
| Token violations in CI | 0 |
| Direct `@fluentui/react-components` imports in `apps/` | 0 |
| Components with Storybook stories | 100% (44/44) |
| Components with reference documentation | 100% (44/44) |
| Loading/error state handled by shell | 100% of data pages |
| Build artifact contamination in `src/` | 0 files |

---

## 2. Architectural Decisions (Binding Constraints)

These 10 decisions were established through the Phase 4b design interview and are **binding constraints** for all implementation work. They are not subject to re-evaluation during implementation without a formal ADR update.

| # | Decision | Binding Rule |
|---|----------|-------------|
| **D-01** | Shell enforcement model | Every page **must** use `WorkspacePageShell` as its outer container. Direct rendering without the shell is prohibited. |
| **D-02** | Layout variant system | Every page **must** declare one of the named layout variants: `dashboard`, `form`, `detail`, or `landing`. No free-composition inside the wrapper. |
| **D-03** | Command bar zone | All page actions **must** be passed to the shell's command bar zone via the `actions` prop on `WorkspacePageShell`. Direct button placement outside the command bar is prohibited. |
| **D-04** | Navigation active state | Active sidebar state **must** be derived automatically from the router. Pages must never manually set active nav state. |
| **D-05** | Token enforcement | All color, spacing, typography, and shadow values **must** come from `@hb-intel/ui-kit` tokens. Hardcoded values are a lint error. |
| **D-06** | Data state handling | Loading, empty, and error states **must** be passed to `WorkspacePageShell` via `isLoading`, `isEmpty`, and `isError` props. Pages must not implement their own spinners or error UIs. |
| **D-07** | Form architecture | All data entry forms **must** use `HbcForm`, `HbcFormLayout`, `HbcFormSection`, and `HbcStickyFormFooter`. Raw form elements are prohibited in page code. |
| **D-08** | Notifications | All user feedback (success, error, warning) **must** be triggered via `useToast`. Inline feedback components on pages are prohibited except `HbcBanner` for persistent page-level warnings. |
| **D-09** | Mobile/field mode | Pages **must** declare supported layout modes. The shell handles all context switching via `useFieldMode`. Pages must not contain their own breakpoint logic. |
| **D-10** | Component consumption | Pages **must** import exclusively from `@hb-intel/ui-kit`. Direct imports from `@fluentui/react-components`, raw HTML structural elements, and inline styles are prohibited and enforced via ESLint. |

---

## 14. Phase 4b.11 — Component Consumption Enforcement

**Goal:** The ui-kit is a closed surface. All imports in `apps/` resolve exclusively to `@hb-intel/ui-kit`. This is enforced automatically at development time via ESLint — the guarantee is mechanical, not aspirational.

**Depends on:** Phase 4b.6 complete (ESLint plugin configured)

### Tasks

#### 4b.11.1 — Complete ESLint rule set

`packages/eslint-plugin-hbc` must enforce all 10 binding constraints:

| Rule | Constraint | Severity |
|------|-----------|----------|
| `no-direct-fluent-import` | No `@fluentui/react-components` imports in `apps/` | `error` |
| `enforce-hbc-tokens` | No hardcoded color/spacing/typography values | `error` |
| `no-inline-styles` | No `style={{ }}` props in page files | `warn` |
| `require-workspace-page-shell` | Page components must use `WorkspacePageShell` | `error` |
| `no-manual-nav-active` | No `setActiveNavItem` calls in `apps/` | `error` |
| `no-inline-feedback` | No `Alert`/`MessageBar` in page files | `warn` |
| `no-raw-form-elements` | No `<input>`, `<select>`, `<textarea>` in `apps/` | `error` |
| `require-layout-variant` | `WorkspacePageShell` must have `layout` prop | `error` |
| `no-page-breakpoints` | No `@media` queries or `window.innerWidth` in `apps/` | `warn` |
| `no-direct-spinner` | No `HbcSpinner` rendered directly in page files | `warn` |

#### 4b.11.2 — Move `interactions/` to stories (F-017)

```bash
mv packages/ui-kit/src/interactions/Interactions.stories.tsx \
   packages/ui-kit/.storybook/stories/InteractionPatterns.stories.tsx

# Update index.ts to remove interactions export if it exports nothing real
```

#### 4b.11.3 — Configure rules per workspace

```js
// apps/*/.eslintrc.cjs — applied to all workspace apps
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    // All hbc rules active at error level in apps/
    '@hb-intel/hbc/no-direct-fluent-import': 'error',
    '@hb-intel/hbc/enforce-hbc-tokens': 'error',
    '@hb-intel/hbc/require-workspace-page-shell': 'error',
  }
};
```

```js
// packages/ui-kit/.eslintrc.cjs — more permissive inside ui-kit itself
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    // ui-kit IS allowed to import from @fluentui directly
    '@hb-intel/hbc/no-direct-fluent-import': 'off',
  }
};
```

#### 4b.11.4 — Remediate existing violations

Run lint across all `apps/` and fix all violations before CI enforcement is activated:

```bash
pnpm --filter './apps/**' lint --fix
# Review unfixable violations manually
# Target: 0 errors, 0 warnings before Phase 4b.12
```

#### 4b.11.5 — Add lint gate to CI

```yaml
# .github/workflows/ci.yml
- name: Lint (enforcement gate)
  run: pnpm turbo run lint
  # Fails PR if any @hb-intel/hbc rule error exists
```

### Acceptance Criteria

- [ ] All 10 ESLint rules implemented and passing tests in `packages/eslint-plugin-hbc`
- [ ] `pnpm turbo run lint` returns 0 errors across all `apps/`
- [ ] CI fails on any new violation introduced in a PR
- [ ] `interactions/` moved to `.storybook/stories/`
- [ ] No raw `<input>`, `<select>`, or `<textarea>` elements in `apps/`
- [ ] No direct `@fluentui/react-components` imports in `apps/`

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4b.11 (Component Consumption Enforcement) completed: 2026-03-06

4b.11.1 completed — Full set of 10 enforcement rules + 1 existing D-03 rule implemented and tested — 2026-03-06
  - Plugin restructured from monolithic index.js to modular src/rules/*.js
  - Package renamed from @hbc/eslint-plugin-hbc to @hb-intel/eslint-plugin-hbc
  - 10 RuleTester-based test files (10/10 passing)
  - Rules: no-direct-fluent-import (D-10), enforce-hbc-tokens (D-05), no-inline-styles (D-10),
    require-workspace-page-shell (D-01), no-manual-nav-active (D-04), no-inline-feedback (D-08),
    no-raw-form-elements (D-07), require-layout-variant (D-02), no-page-breakpoints (D-09),
    no-direct-spinner (D-06), no-direct-buttons-in-content (D-03)

4b.11.2 completed — interactions/Interactions.stories.tsx moved to .storybook/stories/InteractionPatterns.stories.tsx — 2026-03-06
  - Storybook config updated to include .storybook/stories/ glob
  - F-017 remediation complete

4b.11.3 completed — Workspace-specific ESLint rules configured — 2026-03-06
  - All 14 apps/ workspaces: 11 rules active (6 error, 5 warn)
  - packages/ui-kit: permissive config (most rules off)
  - Fluent UI passthrough re-exports added to ui-kit index.ts

4b.11.4 completed — All existing violations remediated — 2026-03-06
  - 46+ @fluentui/react-components imports removed from apps/
  - Hardcoded hex values replaced with design tokens
  - NotFoundPage wrapped in WorkspacePageShell
  - pnpm turbo run lint: 0 errors across all workspaces

4b.11.5 completed — CI lint gate verified — 2026-03-06
  - Existing pnpm turbo run lint step in ci.yml enforces all error-level rules
  - pnpm turbo run build: 23/23 successful
  - pnpm turbo run check-types: 15/15 successful
  - Plugin tests: 10/10 passing

ADR created: docs/architecture/adr/ADR-0045-component-consumption-enforcement.md
Documentation: docs/reference/eslint-plugin-hbc.md, packages/eslint-plugin-hbc/README.md updated
Next: Phase 4b.12
-->