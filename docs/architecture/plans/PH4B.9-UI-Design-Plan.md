# HB-Intel — Phase 4b: UI Design Implementation Plan
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

## 12. Phase 4b.9 — Notifications & Feedback

**Goal:** All user feedback is delivered through a single global toast system. The toast container is mounted once in the shell. Pages call `useToast()` — one line of code — for any feedback event.

**Depends on:** Phase 4b.2 complete

### Tasks

#### 4b.9.1 — Mount toast container in shell root

```tsx
// packages/app-shell/src/index.ts (or ShellLayout)
import { HbcToastContainer } from '@hb-intel/ui-kit';

export const ShellLayout = ({ children }) => (
  <FluentProvider theme={hbcTheme}>
    <HbcToastContainer position="bottom-right" maxToasts={5} />
    {children}
  </FluentProvider>
);
```

`HbcToastContainer` is mounted **once** at the shell root. It must never be mounted inside individual pages.

#### 4b.9.2 — Verify `useToast` API

```ts
// packages/ui-kit/src/HbcToast/useToast.ts
const { toast } = useToast();

toast.success('Risk item saved.');
toast.error('Failed to save. Please try again.');
toast.warning('Record locked by another user.');
toast.info('Export started. Download will begin shortly.');
```

#### 4b.9.3 — Wire toast to TanStack Query mutations

Document the canonical mutation pattern:

```ts
// ✅ Correct — toast wired to mutation lifecycle
const { mutate } = useCreateRiskItem({
  onSuccess: () => toast.success('Risk item created.'),
  onError: (err) => toast.error(err.message ?? 'Failed to create risk item.'),
});
```

#### 4b.9.4 — `HbcBanner` for persistent page-level warnings

`HbcBanner` is used for conditions that must remain visible until resolved:

```tsx
// ✅ Correct — persistent warning via WorkspacePageShell banner prop
<WorkspacePageShell
  layout="detail"
  title="Contract #4421"
  banner={
    isLocked
      ? { type: 'warning', message: 'This record is locked for editing by J. Smith.' }
      : undefined
  }
>
```

`HbcBanner` is **not** used for transient feedback. `useToast` handles all transient events.

#### 4b.9.5 — ESLint rule: no inline alert components

Add rule to `eslint-plugin-hbc`:
```ts
// Warn when Alert, MessageBar, or inline feedback components appear directly in page files
// These should be replaced with useToast() or the banner prop
'@hb-intel/hbc/no-inline-feedback': 'warn'
```

### Acceptance Criteria

- [x] `HbcToastContainer` mounted exactly once in `AppShellLayout` (4b.9.1 — 2026-03-06)
- [x] All 4 toast variants (`success`, `error`, `warning`, `info`) render correctly (4b.9.2 — 2026-03-06)
- [x] `useToast` accessible from any page without additional setup (4b.9.2 — 2026-03-06)
- [x] `HbcBanner` renders in reserved zone above content when `banner` prop provided (4b.9.4 — 2026-03-06)
- [x] No `Alert` or inline message components in any `apps/` page file (4b.9.5 — 2026-03-06)

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*

<!-- IMPLEMENTATION PROGRESS & NOTES
4b.9.1 completed — HbcToastContainer mounted once in AppShellLayout (app-shell) per D-08 — 2026-03-06
  - AppShellLayout wraps ShellLayout with HbcToastProvider + HbcToastContainer
  - Mounted in @hbc/app-shell (not @hbc/shell) to avoid circular dependency
4b.9.2 completed — useToast expanded to 4 variants with convenience API — 2026-03-06
  - ToastCategory: success | error | warning | info (supersedes V2.1 three-category)
  - Convenience API: toast.success(), toast.error(), toast.warning(), toast.info()
  - Auto-dismiss: success=3s, warning=5s, info=4s, error=manual
4b.9.3 completed — Canonical mutation wiring documented — 2026-03-06
  - Reference doc updated: docs/reference/ui-kit/HbcToast.md
  - Pattern: wire toast.success/toast.error to TanStack Query onSuccess/onError
4b.9.4 completed — Banner prop verified in WorkspacePageShell — 2026-03-06
  - BannerConfig interface (variant, message, dismissible) already correct
  - HbcBanner renders below breadcrumbs, above content
4b.9.5 completed — no-inline-feedback ESLint rule added — 2026-03-06
  - Rule: @hbc/hbc/no-inline-feedback warns on Alert, MessageBar, etc.
  - Enforces D-08 at lint time
ADR created: docs/architecture/adr/ADR-0043-notifications-and-feedback.md
Build: pnpm turbo run build — 23/23 packages successful
-->