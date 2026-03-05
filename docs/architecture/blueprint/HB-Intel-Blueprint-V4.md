```markdown
# HB-Intel-Blueprint.md

**HB Intel: Architecture Redesign Blueprint**

**Version:** 4
**Branch:** 
**Status:** Production-Ready Plan (Fully Refined After Structured Interview)  
**Purpose:** This document defines the complete, exhaustive, and granular target architecture for the **HB Intel** application. It replaces the current monolithic SPFx webpart with a clean, scalable monorepo that supports a single **Procore-like standalone PWA** (primary experience for fluent use outside SharePoint), **11 dedicated breakout SPFx webparts** (focused departmental and project-specific use inside SharePoint), and a separate **mobile-first connected application** (HB Site Control) for construction field personnel.  

This blueprint is self-contained and designed such that any competent development team, even one unfamiliar with the project, can implement HB Intel to exact specifications by following the detailed guidance herein. All code is shared via packages. The architecture is deliberately optimized for five core principles: **scalability** (e.g., horizontal backend scaling), **stability** (e.g., compensation on failures), **security** (e.g., server-side operations for sensitive actions), **performance** (e.g., caching and bifurcation in provisioning), and **maintainability** (e.g., clear package boundaries and incremental migration).

## Context & Vision (Interview-Refined)

The current HB Intel app is a single monolithic SPFx webpart housing approximately 65 page components, 55 domain hooks, and 250 data service methods across construction project management domains (leads, estimating, scheduling, buyout, compliance, risk, contracts, Go/No-Go, PMP, and more). It has accumulated significant architectural debt: a single `IDataService` god-interface, React Context cascade problems, a deep folder hierarchy nested under `src/webparts/hbcProjectControls/`, and tight coupling between unrelated domains.

This blueprint answers the question: *"If we built HB Intel from scratch, what does the ideal architecture look like?"* — informed by the real domain complexity of this app, modern best practices, and every decision locked during our structured interview:

- Primary user experience = Procore-like standalone PWA (Vercel for MVP, designed for zero-friction migration to Azure Static Web Apps)  
- 11 independent breakout SPFx webparts (simplified headers — **no project picker**, **no app launcher**) hosted on department- and project-specific SharePoint sites  
- HB Site Control = separate mobile-first connected application (replicates Procore Observations + added safety/job-site monitoring)  
- Dual-mode hosting, dual-mode authentication (MSAL for PWA, native SharePoint context for webparts)  
- Workspace-centric navigation: Procore-style header bar + Microsoft 365 waffle app launcher + global project persistence with intelligent “Back to the Project Hub” section  
- Azure Functions thin secure proxy (Option A: intelligent caching, throttling, batching) for the PWA path  
- Port/adapter pattern retained and extended for all deployment modes  
- Critical MVP feature: SharePoint site provisioning (template-based, bifurcated for speed: basic initial setup + deferred full-spec at 1:00 AM EST, with no data loss)  
- MVP rollout priorities: SharePoint provisioning (triggered by Accounting Manager "Save + Provision Site"), Estimating and Accounting webparts first, followed by Project Hub, Leadership, and Business Development  

## 1. Monorepo Structure (Fully Updated for V4)

The monorepo uses **pnpm workspaces + Turborepo** (locked). Root configuration files are bootstrapped from the official Turborepo starter template with exact customizations. All shared packages and apps are documented with exhaustive manual instructions in the companion Development Plan.

```
hb-intel/
├── turbo.json                          # Turborepo pipeline config (e.g., {"pipeline": {"build": {...}}})
├── pnpm-workspace.yaml                 # Workspace definitions (packages/*, apps/*)
├── tsconfig.base.json                  # Shared TypeScript config (strict mode, path aliases like "@hbc/models/*")
├── .eslintrc.base.js                   # Shared lint rules (extends @typescript-eslint/recommended)
├── vitest.workspace.ts                 # Unified test runner config (include: ['packages/*/src/**/*.test.ts'])
│
├── .github/                       # GitHub-specific templates and workflows
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md          # Structured bug reporting (required fields, screenshots, reproduction steps)
│   │   ├── feature_request.md
│   │   └── question.md
│   └── PULL_REQUEST_TEMPLATE.md
|
├── packages/
│   ├── models/                         # §1a — Domain models & enums (zero dependencies)
│   │   ├── src/
│   │   │   ├── leads/                  # ILead, ILeadFormData, LeadStage enum
│   │   │   ├── estimating/             # IEstimatingTracker, IEstimatingKickoff
│   │   │   ├── schedule/               # IScheduleActivity, IScheduleMetrics
│   │   │   ├── buyout/                 # IBuyoutEntry, IBuyoutSummary
│   │   │   ├── compliance/             # IComplianceEntry, IComplianceSummary
│   │   │   ├── contracts/              # IContractInfo, ICommitmentApproval
│   │   │   ├── risk/                   # IRiskCostItem, IRiskCostManagement
│   │   │   ├── scorecard/              # IGoNoGoScorecard, IScorecardVersion
│   │   │   ├── pmp/                    # IProjectManagementPlan, IPMPSignature
│   │   │   ├── project/                # IActiveProject, IPortfolioSummary
│   │   │   ├── auth/                   # ICurrentUser, IRole, IPermissionTemplate
│   │   │   ├── shared/                 # IPagedResult<T>, ICursorPageResult, IListQueryOptions
│   │   │   └── index.ts                # Barrel exports for easy imports
│   │   ├── package.json                # {"name": "@hbc/models", "dependencies": {}}
│   │   └── tsconfig.json               # Extends ../tsconfig.base.json
│   │
│   ├── data-access/                    # §1b — Data access layer (ports/adapters, replaces IDataService)
│   │   ├── src/
│   │   │   ├── ports/                  # Abstract interfaces per domain (~15 total)
│   │   │   │   ├── ILeadRepository.ts  # getAll, getById, create, update, delete, search
│   │   │   │   ├── IScheduleRepository.ts
│   │   │   │   ├── IBuyoutRepository.ts
│   │   │   │   ├── IScorecardRepository.ts
│   │   │   │   └── ... (one per domain)
│   │   │   ├── adapters/
│   │   │   │   ├── sharepoint/         # PnPjs-based concrete adapters for SPFx/direct calls
│   │   │   │   ├── proxy/              # Azure Functions proxy adapters for PWA (MSAL on-behalf-of)
│   │   │   │   ├── mock/               # In-memory mocks for dev/test
│   │   │   │   └── api/                # Future REST API adapters (e.g., for Azure SQL migration)
│   │   │   ├── factory.ts              # Mode-aware factory: returns adapter based on env (SPFx vs PWA vs Mobile)
│   │   │   └── index.ts                # Exports factories and ports
│   │   ├── package.json                # {"name": "@hbc/data-access", "dependencies": {"@hbc/models": "*"}}
│   │   └── tsconfig.json
│   │
│   ├── query-hooks/                    # §1c — TanStack Query hooks per domain
│   │   ├── src/
│   │   │   ├── leads/                  # useLeads, useLeadById, useCreateLead mutation
│   │   │   ├── schedule/               # useScheduleActivities, useScheduleMetrics
│   │   │   ├── buyout/                 # useBuyoutLog, useCreateBuyoutEntry
│   │   │   ├── scorecard/              # useScorecards, useSubmitDecision
│   │   │   ├── project/                # useActiveProjects, useProjectDashboard
│   │   │   ├── keys.ts                 # Centralized, type-safe query key factory (e.g., queryKeys.leads.all)
│   │   │   ├── defaults.ts             # Default query/mutation options (e.g., staleTime: 5min)
│   │   │   └── index.ts
│   │   ├── package.json                # {"name": "@hbc/query-hooks", "dependencies": {"@hbc/data-access": "*"}}
│   │   └── tsconfig.json
│   │
│   ├── ui-kit/                         # §1d — Shared Fluent UI v9 component library
│   │   ├── src/
│   │   │   ├── HbcDataTable/           # TanStack Table wrapper with virtualization for 10k+ rows
│   │   │   ├── HbcChart/               # Lazy-loaded ECharts wrapper for construction metrics
│   │   │   ├── HbcForm/                # Form primitives (fields, validation, layout)
│   │   │   ├── HbcStatusBadge/         # Consistent status indicators (e.g., In Progress, Failed)
│   │   │   ├── HbcPanel/               # Side panels for detail views/approvals
│   │   │   ├── HbcCommandBar/          # Toolbar with search, filters, actions
│   │   │   ├── HbcEmptyState/          # Zero-data states with actions
│   │   │   ├── HbcErrorBoundary/       # Error boundary with retry button
│   │   │   ├── theme/                  # Fluent tokens/Griffel theme for SharePoint consistency
│   │   │   └── index.ts
│   │   ├── .storybook/                 # Storybook config for isolated component testing
│   │   ├── package.json                # {"name": "@hbc/ui-kit", "dependencies": {"@fluentui/react-components": "^9.0.0"}}
│   │   └── tsconfig.json
│   │
│   ├── auth/                           # §1e — Dual-mode auth & permissions
│   │   ├── src/
│   │   │   ├── stores/                 # Zustand: authStore (currentUser, roles), permissionStore
│   │   │   ├── guards/                 # RoleGate, FeatureGate, PermissionGate components
│   │   │   ├── hooks/                  # useCurrentUser, usePermission, useFeatureFlag
│   │   │   ├── msal/                   # MSAL config for PWA (enterprise Microsoft credentials)
│   │   │   ├── spfx/                   # SPFx context adapter for webparts
│   │   │   └── index.ts
│   │   ├── package.json                # {"name": "@hbc/auth"}
│   │   └── tsconfig.json
│   │
│   └── shell/                          # §1f — Procore-inspired shell (interview-refined)
│       ├── src/
│       │   ├── stores/                 # Zustand: projectStore (global persistence), navStore
│       │   ├── HeaderBar/              # Procore-style: ProjectPicker (left, only in Project Hub) + dynamic tool picker (center)
│       │   ├── AppLauncher/            # M365 waffle icon (top-right, opens workspace grid)
│       │   ├── ProjectPicker/          # Enhanced picker; absent in non-Project-Hub workspaces
│       │   ├── BackToProjectHub/       # Emphasized top section in tool picker for non-Project-Hub (navigates to Project Hub)
│       │   ├── ContextualSidebar/      # Tool-specific navigation (appears as needed)
│       │   ├── ShellLayout/            # Main orchestration (header, sidebar, content)
│       │   └── index.ts
│       ├── package.json                # {"name": "@hbc/shell"}
│       └── tsconfig.json
│
├── apps/
│   ├── pwa/                            # Standalone Procore-like PWA (Vercel MVP, Azure migration-ready)
│   │   ├── src/
│   │   │   ├── pages/                  # All 14 workspaces (e.g., AdminDashboard.tsx, EstimatingDashboard.tsx)
│   │   │   ├── router/                 # Full TanStack Router with route guards
│   │   │   ├── App.tsx                 # Root (wraps ShellLayout, QueryClientProvider)
│   │   │   └── main.tsx                # Entry (ReactDOM.render)
│   │   ├── vite.config.ts              # Vite config (plugins for React, MSAL, service workers for PWA)
│   │   └── package.json                # Dependencies: @hbc/* packages, msal-react
│   │
│   ├── project-hub/                    # SPFx webpart for Project Hub (project-specific sites)
│   │   ├── src/
│   │   │   ├── webparts/project-hub/
│   │   │   │   ├── ProjectHubWebPart.ts  # SPFx entry point
│   │   │   │   └── ProjectHubWebPart.manifest.json
│   │   │   ├── pages/                  # ProjectDashboard.tsx, Preconstruction.tsx, etc.
│   │   │   ├── router/                 # TanStack Router (Project Hub routes only)
│   │   │   └── App.tsx                 # Root with simplified shell
│   │   ├── config/                     # SPFx serve/deploy configs
│   │   └── package.json                # Depends on @hbc/shell, @hbc/query-hooks, etc.
│   │
│   ├── estimating/                     # SPFx webpart for Estimating (department site)
│   │   # (Similar structure to project-hub, but with Estimating-specific pages)
│   │
│   ├── business-development/           # SPFx webpart for Business Development
│   ├── accounting/                     # SPFx webpart for Accounting (critical for provisioning trigger)
│   ├── safety/                         # SPFx webpart for Safety
│   ├── quality-control-warranty/       # SPFx webpart for Quality Control & Warranty
│   ├── risk-management/                # SPFx webpart for Risk Management
│   ├── leadership/                     # SPFx webpart for Leadership
│   ├── operational-excellence/         # SPFx webpart for Operational Excellence
│   ├── human-resources/                # SPFx webpart for Human Resources
│   ├── admin/                          # SPFx webpart for Admin (central admin site, includes error logging)
│   │
│   ├── hb-site-control/                # Mobile-first connected app (replicates Procore Observations + safety)
│   │   ├── src/
│   │   │   ├── pages/                  # ObservationsPage.tsx, SafetyMonitoring.tsx
│   │   │   ├── router/                 # TanStack Router (mobile routes)
│   │   │   └── App.tsx                 # Lightweight shell (responsive-first UI)
│   │   ├── vite.config.ts              # Vite config with mobile optimizations (e.g., service workers for offline)
│   │   └── package.json                # Depends on @hbc/*, react-native-web for future RN migration
│   │
│   └── dev-harness/                    # Vite dev harness (tabs for PWA, each webpart, HB Site Control; mocks Azure Functions)
│
├── backend/
│   └── functions/                      # Azure Functions app (Node.js runtime)
│       ├── host.json                   # Config (e.g., extensions, logging)
│       ├── local.settings.json         # Dev env vars (e.g., AzureWebJobsStorage)
│       ├── provisioningSaga/           # Function for /provision-project-site (Saga orchestrator)
│       ├── proxy/                      # Thin proxy functions for data access (caching with Azure Redis, throttling)
│       ├── timerFullSpec/              # Timer trigger (1:00 AM EST) for deferred full-spec template application
│       └── package.json                # Dependencies: @azure/functions, @pnp/sp, msal-node
│
├── tools/                              # Utility scripts
│   ├── eslint-rules/                   # Custom ESLint plugins (e.g., enforce ports/adapters)
│   ├── bundle-analyzer/                # Scripts for bundle size checks
│   └── generators/                     # Plop.js generators for new domains (e.g., plop new-domain)
│
├── docs/                          # All documentation (the single source of truth)
│   ├── README.md                  # Navigation index and search guidance for the entire docs folder
│   │
│   ├── tutorials/                 # Diátaxis: Learning-oriented (step-by-step onboarding)
│   │   └── getting-started.md
│   │
│   ├── how-to/                    # Diátaxis: Goal-oriented practical guides
│   │   ├── user/
│   │   │   ├── installing-and-using.md
│   │   │   └── common-tasks.md
│   │   ├── administrator/
│   │   └── developer/
│   │
│   ├── reference/                 # Diátaxis: Technical facts and specifications
│   │   ├── api/
│   │   ├── configuration/
│   │   ├── glossary.md
│   │   └── schemas/
│   │
│   ├── explanation/               # Diátaxis: Conceptual and architectural understanding
│   │   ├── architecture.md
│   │   └── design-decisions/
│   │
│   ├── user-guide/                # Complete end-user instructions (mirrors how-to/user/)
│   │   └── full-manual.pdf        # (optional exported version for offline use)
│   │
│   ├── administrator-guide/       # Operations and admin procedures
│   │
│   ├── maintenance/               # Dedicated maintenance runbooks and procedures
│   │   ├── backup-and-restore.md
│   │   ├── patching-and-upgrades.md
│   │   ├── monitoring-and-alerts.md
│   │   └── disaster-recovery.md
│   │
│   ├── troubleshooting/           # Error handling and known problems
│   │   ├── known-issues.md        # Curated list of active bugs with workarounds (never exhaustive)
│   │   └── common-errors.md
│   │
│   ├── architecture/              # High-level blueprints and decisions
│   │   ├── adr/                   # Architecture Decision Records (one markdown file per decision)
│   │   ├── diagrams/              # Architecture diagrams (PlantUML, draw.io exports)
│   │   └── blueprints/            # (e.g., current HB Intel Blueprint V4)
│   │
│   ├── release-notes/             # Detailed per-version notes
│   ├── security/
│   │   └── compliance.md
│   └── faq.md
│
└── (optional) docs-archive/       # Archived older versions (for long-lived enterprise products)
```

### 1d. ui-kit (Enhanced – Critical for Leadership Pitch & Brand Recognition)

**@hbc/ui-kit** is the shared component library built on **heavily customized Fluent UI v9 + Griffel**.  

**HB Intel Design System Requirements (Locked Vision):**  
The UI must be powerful, engaging, stunning, smooth, and easy to follow with the eyes while remaining strictly professional. The application must be instantly recognizable as **HB Intel** — even from across a room or at a glance during leadership presentations or walk-by displays. It must stand out as the premium, one-of-a-kind construction-technology platform rather than a generic or AI-generated interface.  

The design system includes:  
- Signature color palette, typography scale, and elevation system  
- Custom semantic design tokens and Griffel-based theming  
- Smooth micro-interactions, 60 fps animations, and guided eye-flow transitions  
- Distinctive dashboard cards, status badges, command bars, and data-table styling  
- Signature header and workspace-switcher elements that create immediate visual brand identity

## 2. Key Architecture Decisions (Interview-Locked)

### 2a. Dual-Mode Hosting & Deployment
- **PWA**: Vercel for MVP (static hosting with edge functions); migrate to Azure Static Web Apps (integrate with Azure Functions). Use service workers for PWA features like offline caching.
- **11 Breakout SPFx Webparts**: SPFx 1.18+; deploy via SharePoint App Catalog. Each webpart is independent, with its own manifest and bundle.
- **HB Site Control**: Dedicated Vite app (mobile-first, responsive UI); future-proof for React Native migration.
- **Backend**: Azure Functions (serverless, Node.js); thin proxy for all PWA/SPFx data ops. Use managed identities for SharePoint access.

### 2b. Authentication (Dual-Mode Locked)
- PWA: MSAL.js with enterprise Microsoft credentials (Azure AD app registration; scopes: SharePoint.AllSites.FullControl).
- SPFx Webparts/HB Site Control: Native SPFx context (this.context.pageContext.user). No separate login; permissions via SharePoint groups.
- `@hbc/auth`: Dual adapters; use Zustand for state. Example hook:
  ```ts
  const { currentUser } = useCurrentUser(); // Auto-detects mode
  ```

### 2c. Navigation & Shell (Procore-Aligned)
- Header: Procore-style with ProjectPicker (left, visible only in Project Hub) + tool picker (center, workspace-specific).
- Workspace Switcher: M365 waffle icon (top-right; opens grid of 14 workspaces).
- Global Project Persistence: Zustand `projectStore`; persists across workspaces. In non-Project-Hub, add emphasized "Back to the Project Hub {Project Name}" section in tool picker (click navigates).
- Contextual Sidebars: Appear for tool-specific nav (e.g., in Estimating: Tracking, Post-Bid).
- Simplified Shells: Breakout webparts/HB Site Control omit picker/launcher for focus.

### 2d. Domain-Scoped Repositories (Not God-Interface)
Current: `IDataService` (250 methods).  
New: Ports/adapters. Example interface:
  ```ts
  export interface ILeadRepository {
    getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>>;
    getById(id: number): Promise<ILead | null>;
    create(data: ILeadFormData): Promise<ILead>;
    // etc.
  }
  ```
~15 repositories; adapters swap per mode (SharePoint for SPFx, proxy for PWA).

### 2e. Zustand Stores (Not React Context)
Avoid cascade re-renders. Example:
  ```ts
  export const useAuthStore = create<AuthState>((set, get) => ({
    currentUser: null,
    setUser: (user) => set({ currentUser: user }),
  }));
  ```

### 2f. TanStack Router Per App
Isolated instances; type-safe. Example route in Accounting webpart:
  ```ts
  const router = createRouter({
    routeTree: rootRoute.addChildren([accountingSetupRoute]),
  });
  ```

### 2g. Query Key Factory
Centralized:
  ```ts
  export const queryKeys = {
    leads: {
      all: ['leads'] as const,
      detail: (id: number) => ['leads', 'detail', id] as const,
    },
  };
  ```

### 2h. Testing Strategy
Vitest (unit/integration), Playwright (E2E), Storybook (UI/a11y). 95%+ coverage. Turborepo filters changed packages.

### 2i. Provisioning Workflow (MVP Critical)
- Trigger: Accounting Manager "Save + Provision Site" in Accounting webpart.
- Saga: Server-side in Azure Functions (7 steps from ProvisioningSaga.ts; compensation on failure).
- Bifurcated: Immediate basic site (Microsoft template + custom lists/libraries/links/hub connection); deferred full-spec (1:00 AM EST timer trigger) adds web parts without data loss.
- Progress: SignalR real-time bar/modal.
- Error: Layman's modal with retry; log to Admin workspace (state: rolled back, retrying, etc.).
- Example endpoint call:
  ```ts
  await mutation.mutateAsync({ projectCode, ...input }); // Calls /provision-project-site
  ```

### 2i. Provisioning Workflow (MVP Critical)

**Trigger:** Accounting Manager clicks “Save + Provision Site” in the Accounting webpart. This only fires the Azure Functions endpoint — no UI feedback remains here.

**Ownership & UX:** The **Estimating Project Setup page** (in the Estimating SPFx webpart) is the single source of truth for status, feedback, and actions. After trigger, the Accounting user is automatically redirected (or shown a link) to this page.

**Real-time Checklist (Estimating page):**
- Site creation complete  
- Document library setup  
- Template files saved  
- {n} of {m} data lists created  
- Site layout and web parts applied  
- Permissions configured  
- Hub association completed  

Progress updates live via SignalR. Each item shows status (Completed / In Progress / Failed), timestamps, and counts. Layman’s language only — no technical jargon.

**Rollback / Retry / Escalation Logic:**
- On any failure: automatic rollback to the last successfully completed task (compensation executed server-side).  
- “Retry” button attempts only remaining incomplete tasks.  
- On successful completion: clear success message + direct link to the new Project Hub site.  
- On final failed retry: prominent “Escalate to Admin” button (one-click handoff with full context copied to Admin workspace).

**Admin Experience (Admin workspace):**
- Dedicated “Provisioning Failures” dashboard.  
- Guided step-by-step troubleshooting cards for each failure type.  
- One-click “Retry from Admin” and “Mark Resolved” actions.  
- Full audit trail visible (every saga step, compensation action, and error details).

**Technical Implementation (unchanged core):**
- Server-side ProvisioningSaga in Azure Functions (7 steps + compensation).  
- Bifurcated execution: immediate basic site + deferred full-spec at 1:00 AM EST timer trigger.  
- Real-time updates via SignalR.  
- All logging routed to Admin workspace for traceability.

### 2j. Provisioning State Management [New section]

**Persistence Strategy (recommended & assumed for this version):**
- Primary store: Dedicated **ProvisioningStatus** list created in the target project site during the basic provisioning step (visible to Estimating webpart and Admin).  
- Secondary store: Azure Table Storage (for atomic server-side updates and durability during partial failures).  
- Each record contains:  
  - ProjectCode (key)  
  - CurrentStep / TotalSteps  
  - StepResults (JSON array: status, timestamp, error message, completedCount)  
  - OverallStatus (InProgress / Completed / Failed / RolledBack)  
  - LastSuccessfulStep  
  - Escalated (boolean + escalation timestamp)

**Why this works:**
- Estimating SPFx webpart reads the list directly (PnPjs) for instant UI.  
- Azure Functions updates state atomically (even on rollback).  
- Supports SignalR push + polling fallback.  
- Zero data loss on partial failures.

## 3. Data Flow Architecture (Updated)

```mermaid
flowchart LR
    A[UI (PWA/Webpart)] --> B[TanStack Router]
    B --> C[Query Hooks (@hbc/query-hooks)]
    C --> D[Repository Ports (@hbc/data-access)]
    D --> E[Adapters (Proxy for PWA / PnPjs for SPFx)]
    E --> F[SharePoint / Graph API]

    G[UI (Accounting Trigger)] --> H[Azure Functions Saga]
    H <--> I[ProvisioningStatus (SP list + Azure Table)]
    H --> F[SharePoint / Graph API]
    I <--> J[SignalR]
    J --> K[UI (Estimating Project Setup page)]
```

- PWA: All ops via Azure proxy (caching reduces load 70-90%).
- Mutation: Optimistic UI, server confirm, invalidate queries.
- Provisioning: Server-side saga; SignalR for progress. The saga interacts directly with SharePoint/Graph API for provisioning actions, while persisting granular state (e.g., step results, completion counts) in ProvisioningStatus for atomic updates. SignalR enables real-time checklist and feedback pushes to the Estimating Project Setup page, supporting rollback, retry, and escalation logic without requiring full page reloads.

## 4. Cross-Cutting Concerns

### 4a. Permissions & RBAC
`@hbc/auth`: Guards, hooks. Route guards in TanStack Router.

### 4b. Audit Logging
Injected at repository; every mutation logged (e.g., AuditAction.SagaStepCompensated).

### 4c. Error Handling
`HbcErrorBoundary`; global toasts; typed errors.

### 4d. Bundle Optimization
Per-app splitting; Turborepo caching.

### 4e. Accessibility (WCAG 2.2 AA)
Fluent UI enforcement; automated checks.

## 5. CI/CD Pipeline

GitHub Actions; Turborepo-aware (lint, test, build, e2e, deploy). Full exhaustive documentation (Option A) provided in the companion Development Plan.

## 6. Migration Path (Incremental)
Phases 1-10 as detailed; start with provisioning modernization.
 
**Version:** 1.0 (aligned with Blueprint V4)  
**Status:** Approved and Locked  
**Date:** March 2026  
**Purpose:** This document provides the complete, detailed 10-phase incremental migration plan (“strangler fig” pattern) from the current monolithic SPFx webpart to the new clean monorepo architecture (PWA + 11 breakout SPFx webparts + HB Site Control).  

The plan ensures **zero-downtime**, **early business value**, and **risk reduction**. It begins technical foundation work first and delivers the highest-value MVP feature (SharePoint site provisioning) in Phase 6.

## Phase 1: Monorepo Infrastructure & Tooling Setup
Bootstrap the full pnpm workspaces + Turborepo structure using the official starter template. Create all root configuration files and the `apps/dev-harness`.  
**Success Criteria:** `turbo run build` succeeds across the empty workspace.  
**Deliverables:** Working monorepo skeleton with dev-harness.

## Phase 2: Core Shared Packages – Models & Data Access
Implement `@hbc/models` (all domain models and enums) and the complete `@hbc/data-access` package (15 domain-specific ports + SharePoint, proxy, mock, and future API adapters + mode-aware factory).  
**Success Criteria:** All repository ports are swappable and fully tested in the dev-harness.  
**Deliverables:** Clean replacement for the legacy `IDataService` god-interface.

## Phase 3: Query & State Management Layer
Build `@hbc/query-hooks` (TanStack Query hooks, centralized query-key factory, defaults) and Zustand stores for client state.  
**Success Criteria:** Optimistic updates, caching, and invalidation work correctly in the harness.  
**Deliverables:** Modern server-state and client-state management layer.

## Phase 4: UI Foundation & HB Intel Design System
Develop the full `@hbc/ui-kit` package with heavily customized Fluent UI v9 + Griffel and the complete **HB Intel Design System** (signature branding, micro-interactions, smooth animations, and visual identity). Configure Storybook.  
**Success Criteria:** All components render consistently, pass accessibility checks, and reflect the premium HB Intel brand.  
**Deliverables:** Reusable, instantly recognizable UI library.

## Phase 5: Authentication & Navigation Shell
Implement `@hbc/auth` (dual-mode MSAL + SPFx adapters, guards, hooks) and `@hbc/shell` (Procore-style header, global project persistence, Back-to-Project-Hub logic, simplified shells for webparts).  
**Success Criteria:** Seamless mode switching and navigation work across PWA and SPFx previews.  
**Deliverables:** Dual-mode authentication and workspace-centric navigation foundation.

## Phase 6: Provisioning Modernization (MVP Critical – First Business-Value Delivery)
Modernize the entire SharePoint site provisioning workflow using the new Azure Functions backend (`provisioningSaga`, compensation logic, SignalR real-time updates, ProvisioningStatus persistence, bifurcated execution, rollback/retry/escalation). Integrate the Accounting trigger and the Estimating Project Setup page (real-time checklist).  
**Success Criteria:** Accounting Manager can click “Save + Provision Site” and see live, layman-friendly progress on the Estimating page with zero data loss.  
**Deliverables:** Production-ready provisioning (highest-priority MVP feature).

## Phase 7: First Breakout Webparts
Convert the Accounting and Estimating functionality into independent SPFx webparts using the new shared packages and simplified shell.  
**Success Criteria:** These two webparts are production-deployable and fully functional inside SharePoint sites.  
**Deliverables:** First two live breakout webparts.

## Phase 8: Remaining Departmental & Project-Specific Webparts
Migrate the other nine SPFx webparts (Project Hub, Leadership, Risk Management, Safety, etc.) one by one using the shared template and overrides.  
**Success Criteria:** All 11 webparts are independent, lightweight, and use the new architecture.  
**Deliverables:** Complete set of 11 focused SPFx webparts.

## Phase 9A: Standalone Procore-like PWA
Build the full primary PWA (`apps/pwa`) with all 14 workspaces, complete TanStack Router, MSAL authentication, and the Procore-inspired shell.  
**Success Criteria:** The PWA runs independently on Vercel and provides the flagship experience.  
**Deliverables:** Primary standalone application (the future main user experience).

## Phase 9B: UX Enhancement Layer — My Work Feed, Progressive Coaching, Draft Persistence & Instrumentation
Apply the four UX differentiation layers defined in `docs/architecture/plans/PH4-UX-Enhanced-Plan.md` to the fully-built PWA. Wire the `HbcMyWorkFeed` as the default PWA landing route. Integrate `HbcCoachCard` coaching sequences across all 14 workspaces for the 5 MVP roles. Add `useFormDraft` auto-save to all 7 major forms. Instrument the 5 critical task flows with `useUXInstrumentation` timing and `HbcCESPrompt` measurement.  
**Success Criteria:** Field users land on a populated, priority-sorted My Work feed on first open; no form data is lost to a network or browser failure; UX metrics begin accumulating in `HBIntel_UXMetrics`.  
**Deliverables:** Industry-differentiating UX layer applied to the complete PWA — My Work feed, role-aware progressive coaching, form draft recovery, and lightweight task instrumentation.

## Phase 11: Mobile App, Backend Polish, CI/CD & Full Cutover
Complete `apps/hb-site-control`, finalize the Azure Functions proxy and timer triggers, implement the full GitHub Actions CI/CD pipeline, run comprehensive testing (Vitest, Playwright, Storybook), optimize performance, and gradually decommission the old monolithic webpart.  
**Success Criteria:** 100 % of functionality is available in the new architecture; the legacy monolith is retired.  
**Deliverables:** Complete, production-ready HB Intel platform.

## Migration Governance
- Each phase ends with a working dev-harness verification and automated tests.  
- Progress is tracked in the project’s issue tracker.  
- Rollback is always possible because shared packages are introduced incrementally.  
- Business stakeholders receive visible value starting at Phase 6 (provisioning).


## 7. Why This Architecture
| Current Pain                   | Greenfield Solution                          |
|--------------------------------|----------------------------------------------|
| God interface (250 methods)    | ~15 focused domain repositories              |
| Context cascade re-renders     | Zustand selector subscriptions               |
| Single giant bundle            | Natural per-app code splitting               |
| Router instability             | Small per-app TanStack Routers               |
| Monolithic deployment          | 11 SPFx webparts + standalone PWA            |
| Backend lock-in                | Port/adapter + Azure proxy                   |
| Onboarding difficulty          | Clear boundaries + explicit deps             |

## 8. Tech Stack Summary (Updated for V4)

| Layer              | Technology                                      | Rationale                                      |
|--------------------|-------------------------------------------------|------------------------------------------------|
| Hosting            | PWA (Vercel→Azure) + 11 SPFx                    | Focused, dual-mode use                         |
| Monorepo           | pnpm + Turborepo (official starter)             | Fast, incremental builds                       |
| Framework          | React 18                                        | Established                                    |
| UI Library         | Fluent UI v9 + Griffel + **HB Intel Design System** | Consistency + stunning, instantly recognizable branding |
| Routing            | TanStack Router v1 + Procore shell              | Type-safe UX                                   |
| Server State       | TanStack Query v5                               | Caching/updates                                |
| Client State       | Zustand                                         | No cascades                                    |
| Tables             | TanStack Table + virtualization                 | Large datasets                                 |
| Charts             | ECharts (lazy)                                  | Metrics                                        |
| Data Access        | Ports/adapters + Azure proxy                    | Swappable                                      |
| Backend            | Azure Functions (proxy + caching)               | Scalable security                              |
| Testing            | Vitest + Playwright + Storybook                 | Comprehensive                                  |
| Linting/CI         | ESLint + Turborepo + GitHub Actions             | Enforcement                                    |
| Dev Experience     | Vite dev-harness                                | HMR/mocks                                      |

## 9. Companion Development Plan

The exhaustive, numbered, manual step-by-step implementation instructions (including every folder command, package.json, tsconfig.json, and full copy-paste-ready file content for **every** layer) are contained in the separate document **HB Intel Foundation Development Plan** (aligned with Blueprint V4). This plan is the single executable reference for any new developer or AI coding agent.

**End of Document – HB-Intel-Blueprint-V4.md**

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 0 (Prerequisites) completed: 2026-03-03
- CLAUDE.md updated: locked source path corrected from blueprints/ to blueprint/ (singular)
- Duplicate docs/blueprint/ directory removed; canonical location: docs/architecture/blueprint/
- Full Diataxis docs/ folder structure scaffolded per CLAUDE.md §4
- Prerequisites verified: Node.js v22.14.0, pnpm 10.13.1, Git 2.50.1
- Documentation added: docs/README.md (navigation index)
- Documentation added: docs/faq.md (placeholder)
Next: Phase 1 — Bootstrap Monorepo Root Configuration Files

Phase 1 (Bootstrap Monorepo Root Configuration Files) completed: 2026-03-03
- Root config files created: turbo.json, pnpm-workspace.yaml, tsconfig.base.json, .eslintrc.base.js, vitest.workspace.ts
- turbo.json uses Turbo v2 "tasks" syntax (not deprecated "pipeline") — see ADR-0001
- .eslintrc.base.js extends eslint:recommended + @typescript-eslint/recommended (exact Blueprint filename)
- tsconfig.base.json standalone with strict mode, ES2022, @hbc/* path aliases (no config packages)
- pnpm-workspace.yaml includes: apps/*, packages/*, backend/*, tools/*
- .github/ templates created: bug_report.md, feature_request.md, question.md, PULL_REQUEST_TEMPLATE.md
- Supporting files: package.json, .gitignore (replaced Java template), .npmrc, .vscode/settings.json
- Verification: pnpm install (178 packages) + turbo run build (0 tasks, success)
- Documentation added: docs/how-to/developer/phase-1-bootstrap-guide.md
- ADR created: docs/architecture/adr/0001-monorepo-bootstrap.md
Next: Phase 2 — Shared Packages (@hbc/models, @hbc/data-access, etc.)

Phase 2.1 (@hbc/models) completed: 2026-03-03
- Created packages/models/ with package.json (ESM, zero deps), tsconfig.json (extends tsconfig.base.json)
- 12 domain folders per Blueprint §1a: leads, estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp, project, auth, shared
- Barrel export src/index.ts re-exports all 12 domains
- Verification: pnpm turbo run build --filter=@hbc/models (1 task, success, 1.166s)
- Documentation added: docs/how-to/developer/phase-2-shared-packages-guide.md (models section)
Phase 2.2 (@hbc/data-access) completed: 2026-03-03
- Created packages/data-access/ with package.json (ESM, depends on @hbc/models workspace:*), tsconfig.json
- 11 port interfaces per Blueprint §1b: ILeadRepository, IEstimatingRepository, IScheduleRepository, IBuyoutRepository, IComplianceRepository, IContractRepository, IRiskRepository, IScorecardRepository, IPmpRepository, IProjectRepository, IAuthRepository
- 4 adapter directories per Blueprint §1b: mock/ (3 implementations), sharepoint/ (stub), proxy/ (stub), api/ (stub)
- Mode-aware factory.ts with resolveAdapterMode() (reads HBC_ADAPTER_MODE, defaults to 'mock')
- Barrel exports: src/index.ts re-exports all ports (type-only), mock adapters, and factory functions
- Verification: pnpm turbo run build --filter=@hbc/data-access (2 tasks, success, 925ms)
- Documentation added: docs/how-to/developer/phase-2-shared-packages-guide.md (data-access section)
- ADR created: docs/architecture/adr/0002-ports-adapters-data-access.md
- Reference created: docs/reference/api/data-access-ports.md
- Explanation created: docs/explanation/ports-adapters-architecture.md
Phase 2.3 (@hbc/query-hooks) completed: 2026-03-03
- Created packages/query-hooks/ with package.json (ESM, deps: @hbc/data-access, @hbc/models, @tanstack/react-query v5; peerDep: react), tsconfig.json
- Centralized query key factory in src/keys.ts per §2g: type-safe `as const` keys for all 5 domains (leads, schedule, buyout, scorecard, project)
- Default options in src/defaults.ts: staleTime 5min, gcTime 10min, retry 2 (queries) / 0 (mutations) per §1c
- 5 domain hook modules per §1c: leads/ (6 hooks), schedule/ (6 hooks), buyout/ (6 hooks), scorecard/ (4 hooks), project/ (5 hooks)
- Leads/schedule/buyout hooks use factory-created repositories; scorecard/project use type-safe placeholders (awaiting factory export)
- All mutations invalidate parent query keys on success for automatic cache refresh
- Barrel src/index.ts re-exports all 27 hooks + queryKeys + default options
- Verification: pnpm turbo run build --filter=@hbc/query-hooks (3 tasks, success, 2.145s)
- Documentation updated: docs/how-to/developer/phase-2-shared-packages-guide.md (query-hooks section)
Next: Phase 2.4

Phase 2.4 (@hbc/auth) completed: 2026-03-03
- Created packages/auth/ (12 files) per Blueprint §1e, §2b, §2e
- Zustand stores (§2e): useAuthStore (currentUser, isLoading, error, setUser, setLoading, setError, clear), usePermissionStore (permissions[], featureFlags{}, hasPermission(), hasFeatureFlag(), setters)
- React guard components (§1e): RoleGate (checks user role), FeatureGate (checks feature flag), PermissionGate (checks permission action) — all accept children + optional fallback
- Convenience hooks (§1e): useCurrentUser(), usePermission(action), useFeatureFlag(feature) — selector-based subscriptions to prevent cascade re-renders
- Dual-mode adapters (§2b): AuthMode type ('msal' | 'spfx' | 'mock'), resolveAuthMode() auto-detects from environment, IMsalConfig interface, extractSpfxUser() stub (Phase 5), initMsalAuth() stub (Phase 4)
- Dependencies: @hbc/models (workspace:*), zustand ^5.0.0; optionalDeps: @azure/msal-browser ^4.0.0, @azure/msal-react ^3.0.0; peerDep: react ^18.0.0
- Verification: pnpm turbo run build --filter=@hbc/auth (2 tasks, success, 1.301s)
- Documentation updated: docs/how-to/developer/phase-2-shared-packages-guide.md (auth section)
Next: Phase 2.5

Phase 2.5 (@hbc/shell) completed: 2026-03-03
- Created packages/shell/ (13 source files) per Blueprint §1f, §2c, §2e
- Shell-specific types (types.ts): WorkspaceId (14-member string union), WORKSPACE_IDS runtime array, ToolPickerItem, SidebarItem, WorkspaceDescriptor
- 2 Zustand stores (§2e): projectStore (activeProject, availableProjects, isLoading), navStore (activeWorkspace, toolPickerItems, sidebarItems, isSidebarOpen, isAppLauncherOpen)
- navStore.setActiveWorkspace() atomically clears toolPickerItems + sidebarItems to prevent stale nav flash
- 6 React components (§1f, §2c): HeaderBar (3-section), AppLauncher (M365 waffle + 14-workspace grid), ProjectPicker (dropdown), BackToProjectHub (emphasized link), ContextualSidebar (tool-specific nav), ShellLayout (root orchestrator)
- ShellLayout mode prop: 'full' (PWA) vs 'simplified' (SPFx) — simplified unmounts ProjectPicker + AppLauncher entirely (not CSS-hidden)
- Navigation rules enforced: ProjectPicker only in project-hub workspace, BackToProjectHub in non-project-hub, AppLauncher only in full mode
- All components use data-hbc-shell="*" attributes as styling hooks for @hbc/ui-kit (Phase 2.6)
- Callback-based navigation (onClick) — shell never calls router directly; apps inject behavior
- Dependencies: @hbc/models (workspace:*), @hbc/auth (workspace:*), zustand ^5.0.0; peerDep: react ^18.0.0
- ADR created: docs/architecture/adr/0003-shell-navigation-zustand.md
- Documentation updated: docs/how-to/developer/phase-2-shared-packages-guide.md (shell section)
Next: Phase 2.6

Phase 2.6 (@hbc/ui-kit — HB Intel Design System) completed: 2026-03-03
- Created packages/ui-kit/ (30 source files) per Blueprint §1d
- Brand assets: hb_icon_blueBG.jpg + hb_logo_icon-NoBG.svg copied to src/assets/logos/
- Theme system (5 files): tokens.ts (BrandVariants 16-shade ramp from #004B87, HBC_PRIMARY_BLUE #004B87, HBC_ACCENT_ORANGE #F37021, 12 semantic status colors), theme.ts (hbcLightTheme + hbcDarkTheme via createLightTheme/createDarkTheme with HbcSemanticTokens overrides), animations.ts (6 Griffel keyframes: fadeIn, slideInRight, slideInUp, scaleIn, pulse, shimmer + 3 transition presets), typography.ts (9-level type scale: displayHero→caption + monospace), elevation.ts (5-level shadow system: rest, hover, raised, overlay, dialog)
- 8 Blueprint components: HbcStatusBadge (status→color mapping, Fluent Badge), HbcEmptyState (centered + fadeIn/slideInUp), HbcErrorBoundary (class component, retry, onError, fallback render prop), HbcForm (HbcTextField, HbcSelect, HbcCheckbox, HbcFormLayout — thin Fluent v9 wrappers, controlled-only), HbcPanel (OverlayDrawer sm/md/lg), HbcCommandBar (Toolbar + SearchBox + filters + actions), HbcDataTable (@tanstack/react-table + react-virtual, sorting, pagination, row selection, 10k+ virtualization, shimmer loading, semantic <table> for a11y), HbcChart (React.lazy + Suspense around EChartsRenderer, HB color palette as ECharts theme)
- All components use Griffel makeStyles with theme tokens, data-hbc-ui="*" attributes, controlled props pattern
- Storybook 8 config: .storybook/main.ts (@storybook/react-vite, addon-essentials, addon-a11y) + .storybook/preview.tsx (FluentProvider decorator with hbcLightTheme)
- Dependencies: @fluentui/react-components ^9.56.0, @griffel/react ^1.5.0, @tanstack/react-table ^8.21.0, @tanstack/react-virtual ^3.13.0, echarts ^5.6.0, echarts-for-react ^3.0.0; dev: @storybook/* ^8.6.0, vite ^6.0.0
- No workspace dependencies — builds independently
- Verification: pnpm turbo run build --filter=@hbc/ui-kit (1 task, success, 1.17s); full monorepo build (6 tasks, all success, 1.761s)
- ADR created: docs/architecture/adr/0004-ui-kit-design-system.md
- Documentation updated: docs/how-to/developer/phase-2-shared-packages-guide.md (§2.6 section)
Next: Phase 3 — apps/dev-harness

Phase 3 (apps/dev-harness) completed: 2026-03-03
- Created apps/dev-harness/ (17 source files + 4 config files) per Blueprint §1 (monorepo: apps/dev-harness)
- Vite SPA with resolve.alias → package src/ dirs for instant HMR across package boundaries
- Compile-time mock injection via define: process.env.HBC_ADAPTER_MODE = "mock", HBC_AUTH_MODE = "mock"
- Synchronous Zustand bootstrap (bootstrap.ts): seeds authStore, permissionStore, projectStore, navStore before React render
- Provider hierarchy: FluentProvider > QueryClientProvider > HbcErrorBoundary > TabRouter + DevControls + ReactQueryDevtools
- 13-tab navigation (Fluent TabList + React useState): PWA full shell + 11 SPFx webpart previews + HB Site Control mobile viewport
- PwaPreview: ShellLayout mode='full' with workspace switching, project selection, back-to-hub callbacks
- WebpartPreview: Reusable ShellLayout mode='simplified' wrapper with workspaceId prop
- SiteControlPreview: Mobile viewport (max-width 428px) with simplified shell
- 4 demo pages: WorkspacePlaceholder (status badges, conditional demos), DemoDataGrid (HbcDataTable + HbcCommandBar + useLeads), DemoCharts (HbcChart line + pie), DemoForms (HbcTextField + HbcSelect + HbcCheckbox + HbcFormLayout)
- DevControls: Floating panel with theme toggle, user/project info, feature flag toggles, mock data reset
- Verification: pnpm turbo run build (7 tasks, all success, 5.2s); Vite build produces 4 chunks (index.html, CSS, JS 652KB, ECharts lazy 1056KB)
- ADR created: docs/architecture/adr/0005-dev-harness.md
- Documentation added: docs/how-to/developer/phase-3-dev-harness-guide.md
Next: Phase 4 — PWA (apps/web)

Phase 4 (apps/pwa) completed: 2026-03-03
- Created apps/pwa/ (31 source files + 5 config files) per Blueprint §1 (monorepo: apps/pwa/), §2a (dual-mode hosting), §2b (MSAL auth), §2c (shell navigation), §2e (Zustand), §2f (TanStack Router), §4a (route guards)
- Vite PWA with vite-plugin-pwa: registerType='autoUpdate', web manifest (HB Intel, #004B87, standalone), Workbox service worker (24 precache entries)
- Dual-mode auth bootstrap: mock (synchronous bootstrapMockEnvironment) + msal (async initializeMsalAuth with MSAL PublicClientApplication, redirect handling, silent token)
- Provider hierarchy: FluentProvider > MsalProvider (conditional) > QueryClientProvider > HbcErrorBoundary > RouterProvider > ShellLayout (root route)
- TanStack Router code-based routes: createAppRouter() with type registration, createWorkspaceRoute() factory for all 14 workspaces
- Shell-router integration: root route renders ShellLayout mode='full' with <Outlet/>, callbacks wire to router.navigate() per ADR-0003
- Imperative Zustand route guards: requireAuth(), requirePermission() called from beforeLoad (outside React tree)
- 14 lazy-loaded workspace routes + index redirect (/ → /project-hub) + 404 catch-all
- 5 MVP pages with data grids/charts: ProjectHubPage, AccountingPage, EstimatingPage, LeadershipPage, BusinessDevelopmentPage
- 9 standard placeholder pages with HbcEmptyState + NotFoundPage
- Modified packages/shell/src/stores/projectStore.ts: added zustand/middleware persist with localStorage (key: hbc-project-store, partialize: activeProject only)
- Created packages/auth/src/msal/index.ts: mapMsalAccountToUser(), validateMsalConfig() helpers
- Re-exported ColumnDef type from @hbc/ui-kit to avoid leaking @tanstack/react-table as direct dependency
- Verification: pnpm turbo run build (8 tasks, all success, 6.77s); Vite build produces lazy-loaded chunks for all workspace pages + ECharts
- ADR created: docs/architecture/adr/0006-pwa-standalone.md
- Documentation added: docs/how-to/developer/phase-4-pwa-guide.md
Next: Phase 5 — SPFx webparts

Phase 5 (11 SPFx webparts) completed: 2026-03-03
- Pre-requisites: Expanded WorkspaceId from 14 → 19 (added safety, quality-control-warranty, risk-management, operational-excellence, human-resources) per Blueprint §2c
- Implemented extractSpfxUser() in packages/auth/src/adapters/index.ts with ISpfxPageContext interface per Blueprint §2b (dual-mode auth)
- Created packages/auth/src/spfx/index.ts: bootstrapSpfxAuth() seeds authStore + permissionStore from SharePoint context
- Moved WorkspacePageShell from apps/pwa/src/components/ to packages/ui-kit/src/WorkspacePageShell/ for cross-app reuse
- Fixed dev-harness TAB_TO_WORKSPACE mappings for 5 new SPFx workspace IDs
- Added 5 new PWA workspace routes + placeholder pages (SafetyPage, QualityControlWarrantyPage, RiskManagementPage, OperationalExcellencePage, HumanResourcesPage)
- Created 11 SPFx webpart apps (apps/project-hub through apps/human-resources) per Blueprint §1 (monorepo structure), §2a (dual-mode hosting), §2b (SPFx auth), §2c (simplified shell)
- Each webpart: Vite build, ShellLayout mode='simplified', memory-based TanStack Router (createMemoryHistory), dual-mode auth (mock/spfx), unique dev port (4001–4011)
- Page breakdown: project-hub (4 pages), accounting (3), estimating (3), leadership (2), business-development (2), admin (3), safety (2), quality-control-warranty (2), risk-management (2), operational-excellence (2), human-resources (2) = 27 pages total
- Verification: pnpm turbo run build (19 tasks, all success, 15.6s)
- ADR created: docs/architecture/adr/0007-spfx-vite-first.md
- Documentation added: docs/how-to/developer/phase-5-spfx-webparts-guide.md
Next: Phase 6 — HB Site Control

Phase 6 (HB Site Control — Mobile-First Field App) completed: 2026-03-03
- Created apps/hb-site-control as a dedicated mobile-first Vite application per Blueprint §1, §2a, §2b, §2c, §2i
- Tri-mode auth: mock (dev) / msal (prod standalone) / spfx (embedded) via resolveAuthMode()
- Browser history router (not memory) for standalone deployment with mobile back button + deep linking
- vite-plugin-pwa with registerType: 'autoUpdate', standalone display, #004B87 theme, precaches 10 entries
- react-native-web dependency with Vite alias for future React Native migration path
- ShellLayout mode='simplified' (no ProjectPicker, no AppLauncher)
- Mock bootstrap: field worker persona with project:read + document:write permissions
- Mobile-first CSS: 48px min touch targets, env(safe-area-inset-*), overscroll-behavior: contain, prefers-reduced-motion
- 3 pages: HomePage (dashboard cards + recent activity), ObservationsPage (data table with 10 mock observations), SafetyMonitoringPage (SignalR events + trend chart)
- useSignalR hook: setInterval mock event stream (8 event templates, 5s interval, max 50 events), interface ready for @microsoft/signalr swap in Phase 7
- Port assignment: 4012
- Verification: pnpm turbo run build (20 tasks, all success)
- ADR created: docs/architecture/adr/0008-hb-site-control-mobile.md
- Documentation added: docs/how-to/developer/phase-6-hb-site-control-guide.md
Next: Phase 7 — Backend

Phase 7 (Backend/Functions — Azure Functions v4) completed: 2026-03-03
- Created backend/functions/ as Azure Functions v4 Node.js serverless app per Blueprint §1, §2a, §2i, §2j, §3
- Shared provisioning types in packages/models/src/provisioning/: IProvisioningStatus, ISagaStepResult, IProvisionSiteRequest, IProvisioningProgressEvent, IProvisioningEscalation, SAGA_STEPS
- Azure Functions v4 programming model: app.http() / app.timer() registration (no function.json files)
- tsconfig overrides: module: "Node16", moduleResolution: "Node16", no DOM lib, types: ["node"]
- Service layer: 5 port interfaces (ISharePointService, ITableStorageService, IRedisCacheService, ISignalRPushService, IMsalOboService) with mock implementations
- Service factory: HBC_SERVICE_MODE env var controls mock vs azure service instantiation
- Provisioning saga orchestrator: 7-step engine with execute, retry, compensate, and pushProgress
- Saga bifurcation: steps 1,2,3,4,6,7 immediate; step 5 (web parts) deferred to 1:00 AM EST timer
- Compensation: reverse-order rollback from lastSuccessfulStep; step 1 (deleteSite) cascades
- 4 HTTP endpoints: POST /provision-project-site (202), GET /provisioning-status/{projectCode}, POST /provisioning-retry/{projectCode}, POST /provisioning-escalate/{projectCode}
- Proxy layer: GET/POST /api/proxy/{*path} with MSAL OBO, Redis cache (TTL-based), cache invalidation on mutations
- Timer function: cron 0 0 6 * * * (6:00 AM UTC) processes deferred full-spec projects
- SignalR negotiate endpoint: POST /api/signalr/negotiate returns mock connection info
- Backend depends on @hbc/models only — no other @hbc/* packages
- Verification: pnpm turbo run build (21 tasks, all success)
- ADR created: docs/architecture/adr/0009-backend-functions.md
- Documentation added: docs/how-to/developer/phase-7-azure-functions-guide.md
Next: Phase 8 — CI/CD

Phase 8 completed: 2026-03-03
- CI/CD pipeline: 3 GitHub Actions workflows (ci.yml, cd.yml, security.yml)
- CI: 5 jobs — lint-and-format, test, build, storybook, e2e (Playwright smoke test)
- CD: 4 jobs — deploy-pwa (Vercel), deploy-site-control (Vercel), deploy-functions (Azure), deploy-spfx (stubbed, if: false)
- Security: dependency audit on PR + weekly + manual dispatch
- Prettier config: .prettierrc + .prettierignore (semi, singleQuote, 100 width)
- Playwright: chromium-only, testDir: ./e2e, baseURL: localhost:4000, single smoke test
- Turborepo remote caching via TURBO_TOKEN/TURBO_TEAM env vars
- Coverage thresholds start at 0% — ramp to 95% per Blueprint §2h
- SPFx deploy stubbed — Vite-to-.sppkg packaging deferred
- Root config updates: format:check script + task, @playwright/test devDep, vitest workspace expanded
- ADR created: docs/architecture/adr/0010-ci-cd-pipeline.md
- Documentation added: docs/how-to/developer/phase-8-ci-cd-guide.md
Next: Phase 9 — Verification

Phase 2.1 Rebuild (@hbc/models Comprehensive Structure) completed: 2026-03-03
- PH2-Shared-Packages-Plan.md §2.1 Option C — per-domain 6-file structure (ADR-0012)
- 65 new TS files + 14 modified barrels, 13 reference docs, 1 ADR
- Full JSDoc, new enums/FormData/types/constants for all 13 domains
- Zero breaking changes across 62+ consumer imports

Phase 2.2 Rebuild (@hbc/data-access Comprehensive Rebuild) completed: 2026-03-03
- PH2-Shared-Packages-Plan.md §2.2 — Error hierarchy, BaseRepository, 11 mock adapters, 11 factories
- 21 new TS files + 18 modified, 3 new docs + 3 modified docs, 1 ADR (0013)
- Typed error hierarchy: HbcDataAccessError, NotFoundError, ValidationError, AdapterNotImplementedError
- BaseRepository<T> abstract class with wrapAsync, validateId, throwNotFound
- Monolithic mock/index.ts decomposed into 11 per-domain files + shared infrastructure
- All 11 factory functions implemented (unblocks query-hooks/project and query-hooks/scorecard)
- Stub adapter typed configs for SharePoint, Proxy, API
- Full backward compatibility preserved for all existing consumer imports

Phase 3.1 Rebuild (@hbc/query-hooks Comprehensive Rebuild) completed: 2026-03-03
- PH3-Query-State-Mngmt-Plan.md §3.1 Option C — per-file hook structure, 11 domains, optimistic mutations
- ~100 new TS files: 66 hooks across 11 domains, 3 Zustand stores, createQueryKeys utility, useRepository hook
- createQueryKeys helper with static `all` array (backward compatible)
- useOptimisticMutation generic helper: cancel → snapshot → rollback → invalidate lifecycle
- useRepository type-safe hook with RepositoryMap interface + DI overrides for testing
- 5 existing domains refactored from monolithic to per-file; scorecard/project placeholders replaced with real factories
- 6 new domains: estimating (7), compliance (6), contracts (7), risk (6), pmp (7), auth (6)
- 3 Zustand stores: useUiStore, useFilterStore (shallow selectors), useFormDraftStore
- 14 docs: 11 reference, 1 ADR (0014), 1 developer guide, progress notes
- All 27 existing hook names/signatures preserved, defaultQueryOptions/defaultMutationOptions unchanged
- Full monorepo build: 21/21 tasks pass

Phase 3.2 (@hbc/query-hooks Quality Audit & Gap Remediation) completed: 2026-03-03
- Port-to-hook coverage: 66/69 → 69/69 (100%)
- 3 new hooks: useUpdateScorecard, useDeleteScorecard, useDeleteProject
- Scorecard domain: 4 → 6 hooks; Project domain: 5 → 6 hooks
- Barrel exports updated (scorecard/index.ts, project/index.ts, root index.ts)
- Documentation updated: scorecard.md, project.md, developer guide, ADR-0014
- Verification: pnpm turbo run build — 21/21 tasks pass

Phase 4.3 (Design System Foundation V2.1) completed: 2026-03-04
- tokens.ts, theme.ts, typography.ts enhanced; grid.ts, icons/index.tsx, lint/enforce-hbc-tokens.ts created
- ADR-0016 filed

Phase 4.13 (Module-Specific UI Patterns) completed: 2026-03-04
- 5 new components: HbcScoreBar, HbcApprovalStepper, HbcPhotoGrid, HbcCalendarGrid, HbcDrawingViewer
- HbcDataTable enhanced with frozenColumns prop (sticky left, shadow border)
- 8 module config files: scorecards, rfis, punch-list, drawings, budget, daily-log, turnover, documents
- pdfjs-dist added as optional peer dependency for HbcDrawingViewer
- ADR-0026 filed, developer guide created

Phase 4.14.4 (Field Mode Dark Theme) completed: 2026-03-04
- HbcAppShell wrapped in FluentProvider with dynamic theme (isFieldMode ? hbcFieldTheme : hbcLightTheme)
- useFieldMode hook: dynamic <meta name="theme-color"> (Light=#FFFFFF, Field=#0F1419)
- HbcUserMenu dropdown: theme-aware bg/text/border via isFieldMode prop
- FieldMode.stories.tsx: LightMode + FieldMode Storybook stories
- ADR-0027 filed, developer guide: phase-4.14-mobile-pwa-adaptations.md

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
- @hbc/ui-kit finalized at v2.1.0 with full exports map (./theme, ./icons)
- vite.config.ts added for Storybook/analysis; production build remains tsc
- Density tier system: compact/comfortable/touch with auto-detection + localStorage persistence
- Canonical theme hooks: useHbcTheme, useConnectivity, useDensity in @hbc/ui-kit/theme
- 27 per-component reference docs in docs/reference/ui-kit/
- ADR-0030, developer guide: phase-4.16-ui-kit-package.md
- Build: zero errors; Lint: zero errors
Next: Phase 5 (SPFx webparts) or verification

Phase 4.17 completed: 2026-03-04
- Storybook preview: bg corrected to #FAFBFC, WCAG 2.2 AA a11y params, field viewport presets
- All shell + layout stories standardized to 4 required exports (Default, AllVariants, FieldMode, A11yTest)
- CI test-runner: @storybook/test-runner + axe-playwright for automated WCAG 2.2 AA validation
- ADR-0031, developer guide: phase-4.17-storybook-configuration.md
- Build: zero errors; Lint: zero errors

PHASE 4 COMPLETE — Phase 4.18 QA/QC Review: 2026-03-04
- §20 Checklist: ALL items verified and marked [x]
- Gap fixed: ADR-0016 created; ADR numbering mapped (§20 "ADR 0008"=ADR-0016, "ADR 0009"=ADR-0027)
- Final: 37 components, 43 stories, 27 ref docs, 16 ADRs (0016-0031+0032), 26 dev guides
- Deferred to Phase 5+: SPFx Application Customizer, SharePoint list schema, PWA runtime APIs
- ADR-0032: Phase 4 completion QA/QC review
Next: Phase 5 (SPFx Webparts)

Phase 4.19 completed: 2026-03-04 — Full wiring of @hbc/ui-kit HbcAppShell into PWA, dev-harness, and hb-site-control root routes

Phase 4b.0 completed: 2026-03-05 — Prerequisites & Audit Remediation (SS3.1 hard blockers F-001/F-002/F-004/F-005/F-006 resolved)
- 117 build artifacts removed from ui-kit/src/, eslint-plugin-hbc extracted to workspace package, app-shell expanded as PWA facade
- ADR-0034: audit-remediation.md
Next: Phase 4b.1 (Build & Packaging Foundation)
-->