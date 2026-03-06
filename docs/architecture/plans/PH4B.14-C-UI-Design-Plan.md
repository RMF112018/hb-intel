**HB-Intel — Phase 4B: Post-Audit Remediation & Production Readiness Plan Completion Task 4B.14**  
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

## 5. Phase 4b.14 — Navigation & Active State Synchronization (CF-005)

**Effort:** 4 hours  
**Owner:** UI Architect  
**Acceptance Criteria:**

1. `packages/shell/src/stores/navStore.ts` subscribes to TanStack Router location changes (via `router.history` or `useMatchRoute`).  
2. Active sidebar item updates correctly on browser back/forward and deep links.  
3. Unit test added verifying subscription and state update.  
4. `pnpm lint` and `pnpm turbo run type-check` pass.

**Implementation Steps:**

- Add `useEffect` subscription in `navStore` (or convert to a TanStack-aware hook).  
- Update `HbcAppShell` and `WorkspacePageShell` to use the synchronized store.  
- Add Storybook example demonstrating back/forward behavior.

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
- [ ] `pnpm turbo run build` passes  
- [ ] `pnpm turbo run type-check` passes  
- [ ] `pnpm turbo run lint` passes with 0 violations  
- [ ] All Storybook stories pass test-runner (including new dark/Field Mode variants)  
- [ ] All Playwright e2e specs pass  

### Remediation Gates
- [ ] Menu & overlay contrast bug (white backgrounds) fully resolved  
- [ ] CF-005 and HF-007 fully resolved  
- [ ] All P2–P4 items closed  
- [ ] 100% of workspace pages use `WorkspacePageShell` + named layout  
- [ ] 0 direct Fluent UI imports or token violations  

### Documentation & Polish
- [ ] Developer Playbook updated with theme rules  
- [ ] All reference docs complete  
- [ ] Bundle-size reporting enforced in CI  

**Final Status:** Production-ready for Phase 5 deployment.

---

This plan is ready to be saved as `docs/architecture/plans/PH4B-UI-Design-Post-Audit-Remediation-Plan.md`. All tasks are fully scoped, estimated, and include clear acceptance criteria and implementation steps matching the style of the existing PH4B.1–PH4B.12 plans. The menu contrast issue has been elevated to the first P1 task (4b.13) as it blocks visual consistency in the development environment.