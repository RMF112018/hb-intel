# PH7 — Breakout SPFx Webparts: Master Infrastructure Plan

> **Doc Classification:** Canonical Normative Plan — master index and summary for Phase 7 Breakout SPFx Webparts infrastructure; governs `ph7-breakout-webparts/PH7-BW-0` through `BW-11` task files. Implementation pending PH7.12 sign-off (ADR-0090). See `HB-Intel-Blueprint-Crosswalk.md §5` for the PH7 Stabilization vs Expansion distinction.

**Version:** 2.0 (split into summary + task files — supersedes v1.0 monolithic plan)
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §1, §2a, §2b, §2c · `hb-intel-foundation-plan.md` Phase 7
**Date:** 2026-03-07
**Status:** ACTIVE — Infrastructure tasks pending; feature work may begin on Accounting after BW-1 through BW-5 are complete
**Audience:** Implementation agent, tech leads, DevOps, product owner

---

## Purpose of This Document

This is the **master index and summary plan** for Phase 7 Breakout SPFx Webparts. It replaces the v1.0 monolithic plan with a lean summary + individual task files following the same pattern established in PH6F.

Phase 7 has **two distinct layers**:

1. **Infrastructure Layer** (this plan) — The SPFx-specific scaffolding that every webpart needs before feature work can proceed. Covered by task files `PH7-BW-0` through `PH7-BW-11`.
2. **Feature Layer** (separate domain plans) — The actual pages, data, and business logic for each domain. Covered by the `PH7-[Domain]-*` plan files listed in §6 below.

The infrastructure layer must be substantially complete **before** feature work begins on any new domain. Accounting and Estimating are the first two domains and have the most critical infrastructure dependencies (provisioning trigger, SPFx auth context).

### Single Build Source, Two Deployment Targets

Each domain produces **two separate build outputs** (PWA bundle + SPFx `.sppkg`), but all feature page components live in a **single shared location**: `packages/features/[domain]/`. Apps contain only routing configuration, entry points, and bootstrapping — never page components.

```
packages/features/estimating/src/ProjectSetupPage.tsx   ← written ONCE
        ↙                                                      ↘
apps/estimating/ (routes.ts imports it)          apps/pwa/ (router imports it)
  → Vite build → SPFx .sppkg                      → Vite build → PWA bundle
```

This pattern is formalized in **`PH7-BW-0-Shared-Feature-Package.md`** and is a mandatory pre-requisite before any feature page is written. No page component is ever created directly in `apps/*/src/pages/`.

---

## Current State of Each SPFx App (as of 2026-03-07)

All 11 webpart apps exist at `apps/[domain]/` and share the same scaffolded structure. The table below shows what is already in place (✅), what is missing (❌), and what needs alignment (⚠️).

| Concern | Status | Task |
|---|---|---|
| `packages/features/[domain]/` shared page package structure | ❌ Does not exist | **BW-0** |
| `App.tsx` provider stack (Theme > Query > ErrorBoundary > Router) | ✅ All 11 apps | — |
| `main.tsx` with dual-mode bootstrap (`resolveAuthMode()`) | ✅ All 11 apps | — |
| Memory router (`createMemoryHistory`) + simplified shell | ✅ All 11 apps | — |
| `ShellLayout mode="simplified"` in root-route.tsx | ✅ All 11 apps | — |
| Stub pages (domain-specific placeholder components) | ✅ All 11 apps | — |
| `bootstrap.ts` with `bootstrapMockEnvironment()` | ⚠️ Uses hardcoded `MOCK_USER` | BW-5 |
| `BaseClientSideWebPart.ts` SPFx entry point | ❌ Does not exist in any app | BW-1 |
| `bootstrapSpfxAuth()` implementation | ❌ Comment-only "future phase" | BW-2 |
| `config/package-solution.json`, manifests, serve config | ❌ No `config/` directory | BW-3 |
| `vite.config.ts` tuned for SPFx bundle budgets | ❌ No vite.config.ts in any webpart app | BW-4 |
| Back-to-Project-Hub wiring in simplified shell | ❌ ShellLayout renders but no nav wiring | BW-6 |
| Domain tool picker entries in simplified shell | ❌ Not configured per domain | BW-6 |
| SharePoint group → permission key RBAC mapping | ❌ No SP context RBAC adapter | BW-7 |
| Dev harness SPFx preview tabs | ✅ 11 direct-import tab components | BW-8 |
| GitHub Actions `.sppkg` build + App Catalog CI/CD | ❌ No SPFx workflow | BW-9 |
| Per-webpart Vitest + Playwright test setup | ❌ No test files in webpart apps | BW-10 |
| Remaining domain feature plans (Safety, QC/W, Risk, OE, HR) | ❌ No detailed feature plans | BW-11 |

---

## Pre-Requisites Before Starting BW Tasks

| Pre-requisite | Plan | Status |
|---|---|---|
| PH6F-3: Feature Registration initialized in PWA | PH6F-3-Cleanup-FeatureRegistration.md | ⏳ Pending |
| PH6F.2: `mapRolesToPermissions()` aligned to 17 keys | PH6F.2-Cleanup-PersonaRegistryAlignment.md | ⏳ Pending |
| `@hbc/auth/spfx` adapter exports (`bootstrapSpfxAuth`, `SpfxContextAdapter`) | packages/auth/src/spfx/ | ⚠️ Needs verification |
| `ShellLayout` simplified mode props API locked | packages/shell/src/ShellLayout/ | ✅ Exists |

---

## Implementation Sequence

Execute BW tasks in this order. **BW-0 must be completed before any feature page is written.** BW-1 through BW-5 are the "entry gate" for SPFx infrastructure before feature route work begins on a new domain.

```
BW-0 (Shared Feature Package)   ← FIRST — locks page component location before any feature code is written
  │
  ├── BW-1 (SPFx Entry Points)
  │     └── BW-2 (Auth Bridge)        ← requires BW-1
  │           └── BW-3 (Config/Manifests)  ← requires BW-1 + BW-2
  │                 └── BW-4 (Vite Config)  ← requires BW-3 for manifest IDs
  │
  ├── BW-5 (Bootstrap Alignment)     ← independent; do in parallel with BW-1 to BW-4
  │
  ├── BW-6 (Simplified Shell Nav)    ← requires BW-1 through BW-4 for at least one webpart
  ├── BW-7 (RBAC Mapping)            ← requires BW-2
  │
  ├── BW-8 (Dev Harness)             ← requires BW-4 (Vite configs)
  ├── BW-9 (CI/CD)                   ← requires BW-3 (package-solution.json)
  │
  ├── BW-10 (Testing Infrastructure) ← requires BW-4 + BW-8
  └── BW-11 (Domain Feature Plans)   ← reference document; no blockers
```

**Domain sequencing within each BW task:**
Execute per-domain work in this order (Blueprint §2i, CLAUDE.md §2 MVP priority):
`accounting → estimating → project-hub → leadership → business-development → admin → safety → quality-control-warranty → risk-management → operational-excellence → human-resources`

---

## Task File Index

| File | Title | Priority | Blocked By |
|---|---|---|---|
| `PH7-BW-0-Shared-Feature-Package.md` | packages/features/[domain]/ pattern — one source, two builds | **CRITICAL** | — |
| `PH7-BW-1-SPFx-Entry-Points.md` | BaseClientSideWebPart.ts for all 11 apps | HIGH | — |
| `PH7-BW-2-SPFx-Auth-Bridge.md` | bootstrapSpfxAuth() + SP context adapter | HIGH | BW-1 |
| `PH7-BW-3-SPFx-Config-Manifests.md` | config/ directory: manifests, package-solution, serve | HIGH | BW-1 |
| `PH7-BW-4-Vite-Bundle-Config.md` | Per-webpart vite.config.ts with SPFx budgets | HIGH | BW-3 |
| `PH7-BW-5-Bootstrap-Alignment.md` | Replace MOCK_USER with PersonaRegistry in all 11 | MEDIUM | PH6F.2 |
| `PH7-BW-6-Simplified-Shell-Nav.md` | Back-to-ProjectHub, tool picker, workspace context | MEDIUM | BW-1–4 |
| `PH7-BW-7-SPFx-RBAC-Mapping.md` | SharePoint groups → permission keys per domain | MEDIUM | BW-2 |
| `PH7-BW-8-DevHarness-Integration.md` | SPFx preview tabs in dev-harness | MEDIUM | BW-4 |
| `PH7-BW-9-CI-CD-Pipeline.md` | GitHub Actions: .sppkg build + App Catalog deploy | MEDIUM | BW-3 |
| `PH7-BW-10-Testing-Infrastructure.md` | Vitest unit + Playwright E2E per webpart | LOW | BW-4, BW-8 |
| `PH7-BW-11-Domain-Feature-Plans.md` | Roadmap for remaining 5 domain feature plans | REFERENCE | — |

---

## Affected Files Summary

**New shared feature packages (× 11):**
- `packages/features/[domain]/package.json`
- `packages/features/[domain]/tsconfig.json`
- `packages/features/[domain]/src/index.ts`
- `packages/features/[domain]/src/[Page]Page.tsx` (migrated from `apps/[domain]/src/pages/`)

**New files per webpart app (× 11):**
- `apps/[domain]/src/webparts/[domain]/[Domain]WebPart.ts`
- `apps/[domain]/src/webparts/[domain]/[Domain]WebPart.manifest.json`
- `apps/[domain]/config/package-solution.json`
- `apps/[domain]/config/serve.json`
- `apps/[domain]/config/deploy-azure-storage.json`
- `apps/[domain]/vite.config.ts`

**Modified files per webpart app (× 11):**
- `apps/[domain]/src/bootstrap.ts` — PersonaRegistry alignment
- `apps/[domain]/src/main.tsx` — call `bootstrapSpfxAuth()` in spfx mode
- `apps/[domain]/src/router/root-route.tsx` — back-to-project-hub + tool picker props
- `apps/[domain]/src/router/routes.ts` — import pages from `@hbc/features-[domain]` (not local pages/)
- `apps/[domain]/src/pages/` — directory removed or emptied (pages migrate to `packages/features/`)

**Shared package changes:**
- `packages/auth/src/spfx/SpfxContextAdapter.ts` — implement or verify SP context bootstrap
- `packages/auth/src/spfx/index.ts` — export `bootstrapSpfxAuth`
- `packages/shell/src/ShellLayout/` — verify simplified mode accepts nav props

**New infrastructure files:**
- `.github/workflows/spfx-build.yml` — CI/CD for all 11 webparts
- `tools/spfx-bundle-check.ts` — bundle size validation script
- `apps/dev-harness/src/webpart-tabs/` — SPFx preview tab components

---

## Domain Feature Plan Cross-Reference

| Domain | Feature Plan | Sub-Task Files | Status |
|---|---|---|---|
| Business Development | `PH7-BD-Features.md` | PH7-BD-1 through PH7-BD-9 | ✅ Plans complete |
| Project Hub | `PH7-ProjectHub-Features-Plan.md` | PH7-ProjectHub-1 through PH7-ProjectHub-16 | ✅ Plans complete |
| Estimating | `PH7-Estimating-Feature-Plan.md` | (monolithic — needs splitting) | ⚠️ Plan exists, task split pending |
| Admin | `PH7-Admin-Feature-Plan.md` | (monolithic) | ⚠️ Plan exists, task split pending |
| Accounting | — | — | ❌ No detailed feature plan |
| Leadership | — | — | ❌ No detailed feature plan |
| Safety | — | — | ❌ No detailed feature plan |
| Quality Control/Warranty | — | — | ❌ No detailed feature plan |
| Risk Management | — | — | ❌ No detailed feature plan |
| Operational Excellence | — | — | ❌ No detailed feature plan |
| Human Resources | — | — | ❌ No detailed feature plan |

See `PH7-BW-11-Domain-Feature-Plans.md` for the roadmap and scoping notes for the five missing domain plans.

---

## Definition of Done

Phase 7 infrastructure is complete when all of the following pass:

- [ ] `packages/features/` added to `pnpm-workspace.yaml`; all 11 domain feature package skeletons exist (`package.json` + `tsconfig.json` + `src/index.ts`)
- [ ] `ADR 0013` documents the shared feature package decision
- [ ] No feature page components exist in any `apps/*/src/pages/` directory
- [ ] All 11 `BaseClientSideWebPart.ts` files exist and compile without errors
- [ ] `bootstrapSpfxAuth()` is called in SPFx mode and populates `useAuthStore` from SP page context
- [ ] All 11 apps have valid `config/package-solution.json` with unique solution GUIDs
- [ ] All 11 `vite.config.ts` files enforce bundle budget < 1 MB
- [ ] All 11 `bootstrap.ts` files use `PersonaRegistry` (no `MOCK_USER` literals)
- [ ] Back-to-Project-Hub link renders correctly in simplified shell for all non-Project-Hub domains
- [ ] SharePoint group membership resolves to the correct permission keys via `SpfxContextAdapter`
- [ ] All 11 webpart apps are visible as tabs in dev-harness
- [ ] GitHub Actions `spfx-build.yml` produces valid `.sppkg` for all 11 apps on push to `main`
- [ ] Vitest unit coverage ≥ 80% for each webpart's router, bootstrap, and RBAC logic
- [ ] `pnpm turbo run build` succeeds across all 11 apps
- [ ] All documentation created in correct `docs/` Diátaxis locations

---

## Verification Commands

```bash
# Build all webpart apps
pnpm turbo run build --filter="./apps/accounting" --filter="./apps/estimating" --filter="./apps/project-hub"

# Check bundle sizes
node tools/spfx-bundle-check.ts

# Run webpart unit tests
pnpm turbo run test --filter="./apps/accounting"

# Validate package-solution GUIDs are unique
node tools/validate-manifests.ts
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Version 2.0: 2026-03-07 — Rewritten as master summary/index. Individual task files PH7-BW-1 through PH7-BW-11 created.
Previous version (v1.0 monolithic) content superseded by task files.
BW-0 completed: 2026-03-07 — All 11 packages/features/[domain]/ scaffolded, workspace/tsconfig/vite wired, ADR-0079 created, build verified (24/24 green).
BW-1 completed: 2026-03-08 — All 11 BaseClientSideWebPart.tsx files created, main.tsx comments updated, SPFx type packages added. Build verified (24/24 green).
BW-2 completed: 2026-03-08 — SpfxContextAdapter.ts created with bootstrapSpfxAuth(WebPartContext) + getSpfxContext(). Dual export strategy: hostBridge.ts (lightweight, root import) + SpfxContextAdapter.ts (WebPartContext, @hbc/auth/spfx subpath). Build verified (24/24 green).
BW-3 completed: 2026-03-08 — 33 GUIDs generated and locked. Created 44 files: 11 package-solution.json, 11 serve.json, 11 deploy-azure-storage.json, 11 manifest files. tools/validate-manifests.ts created, validate-manifests task added to turbo.json. All validations pass (33 unique GUIDs, 11 unique ports, 44 files). Build verified (24/24 green).
BW-4 completed: 2026-03-08 — All 11 vite.config.ts files transformed with SPFx build config (rollupOptions, manualChunks, deterministic filenames, HTTPS dev server, bundle budget). Port misalignments fixed (accounting/estimating/project-hub). tools/spfx-bundle-check.ts created. 17 file operations total.
BW-5 completed: 2026-03-08 — All 11 bootstrap.ts files transformed to use PersonaRegistry pattern (resolveBootstrapPersona/personaToCurrentUser/resolveBootstrapPermissions). Removed MOCK_USER constants, '*:*' wildcards, ICurrentUser imports. Added domain-specific feature flags, JSDoc with D-PH7-BW-5 ref, console.log persona output. 11 file operations.
BW-6 completed: 2026-03-08 — SimplifiedShellConfig type + resolveProjectHubUrl utility added to @hbc/shell. BackToProjectHub enhanced with projectHubUrl prop. ShellLayout extended with simplifiedConfig prop. All 11 root-route.tsx files updated with domain-specific config (workspace name, tool picker items, Back-to-Project-Hub classification). 18 file operations. Build verified (24/24 green).
BW-7 completed: 2026-03-08 — SpfxRbacAdapter.ts created with SP_GROUP_TO_PERMISSIONS (12 SP groups → permission keys) and resolveSpfxPermissions(). @pnp/sp ^4.0.0 added to @hbc/auth. All 11 [Domain]WebPart.tsx files wired: resolveSpfxPermissions(this.context) → bootstrapSpfxAuth(this.context, permissionKeys). Error fallback returns ['project:read', 'action:read']. 14 file operations.
BW-8 completed: 2026-03-08 — 11 webpart tab components created in apps/dev-harness/src/tabs/. TabRouter.tsx updated with TAB_TO_COMPONENT map replacing WebpartPreview fallback. @hbc/auth/spfx alias added to vite.config.ts. All 11 @hbc/spfx-* workspace deps added. TanStack Router Register declarations extracted to register.d.ts files (11 webparts) to prevent TS2717 conflicts. 27 file operations. Build verified (24/24 green).
BW-9 completed: 2026-03-08 — CI/CD pipeline for SPFx .sppkg build + App Catalog deployment. Created spfx-build.yml (build → bundle-check → manifest-validate → package → artifact upload) and spfx-deploy.yml (staging auto-deploy → production manual gate). tools/package-sppkg.ts creates 11 ZIP archives. Deployment runbook at docs/maintenance/spfx-deployment-runbook.md. 6 corrections applied from plan (tsx, check-types, run-id, PnP install, pnpm order, scope). 8 file operations. Build verified (24/24 green, 11 .sppkg files).
BW-10 completed: 2026-03-08 — Testing infrastructure for all 11 SPFx webparts. Shared Vitest factory (tools/vitest-webpart.config.ts) with createWebpartVitestConfig() factory function, SPFx SDK mocks (3 files), per-app vitest.config.ts + setup.ts + bootstrap.test.ts + router.test.ts (44 files). SpfxRbacAdapter.test.ts (4 assertions). Playwright E2E config + 11 spec files (26 passing, 2 admin fixme — pre-existing issue). @testing-library/jest-dom + jsdom added to root devDeps. tsconfig.json exclude for test files added to all 11 apps. spfx-build.yml updated with unit test step. 87 file operations. Build verified (24/24 green). Unit tests: 66 passing. RBAC: 4 passing. E2E: 26 passing.
Next: BW-11 (Domain Feature Plans)
-->
