# PH7 — Breakout SPFx Webparts: Master Infrastructure Plan

**Version:** 2.0 (split into summary + task files — supersedes v1.0 monolithic plan)
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §1, §2a, §2b, §2c · `hb-intel-foundation-plan.md` Phase 7
**Date:** 2026-03-07
**Status:** ACTIVE — Infrastructure tasks pending; feature work may begin on Accounting after BW-1 through BW-5 are complete
**Audience:** Implementation agent, tech leads, DevOps, product owner

---

## Purpose of This Document

This is the **master index and summary plan** for Phase 7 Breakout SPFx Webparts. It replaces the v1.0 monolithic plan with a lean summary + individual task files following the same pattern established in PH6F.

Phase 7 has **two distinct layers**:

1. **Infrastructure Layer** (this plan) — The SPFx-specific scaffolding that every webpart needs before feature work can proceed. Covered by task files `PH7-BW-1` through `PH7-BW-11`.
2. **Feature Layer** (separate domain plans) — The actual pages, data, and business logic for each domain. Covered by the `PH7-[Domain]-*` plan files listed in §6 below.

The infrastructure layer must be substantially complete **before** feature work begins on any new domain. Accounting and Estimating are the first two domains and have the most critical infrastructure dependencies (provisioning trigger, SPFx auth context).

---

## Current State of Each SPFx App (as of 2026-03-07)

All 11 webpart apps exist at `apps/[domain]/` and share the same scaffolded structure. The table below shows what is already in place (✅), what is missing (❌), and what needs alignment (⚠️).

| Concern | Status | Task |
|---|---|---|
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
| Dev harness SPFx preview tabs | ❌ No webpart tabs in dev-harness | BW-8 |
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

Execute BW tasks in this order. BW-1 through BW-5 are the "entry gate" before any feature route work begins on a new domain.

```
BW-1 (SPFx Entry Points)
  └── BW-2 (Auth Bridge)        ← requires BW-1
        └── BW-3 (Config/Manifests)  ← requires BW-1 + BW-2
              └── BW-4 (Vite Config)  ← requires BW-3 for manifest IDs

BW-5 (Bootstrap Alignment)     ← independent; do in parallel with BW-1 to BW-4

BW-6 (Simplified Shell Nav)    ← requires BW-1 through BW-4 for at least one webpart
BW-7 (RBAC Mapping)            ← requires BW-2

BW-8 (Dev Harness)             ← requires BW-4 (Vite configs)
BW-9 (CI/CD)                   ← requires BW-3 (package-solution.json)

BW-10 (Testing Infrastructure) ← requires BW-4 + BW-8
BW-11 (Domain Feature Plans)   ← reference document; no blockers
```

**Domain sequencing within each BW task:**
Execute per-domain work in this order (Blueprint §2i, CLAUDE.md §2 MVP priority):
`accounting → estimating → project-hub → leadership → business-development → admin → safety → quality-control-warranty → risk-management → operational-excellence → human-resources`

---

## Task File Index

| File | Title | Priority | Blocked By |
|---|---|---|---|
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
Next: Begin BW-1 (SPFx Entry Points) for accounting app first.
-->
