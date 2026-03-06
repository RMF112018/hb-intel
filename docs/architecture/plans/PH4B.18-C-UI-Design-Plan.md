**HB-Intel — Phase 4B: Post-Audit Remediation & Production Readiness Plan**  
### UI Kit + Shell Completion Sprint (Final)

**Version:** 1.1  
**Date:** March 6, 2026  
**Depends On:** Phase 4B UI Design Implementation (completed through 4b.12) + March 2026 UI Kit QA/QC Audit (full source validation)  
**Objective:** Resolve all remaining P1–P4 findings from the comprehensive UI Kit audit **and the critical dark-mode / Field Mode menu contrast issues** observed in the PWA development environment. This final cleanup sprint ensures visual consistency, theme correctness, and full production readiness before Phase 5 begins.

---

## Table of Contents

1. [Objective & Success Criteria](#1-objective--success-criteria)  
2. [Architectural Decisions (Binding Constraints)](#2-architectural-decisions-binding-constraints)  
3. [Prerequisites & Audit Remediation](#3-prerequisites--audit-remediation)  
4. [Phase 4b.13 — Menu & Overlay Theme Adaptation (NEW P1 – Critical Contrast Fix)](#4-phase-4b13--menu--overlay-theme-adaptation-new-p1--critical-contrast-fix)  
5. [Phase 4b.14 — Navigation & Active State Synchronization (CF-005)](#5-phase-4b14--navigation--active-state-synchronization)  
6. [Phase 4b.15 — Form Validation Architecture Finalization (HF-007)](#6-phase-4b15--form-validation-architecture-finalization)  
7. [Phase 4b.16 — Developer Harness, Documentation & E2E Expansion (P3)](#7-phase-4b16--developer-harness-documentation--e2e-expansion)  
8. [Phase 4b.17 — Build Pipeline, Bundle Reporting & Polish (P2/P4)](#8-phase-4b17--build-pipeline-bundle-reporting--polish)  
9. [Phase 4b.18 — Integration Verification & Acceptance](#9-phase-4b18--integration-verification--acceptance)  
10. [Developer Playbook Update](#10-developer-playbook-update)  
11. [Completion Criteria](#11-completion-criteria)  
12. [Progress Notes](#12-progress-notes)

---

## 1. Objective & Success Criteria

### Primary Objective

Resolve every open P1–P4 remediation item identified in the March 2026 UI Kit audit **and the newly reported menu/popover contrast bug** observed in `apps/pwa` dev mode (white backgrounds on Project Picker and User Menu in dark/Field Mode).

### What “Production Ready” Means

- All critical and high-severity risks (including theme contrast) are eliminated  
- Every overlay surface (menus, popovers, command palette, etc.) respects the active theme  
- Navigation, forms, and consumption enforcement are fully wired and enforced  

### Success Metrics (updated)

| Metric                              | Target                  |
|-------------------------------------|-------------------------|
| Critical Findings remaining         | 0                       |
| High Severity Findings remaining    | 0                       |
| Menu/overlay contrast violations    | 0 (dark & Field Mode)   |
| `pnpm turbo run lint` violations    | 0 across all apps       |
| Pages using `WorkspacePageShell`    | 100%                    |

---

## 2. Architectural Decisions (Binding Constraints)

The following decisions from the original Phase 4B plan remain binding and are non-negotiable:

| #  | Decision                              | Binding Rule |
|----|---------------------------------------|--------------|
| D-04 | Navigation active state               | Must be derived automatically from TanStack Router |
| D-07 | Form architecture                     | All forms must use `HbcForm` + centralized validation |
| D-10 | Component consumption enforcement     | ESLint rules remain mandatory |

**New binding decision for this remediation sprint:**

**D-12**: All overlay surfaces (Menu, Popover, CommandPalette, etc.) **must** inherit the current `FluentProvider` theme (including custom `hbcLightTheme`, `hbcDarkTheme`, and Field Mode overrides). No component may hard-code light-mode styles.

---

## 3. Prerequisites & Audit Remediation

All P0 items from the March 2026 audit are resolved. The following P1–P4 items (plus the new menu contrast issue) remain open and are the scope of this plan.

### 3.1 Hard Blockers (P1 – Must complete first)

- **NEW**: Menu & overlay theme adaptation (white-background dropdowns in dark/Field Mode)  
- CF-005: Navigation active state synchronization with TanStack Router  
- HF-007: Form validation adapter integration (zod / react-hook-form)

### 3.2 Secondary Remediation (P2–P4)

All remaining medium/low findings.

---

## 9. Phase 4b.18 — Integration Verification & Acceptance

**Effort:** 4 hours  
**Owner:** UI Architect  
**Acceptance Criteria:**

- Full `pnpm turbo run build` + `lint` + `type-check` green.  
- All Storybook stories pass test-runner.  
- Playwright e2e suite passes against local build.  
- Final audit run confirms zero remaining findings.  
- PR created and merged.

**Implementation Steps:**

- Run full monorepo build and test suite.  
- Verify menu contrast in PWA dev mode.  
- Perform final visual QA in both light and Field Mode.  
- Merge remediation PR.

---

## 10. Developer Playbook Update

Add the following to `docs/how-to/developer/phase-4b-developer-playbook.md`:

**New Section: Theme & Overlay Rules**

- All menus, popovers, and dropdowns must be children of the root `FluentProvider`.  
- Never hard-code background colors — always use theme tokens or `useHbcTheme()`.  
- Test every new overlay in both light, dark, and Field Mode before merging.

**New Section: Post-Audit Remediation Checklist**

- Always import navigation state from TanStack Router (never set manually).  
- All forms must wrap content in `<HbcForm>` and use the validation context.  
- Run `pnpm lint` locally before every commit.

---

## 11. Completion Criteria

Phase 4B Remediation is **complete** when all of the following are true simultaneously:

### Code Quality Gates (CI enforced)
- [x] `pnpm turbo run build` passes — completed 2026-03-06 in Phase 4b.18 verification sweep.  
- [x] `pnpm turbo run type-check` passes — repository command is `pnpm turbo run check-types` (type-check alias reference normalized in evidence).  
- [x] `pnpm turbo run lint` passes with 0 violations — completed 2026-03-06 (0 errors; warnings remained non-blocking and pre-existing).  
- [x] All Storybook stories pass test-runner (including new dark/Field Mode variants) — completed 2026-03-06 (`365 passed`, `0 failed`).  
- [x] All Playwright e2e specs pass — completed 2026-03-06 (`37 passed`, `4 skipped`, `0 failed`).  

### Remediation Gates
- [x] Menu & overlay contrast bug (white backgrounds) fully resolved — D-12 remediation verified in final light/dark/Field Mode QA pass and Storybook overlay verification stories.  
- [x] CF-005 and HF-007 fully resolved — CF-005 (ADR-0048) and HF-007 (ADR-0049) closure reconfirmed during final gate run.  
- [x] All P2–P4 items closed — P3 closure recorded in ADR-0050 and P2/P4 closure recorded in ADR-0051; no remaining open gates.  
- [x] 100% of workspace pages use `WorkspacePageShell` + named layout — maintained by per-domain smoke suite and route/component audit evidence from Phase 4b.16.  
- [x] 0 direct Fluent UI imports or token violations — lint gate completed with no rule-breaking errors on D-10 enforcement rules.  

### Documentation & Polish
- [x] Developer Playbook updated with theme rules — completed in prior remediation and reconfirmed during 4b.18 closure review.  
- [x] All reference docs complete — completed in Phase 4b.16 audit closure and reconfirmed in final acceptance review.  
- [x] Bundle-size reporting enforced in CI — completed in Phase 4b.17 (`bundle-report` Turbo task + CI gate), reconfirmed in final acceptance review.  

**Final Status:** [x] Production-ready for Phase 5 deployment (final Phase 4B remediation acceptance confirmed 2026-03-06).

---

## 12. Progress Notes

- 4b.18 completed — monorepo verification gates passed: `pnpm turbo run build`, `pnpm turbo run check-types` (type-check equivalent), and `pnpm turbo run lint` (0 errors) — 2026-03-06.  
- 4b.18 completed — Storybook final acceptance run passed using static build + test-runner (`54 suites`, `365 tests`, `0 failed`) with dark/Field overlay verification stories included in coverage — 2026-03-06.  
- 4b.18 completed — Playwright final acceptance run passed (`37 passed`, `4 skipped`, `0 failed`) and reconfirmed WorkspacePageShell rendering baseline across domain routes — 2026-03-06.  
- 4b.18 completed — final visual QA evidence reviewed for Project Picker, User Menu, Toolbox flyout, and Command Palette across light, dark, and Field Mode using `HbcAppShell` overlay verification stories plus PWA shell smoke checks; no remaining contrast findings — 2026-03-06.  
- 4b.18 completed — governance closure finalized: PH4B-C §11 fully marked complete, blueprint/foundation progress logs updated, and ADR-0052 published as final Phase 4B sign-off — 2026-03-06.
