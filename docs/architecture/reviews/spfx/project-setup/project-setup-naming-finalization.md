# Project Setup Requests — Naming & Comment Finalization

> **Date**: 2026-03-30
> **Scope**: Sweep all source files to replace residual "Estimating" naming with "Project Setup" where it refers to this SPFx surface

---

## 1. Problem

After the Prompt 7 structural re-scope (package name, manifests, IIFE global, build config), many source file comments, user-facing strings, and doc references still said "Estimating" when referring to this standalone Project Setup Requests surface. This creates confusion about whether this artifact is the broader Estimating product or the scoped Project Setup surface.

## 2. What Changed

### Comments updated (non-user-facing)

| File | Old | New |
|------|-----|-----|
| `mount.tsx` | "Production entry point for the Estimating app" | "...for the Project Setup Requests SPFx surface" |
| `mount.tsx` | "Enables the reviewer-only backend mode switch in the Estimating header" | "...in the Project Setup header" |
| `mount.tsx` | "Mount the Estimating React app" | "Mount the Project Setup Requests app" |
| `App.tsx` | `estimatingSessionExecutor` variable | `projectSetupSessionExecutor` |
| `App.tsx` | "Estimating currently uses session-state" | "Project Setup uses session-state" |
| `runtimeConfig.ts` | "Runtime configuration for the Estimating app" | "...for the Project Setup Requests app" |
| `bootstrap.ts` | "Synchronous mock environment bootstrap for Estimating webpart" | "...for Project Setup Requests surface" |
| `bootstrap.ts` | `[HB-BOOTSTRAP] Estimating mock environment` | `[HB-BOOTSTRAP] Project Setup mock environment` |
| `main.tsx` | Comment referencing EstimatingWebPart.tsx | Simplified to describe IIFE mount path |
| `test/setup.ts` | "Vitest setup for estimating webpart tests" | "...for Project Setup Requests tests" |
| `test/renderWithProviders.tsx` | "Renders a component wrapped with the providers used by the Estimating app" | "...by the Project Setup app" |
| `ProvisioningChecklist.tsx` | Traceability ref to PH6.10-Estimating-App.md | "Project Setup provisioning workflow" |
| `RequestDetailPage.tsx` | Same stale doc ref | "Project Setup request detail workflow" |
| `EstimatingWebPart.tsx` | "SPFx webpart entry point for Estimating" | "...for Project Setup Requests" with backward-compat note |
| `EstimatingWebPart.tsx` | "Estimating SPFx webpart" | "Project Setup Requests SPFx webpart" |
| `EstimatingWebPart.tsx` | "Estimating Webpart Settings" | "Project Setup Requests Settings" |

### User-facing strings updated

| File | Old | New |
|------|-----|-----|
| `CompletionConfirmationCard.tsx` | "Stay in Estimating" | "Stay in Project Setup" |

### Test updates

| File | Change |
|------|--------|
| `RequestDetailPage.completion.test.tsx` | Updated all "Stay in Estimating" assertions to "Stay in Project Setup" |

### Smart empty state module context

| File | Old | New |
|------|-----|-----|
| `ProjectSetupPage.tsx` | `module: 'estimating'` | `module: 'project-setup'` |

## 3. Intentionally Preserved

These "estimating" references are intentionally kept:

| Reference | Reason |
|-----------|--------|
| `apps/estimating/` directory path | High blast radius to rename; documented as follow-up |
| `class EstimatingWebPart` | SPFx manifest alias requires this class name for backward compatibility |
| `IEstimatingWebPartProps` interface | Coupled to the class above |
| `@hbc/features-estimating` imports | Separate package — owns both Project Setup and Bid Readiness config |
| `useNavStore.setActiveWorkspace('estimating')` | `'estimating'` is a valid WorkspaceId in the shell type system |
| `hb-intel:estimating:*` localStorage keys | Changing would orphan existing user drafts |
| `Estimating Team` section heading in TeamStepBody | Refers to the estimating discipline (team role grouping), not the SPFx package |

## 4. Verification

| Check | Result |
|-------|--------|
| Build | Pass (1,185.01 KB, gzip 337.99 KB) |
| Lint | 0 errors (61 pre-existing warnings) |
| Tests | 107/107 pass + 2 todo (16 files) |

## 5. Files Changed

| File | Change |
|------|--------|
| `apps/estimating/src/mount.tsx` | Comments updated |
| `apps/estimating/src/App.tsx` | Variable rename + comment |
| `apps/estimating/src/main.tsx` | Comment simplified |
| `apps/estimating/src/bootstrap.ts` | Comments + log message |
| `apps/estimating/src/config/runtimeConfig.ts` | Comment updated |
| `apps/estimating/src/webparts/estimating/EstimatingWebPart.tsx` | Comments + property pane label + backward-compat note |
| `apps/estimating/src/components/project-setup/CompletionConfirmationCard.tsx` | "Stay in Project Setup" |
| `apps/estimating/src/components/ProvisioningChecklist.tsx` | Traceability comment |
| `apps/estimating/src/pages/RequestDetailPage.tsx` | Traceability comment |
| `apps/estimating/src/pages/ProjectSetupPage.tsx` | Empty state module context |
| `apps/estimating/src/test/setup.ts` | Comment |
| `apps/estimating/src/test/renderWithProviders.tsx` | Comment |
| `apps/estimating/src/test/RequestDetailPage.completion.test.tsx` | Button text assertions |
| `apps/estimating/package.json` | Version bump 0.2.3 → 0.2.4 |
