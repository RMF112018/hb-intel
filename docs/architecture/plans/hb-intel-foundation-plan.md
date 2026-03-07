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

### Phase 2 Migration Plan `docs/architecture/plans/PH2-Shared-Packages-Plan.md`

### Phase 3 Migration Plan `docs/architecture/plans/PH3-Query-State-Mngmt-Plan.md`

### Phase 4 Migration Plan `docs/architecture/plans/PH4-UI-Design-Plan.md`

### Phase 5 Migration Plan **TO BE PROVIDED**

### Phase 6 Migration Plan **TO BE PROVIDED**

### Phase 7 Migration Plan **TO BE PROVIDED**

### Phase 8 Migration Plan **TO BE PROVIDED**

### Phase 9 Migration Plan **TO BE PROVIDED**

### Phase 10 Migration Plan **TO BE PROVIDED**

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

Phase 3 (apps/dev-harness) completed: 2026-03-03
- Created apps/dev-harness/ (17 source files + 4 config files) per Foundation Plan Phase 3
- Config: package.json (Vite + all 6 @hbc/* workspace deps + React 18 + Fluent + TanStack Query), tsconfig.json (extends tsconfig.base.json, noEmit), vite.config.ts (alias-based HMR + mock define), index.html
- bootstrap.ts: Synchronous Zustand store seeding — authStore (admin user), permissionStore (*:* + feature flags), projectStore (3 mock projects), navStore (project-hub)
- main.tsx: Bootstrap → createRoot → StrictMode → App
- App.tsx: FluentProvider (theme toggle) > QueryClientProvider > HbcErrorBoundary > TabRouter + DevControls + ReactQueryDevtools
- TabRouter.tsx: 13 Fluent TabList tabs (PWA + 11 webparts + HB Site Control), React useState tab switching
- PwaPreview: ShellLayout mode='full' with workspace/project switching callbacks
- WebpartPreview: Reusable ShellLayout mode='simplified' with workspaceId prop + navStore sync
- SiteControlPreview: Mobile viewport wrapper (max-width 428px) + simplified shell
- WorkspacePlaceholder: Status badges + conditional demo components per workspace
- DemoDataGrid: HbcDataTable + HbcCommandBar + useLeads() → IPagedResult<ILead>.items
- DemoCharts: HbcChart (schedule progress line + budget pie with mock data)
- DemoForms: HbcTextField + HbcSelect + HbcCheckbox + HbcFormLayout
- DevControls: Floating panel — theme toggle, user/project info, feature flag toggles, mock reset
- Verification: pnpm turbo run build (7 tasks, all success, 5.2s); Vite production build 4 chunks
- ADR: docs/architecture/adr/0005-dev-harness.md
- Documentation: docs/how-to/developer/phase-3-dev-harness-guide.md
Next: Phase 4 — PWA (apps/web)

Phase 4 (apps/pwa) completed: 2026-03-03
- Created apps/pwa/ (31 source files + 5 config files) per Foundation Plan Phase 4
- Config: package.json (Vite + PWA plugin + MSAL + TanStack Router + all 6 @hbc/* deps), tsconfig.json, vite.config.ts (dual-mode env defines), index.html (PWA manifest + theme-color meta), env.d.ts (VITE_MSAL_* types)
- main.tsx: Dual-mode entry — resolveAuthMode() → mock (sync bootstrap) or msal (async init) → createRoot
- App.tsx: FluentProvider > MsalProvider (conditional) > QueryClientProvider > HbcErrorBoundary > RouterProvider
- bootstrap.ts: Same mock seeding pattern as dev-harness
- pwa.css: CSS reset + shell layout sizing (flex column + body)
- Auth: msal-config.ts (MSAL Configuration from VITE_MSAL_* env vars), msal-init.ts (PublicClientApplication init + redirect + silent token + store sync), MsalGuard.tsx (MsalProvider + MsalAuthenticationTemplate wrapper)
- Router: index.ts (createAppRouter + type registration), root-route.tsx (ShellLayout mode='full' + Outlet + callbacks → router.navigate), workspace-routes.ts (createWorkspaceRoute factory × 14 + index redirect + 404), route-guards.ts (requireAuth + requirePermission via Zustand .getState()), workspace-config.ts (descriptors + tool-picker/sidebar factories)
- Components: WorkspacePageShell (title + project context + status), LoadingFallback (Spinner), ErrorFallback (error + retry)
- 5 MVP pages: ProjectHubPage (project table + summary cards), AccountingPage (budget grid + financial cards), EstimatingPage (bid grid + status badges), LeadershipPage (KPI cards + ECharts bar chart), BusinessDevelopmentPage (lead pipeline grid)
- 9 standard placeholder pages: Scheduling, Buyout, Compliance, Contracts, Risk, Scorecard, PMP, Admin, SiteControl (all using HbcEmptyState)
- NotFoundPage: 404 catch-all with navigation back to project-hub
- Package modifications: projectStore.ts → zustand persist middleware (localStorage, hbc-project-store, partialize: activeProject); packages/auth/src/msal/index.ts (mapMsalAccountToUser, validateMsalConfig); re-exported ColumnDef from @hbc/ui-kit
- Verification: pnpm turbo run build (8 tasks, all success, 6.77s); PWA build: 24 precache entries, lazy chunks for all workspace pages
- ADR: docs/architecture/adr/0006-pwa-standalone.md
- Documentation: docs/how-to/developer/phase-4-pwa-guide.md
Next: Phase 5 — SPFx webparts

Phase 5 (11 SPFx webparts) completed: 2026-03-03
- Pre-requisites (~14 existing files modified + 6 new PWA pages):
  - packages/shell/src/types.ts: WorkspaceId expanded 14 → 19, WORKSPACE_IDS array updated
  - packages/auth/src/adapters/index.ts: extractSpfxUser() implemented with ISpfxPageContext interface (maps pageContext.user → ICurrentUser, derives permissions from SP permission levels)
  - packages/auth/src/spfx/index.ts (NEW): bootstrapSpfxAuth() function, re-exported from packages/auth/src/index.ts
  - packages/ui-kit/src/WorkspacePageShell/index.tsx (NEW): moved from apps/pwa, added @hbc/shell dependency to ui-kit
  - 14 PWA pages updated to import WorkspacePageShell from @hbc/ui-kit
  - apps/dev-harness/src/TabRouter.tsx: fixed TAB_TO_WORKSPACE for 5 new workspace IDs, renamed quality-control → quality-control-warranty
  - apps/pwa/src/router/workspace-config.ts: 5 new WORKSPACE_DESCRIPTORS
  - apps/pwa/src/router/workspace-routes.ts: 5 new routes + allRoutes updated
  - 5 new PWA placeholder pages: SafetyPage, QualityControlWarrantyPage, RiskManagementPage, OperationalExcellencePage, HumanResourcesPage
- 11 SPFx webpart apps created (~115 source files total):
  - apps/project-hub (port 4001): DashboardPage, PreconstructionPage, DocumentsPage, TeamPage
  - apps/accounting (port 4002): OverviewPage, BudgetsPage, InvoicesPage
  - apps/estimating (port 4003): BidsPage, TemplatesPage, ProjectSetupPage
  - apps/leadership (port 4004): KpiDashboardPage, PortfolioOverviewPage
  - apps/business-development (port 4005): PipelinePage, OpportunitiesPage
  - apps/admin (port 4006): SystemSettingsPage, ErrorLogPage, ProvisioningFailuresPage
  - apps/safety (port 4007): IncidentsPage, InspectionsPage
  - apps/quality-control-warranty (port 4008): QualityChecksPage, WarrantyTrackingPage
  - apps/risk-management (port 4009): RiskRegisterPage, MitigationPage
  - apps/operational-excellence (port 4010): MetricsPage, ProcessImprovementPage
  - apps/human-resources (port 4011): StaffingPage, CertificationsPage
- Each webpart: Vite-first build (no SPFx gulp/webpack), ShellLayout mode='simplified', createMemoryHistory router, dual-mode auth (mock/spfx), HBC_AUTH_MODE define
- Verification: pnpm turbo run build (19 tasks, all success, 15.6s)
- ADR: docs/architecture/adr/0007-spfx-vite-first.md
- Documentation: docs/how-to/developer/phase-5-spfx-webparts-guide.md
Next: Phase 6 — HB Site Control

Phase 6 (HB Site Control) completed: 2026-03-03
- apps/hb-site-control: mobile-first Vite app (port 4012) with vite-plugin-pwa + react-native-web
- ~16 source files:
  - Config: package.json, tsconfig.json, vite.config.ts, index.html, src/env.d.ts
  - Core: main.tsx (tri-mode entry), App.tsx (provider hierarchy), bootstrap.ts (field worker mock), app.css (mobile-first styles)
  - Router: index.ts (browser history), root-route.tsx (simplified shell), routes.ts (3 lazy routes)
  - Pages: HomePage (dashboard), ObservationsPage (data table), SafetyMonitoringPage (SignalR + chart)
  - Hooks: useSignalR.ts (mock event stream, 5s interval, 8 templates)
- Key decisions: browser history (not memory) for standalone deployment, tri-mode auth, simplified shell, 48px touch targets
- Dependencies added: react-native-web, @tanstack/react-table, vite-plugin-pwa
- Verification: pnpm turbo run build (20 tasks, all success)
- ADR: docs/architecture/adr/0008-hb-site-control-mobile.md
- Documentation: docs/how-to/developer/phase-6-hb-site-control-guide.md
Next: Phase 7 — Backend

Phase 7 (Backend/Functions) completed: 2026-03-03
- backend/functions/: Azure Functions v4 Node.js serverless app (@hbc/functions)
- ~27 source files:
  - Shared types: packages/models/src/provisioning/index.ts (7 exports)
  - Config: package.json, tsconfig.json (Node16), host.json, local.settings.json
  - Services (6): sharepoint-service, table-storage-service, redis-cache-service, signalr-push-service, msal-obo-service, service-factory
  - Saga (9): provisioningSaga/index.ts (4 HTTP endpoints), saga-orchestrator.ts, 7 step files
  - Proxy (2): proxy/index.ts, proxy-handler.ts
  - Timer (1): timerFullSpec/index.ts (cron 0 0 6 * * *)
  - SignalR (1): signalr/index.ts (negotiate endpoint)
  - Utils (2): logger.ts, env.ts
  - Entry: src/index.ts
- Key decisions: tsc-only build, HBC_SERVICE_MODE factory, mock-first services, step 5 deferred to timer
- Verification: pnpm turbo run build (21 tasks, all success)
- ADR: docs/architecture/adr/0009-backend-functions.md
- Documentation: docs/how-to/developer/phase-7-azure-functions-guide.md
Next: Phase 8 — CI/CD

Phase 8 completed: 2026-03-03
- 10 new files + 5 edits:
  - .prettierrc, .prettierignore (formatting config)
  - playwright.config.ts, e2e/smoke.spec.ts (E2E setup)
  - .github/workflows/ci.yml (5 jobs: lint-format, test, build, storybook, e2e)
  - .github/workflows/cd.yml (4 jobs: pwa, site-control, functions, spfx-stubbed)
  - .github/workflows/security.yml (1 job: dependency audit)
  - docs/architecture/adr/0010-ci-cd-pipeline.md
  - docs/how-to/developer/phase-8-ci-cd-guide.md
- Modified: package.json (scripts + devDep), turbo.json (format:check), vitest.workspace.ts (expanded)
- Key decisions: 3-workflow split, Turborepo remote cache, Playwright chromium-only, 0% coverage start, SPFx stubbed
- Verification: pnpm turbo run build (21 tasks), pnpm format:check, pnpm e2e
Next: Phase 9 — Verification

Phase 9 (Verification & Deployment Readiness) completed: 2026-03-03
- 4 new files + 3 modified files:
  - apps/dev-harness/package.json: added --port 3000 to preview script
  - playwright.config.ts: multi-project config (chromium + dev-harness), webServer array
  - e2e/dev-harness.spec.ts (NEW): 13-tab navigation tests + DevControls theme toggle
  - e2e/pwa.spec.ts (NEW): root load + 5 MVP route tests + shell header verification
  - apps/pwa/vercel.json (NEW): SPA catch-all rewrite, immutable asset caching, no-cache SW
  - apps/pwa/vite.config.ts: env-configurable VITE_AUTH_MODE / VITE_ADAPTER_MODE with fallbacks
- Documentation:
  - docs/how-to/developer/phase-9-verification-guide.md (NEW)
  - docs/how-to/developer/domain-migration-runbook.md (NEW)
  - docs/architecture/adr/0011-verification-deployment.md (NEW)
  - docs/how-to/developer/phase-8-ci-cd-guide.md (updated: E2E expansion note)
- Key decisions: multi-project Playwright, env-var auth mode, Vercel SPA config, iframe SPFx testing
- Verification: pnpm turbo run build (21 tasks), pnpm format:check, pnpm e2e
Foundation complete — ready for domain migration starting with Accounting

Phase 2.1 (@hbc/models Comprehensive Rebuild) completed: 2026-03-03
- PH2-Shared-Packages-Plan.md §2.1 Option C — per-domain 6-file structure
- 65 new TypeScript files (13 domains × 5 content files)
- 14 modified TypeScript files (13 domain index.ts + 1 root index.ts)
- New enums: EstimatingStatus, ScheduleActivityStatus, BuyoutStatus, ComplianceStatus,
  ComplianceRequirementType, ContractStatus, ApprovalStatus, RiskCategory, RiskStatus,
  ScorecardRecommendation, PmpStatus, SignatureStatus, ProjectStatus, SystemRole
- New FormData interfaces for all 13 domains
- New type aliases (IDs, search criteria) and constants (labels, thresholds) per domain
- Root barrel rewritten with Option C JSDoc (package docs, domain table, import examples)
- Documentation: 13 reference docs (docs/reference/models/), ADR-0012, updated phase-2 guide
- Zero breaking changes: all 62+ existing imports resolve identically
- Verification: pnpm turbo run build (21/21 pass), check-types pass, runtime values verified
Next: Phase 2.2 — @hbc/data-access rebuild

Phase 2.2 (@hbc/data-access Comprehensive Rebuild) completed: 2026-03-03
- See Blueprint progress notes for full details

Phase 3.1 (@hbc/query-hooks Comprehensive Rebuild) completed: 2026-03-03
- PH3-Query-State-Mngmt-Plan.md §3.1 Option C — per-file hooks, 11 domains, optimistic mutations
- 66 hooks across 11 domains (27 existing preserved + 39 new)
- Infrastructure: createQueryKeys utility, useOptimisticMutation helper, useRepository with DI
- 3 Zustand stores: useUiStore, useFilterStore (with useDomainFilters shallow selector), useFormDraftStore
- Scorecard/project placeholders replaced with real factory-backed hooks
- Documentation: 11 reference docs, ADR-0014, developer guide
- Verification: pnpm turbo run build (21/21 pass)
Next: Phase 3.2 — Zustand store integration with shell/auth packages

Phase 3.2 (@hbc/query-hooks Quality Audit & Gap Remediation) completed: 2026-03-03
- 3 missing hooks created: useUpdateScorecard, useDeleteScorecard, useDeleteProject
- Port-to-hook coverage: 69/69 (100%)
- Barrel exports and root index updated
- Documentation updated: reference docs, developer guide, ADR-0014
- Verification: pnpm turbo run build (21/21 pass)

Phase 4.3 (Design System Foundation) completed: 2026-03-04
- V2.1 tokens, Field Mode theme, intent-based typography, 12-col grid, 60+ icons, ESLint stub, Storybook switcher
- See ADR-0016

Phase 4.13 (Module-Specific UI Patterns) completed: 2026-03-04
- 5 new components: HbcScoreBar, HbcApprovalStepper, HbcPhotoGrid, HbcCalendarGrid, HbcDrawingViewer
- HbcDataTable frozenColumns enhancement (sticky left + shadow border)
- 8 module config files with typed presets (columns, KPIs, tabs)
- pdfjs-dist peer dependency (lazy-loaded for DrawingViewer)
- 7 Storybook story files + ModulePatterns.stories.tsx
- See ADR-0026, developer guide at docs/how-to/developer/phase-4.13-module-specific-patterns.md

Phase 4.14.4 (Field Mode Dark Theme) completed: 2026-03-04
- FluentProvider wrapping at HbcAppShell level with dynamic theme selection
- useFieldMode: dynamic <meta name="theme-color"> update (Light=#FFFFFF, Field=#0F1419)
- HbcUserMenu: theme-aware dropdown colors via isFieldMode prop
- FieldMode.stories.tsx: LightMode + FieldMode stories
- See ADR-0027, developer guide at docs/how-to/developer/phase-4.14-mobile-pwa-adaptations.md

Phase 4.14.5 completed: 2026-03-04
- HbcBottomNav: fixed bottom nav bar for <1024px viewports, 56px height, "More" overflow sheet
- useIsTablet hook: tablet breakpoint detection at ≤1023px
- HbcModal: full-screen slide-up on mobile (<768px), 44px close button touch target
- HbcCommandPalette: full-screen slide-up on mobile (<768px), X close button replaces ESC hint
- slideInFromBottom keyframe + bottomNav z-index (300) added to theme
- HbcAppShell: integrates bottom nav, derives items from sidebarGroups
- Documentation: ADR-0028, developer how-to guide updated
Phase 4.15 (NGX Modernization & Design Consistency) completed: 2026-03-04
- eslint-plugin-hbc: local ESLint plugin with enforce-hbc-tokens rule
- no-restricted-imports: blocks @fluentui/react-theme direct imports
- Storybook compliance: all core stories export Default + AllVariants + FieldMode + A11yTest
- DESIGN_SYSTEM.md: authoring rules in packages/ui-kit/
- NGX Tracker: docs/architecture/ngx-tracker.md
- ADR-0029, developer guide: phase-4.15-ngx-modernization.md

Phase 4.16 completed: 2026-03-04
- @hbc/ui-kit v2.1.0 finalized: package.json exports, vite.config.ts, density tier system
- Theme hooks (useHbcTheme, useConnectivity, useDensity) + density.ts + theme/README.md
- 27 per-component docs in docs/reference/ui-kit/
- ADR-0030, developer guide: phase-4.16-ui-kit-package.md
- Build: zero errors; Lint: zero errors
Next: Phase 5 (SPFx webparts) or verification

Phase 4.17 completed: 2026-03-04
- Storybook configuration: preview bg fix, WCAG 2.2 AA parameters, field viewport presets
- Shell stories (HbcHeader, HbcSidebar, HbcConnectivityBar, HbcAppShell): all 4 required exports
- Layout stories (DetailLayout, CreateUpdateLayout, ToolLandingLayout): all 4 required exports
- CI automation: @storybook/test-runner + axe-playwright test-runner.ts
- ADR-0031, developer guide: phase-4.17-storybook-configuration.md
- Build: zero errors; Lint: zero errors

PHASE 4 COMPLETE — Phase 4.18 QA/QC Review: 2026-03-04
- §20 Checklist: ALL items verified and marked [x]
- Gap fixed: ADR-0016 created; ADR numbering mapped (§20 "ADR 0008"=ADR-0016, "ADR 0009"=ADR-0027)
- Final: 37 components, 43 stories, 27 ref docs, 16 ADRs (0016-0031+0032), 26 dev guides
- Deferred to Phase 5+: SPFx Application Customizer, SharePoint list schema, PWA runtime APIs
- ADR-0032: Phase 4 completion QA/QC review
Next: Phase 5 (SPFx Webparts)

Phase 4.19 completed: 2026-03-04 — Integration gap diagnosis and HbcAppShell wiring across all consumer apps

Phase 4b.0 completed: 2026-03-05 — Prerequisites & Audit Remediation (SS3.1 hard blockers F-001/F-002/F-004/F-005/F-006 resolved)
- 117 build artifacts removed from ui-kit/src/, eslint-plugin-hbc extracted to workspace package, app-shell expanded as PWA facade
- ADR-0034: audit-remediation.md
Next: Phase 4b.1 (Build & Packaging Foundation)

Phase 4b.1 completed: 2026-03-05 — Build & Packaging Foundation
- turbo.json: check-types ^build dep, lint inputs, build-storybook task
- Barrel: 35 component families verified complete; interactions/ excluded per F-017
- 10 reference docs + entry-points.md created (38 total in docs/reference/ui-kit/)
- ADR-0035: build-packaging-foundation.md
Next: Phase 4b.2 (Shell Completion & WorkspacePageShell)

Phase 4b.2 completed: 2026-03-05 — Shell Completion & WorkspacePageShell (ADR-0036)
Phase 4b.3 completed: 2026-03-05 — Layout Variant System (ADR-0037)
Phase 4b.4 completed: 2026-03-05 — Command Bar & Page Actions (ADR-0038)
- CommandBarAction: isDestructive, tooltip, overflow menu
- Field mode: primary → FAB, secondary → Cmd+K palette via fieldModeActionsStore
- ESLint rule: hbc/no-direct-buttons-in-content (D-03)
Next: Phase 4b.5 (Navigation & Active State)

Phase 4b.5 (Navigation & Active State) completed: 2026-03-05
D-04 implemented: active sidebar state derived from useRouterState().location.pathname
NAV_ITEMS centralized registry created in @hbc/shell
Per-item requiredPermission filtering added to HbcSidebar

Phase 4b.6 (Theme & Token Enforcement) completed: 2026-03-05
D-05 + D-10 implemented via eslint-plugin-hbc (enforce-hbc-tokens enhanced, no-direct-fluent-import added)
Both rules set to 'error' in .eslintrc.base.js for apps/**
Dark mode: all 25 HbcSemanticTokens verified in both light and field themes
Token reference table expanded in packages/ui-kit/src/theme/README.md
ADR-0040: theme-and-token-enforcement.md

Phase 4b.7 (Data Loading & State Handling) completed: 2026-03-05
  - 4b.7.1: Error state with tokens
  - 4b.7.3: SPFx storage adapter F-022
  - 4b.7.4: Layout-aware skeleton loading
  - 4b.7.5: useFilterStore full interface + useListFilterStoreBinding
  - 4b.7.2: Documentation
  - ADR: ADR-0041-data-loading-and-state-handling.md
  - Documentation added: docs/how-to/developer/phase-4b.7-data-loading-guide.md
  - Build: 23/23 packages pass, 0 errors

Phase 4b.8 (Form Architecture & Draft System) completed: 2026-03-06
  - 4b.8.1: HbcForm sub-components verified (HbcFormSection, HbcFormLayout, HbcStickyFormFooter)
  - 4b.8.2: useFormDraft hook for auto-save draft persistence
  - 4b.8.3: HbcFormGuard with HbcConfirmDialog for unsaved changes blocking
  - 4b.8.5: Density integration via useDensity() — compact mode auto-applied
  - 4b.8.4: Documentation
  - ADR created: ADR-0042-form-architecture.md
  - Documentation added: docs/how-to/developer/phase-4b.8-form-architecture-guide.md
  - Build: 23/23 packages pass, 0 errors
Phase 4b.12 (Integration Verification & Acceptance) completed: 2026-03-06
  - CI workflow updated with Storybook test-runner integration and final lint gate
  - e2e coverage expanded with six critical specs and existing dev-harness stability patch
  - ADR hygiene completed: ADR-0001..ADR-0014 naming standardization, duplicate legacy ADR-0016 removed, ADR index status fields added
  - Carryover crosswalk (4b.1–4b.11) reconciled and §17 completion checklist fully marked complete
  - Final sign-off published: ADR-0046-integration-verification-and-acceptance.md
Phase 4b.13 (Menu & Overlay Theme Adaptation) completed: 2026-03-06
  - D-12 compliance enforced in overlay surfaces: `HbcProjectSelector`, `HbcUserMenu`, `HbcToolboxFlyout`, and `HbcCommandPalette`
  - Removed residual light-only overlay backgrounds; active provider theme now drives overlay contrast in office/light and dark/Field contexts
  - Added deterministic dark + Field Mode verification stories for `HbcAppShell`
  - Documentation closure completed in PH4B.13-C + PH4B-C plans, remediation gate updated, ADR-0047 published
Phase 4b.13 follow-up (System Theme Awareness / D-13) completed: 2026-03-06
  - Implemented dedicated `hbcDarkTheme` and removed dark aliasing to field theme
  - `useFieldMode` internal `useAppTheme` now resolves OS `prefers-color-scheme` in office mode and exposes `resolvedTheme`
  - Root `FluentProvider` usage updated across PWA/SPFx/hb-site-control plus HbcAppShell to consume hook-driven dynamic theme
  - Storybook + runtime verification completed for light/dark/field behavior; ADR-0047 addendum published with acceptance evidence
Phase 4b.14 (Navigation & Active State Synchronization / CF-005) completed: 2026-03-06
  - Added route-sync lifecycle APIs in `packages/shell/src/stores/navStore.ts`: `resolveNavRouteState`, `syncFromPathname`, `startNavSync`, `stopNavSync`
  - PWA TanStack root route now starts/stops router-history sync, making location changes authoritative for nav active state
  - `HbcAppShell` now defaults active item rendering to synchronized store state; `WorkspacePageShell` reads synchronized workspace metadata
  - Added regression coverage: `packages/shell/src/stores/navStore.test.ts` + `HbcAppShell.stories.tsx` back/forward synchronization scenario
  - Verification: `pnpm turbo run build`, `pnpm turbo run lint`, `pnpm turbo run check-types`, Storybook build/test-runner, and `pnpm e2e` all pass (lint warnings remain pre-existing)
Phase 4b.15 (Form Validation Architecture Finalization / HF-007) completed: 2026-03-06
  - HbcForm now provides centralized RHF + zod validation with D-07 enforcement and migration-safe submit compatibility
  - HbcFormContext now exposes full API surface required by HF-007: register, handleSubmit, formState, control, setValue, getValues, watch, trigger, reset
  - HbcForm primitives (TextField, Select, Checkbox) now consume centralized context in RHF mode while preserving controlled compatibility
  - useFormDraft consolidation completed: hook is consumer-facing and store remains low-level for compatibility
  - Governance closure completed: HbcForm validation story added, ADR-0042 updated, ADR-0049 created, PH4B-C HF-007 gate marked complete
Phase 4b.16 (Developer Harness, Documentation & E2E Expansion / P3) completed: 2026-03-06
  - Added DemoShell, DemoNavigation, and DemoLayouts in dev-harness pages with explicit WorkspacePageShell usage examples
  - Updated workspace preview demo wiring so shell/navigation/layout demos are visible in runtime
  - Added one WorkspacePageShell smoke spec per domain app route group (12 total) plus shared e2e helper assertions
  - Completed remaining UI-kit component reference docs and entry-point cross-links (chart wrappers, input wrappers, toast provider/container)
  - Finalized dual-entry-point guidance in CLAUDE.md and DESIGN_SYSTEM.md; ADR-0050 created
  - Verification rerun completed successfully across required gates: build, check-types, lint (0 errors), Storybook test-runner, and Playwright e2e
Phase 4b.17 (Build Pipeline, Bundle Reporting & Polish / P2-P4) completed: 2026-03-06
  - Added Turbo `bundle-report` task and wired it to SPFx bundle budget script for deterministic regression checks
  - Added CI `Bundle Size Gate` with hard-fail behavior when SPFx bundle exceeds threshold
  - Updated root `.gitignore` dist handling for app/library/function outputs and documented Vercel preview-only policy in CLAUDE.md
  - Governance updates completed: PH4B-C + PH4B.17-C progress/gates updated and ADR-0051 created
Phase 4b.18 (Integration Verification & Acceptance Final Closure) completed: 2026-03-06
  - Final quality gates passed in closure run: `pnpm turbo run build`, `pnpm turbo run check-types`, `pnpm turbo run lint` (0 errors), Storybook test-runner (`54 suites`, `365 tests`, `0 failed`), `pnpm e2e` (`37 passed`, `4 skipped`, `0 failed`)
  - Final visual QA confirmed overlay/menu contrast compliance across light, dark, and Field Mode for Project Picker, User Menu, Toolbox flyout, and Command Palette
  - Governance closure finished: PH4B.18-C + PH4B-C final notes added, PH4B-C §11 fully completed, and ADR-0052 published as Phase 4B completion sign-off for Phase 5 deployment readiness
Phase 5.1 (Authentication & Shell Foundation Task 1) completed: 2026-03-06
  - 5.1.1 package boundaries locked for `@hbc/auth` and `@hbc/shell` via package configs (`package.json`, `tsconfig.json`, `vite.config.ts`) and package boundary READMEs
  - 5.1.2 Option C per-feature structure and JSDoc/public export rules documented and enforced in package ownership docs
  - 5.1.3 ADR-0053 and ADR-0054 published to lock auth/shell ownership seams prior to migration
  - 5.1.4 workspace dependency governance updated in `pnpm-workspace.yaml` and `turbo.json` (including cache invalidation linkage to workspace dependency rules)
  - 5.1.5 verification gates passed for scoped packages: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`
Phase 5.2 (Dual-Mode Authentication Architecture) completed: 2026-03-06
  - 5.2.1 typed adapter abstraction + shared auth primitives implemented (`IAuthAdapter.ts`, `types.ts`) with Option C boundary constraints
  - 5.2.2 canonical modes implemented (`pwa-msal`, `spfx-context`, `mock`, `dev-override`) with compatibility alias mapping for existing app branches (`msal`, `spfx`)
  - 5.2.3 production auto-detection + non-production override gating implemented in `resolveAuthMode.ts`
  - 5.2.4 auth adapters implemented (`MsalAdapter`, `SpfxAdapter`, `MockAdapter`) with structured `AuthResult` and required failure classification categories
  - 5.2.5 session normalization + restore-policy utilities implemented with typed restore outcomes and shell-status transition outputs
  - 5.2.6 verification gates passed for scoped package: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run lint --filter=@hbc/auth`, `pnpm turbo run check-types --filter=@hbc/auth`
  - 5.2.7 ADR-0055 created: `docs/architecture/adr/ADR-0055-dual-mode-authentication-architecture.md`
Phase 5.3 (Central Auth / Session / Permission State) completed: 2026-03-06
  - 5.3.1 central auth/session store implemented with lifecycle phase, normalized session, runtime mode, restore state, structured error, and shell bootstrap readiness ownership
  - 5.3.2 typed shallow selector hooks/functions added for lifecycle/bootstrap/session/permission slices (`useAuthLifecycleSelector`, `useAuthBootstrapSelector`, `useAuthSessionSummarySelector`, `useAuthPermissionSummarySelector`)
  - 5.3.3 permission resolution layer added (`resolveEffectivePermissions`, `isPermissionGranted`, `getPermissionResolutionSnapshot`) combining base/default/override/expiry/emergency access sources
  - 5.3.4 anti-bypass shared API boundary enforced at auth package export surface; compatibility fields/actions retained for migration-safe adoption
  - 5.3.5 verification gates passed for scoped package: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run lint --filter=@hbc/auth`, `pnpm turbo run check-types --filter=@hbc/auth`
  - 5.3.6 ADR-0056 created: `docs/architecture/adr/ADR-0056-central-auth-session-permission-state.md`
Phase 5.4 (Role Mapping and Authorization Governance) completed: 2026-03-06
  - 5.4.1 role-mapping layer added (`packages/auth/src/roleMapping.ts`) and integrated into session normalization so provider/context identity resolves to app roles centrally
  - 5.4.2 standard action vocabulary + feature registration contracts added with centralized evaluators (`isActionAllowed`, `isFeatureVisible`, `isFeatureAccessible`, `evaluateFeatureAccess`)
  - 5.4.3 default-deny enforcement applied for unregistered protected features and discoverable-locked visibility policy implemented for strategic restricted navigation surfaces
  - 5.4.4 structured access-denied UX added in auth guard layer (`AccessDenied`) with plain-language explanation, safe nav actions, and optional request-access callback seam
  - 5.4.5 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run lint --filter=@hbc/auth`, `pnpm turbo run check-types --filter=@hbc/auth`
  - 5.4.6 ADR-0057 created: `docs/architecture/adr/ADR-0057-role-mapping-and-authorization-governance.md`
Phase 5.5 (Shell Composition and Core Layout Architecture) completed: 2026-03-06
  - 5.5.1 shared shell core orchestration implemented in `@hbc/shell` (`ShellCore`) with narrow scope boundaries and centralized experience-state enforcement
  - 5.5.2 shell adapter extension points + shell mode rule resolver implemented with explicit runtime capabilities and Option C guardrails
  - 5.5.3 `ShellLayout` refactored to presentational-only composition; orchestration moved to shell core + shell-core store
  - 5.5.4 safe redirect restoration and role-appropriate landing resolution implemented with runtime/mode safety checks
  - 5.5.5 full sign-out cleanup policy implemented for auth/session clearing, redirect memory clearing, shell bootstrap reset, environment artifact cleanup, and retention-tier cache hooks
  - 5.5.6 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/shell`
  - 5.5.7 ADR-0058 created: `docs/architecture/adr/ADR-0058-shell-composition-and-core-layout-architecture.md`
Phase 5.6 (Unified Shell-Status / Connectivity Bar Integration) completed: 2026-03-06
  - 5.6.1 unified shell-status domain implemented with central state derivation, fixed priority hierarchy, plain-language status copy, and approved action allowlist
  - 5.6.2 shell core now derives canonical status rail snapshots from centralized auth/shell/connectivity inputs with deterministic action dispatch
  - 5.6.3 existing top `HbcConnectivityBar` upgraded to canonical shell-status rail with snapshot-driven messaging/action rendering and legacy connectivity compatibility
  - 5.6.4 degraded mode integration completed with section-level labels and explicit future-path documentation for richer sub-state contributions (not implemented in Phase 5.6)
  - 5.6.5 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/shell`
  - 5.6.6 ADR-0059 created: `docs/architecture/adr/ADR-0059-unified-shell-status-connectivity-bar-integration.md`
Phase 5.7 (Controlled Degraded Mode) completed: 2026-03-06
  - 5.7.1 centralized degraded policy domain implemented in `@hbc/shell` with strict eligibility (recent session validation + trusted fresh section data) and safe recovery resolution
  - 5.7.2 sensitive action policy enforced for degraded mode to block write/approve/permission-change/current-auth-dependent/backend-validated operations
  - 5.7.3 shell core preserves frame, safe identity context, cached navigation, and visibly restricted zones while degraded; section-level freshness/validation/restricted labels enforced
  - 5.7.4 shell-status messaging now exposes explicit recovery state (`recovered`) when safe reconnection/authorization validation completes
  - 5.7.5 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/shell`
  - 5.7.6 ADR-0060 created: `docs/architecture/adr/ADR-0060-controlled-degraded-mode.md`
Phase 5.8 (Guards, Redirects, and Recovery Surfaces) completed: 2026-03-06
  - 5.8.1 centralized guard resolution and pre-render guard execution implemented for runtime/auth/role/permission checks in `@hbc/auth`
  - 5.8.2 shared hooks expanded for current session, resolved runtime mode, permission evaluation, shell-status state, and degraded visibility rules
  - 5.8.3 redirect policy updated for intended destination capture, safe restoration, and role-landing fallback
  - 5.8.4 dedicated recovery surfaces implemented for bootstrap, restore, access-denied, reauth, unsupported runtime, and fatal startup outcomes
  - 5.8.5 request-access flow extended with typed in-app admin review queue submission seam
  - 5.8.6 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`
  - 5.8.7 ADR-0061 created: `docs/architecture/adr/ADR-0061-guards-redirects-and-recovery-surfaces.md`
Phase 5.9 (Protected Feature Registration Contract) completed: 2026-03-06
  - 5.9.1 shell-owned protected feature registration contract implemented with centralized route/nav visibility/permission/visibility designation/shell compatibility metadata
  - 5.9.2 extension path for exceptional features added with explicit typed seam and deferred-behavior documentation
  - 5.9.3 shell/auth enforcement helpers added to require registration usage and preserve default-deny for unregistered protected features
  - 5.9.4 practical lint/boundary restrictions implemented through `@hb-intel/hbc/require-feature-registration-contract` and app lint configuration
  - 5.9.5 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/shell`
  - 5.9.6 eslint plugin rule tests passed: `pnpm --filter @hb-intel/eslint-plugin-hbc test`
  - 5.9.7 ADR-0062 created: `docs/architecture/adr/ADR-0062-protected-feature-registration-contract.md`
Phase 5.10 (Access-Control Backend and Data Model) completed: 2026-03-06
  - 5.10.1 HB Intel-owned access-control backend model implemented in `packages/auth/src/backend/accessControlModel.ts` for role/grant/approval/expiration/review/audit contracts
  - 5.10.2 explicit override record model + lifecycle transition helpers implemented in `packages/auth/src/backend/overrideRecord.ts`
  - 5.10.3 role-definition drift detection + dependent override review flagging implemented (`getChangedBaseRoleReferences`, `markDependentOverridesForRoleReview`)
  - 5.10.4 central typed shell/auth configuration layer implemented in `packages/auth/src/backend/configurationLayer.ts` with runtime/redirect/session/policy contracts and default-deny validation
  - 5.10.5 package exports/types + Phase 5 documentation closure completed (PH5.10 and PH5 progress notes/checklists updated)
  - 5.10.6 verification gates passed: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run lint --filter=@hbc/auth`, `pnpm turbo run check-types --filter=@hbc/auth`
  - 5.10.7 ADR-0063 created: `docs/architecture/adr/ADR-0063-access-control-backend-and-data-model.md`
Phase 5.11 (Minimal Production Admin UX) completed: 2026-03-06
  - 5.11.1 minimal production admin module implemented in `packages/auth/src/admin/` with typed repository, in-memory runtime adapter, workflow handlers, hooks, and sectioned UX surface
  - 5.11.2 required core admin capabilities implemented: user lookup, role/access lookup, override review decisions, renewal handling, role-change impact review queue, emergency queue, and basic audit visibility
  - 5.11.3 PWA/admin runtime wiring completed (`apps/pwa/src/pages/AdminPage.tsx`, `apps/admin/src/pages/SystemSettingsPage.tsx`) with explicit admin route guard enforcement
  - 5.11.4 deferred expansion items documented (broader dashboards, analytics, request tracking history, notifications, advanced reporting)
  - 5.11.5 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run lint --filter=@hbc/auth`, `pnpm turbo run check-types --filter=@hbc/auth`
  - 5.11.6 ADR-0064 created: `docs/architecture/adr/ADR-0064-minimal-production-admin-ux.md`
Phase 5.12 (Approval, Renewal, and Emergency Access Workflows) completed: 2026-03-06
  - 5.12.1 structured request workflow implemented in `packages/auth/src/workflows/overrideRequest.ts` with deterministic validation and required request metadata capture
  - 5.12.2 approval workflow implemented in `packages/auth/src/workflows/overrideApproval.ts` for approve/reject/set expiration/permanent-with-explicit-justification paths
  - 5.12.3 renewal workflow implemented in `packages/auth/src/workflows/renewalWorkflow.ts` enforcing renewed request, updated justification, and fresh approval
  - 5.12.4 emergency workflow implemented in `packages/auth/src/workflows/emergencyAccess.ts` with authorized-admin immediate action, mandatory reason, short expiration, mandatory post-action review, and non-substitution boundary checks
  - 5.12.5 workflow exports/contracts integrated through `packages/auth/src/workflows/index.ts`, `packages/auth/src/types.ts`, and `packages/auth/src/index.ts`
  - 5.12.6 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run lint --filter=@hbc/auth`, `pnpm turbo run check-types --filter=@hbc/auth`
  - 5.12.7 ADR-0065 created: `docs/architecture/adr/ADR-0065-approval-renewal-and-emergency-access-workflows.md`
Phase 5.13 (Audit, Retention, and Traceability) completed: 2026-03-06
  - 5.13.1 centralized structured audit logger implemented in `packages/auth/src/audit/auditLogger.ts` with required PH5.13 event taxonomy and metadata contract (eventId, source, runtime, correlation, request/override/feature context, outcome, details)
  - 5.13.2 retention policy implemented with locked Option C defaults (180-day active history + indefinite archive strategy) and explicit deferred event-type tiering documentation
  - 5.13.3 audit emission integrated across auth lifecycle store/adapters, access-denied/request submission, override workflows, emergency flow, and admin state-changing operations
  - 5.13.4 basic operational admin audit visibility hook delivered with retention-aware active/archived counts and recent-events projection
  - 5.13.5 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run lint --filter=@hbc/auth`, `pnpm turbo run check-types --filter=@hbc/auth`
  - 5.13.6 ADR-0066 created: `docs/architecture/adr/ADR-0066-audit-retention-and-traceability.md`
Phase 5.14 (SPFx Boundary and Hosting Integration) completed: 2026-03-06
  - 5.14.1 strict SPFx host-bridge contracts implemented in `@hbc/auth` and `@hbc/shell` for approved seams only (container metadata, identity context handoff, limited host signals)
  - 5.14.2 SPFx adapter and bootstrap seams refactored to typed bridge inputs with deterministic validation and legacy compatibility normalization
  - 5.14.3 shell boundary enforcement implemented so SPFx host data cannot become shell composition truth; composition remains resolved by shell-owned rules
  - 5.14.4 approved SPFx host hooks (`theme`, `resize`, `location`) implemented through `createSpfxShellEnvironmentAdapter` without generic shell component coupling
  - 5.14.5 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`
  - 5.14.6 ADR-0067 created: `docs/architecture/adr/ADR-0067-spfx-boundary-and-hosting-integration.md`
Phase 5.15 (Performance Baseline and Startup Budgets) completed: 2026-03-06
  - 5.15.1 centralized startup timing utility + locked balanced budgets implemented in `packages/shell/src/startupTiming.ts` (`runtime-detection`, `auth-bootstrap`, `session-restore`, `permission-resolution`, `first-protected-shell-render` => `100/800/500/200/1500` ms)
  - 5.15.2 non-blocking budget validation model implemented with explicit diagnostics output (`StartupTimingSnapshot` + `StartupBudgetValidationResult`) and release-gating evidence semantics
  - 5.15.3 instrumentation integrated through auth runtime detection, bootstrap/restore adapters, SPFx bootstrap seam, guard permission resolution, and shell first-protected-render readiness boundary
  - 5.15.4 scoped verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`
  - 5.15.5 targeted Vitest startup-timing suite attempted but blocked by existing workspace Vite-resolution issue (`Cannot find package 'vite'` from package `.vite-temp` configs)
  - 5.15.6 ADR-0068 created: `docs/architecture/adr/ADR-0068-performance-baseline-and-startup-budgets.md`
Phase 5.16 (Testing Strategy and Validation Matrix) completed: 2026-03-06
  - 5.16.1 formal dual-mode validation matrix suites added in `packages/auth/src/validation/` and `packages/shell/src/validation/` to cover required runtime/auth/guard/redirect/override/degraded/status/cleanup/boundary scenarios
  - 5.16.2 accessibility validation checks added for shell navigation/status surfaces using semantic landmark + ARIA contract assertions and plain-language shell-status action checks
  - 5.16.3 performance/rerender checks added for auth selector slice stability and shell transition readiness; automated boundary checks added for protected-feature registration and strict SPFx host seam enforcement
  - 5.16.4 verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`, `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts`
  - 5.16.5 ADR-0069 created: `docs/architecture/adr/ADR-0069-testing-strategy-and-validation-matrix.md`
Phase 5.17 (Release Gating and Sign-Off) completed: 2026-03-06
  - 5.17.1 final release checklist artifact created in `docs/architecture/release/PH5-final-release-checklist-and-signoff.md` with required pass/fail release gates and captured evidence structure
  - 5.17.2 named sign-off workflow documented and enforced as mandatory production gate (architecture owner, product owner, operations/support owner)
  - 5.17.3 full Phase 5 success criteria marked complete with explicit Layer 1/Layer 2/Layer 3 acceptance closure
  - 5.17.4 final verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`, `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts`
  - 5.17.5 ADR-0070 created: `docs/architecture/adr/ADR-0070-phase-5-final-release-gating-and-sign-off.md`
Phase 5.18 (Documentation Package) completed: 2026-03-06
  - 5.18.1 package READMEs for `@hbc/auth` + `@hbc/shell` expanded with purpose summaries, architecture responsibilities, contracts, runtime boundaries, and traceability
  - 5.18.2 complete architecture/reference documentation set produced in `docs/architecture/` + `docs/reference/` for contracts/state diagrams/provider-adapter-runtime/governance/emergency/shell-status/degraded/SPFx-boundary/feature-registration/validation/release topics
  - 5.18.3 consolidated deferred-scope roadmap produced in `docs/reference/auth-shell-deferred-scope-roadmap.md` with required four-point deferred-item structure and future dependency assumptions
  - 5.18.4 final Phase 5 documentation and governance closure completed in PH5.18/PH5 plans + blueprint/foundation logs with ADR-0071 publication and ADR index update
  - 5.18.5 final verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`, `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts`
Phase 5.19 (Final Acceptance Criteria Structure) completed: 2026-03-06
  - 5.19.1 explicit three-layer final acceptance model documented with pass/fail criteria for Layer 1 Feature Completion, Layer 2 Outcome Validation, and Layer 3 Operational Readiness
  - 5.19.2 all Phase 5 success criteria and acceptance layers explicitly marked complete with final PASS decision structure
  - 5.19.3 named sign-off capture continuity documented through canonical release checklist package reference and release-lock policy
  - 5.19.4 final verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`, `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts`
  - 5.19.5 ADR-0072 created: `docs/architecture/adr/ADR-0072-phase-5-final-acceptance-criteria-and-sign-off.md`
Phase 5C.1 (Vitest Workspace Configuration Fix) completed: 2026-03-07
  - Implemented D-PH5C-05 root-cause Vitest workspace fix with explicit absolute paths in `vitest.workspace.ts` for `@hbc/auth` and `@hbc/shell` and package-scoped test environment/coverage configuration.
  - Added package test scripts (`test`, `test:watch`, `test:coverage`) for `@hbc/auth` and `@hbc/shell`; wired root test orchestration in `package.json`, `turbo.json`, and executable fallback script `scripts/test-auth-shell.sh`.
  - Updated package documentation in `packages/auth/README.md` and `packages/shell/README.md` with running-test workflows and fallback guidance.
  - Applied PH5C.1 remediation to close verification blockers: workspace execution dependency fixes (`happy-dom`, `@vitest/coverage-v8`) and two auth test corrections (emergency validation order, UTC-safe expiration duration arithmetic).
  - Verification gates passed: `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell`, `bash scripts/test-auth-shell.sh --coverage`, `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`.
Phase 5C.2 (DevAuthBypassAdapter Implementation) completed: 2026-03-07
  - Implemented D-PH5C-02/D-PH5C-03 in `packages/auth/src/adapters/DevAuthBypassAdapter.ts` with full auth lifecycle simulation, configurable delay, timing/event instrumentation, audit logging, and session persistence/restore logic.
  - Added dedicated dev subpath entrypoint `packages/auth/src/dev.ts` and `@hbc/auth/dev` export mapping in `packages/auth/package.json` to keep dev-only adapter reachable without invalid conditional exports in `src/index.ts`.
  - Enforced production boundary by excluding dev adapter/dev entry from auth emit targets and validating `grep -r "DevAuthBypassAdapter" dist/ --include="*.js"` returns empty.
  - Verification gates passed: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run test --filter=@hbc/auth`, `pnpm --filter @hbc/auth run test:coverage` (`DevAuthBypassAdapter.ts` statements 97.74%, functions 100.00%), and dist grep check (empty result).
Phase 5C.3 (PersonaRegistry Implementation) completed: 2026-03-07
  - Implemented D-PH5C-04 production persona registry in `packages/auth/src/mock/personaRegistry.ts` with 11 locked personas, role/permission profiles, metadata/tags, and complete query helpers for dev persona switching.
  - Added dev-surface export wiring in `packages/auth/src/dev.ts` so `@hbc/auth/dev` exposes `PERSONA_REGISTRY`/`IPersona`; added persona reference documentation at `docs/reference/auth/personas.md`.
  - Added PersonaRegistry verification tests in `packages/auth/src/mock/personaRegistry.test.ts` for lookup, category/tag filters, default/count behavior, duplicate-id protection, and required field/permission integrity checks.
  - Verification gates passed: `pnpm turbo run build --filter=@hbc/auth`, `pnpm turbo run test --filter=@hbc/auth`, `pnpm --filter @hbc/auth run test:coverage`; `personaRegistry.ts` coverage 100.00% statements/branches/functions.
Phase 5C.4 (DevToolbar Component Implementation) completed: 2026-03-07
  - Implemented D-PH5C-06 DevToolbar package in `packages/shell/src/devToolbar/` with `DevToolbar.tsx`, `PersonaCard.tsx`, `useDevAuthBypass.ts`, `DevToolbar.module.css`, and `index.ts`, including collapsible three-tab interaction and persisted dev auth tooling.
  - Integrated DEV-only lazy toolbar mount into `packages/shell/src/ShellCore.tsx` (alignment marker preserved) to enforce D-PH5C-02 production exclusion boundary.
  - Added PH5C.4 validation suites in `packages/shell/src/devToolbar/DevToolbar.test.tsx` and `useDevAuthBypass.test.tsx` with wrapper `.test.ts` entries to align with workspace include patterns; targeted devToolbar coverage run reports 95.39%.
  - Verification gates passed: `pnpm turbo run build --filter=@hbc/shell`, `pnpm turbo run test --filter=@hbc/shell`, `pnpm --filter @hbc/shell run test:coverage`; production app bundle grep after `pnpm --filter @hbc/dev-harness build` returned no `HB-AUTH-DEV|DevToolbar|devToolbar` markers.
  - PH5C.4 remediation closure: resolved `@hbc/auth/dev` shell build boundary conflict by aligning auth dev subpath emit/export settings and shell type-path mapping (`packages/auth/package.json`, `packages/auth/tsconfig.json`, `packages/shell/tsconfig.json`) and removed duplicate `IPersona` re-export in persona registry.
Phase 5C.5 (Developer Integration How-To Guide) completed: 2026-03-07
  - Implemented D-PH5C-07 by creating `docs/how-to/developer/integrate-auth-with-your-feature.md` from the locked PH5C.5 production markdown block with complete Diátaxis how-to structure, 10 numbered integration steps, worked Accounting Invoice List example, and troubleshooting guidance.
  - Verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` (pass with one pre-existing auth warning), `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`.
  - PH5C.5 remediation status: no phase-specific remediation required; no new lint/build/type-check failures introduced by the PH5C.5 documentation deliverable.
Phase 5C.6 (End-User Access Request How-To Guide) completed: 2026-03-07
  - Implemented D-PH5C-07 by creating `docs/how-to/user/request-elevated-access.md` from the locked PH5C.6 production markdown block with end-user-friendly language, full request workflow, visual descriptions, timeline/approval process, FAQ, and troubleshooting guidance.
  - Verification gates passed: `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`, `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` (pass with one pre-existing auth warning), `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`.
  - PH5C.6 remediation status: no phase-specific remediation required; no new build/lint/type-check failures introduced by the PH5C.6 documentation deliverable.
-->
