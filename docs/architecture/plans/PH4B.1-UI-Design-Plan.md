# HB-Intel — Phase 4b: UI Design Implementation Plan Task 1
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

## 3. Prerequisites & Audit Remediation

Phase 4b cannot begin until the following audit findings (from the Phase 4 QA/QC Audit Report) are resolved. These are **hard blockers** — they will cause Phase 4b implementation to fail or produce incorrect results if not addressed first.

### 3.1 Hard Blockers (Must complete before Phase 4b.1)

#### F-001 + F-002 — Remove build artifacts from `src/`

**Why it blocks Phase 4b:** Committed `.js`/`.d.ts` artifacts in `src/` break TypeScript resolution for all downstream consumers. Every app importing from `@hb-intel/ui-kit` may resolve to stale compiled output instead of source, making the enforcement system in D-10 unreliable.

**Steps:**
1. Update `packages/ui-kit/vite.config.ts`:
```ts
build: {
  lib: {
    entry: {
      index: 'src/index.ts',
      'app-shell': 'src/app-shell.ts'
    },
    formats: ['es'],
  },
  outDir: 'dist',
  rollupOptions: {
    external: [
      'react', 'react-dom',
      '@fluentui/react-components',
      'echarts', 'zustand'
    ],
    output: {
      preserveModules: true,
      preserveModulesRoot: 'src'
    }
  }
}
```

2. Update `packages/ui-kit/package.json` exports:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./app-shell": {
      "import": "./dist/app-shell.js",
      "types": "./dist/app-shell.d.ts"
    },
    "./theme": {
      "import": "./dist/theme/index.js",
      "types": "./dist/theme/index.d.ts"
    }
  },
  "sideEffects": false
}
```

3. Add to `packages/ui-kit/.gitignore`:
```
dist/
storybook-static/
src/**/*.js
src/**/*.js.map
src/**/*.d.ts
src/**/*.d.ts.map
```

4. Remove tracked artifacts:
```bash
git rm --cached $(git ls-files \
  'packages/ui-kit/src/**/*.js' \
  'packages/ui-kit/src/**/*.d.ts' \
  'packages/ui-kit/src/**/*.map')
git commit -m "chore(ui-kit): remove committed build artifacts from src/"
```

**Acceptance:** `git ls-files packages/ui-kit/src/ | grep -E '\.(js|d\.ts|map)$'` returns empty.

---

#### F-004 — Extract ESLint plugin to proper workspace package

**Why it blocks Phase 4b:** D-05 and D-10 both depend on `eslint-plugin-hbc`. The plugin currently lives inside `ui-kit/src/lint/` as an orphaned file — it cannot be referenced as a proper ESLint plugin from this location.

**Steps:**
1. Create `packages/eslint-plugin-hbc/` with `package.json`, `src/index.js`, `tsconfig.json`
2. Move rules from `packages/ui-kit/src/lint/eslint-plugin-hbc/` to new package
3. Add to `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'  # already covers it if packages/eslint-plugin-hbc/ exists
```
4. Reference from root `.eslintrc.base.js`:
```js
plugins: ['@hb-intel/eslint-plugin-hbc'],
extends: ['plugin:@hb-intel/eslint-plugin-hbc/recommended']
```

**Acceptance:** Running `pnpm lint` from repo root applies `hbc/` rules to all `apps/` and `packages/`.

---

#### F-005 — Resolve `app-shell` vs `shell` ambiguity

**Why it blocks Phase 4b:** `WorkspacePageShell` (D-01) must have a clear home. The two shell packages create import ambiguity that will produce inconsistent behavior across apps.

**Resolution:** `packages/app-shell` is a **PWA-specific re-export facade** of `packages/shell`. It re-exports `WorkspacePageShell` and `ShellLayout` with PWA-specific MSAL auth context injected. All workspace apps import from `@hb-intel/app-shell`. SPFx webparts import from `@hb-intel/shell` directly (no auth context).

**Steps:**
1. Implement `packages/app-shell/src/index.ts` as an explicit re-export with auth injection
2. Update ADR-0003 and ADR-0017 to document this two-package distinction
3. Update all `apps/pwa` imports to use `@hb-intel/app-shell`

---

#### F-006 — Remove `storybook-static/` from git

**Steps:**
```bash
git rm -r --cached packages/ui-kit/storybook-static/
echo "packages/ui-kit/storybook-static/" >> .gitignore
git commit -m "chore(ui-kit): remove storybook-static from version control"
```

Add to `.github/workflows/ci.yml`:
```yaml
- name: Deploy Storybook
  run: pnpm --filter @hb-intel/ui-kit build-storybook
  # Deploy to Chromatic or Vercel here
```

---

### 3.2 Secondary Remediation (Complete during relevant Phase 4b sub-phase)

| Finding | Resolve During |
|---------|---------------|
| F-003 — Barrel completeness + missing ref docs | Phase 4b.1 |
| F-007 — ECharts dynamic import | Phase 4b.1 |
| F-008 — pdf.js dynamic import | Phase 4b.1 |
| F-009 — `useVoiceDictation` feature detection | Phase 4b.1 |
| F-010 — `tokens.ts` artifact removal | Phase 4b.1 (covered by F-001) |
| F-011 — Normalize build artifact state | Phase 4b.1 (covered by F-001) |
| F-012 — Wire test-runner to CI | Phase 4b.12 |
| F-013 — Missing stories for shell sub-components | Phase 4b.2 |
| F-014 — Move `module-configs/` out of ui-kit | Phase 4b.2 |
| F-015 — Consolidate `WorkspacePageShell` | Phase 4b.2 |
| F-016 — Document dual entry points | Phase 4b.1 |
| F-017 — Move `interactions/` to stories | Phase 4b.11 |
| F-018 — Icon import audit | Phase 4b.1 |
| F-019 — Turborepo pipeline inputs/outputs | Phase 4b.1 |
| F-020 — `vite.config.ts` verification | Phase 4b.1 |
| F-021 — ADR naming + ADR-0015 gap | Phase 4b.12 |
| F-022 — `HbcDataTable` savedViews storage | Phase 4b.7 |
| F-023 — `timerFullSpec` documentation | Phase 4b.10 |

---

## 4. Phase 4b.1 — Build & Packaging Foundation

**Goal:** A clean, correctly configured build pipeline where `@hb-intel/ui-kit` is the single reliable source of truth for all UI components consumed by apps and webparts.

**Depends on:** Prerequisites 3.1 (all hard blockers resolved)

### Tasks

#### 4b.1.1 — Verify Turborepo pipeline ordering

Confirm `turbo.json` defines correct build ordering and caching:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "package.json", "tsconfig.json"],
      "outputs": ["dist/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig.json"],
      "outputs": []
    },
    "lint": {
      "inputs": ["src/**", ".eslintrc.*"],
      "outputs": []
    },
    "storybook:build": {
      "dependsOn": ["build"],
      "outputs": ["storybook-static/**"]
    }
  }
}
```

Expected build order: `models` → `data-access` + `auth` → `query-hooks` → `ui-kit` → `shell` → `app-shell` → `apps/*`

#### 4b.1.2 — Audit and complete `src/index.ts` barrel

Verify every component directory in `packages/ui-kit/src/` is exported:

```ts
// packages/ui-kit/src/index.ts — required exports checklist
export * from './HbcAppShell';
export * from './HbcApprovalStepper';
export * from './HbcBanner';
export * from './HbcBottomNav';
export * from './HbcBreadcrumbs';
export * from './HbcButton';
export * from './HbcCalendarGrid';
export * from './HbcCard';
export * from './HbcChart';
export * from './HbcCommandBar';
export * from './HbcCommandPalette';
export * from './HbcConfirmDialog';
export * from './HbcDataTable';
export * from './HbcDrawingViewer';
export * from './HbcEmptyState';
export * from './HbcErrorBoundary';
export * from './HbcForm';
export * from './HbcInput';
export * from './HbcKpiCard';
export * from './HbcModal';
export * from './HbcPagination';
export * from './HbcPanel';
export * from './HbcPhotoGrid';
export * from './HbcPopover';
export * from './HbcScoreBar';
export * from './HbcSearch';
export * from './HbcSpinner';
export * from './HbcStatusBadge';
export * from './HbcTabs';
export * from './HbcTearsheet';
export * from './HbcToast';
export * from './HbcTooltip';
export * from './HbcTree';
export * from './HbcTypography';
export * from './WorkspacePageShell';
export * from './layouts';
export * from './theme';
export * from './hooks';
export * from './icons';
export * from './interactions';
```

#### 4b.1.3 — Dynamic import for heavy dependencies

**ECharts** (`HbcChart/EChartsRenderer.tsx`):
```ts
// Before
import * as echarts from 'echarts';

// After
const echarts = await import('echarts');
```

**pdf.js** (`HbcDrawingViewer/hooks/usePdfRenderer.ts`):
```ts
const pdfjsLib = await import('pdfjs-dist');
```

#### 4b.1.4 — Icon import audit

Audit `packages/ui-kit/src/icons/index.tsx`. Replace any wildcard imports:
```ts
// ❌ Prohibited
import * as Icons from '@fluentui/react-icons';

// ✅ Required
import { Add24Regular, ChevronRight20Regular, ... } from '@fluentui/react-icons';
```

Confirm `"sideEffects": false` is set in `packages/ui-kit/package.json`.

#### 4b.1.5 — SPFx feature detection for `useVoiceDictation`

```ts
// packages/ui-kit/src/HbcInput/hooks/useVoiceDictation.ts
const isSupported =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

// Return no-op hook if unsupported (SPFx iframe, Firefox, Safari iOS)
if (!isSupported) return { isListening: false, start: () => {}, stop: () => {} };
```

#### 4b.1.6 — Create missing reference documentation

Create `docs/reference/ui-kit/` entries for all undocumented components:

- `HbcApprovalStepper.md`
- `HbcCalendarGrid.md`
- `HbcConfirmDialog.md`
- `HbcDrawingViewer.md`
- `HbcHeader.md`
- `HbcKpiCard.md`
- `HbcPhotoGrid.md`
- `HbcScoreBar.md`
- `WorkspacePageShell.md`

Each doc must include: description, props table, usage example, variants, and SPFx compatibility notes.

### Acceptance Criteria

- [ ] `git ls-files packages/ui-kit/src/ | grep -E '\.(js|d\.ts|map)$'` returns empty
- [ ] `pnpm --filter @hb-intel/ui-kit build` completes and outputs to `dist/`
- [ ] `pnpm turbo run build` completes in correct dependency order
- [ ] All 44 components exported from `src/index.ts`
- [ ] ECharts and pdf.js use dynamic imports
- [ ] `useVoiceDictation` returns gracefully in unsupported environments
- [ ] All 44 components have reference documentation

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*