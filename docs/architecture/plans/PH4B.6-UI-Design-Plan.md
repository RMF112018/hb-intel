# HB-Intel — Phase 4b: UI Design Implementation Plan Task 6
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

## 9. Phase 4b.6 — Theme & Token Enforcement

**Goal:** Zero hardcoded color, spacing, or typography values in any page or component code. All values derive from HBC design tokens. Violations are caught at development time via ESLint.

**Depends on:** Phase 4b.1 complete (ESLint plugin extracted)

### Tasks

#### 4b.6.1 — Implement token enforcement ESLint rule

Add to `packages/eslint-plugin-hbc/src/rules/enforce-hbc-tokens.ts`:

```ts
// Flags hardcoded color values
// ❌ color: "#1B3A6B"   → Error: Use tokens.colorBrandForeground1
// ❌ color: "rgb(27,58,107)"  → Error: Use tokens.colorBrandForeground1
// ❌ padding: "12px"    → Error: Use tokens.spacingVerticalM
// ❌ fontSize: "14px"   → Error: Use tokens.fontSizeBase300
```

Pattern: flag string literals matching hex colors, rgb/rgba values, and raw pixel values in style objects and `makeStyles` calls.

#### 4b.6.2 — Implement import path enforcement ESLint rule

```ts
// packages/eslint-plugin-hbc/src/rules/no-direct-fluent-import.ts

// ❌ Prohibited
import { Button } from '@fluentui/react-components';  // Error: Use HbcButton from @hb-intel/ui-kit

// ✅ Required
import { HbcButton } from '@hb-intel/ui-kit';
```

#### 4b.6.3 — Configure rules in `eslintrc.base.js`

```js
// .eslintrc.base.js
module.exports = {
  plugins: ['@hb-intel/eslint-plugin-hbc'],
  rules: {
    '@hb-intel/hbc/enforce-hbc-tokens': 'error',
    '@hb-intel/hbc/no-direct-fluent-import': 'error',
    '@hb-intel/hbc/no-inline-styles': 'warn',
  }
};
```

#### 4b.6.4 — Token documentation

Update `packages/ui-kit/src/theme/README.md` with a full token reference table:

| Token | Value | Use for |
|-------|-------|---------|
| `tokens.colorBrandForeground1` | HB Blue `#1B3A6B` | Primary text, links |
| `tokens.colorBrandBackground` | HB Gold `#C8962E` | Accent elements, CTAs |
| `tokens.spacingVerticalM` | `12px` | Standard vertical padding |
| `tokens.fontSizeBase300` | `14px` | Body text |
| ... | ... | ... |

#### 4b.6.5 — Dark mode token verification

Verify all HBC tokens have correct dark mode counterparts in `theme.ts`. The `FluentProvider` must be able to switch to dark theme without any page-level changes.

### Acceptance Criteria

- [ ] `pnpm lint` fails on any file containing hardcoded hex color values in `apps/`
- [ ] `pnpm lint` fails on any `import { ... } from '@fluentui/react-components'` in `apps/`
- [ ] Token reference table complete in `packages/ui-kit/src/theme/README.md`
- [ ] Dark mode toggle in dev harness renders all pages correctly without visual breaks
- [ ] Zero token violations in CI across all packages

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*