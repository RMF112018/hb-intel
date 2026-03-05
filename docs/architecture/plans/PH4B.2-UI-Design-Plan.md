# HB-Intel — Phase 4b: UI Design Implementation Plan Task 2
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

## 5. Phase 4b.2 — Shell Completion & WorkspacePageShell

**Goal:** A fully implemented `WorkspacePageShell` that serves as the mandatory outer container for every page, with consistent header, sidebar, content area, and state handling zones.

**Depends on:** Phase 4b.1 complete

### Tasks

#### 4b.2.1 — Resolve dual WorkspacePageShell (F-015)

Consolidate to a single source of truth:

```
packages/ui-kit/src/WorkspacePageShell/index.tsx  ← canonical base (auth-agnostic)
apps/pwa/src/components/WorkspacePageShell.tsx     ← DELETE (replace with import)
```

`apps/pwa` version is replaced with:
```ts
// apps/pwa/src/components/WorkspacePageShell.tsx
export { WorkspacePageShell } from '@hb-intel/ui-kit';
```

Auth context is injected via the `packages/app-shell` facade (resolved in prerequisite F-005).

#### 4b.2.2 — Implement `WorkspacePageShell` full contract

`WorkspacePageShell` must accept and enforce the following prop contract:

```ts
interface WorkspacePageShellProps {
  // Layout (D-02)
  layout: 'dashboard' | 'list' | 'form' | 'detail' | 'landing';

  // Page identity
  title: string;
  breadcrumbs?: BreadcrumbItem[];

  // Command bar (D-03)
  actions?: CommandBarAction[];
  overflowActions?: CommandBarAction[];

  // Data state (D-06)
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;

  // Persistent page-level warning (D-08)
  banner?: BannerConfig;

  // Field mode (D-09)
  supportedModes?: ('office' | 'field')[];

  // Content
  children: React.ReactNode;
}
```

#### 4b.2.3 — Implement `packages/app-shell` PWA facade

```ts
// packages/app-shell/src/index.ts
import { WorkspacePageShell as BaseShell } from '@hb-intel/ui-kit';
import { useMsalAuth } from '@hb-intel/auth';

// Injects MSAL auth context — workspace apps use this, not the base
export const WorkspacePageShell = (props) => {
  const auth = useMsalAuth();
  return <BaseShell {...props} authContext={auth} />;
};

export { ShellLayout, AppLauncher, ProjectPicker } from '@hb-intel/shell';
```

#### 4b.2.4 — Move `module-configs/` out of ui-kit (F-014)

```bash
# Move to packages/shell where it belongs
mv packages/ui-kit/src/module-configs packages/shell/src/module-configs
```

Update `packages/shell/src/index.ts` to export module configs. Update all import paths. Remove from `packages/ui-kit/src/index.ts`.

#### 4b.2.5 — Add missing stories for HbcAppShell sub-components

Create `.stories.tsx` files for all 10 missing components:

| Component | Required Story Variants |
|-----------|------------------------|
| `HbcHeader` | Default, with search active, with notifications |
| `HbcSidebar` | Expanded, collapsed, with active item, role-based items |
| `HbcProjectSelector` | Empty state, loading, project selected |
| `HbcUserMenu` | Authenticated, with avatar, guest |
| `HbcNotificationBell` | 0 count, N count, 99+ count |
| `HbcGlobalSearch` | Empty, typing, with results, no results |
| `HbcCreateButton` | Single action, split button (multi-action) |
| `HbcFavoriteTools` | Populated, empty pinned state |
| `HbcToolboxFlyout` | Open, closed |
| `WorkspacePageShell` | All 4 layout variants, loading state, error state, empty state |

### Acceptance Criteria

- [ ] Single `WorkspacePageShell` source in `packages/ui-kit`
- [ ] `apps/pwa` `WorkspacePageShell` deleted and replaced with import
- [ ] `packages/app-shell` fully implemented as auth-injecting facade
- [ ] `module-configs/` removed from `ui-kit`, present in `packages/shell`
- [ ] All 10 missing shell sub-component stories created and passing
- [ ] `WorkspacePageShell` renders correctly in all 4 layout variants
- [ ] Loading, empty, and error states render correctly from props

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*