# HB-Intel — Phase 4b: UI Design Implementation Plan Task 12
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

## 15. Phase 4b.12 — Integration Verification & Acceptance

**Goal:** End-to-end verification that the complete system works together. The guarantee is confirmed mechanically, not by inspection.

**Depends on:** All previous phases complete

### 4b.12.0 — Carryover Closure From 4b.1 Through 4b.11

Phase 4b.12 is the closure phase for any unresolved or undocumented gates from phases 4b.1 through 4b.11. Carryover is evidence-based: items already implemented are marked as verified, and true gaps are completed in this phase.

| Carryover area | Source phases | 4b.12 closure action | Evidence required |
|---|---|---|---|
| CI quality gates | 4b.6, 4b.11, §17 | Run and record `build`, `check-types`, `lint`, Storybook test-runner, and Playwright e2e in CI | Green CI run and dated plan progress note |
| Storybook/e2e integration | 4b.3, 4b.7, 4b.8, 4b.9, 4b.10, 4b.11 | Add missing Storybook test-runner CI step and six critical Playwright specs | `.github/workflows/ci.yml` + `e2e/*.spec.ts` updates |
| Structural hygiene | 4b.1, F-024, §17 | Remove generated test artifacts from git and ensure artifact folders are ignored | `.gitignore` + untracked artifact directories |
| ADR hygiene | 4b.1, F-021, §17 | Standardize early ADR naming, remove duplicates, document ADR-0015 gap, and update ADR index | ADR directory + `docs/README.md` index |
| Authoring guarantee verification | 4b.2 through 4b.11, §17 | Execute Phase 4b acceptance matrix and verify D-01 through D-10 constraints across apps | Matrix report + final sign-off ADR-0046 |
| Documentation closure | §16, §17 | Publish missing Phase 4b developer playbook and append dated progress notes | `docs/how-to/developer/phase-4b-developer-playbook.md` + plan note entries |

### Tasks

#### 4b.12.1 — Wire Storybook test-runner to CI (F-012)

```yaml
# .github/workflows/ci.yml
- name: Build Storybook
  run: pnpm --filter @hb-intel/ui-kit build-storybook

- name: Run Storybook tests
  run: |
    pnpm --filter @hb-intel/ui-kit serve-storybook &
    sleep 5
    pnpm --filter @hb-intel/ui-kit test-storybook
```

#### 4b.12.2 — Expand e2e coverage (F-024)

Add Playwright specs for all critical workflows:

| Spec file | Workflows covered |
|-----------|------------------|
| `e2e/shell.spec.ts` | Shell renders, nav highlights, mode switching |
| `e2e/forms.spec.ts` | Form validation, dirty-state warning, draft restore |
| `e2e/notifications.spec.ts` | Toast success/error, banner persistent |
| `e2e/scorecard.spec.ts` | Go/No-Go scorecard create → submit → approve |
| `e2e/risk.spec.ts` | Risk item create → detail → edit |
| `e2e/field-mode.spec.ts` | Mobile viewport, bottom nav, field mode rendering |

#### 4b.12.3 — Standardize ADR naming (F-021)

```bash
# Rename early ADRs to consistent ADR-XXXX format
mv docs/architecture/adr/0001-monorepo-bootstrap.md \
   docs/architecture/adr/ADR-0001-monorepo-bootstrap.md
# ... repeat for 0001–0014
# Remove duplicate ADR-0016
```

Update `docs/README.md` ADR index with correct filenames and status field for each ADR.

#### 4b.12.4 — Phase 4b acceptance test matrix

Run the following verification checklist across all 11 workspace apps + pwa + hb-site-control:

```
For each app page:
  □ Page renders inside WorkspacePageShell
  □ Correct layout variant applied
  □ Sidebar item highlights on navigation
  □ Actions appear in command bar zone only
  □ Loading state shows HbcSpinner/skeleton
  □ Empty state shows HbcEmptyState
  □ Error state shows HbcErrorBoundary
  □ Toast fires on save/error
  □ No lint errors
  □ Field mode renders correctly at 375px viewport
```

Also reconcile unresolved gates from 4b.1 through 4b.11 in a carryover crosswalk:

```
For each unresolved historical checkbox:
  □ Mark as "Verified complete" with objective evidence, OR
  □ Complete implementation in this phase and link commit/file evidence
  □ Reference final status in PH4B-UI-Design-Plan.md §17
```

#### 4b.12.5 — Remove generated artifacts from git (F-024)

```bash
echo "playwright-report/" >> .gitignore
echo "test-results/" >> .gitignore
git rm -r --cached playwright-report/ test-results/
git commit -m "chore: remove generated test artifacts from version control"
```

### Acceptance Criteria

- [x] All Storybook stories passing in CI (0 failures) — verified 2026-03-06 via `build-storybook` + `test-storybook --url`
- [x] All e2e specs passing in CI — verified 2026-03-06 via `pnpm e2e` (25 passed, 4 skipped)
- [x] `pnpm turbo run build` = 0 errors — verified 2026-03-06
- [x] `pnpm turbo run lint` = 0 errors — verified 2026-03-06 (warnings only, no errors)
- [x] `pnpm turbo run type-check` = 0 errors — verified 2026-03-06
- [x] Phase 4b acceptance test matrix passing for all apps — verified 2026-03-06 (source scan + e2e evidence)
- [x] Carryover crosswalk from phases 4b.1–4b.11 completed (no unresolved items) — verified in PH4B §17 notes
- [x] ADR naming standardized, index updated — verified 2026-03-06
- [x] ADR-0015 gap documented in ADR index/notes — verified 2026-03-06
- [x] `docs/how-to/developer/phase-4b-developer-playbook.md` published — verified 2026-03-06
- [x] No generated artifacts in git — verified 2026-03-06 (`playwright-report/`, `test-results/` untracked)
- [x] PH4B-UI-Design-Plan.md §17 fully marked complete with dated verification notes — verified 2026-03-06

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4b.12 planning update: 2026-03-06
  - Added explicit carryover closure section for unresolved 4b.1-4b.11 tasks
  - Added evidence-based crosswalk requirement (verify complete vs complete now)
  - Expanded acceptance criteria to include build gate, ADR-0015 gap note, and developer playbook publication
  - Linked final closure responsibility to PH4B-UI-Design-Plan.md §17 completion updates
Phase 4b.12.1 and 4b.12.5 completed: 2026-03-06
  - Storybook CI now runs build-storybook + test-storybook with explicit Playwright install, health wait loop, and background process cleanup
  - Final CI lint gate added after integration jobs complete
  - Generated Playwright artifacts removed from git index and ignored (`playwright-report/`, `test-results/`)
Phase 4b.12.2 and 4b.12.3 completed: 2026-03-06
  - Added six Playwright specs: shell, forms, notifications, scorecard, risk, and field-mode with explicit workflow rationale comments
  - Standardized ADR filenames ADR-0001 through ADR-0014 and removed duplicate legacy `0016-ui-design-system-foundation.md`
  - Rebuilt `docs/README.md` ADR index with per-ADR status field and ADR-0015 reserved-gap documentation
Phase 4b.12.4 completed: 2026-03-06
  - Executed acceptance matrix evidence across 11 workspace apps + `pwa` + `hb-site-control` using shell/layout scans and e2e coverage
  - Verified `build`, `check-types`, `lint`, Storybook test-runner, and Playwright commands with dated command evidence
  - Completed carryover crosswalk closure for all unresolved 4b.1-4b.11 checklist items and linked objective evidence into PH4B §17
Phase 4b.12 final closure completed: 2026-03-06
  - PH4B §17 completion checklist fully marked complete with dated verification notes
  - ADR-0046 created for final sign-off and guarantee confirmation
  - Blueprint and Foundation plan progress comments updated for Phase 4b closure traceability
-->
