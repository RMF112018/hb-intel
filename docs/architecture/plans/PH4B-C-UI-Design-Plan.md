**HB-Intel — Phase 4B: Post-Audit Remediation & Production Readiness Plan**  
### UI Kit + Shell Completion Sprint (Final)

**Version:** 1.2  
**Date:** March 6, 2026  
**Depends On:** Phase 4B UI Design Implementation (completed through 4b.12) + March 2026 UI Kit QA/QC Audit (full source validation)  
**Objective:** Resolve all remaining P1–P4 findings from the comprehensive UI Kit audit **and the newly discovered system theme awareness bug** (app always renders light mode when Field Mode is off, ignoring OS `prefers-color-scheme: dark`) **plus the menu/overlay contrast issues** observed in the PWA development environment. This final cleanup sprint ensures visual consistency, full system + Field Mode theme correctness, and production readiness before Phase 5 begins.

---

## Table of Contents

1. [Objective & Success Criteria](#1-objective--success-criteria)  
2. [Architectural Decisions (Binding Constraints)](#2-architectural-decisions-binding-constraints)  
3. [Prerequisites & Audit Remediation](#3-prerequisites--audit-remediation)  
4. [Phase 4b.13 — System Theme Awareness + Menu & Overlay Adaptation (P1 – Critical)](#4-phase-4b13--system-theme-awareness--menu--overlay-adaptation-p1--critical)  
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

Resolve every open P1–P4 remediation item identified in the March 2026 UI Kit audit **and the system theme awareness bug** (app forces light mode when Field Mode is off, ignoring OS dark preference) plus the menu/overlay contrast issues.

### What “Production Ready” Means

- Full system dark mode support when Field Mode is disabled  
- All overlays (menus, popovers, command palette) adapt correctly to light / dark / field themes  
- Navigation, forms, and consumption enforcement are fully wired and enforced  

### Success Metrics (updated)

| Metric                              | Target                  |
|-------------------------------------|-------------------------|
| Critical Findings remaining         | 0                       |
| High Severity Findings remaining    | 0                       |
| System theme / menu contrast violations | 0 (light, dark, field) |
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

**New binding decisions for this remediation sprint:**

**D-12**: All overlay surfaces (Menu, Popover, CommandPalette, etc.) **must** inherit the current `FluentProvider` theme (including custom `hbcLightTheme`, `hbcDarkTheme`, and Field Mode overrides). No component may hard-code light-mode styles.

**D-13**: When Field Mode is off, the app **must** respect the OS `prefers-color-scheme` (light or dark). Field Mode always forces `hbcFieldTheme`.

---

## 3. Prerequisites & Audit Remediation

All P0 items from the March 2026 audit are resolved. The following P1–P4 items (plus the new system theme bug) remain open and are the scope of this plan.

### 3.1 Hard Blockers (P1 – Must complete first)

- **NEW**: System theme awareness + menu/overlay contrast (light mode forced, white backgrounds in dark/field)  
- CF-005: Navigation active state synchronization with TanStack Router  
- HF-007: Form validation adapter integration (zod / react-hook-form)

### 3.2 Secondary Remediation (P2–P4)

All remaining medium/low findings.

---

## 10. Developer Playbook Update

Add the following to `docs/how-to/developer/phase-4b-developer-playbook.md`:

**New Section: Theme & Overlay Rules**

- The root `FluentProvider` must always receive the dynamic theme from `useHbcTheme()`.  
- All menus, popovers, and dropdowns must be children of the root `FluentProvider`.  
- Never hard-code background colors — always use theme tokens or `useHbcTheme()`.  
- Test every new overlay in light, dark (system), and Field Mode before merging.

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
- [ ] All Storybook stories pass test-runner (including light/dark/field variants)  
- [ ] All Playwright e2e specs pass  

### Remediation Gates
- [x] System theme awareness bug resolved (respects OS `prefers-color-scheme`) — dynamic theme resolution now uses OS preference in office mode and forces field theme in Field Mode (D-13 verified on 2026-03-06)  
- [x] Menu & overlay contrast bug (white backgrounds) fully resolved — verified across Project Picker, User Menu, Toolbox flyout, and Command Palette in light + dark/Field Mode (2026-03-06)  
- [x] CF-005 navigation active state synchronization resolved — `navStore` now subscribes to TanStack Router history and drives route-authoritative `activeWorkspace`/`activeItemId` updates for deep links and browser back/forward (2026-03-06)  
- [x] HF-007 form validation architecture finalization resolved — `HbcForm` now exposes centralized RHF + zod validation context, `HbcForm` primitives run in dual-mode context validation, draft APIs consolidated around `useFormDraft`, and ADR-0049 published (2026-03-06)  
- [x] P3 Developer Harness / Documentation / E2E expansion complete — DemoShell/DemoNavigation/DemoLayouts added, per-domain WorkspacePageShell smoke specs added, and ADR-0050 published (2026-03-06)
- [x] P2/P4 Build Pipeline / Bundle Reporting polish complete — Turbo bundle-report task added, CI regression gate enforced, dist artifact ignore policy normalized, and ADR-0051 published (2026-03-06)
- [ ] All P2–P4 items closed  
- [x] 100% of workspace pages use `WorkspacePageShell` + named layout — validated by route/component audit and per-domain shell smoke coverage refresh (2026-03-06)  
- [ ] 0 direct Fluent UI imports or token violations  

### Documentation & Polish
- [ ] Developer Playbook updated with theme rules  
- [x] All reference docs complete — component reference audit closed with missing chart/input/toast references added and cross-links updated (2026-03-06)  
- [x] Bundle-size reporting enforced in CI — SPFx budget gate now runs in Turbo and CI with regression-fail behavior (2026-03-06)  

**Final Status:** Production-ready for Phase 5 deployment.

---

## 12. Progress Notes

- 4b.13 System Theme Awareness audit completed — verified `hbcDarkTheme` was aliasing field theme and `useFieldMode` was light-only when Field Mode disabled, causing OS preference mismatch — 2026-03-06.  
- 4b.13 System Theme Awareness implementation completed — `useFieldMode` internal `useAppTheme` logic now resolves `light`/`dark`/`field` modes with live `prefers-color-scheme` tracking and provider-ready `resolvedTheme` output — 2026-03-06.  
- 4b.13 System Theme Awareness provider wiring completed — `HbcAppShell` and root app providers (PWA + SPFx + hb-site-control) now consume hook-provided dynamic theme and no longer hard-code `hbcLightTheme` — 2026-03-06.  
- 4b.13 System Theme Awareness story verification completed — `HbcAppShell.stories.tsx` now includes deterministic light/dark/field variants with OS theme simulation harness for D-13 regression coverage — 2026-03-06.  
- 4b.13 System Theme Awareness completed — dynamic theme now respects OS `prefers-color-scheme` when Field Mode is disabled, with remediation gate marked complete and ADR-0047 addendum published — 2026-03-06.  
- 4b.13 completed — all overlays now correctly inherit theme in dark/Field Mode; D-12 enforcement verified and remediation gate marked complete — 2026-03-06.  
- 4b.13 audit completed — identified non-compliant light-only overlay styles in `HbcProjectSelector`, `HbcUserMenu`, `HbcToolboxFlyout`, and `HbcCommandPalette` (D-12 traceability) — 2026-03-06.  
- 4b.13 implementation completed — all target overlays now derive surfaces/borders/text from active theme context using `useHbcTheme()` + mode-aware tokens; hard-coded white overlay backgrounds removed — 2026-03-06.  
- 4b.13 Storybook coverage completed — `HbcAppShell.stories.tsx` now includes deterministic dark-theme and Field Mode overlay verification variants — 2026-03-06.  
- 4b.13 governance completed — remediation gate updated, ADR-0047 authored, and blueprint/foundation progress logs updated with acceptance evidence — 2026-03-06.
- 4b.14 audit completed — confirmed manual active item derivation in PWA root route and missing router subscription lifecycle in `packages/shell/src/stores/navStore.ts` (CF-005 / D-04 traceability) — 2026-03-06.
- 4b.14 implementation completed — added `resolveNavRouteState`, `syncFromPathname`, and `startNavSync`/`stopNavSync` lifecycle controls in `navStore`; active state now derives automatically from TanStack Router location changes (deep link + nested route + back/forward support) — 2026-03-06.
- 4b.14 consumer wiring completed — `HbcAppShell` now consumes synchronized store active state by default, `WorkspacePageShell` now reads synchronized workspace context, and PWA root route initializes router history sync on mount — 2026-03-06.
- 4b.14 verification and governance completed — unit test + Storybook route-sync scenario added, gates executed (`build`, `lint`, `check-types`, Storybook test-runner, `pnpm e2e`), remediation gate updated, and ADR-0048 published — 2026-03-06.
- 4b.15 completed — `HbcFormContext` now exposes full centralized `react-hook-form` + `zodResolver` validation API (`register`, `handleSubmit`, `formState`, `control`, `setValue`, `getValues`, `watch`, `trigger`, `reset`) per D-07/HF-007 — 2026-03-06.
- 4b.15 completed — `HbcTextField`, `HbcSelect`, and `HbcCheckbox` now enforce dual-mode centralized validation via `name` + context while preserving controlled backward compatibility paths — 2026-03-06.
- 4b.15 completed — draft persistence finalized: `useFormDraft` is the consumer-facing API with RHF-aligned helpers, `useFormDraftStore` retained as low-level state for compatibility — 2026-03-06.
- 4b.15 governance completed — `HbcForm.stories.tsx` schema-validation + draft example added, ADR-0042 updated, ADR-0049 created, and HF-007 remediation gate marked complete — 2026-03-06.
- 4b.16 completed — dev-harness P3 demo pages added (`DemoShell`, `DemoNavigation`, `DemoLayouts`) and wired into workspace preview flows for live shell/layout validation — 2026-03-06.
- 4b.16 completed — per-domain Playwright smoke coverage added (12 domain specs) using shared WorkspacePageShell assertions to verify shell frame rendering and route stability — 2026-03-06.
- 4b.16 completed — UI-kit reference documentation audit finalized; missing chart/input/toast component references created and entry-point cross-links updated — 2026-03-06.
- 4b.16 governance completed — `CLAUDE.md` and `DESIGN_SYSTEM.md` dual-entry-point guidance finalized, PH4B-C remediation gates updated, and ADR-0050 created — 2026-03-06.
- 4b.16 verification completed — `pnpm turbo run build`, `pnpm turbo run check-types`, `pnpm turbo run lint` (0 errors), Storybook build/test-runner, and `pnpm e2e` all passed for P3 closure evidence — 2026-03-06.
- 4b.17 completed — Turbo now includes dedicated `bundle-report` task and optimized build/lint/check-types pipeline cache contracts for deterministic regression detection — 2026-03-06.
- 4b.17 completed — CI `Bundle Size Gate` job added and wired to fail on SPFx bundle-size regression via `packages/spfx/scripts/report-bundle-size.mjs` — 2026-03-06.
- 4b.17 completed — `.gitignore` dist policy normalized for app/library/function outputs and bundle report diagnostics improved for CI readability — 2026-03-06.
- 4b.17 governance completed — `CLAUDE.md` preview-only Vercel policy documented, PH4B-C remediation gates updated, and ADR-0051 created — 2026-03-06.
