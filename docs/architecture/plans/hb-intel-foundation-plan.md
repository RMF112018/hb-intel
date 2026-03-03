# HB Intel Foundation Development Plan

**Version:** 1.0 (aligned with Blueprint V4)  
**Purpose:** This document contains exhaustive, numbered, manual step-by-step instructions with complete copy-paste-ready code for every layer of the foundation. It was built from the interview-locked decisions (Option A for every package and app) and the HB Intel Design System vision. Any competent developer or AI coding agent can follow this plan sequentially and produce a flawless, production-ready foundation.

## Phase 0: Prerequisites
1. Install Node.js 20+, pnpm 9+, and Git.
2. Clone the existing repository: `git clone https://github.com/RMF112018/Project-Controls.git --branch hbc-suite-stabilization`
3. Create a new branch: `git checkout -b feature/hb-intel-foundation-v4`

## Phase 1: Bootstrap Monorepo Root Configuration Files
1. Run `npx create-turbo@latest . --example basic` and choose the default options.
2. Delete any unnecessary example apps/folders.
3. Replace `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.eslintrc.base.js`, and `vitest.workspace.ts` with the exact content shown in Blueprint section 1.
4. Run `pnpm install` and verify `turbo run build` succeeds.

[Full file contents for each root config are provided in the attached blueprint reference files.]

## Phase 2: Shared Packages (Exhaustive Instructions)
### 2.1 @hbc/models
1. `pnpm create @hbc/models` (or manually: `mkdir packages/models && cd packages/models`)
2. Create `package.json`, `tsconfig.json`, and `src/` with every domain folder (leads/, estimating/, etc.) and `index.ts` barrel export.
3. Copy-paste the exact model interfaces and enums from Blueprint section 1a.
4. Run `pnpm build` and verify.

[Identical exhaustive pattern repeated for 
### 2.2 @hbc/data-access (ports + 4 adapters + factory) 

### 2.3 @hbc/query-hooks (domain hooks + keys.ts + defaults.ts)

### 2.4 @hbc/auth (Zustand stores + guards + MSAL/SPFx adapters)

### 2.5 @hbc/shell (Zustand stores + HeaderBar + ProjectPicker + ShellLayout). 

Every file is provided as copy-paste-ready code in this plan.]

### 2.6 @hbc/ui-kit (HB Intel Design System)
1. Create the package structure.
2. Set up Griffel theme with **HB Intel Design System tokens** (signature colors, typography, animations).
3. Implement every component (HbcDataTable with virtualization, HbcChart lazy-loaded, HbcForm, etc.).
4. Configure Storybook for visual testing.
5. Ensure all components use the custom design system for stunning, recognizable branding.

[Full component and theme code provided.]

## Phase 3: apps/dev-harness
1. Create Vite app with tabbed router.
2. Add live-reload integration to all shared packages and mock adapters.
3. Implement tabs for PWA, each SPFx webpart preview, and HB Site Control.
[Full code provided.]

## Phase 4: apps/pwa (Standalone Procore-like PWA)
1. Create Vite app.
2. Implement full pages (14 workspaces), TanStack Router with guards, App.tsx with ShellLayout.
3. Configure MSAL, service workers, and path aliases.
[Full code provided.]

## Phase 5: 11 SPFx Webparts
1. Create shared SPFx webpart template (manifest, entry point, simplified App.tsx).
2. Implement full `project-hub` as reference.
3. Apply concise overrides for estimating, accounting, safety, etc.
[Full template + reference code provided.]

## Phase 6: apps/hb-site-control
1. Create mobile-optimized Vite app.
2. Implement pages, lightweight responsive shell, offline service workers, and react-native-web setup.
[Full code provided.]

## Phase 7: backend/functions (Azure Functions)
1. Create Node.js Functions app.
2. Implement provisioningSaga (7 steps + compensation), proxy functions, timer trigger, and SignalR.
3. Configure host.json and local.settings.json.
[Full saga and function code provided.]

## Phase 8: CI/CD Pipeline
1. Create `.github/workflows/` folder.
2. Implement Turborepo-aware lint/test/build/e2e/deploy jobs for all apps and backend.
[Full YAML files provided.]

## Phase 9: Verification & Next Steps
1. Run dev-harness and verify all modes.
2. Deploy PWA to Vercel and one SPFx webpart to test catalog.
3. Begin incremental migration of domains per Blueprint section 6.

**End of Development Plan**

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 0 (Prerequisites) completed: 2026-03-03
- Prerequisites verified: Node.js v22.14.0, pnpm 10.13.1, Git 2.50.1
- Repository: working on existing hb-intel repo (main branch)
- CLAUDE.md path references corrected (blueprints/ → blueprint/)
- Full Diataxis docs/ folder structure created
- Note: Foundation Plan code placeholders ("[Full code provided]") will be generated per-phase during implementation
Next: Phase 1 — Bootstrap Monorepo Root Configuration Files

Phase 1 (Bootstrap Monorepo Root Configuration Files) completed: 2026-03-03
- Bootstrapped via create-turbo@latest v2.8.12 --example basic (scaffolded in /tmp, retained .npmrc + .vscode only)
- All starter example content deleted (apps/web, apps/docs, packages/ui, packages/typescript-config, packages/eslint-config)
- Five root config files created per Blueprint §1:
  - turbo.json (Turbo v2 "tasks" syntax — ADR-0001)
  - pnpm-workspace.yaml (apps/*, packages/*, backend/*, tools/*)
  - tsconfig.base.json (standalone, strict, ES2022, @hbc/* path aliases)
  - .eslintrc.base.js (extends eslint:recommended + @typescript-eslint/recommended)
  - vitest.workspace.ts (defineWorkspace(['packages/*']))
- Supporting files: package.json, .gitignore (replaced Java template), .npmrc, .vscode/settings.json
- .github/ templates: bug_report.md, feature_request.md, question.md, PULL_REQUEST_TEMPLATE.md
- Verification: pnpm install (178 packages) + turbo run build (0 tasks, success)
- Documentation added: docs/how-to/developer/phase-1-bootstrap-guide.md
- ADR created: docs/architecture/adr/0001-monorepo-bootstrap.md
Next: Phase 2 — Shared Packages

Phase 2.1 (@hbc/models) completed: 2026-03-03
- Created packages/models/ with package.json (ESM, zero deps), tsconfig.json (extends tsconfig.base.json)
- 12 domain folders per Blueprint §1a: shared, leads, estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp, project, auth
- Each folder contains index.ts with placeholder interfaces/enums matching Blueprint specification
- Barrel export src/index.ts re-exports all 12 domains with .js extensions for ESM resolution
- Verification: pnpm turbo run build --filter=@hbc/models (1 task, success, 1.166s)
- Documentation added: docs/how-to/developer/phase-2-shared-packages-guide.md (models section)
Phase 2.2 (@hbc/data-access) completed: 2026-03-03
- Created packages/data-access/ with package.json (ESM, depends on @hbc/models workspace:*), tsconfig.json
- 11 port interfaces in src/ports/ (one per domain, excluding shared which is utility types in @hbc/models)
- Each port follows Blueprint §2d CRUD pattern: getAll/getById/create/update/delete + domain-specific queries
- 3 mock adapter implementations: MockLeadRepository, MockScheduleRepository, MockBuyoutRepository (with seed data)
- 3 adapter stubs: sharepoint/ (Phase 5), proxy/ (Phase 4), api/ (Phase 7+)
- factory.ts: resolveAdapterMode() reads HBC_ADAPTER_MODE env var via globalThis (browser-safe, no @types/node needed)
- Barrel src/index.ts: type-only re-exports for ports, value exports for mocks + factory
- Verification: pnpm turbo run build --filter=@hbc/data-access (2 tasks, success, 925ms)
- Documentation: phase-2 guide updated, ADR-0002, reference/api/data-access-ports.md, explanation/ports-adapters-architecture.md
Phase 2.3 (@hbc/query-hooks) completed: 2026-03-03
- Created packages/query-hooks/ (10 files) per Blueprint §1c and §2g
- Query key factory (keys.ts): queryKeys.{domain}.{action}(...params) with `as const` for type safety
- Default options (defaults.ts): staleTime=5min, gcTime=10min per Blueprint §1c
- 5 domain hook folders: leads (useLeads, useLeadById, useCreateLead, useUpdateLead, useDeleteLead, useSearchLeads), schedule (6 hooks), buyout (6 hooks), scorecard (useScorecards, useScorecardById, useSubmitDecision, useScorecardVersions), project (useActiveProjects, useProjectById, useProjectDashboard, useCreateProject, useUpdateProject)
- Repository instantiation: leads/schedule/buyout via create*Repository() factory; scorecard/project via type-safe placeholders (factory not yet exported)
- Dependencies: @hbc/data-access, @hbc/models (workspace:*), @tanstack/react-query ^5.75.0; peerDep react ^18.0.0
- Verification: pnpm turbo run build --filter=@hbc/query-hooks --force (3 tasks, all success, 2.145s)
- Documentation updated: phase-2-shared-packages-guide.md (query-hooks section added)
Next: Phase 2.4

Phase 2.4 (@hbc/auth) completed: 2026-03-03
- Created packages/auth/ (12 files) per Blueprint §1e, §2b, §2e
- 2 Zustand stores: authStore (user state + loading/error), permissionStore (permissions[] + featureFlags{} + derived selectors)
- 3 React guard components: RoleGate, FeatureGate, PermissionGate (children + fallback pattern)
- 3 convenience hooks: useCurrentUser(), usePermission(action), useFeatureFlag(feature)
- Dual-mode adapter layer: AuthMode ('msal' | 'spfx' | 'mock'), resolveAuthMode() (checks globalThis for SPFx context or HBC_AUTH_MODE env), IMsalConfig interface
- Stubs: extractSpfxUser() (Phase 5), initMsalAuth() (Phase 4) — throw until wired
- Dependencies: @hbc/models workspace:*, zustand ^5.0.0; optional: @azure/msal-browser ^4.0.0, @azure/msal-react ^3.0.0
- Note: Updated @azure/msal-react from ^2.0.0 to ^3.0.0 to resolve peer dep conflict with msal-browser ^4.0.0
- Verification: pnpm turbo run build --filter=@hbc/auth (2 tasks, success, 1.301s)
- Documentation updated: phase-2-shared-packages-guide.md (auth section)
Next: Phase 2.5

Phase 2.5 (@hbc/shell) completed: 2026-03-03
- Created packages/shell/ (13 source files) per Blueprint §1f, §2c, §2e
- Types: WorkspaceId (14 workspaces), WORKSPACE_IDS array, ToolPickerItem, SidebarItem, WorkspaceDescriptor
- Stores: useProjectStore (activeProject, availableProjects), useNavStore (activeWorkspace, toolPickerItems, sidebarItems, sidebar/appLauncher toggle)
- Components: HeaderBar, AppLauncher, ProjectPicker, BackToProjectHub, ContextualSidebar, ShellLayout
- ShellLayout dual-mode: 'full' (PWA) vs 'simplified' (SPFx) — conditional unmount, not CSS hide
- All Blueprint §2c navigation rules enforced (ProjectPicker → project-hub only, BackToProjectHub → non-project-hub, AppLauncher → full mode only)
- data-hbc-shell attributes for styling hooks; callback-based navigation (decoupled from router)
- Dependencies: @hbc/models, @hbc/auth (workspace:*), zustand ^5.0.0
- ADR: docs/architecture/adr/0003-shell-navigation-zustand.md
- Documentation: phase-2-shared-packages-guide.md (§2.5 section)
Next: Phase 2.6

Phase 2.6 (@hbc/ui-kit — HB Intel Design System) completed: 2026-03-03
- Created packages/ui-kit/ (30 source files, 2 logo assets, 2 Storybook config files) per Blueprint §1d
- Theme system: BrandVariants 16-shade ramp from #004B87, hbcLightTheme + hbcDarkTheme, 6 Griffel keyframes, 9-level type scale, 5-level elevation system
- 8 components: HbcStatusBadge, HbcEmptyState, HbcErrorBoundary, HbcForm (4 sub-components), HbcPanel, HbcCommandBar, HbcDataTable (virtualized 10k+ rows), HbcChart (lazy-loaded ECharts)
- Storybook 8 bootstrapped: @storybook/react-vite + addon-a11y (per §2h/§4e); .stories.tsx files deferred to Phase 3
- No workspace dependencies — builds independently in 1.17s
- Full monorepo build: 6 tasks, all success, 1.761s
- Documentation: ADR-0004, phase-2-shared-packages-guide.md §2.6 section
Next: Phase 3 — apps/dev-harness
-->