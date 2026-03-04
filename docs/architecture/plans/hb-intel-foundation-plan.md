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
-->
