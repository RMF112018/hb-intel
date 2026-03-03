# Phase 2: Shared Packages — Developer Guide

## 2.1 @hbc/models

**Blueprint Reference:** §1a — Domain models & enums
**Foundation Plan Reference:** Phase 2, step 2.1

### Overview

`@hbc/models` is the foundational shared package containing all domain interfaces and enums for the HB Intel platform. It has **zero runtime dependencies** and is consumed by every other package and app in the monorepo.

### Package Location

```
packages/models/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # Root barrel re-export (Option C JSDoc)
    ├── shared/
    │   ├── IPagedResult.ts
    │   ├── ICursorPageResult.ts
    │   ├── IListQueryOptions.ts
    │   ├── types.ts          # SortOrder, DateString, EntityId
    │   ├── constants.ts      # DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
    │   └── index.ts          # Barrel
    ├── leads/                # ILead, ILeadFormData, LeadStage, types, constants
    ├── estimating/           # IEstimatingTracker, IEstimatingKickoff, EstimatingStatus
    ├── schedule/             # IScheduleActivity, IScheduleMetrics, ScheduleActivityStatus
    ├── buyout/               # IBuyoutEntry, IBuyoutSummary, BuyoutStatus
    ├── compliance/           # IComplianceEntry, ComplianceStatus, ComplianceRequirementType
    ├── contracts/            # IContractInfo, ICommitmentApproval, ContractStatus, ApprovalStatus
    ├── risk/                 # IRiskCostItem, IRiskCostManagement, RiskCategory, RiskStatus
    ├── scorecard/            # IGoNoGoScorecard, IScorecardVersion, ScorecardRecommendation
    ├── pmp/                  # IProjectManagementPlan, IPMPSignature, PmpStatus, SignatureStatus
    ├── project/              # IActiveProject, IPortfolioSummary, ProjectStatus
    ├── auth/                 # ICurrentUser, IRole, SystemRole, AuthMode
    └── provisioning/         # IProvisioningStatus, SAGA_STEPS (runtime), type unions
```

Each domain follows a consistent 6-file structure (per ADR-0012):
- `I[Domain].ts` — Main interface(s) with full JSDoc
- `I[Domain]FormData.ts` — Form input interfaces
- `[Domain]Enums.ts` — Domain enums and type unions
- `types.ts` — Domain-specific type aliases (IDs, search criteria)
- `constants.ts` — Labels, defaults, thresholds
- `index.ts` — Pure barrel re-export with `.js` extensions

### Importing Models

From any workspace package or app:

```ts
import { ILead, LeadStage, IPagedResult } from '@hbc/models';
```

Or import a specific domain sub-path:

```ts
import { ILead } from '@hbc/models/leads';
```

### Building

```bash
pnpm turbo run build --filter=@hbc/models
```

### Design Decisions

- **Zero dependencies**: Models are pure TypeScript interfaces/enums with no runtime imports.
- **ESM-only**: `"type": "module"` with `.js` extensions in barrel re-exports for Node ESM resolution.
- **Comprehensive file structure (Option C)**: Each domain has 6 files — interface, FormData, enums, types, constants, barrel. See [ADR-0012](../../architecture/adr/0012-models-comprehensive-structure.md).
- **Full JSDoc**: Every exported type and field has JSDoc documentation.
- **13 domains**: shared, leads, estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp, project, auth, provisioning.
- **Runtime values preserved**: `SAGA_STEPS`, `TOTAL_SAGA_STEPS`, and `LeadStage` use `export` (not `export type`) to ensure runtime accessibility.
- **Zero breaking changes**: All 62+ existing imports resolve identically through re-export chains.

**Reference:** See `docs/reference/models/` for per-domain API documentation.

---

## 2.2 @hbc/data-access

**Blueprint Reference:** §1b — Data access layer (ports/adapters), §2d — Domain-scoped repositories
**Foundation Plan Reference:** Phase 2, step 2.2

### Overview

`@hbc/data-access` implements the ports/adapters (hexagonal architecture) pattern, replacing the monolithic `IDataService` with domain-scoped repository interfaces and swappable adapter implementations. Depends on `@hbc/models`.

As of Phase 2.2, all 11 domains have complete mock adapters, factory functions, a typed error hierarchy, and a `BaseRepository` abstract class. The package exports 11 port interfaces, 11 mock classes, 11 factory functions, 4 error types, and shared infrastructure.

### Package Location

```
packages/data-access/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                        # Root barrel (ports, errors, mocks, factory, BaseRepository)
    ├── factory.ts                      # Mode-aware adapter factory (11 create functions)
    ├── errors/
    │   └── index.ts                    # HbcDataAccessError, NotFoundError, ValidationError, etc.
    ├── ports/
    │   ├── index.ts                    # Barrel re-export of all 11 port interfaces
    │   ├── ILeadRepository.ts          # getAll, getById, create, update, delete, search
    │   ├── IEstimatingRepository.ts    # getAllTrackers, getKickoff, createKickoff
    │   ├── IScheduleRepository.ts      # getActivities, getMetrics
    │   ├── IBuyoutRepository.ts        # getEntries, getSummary
    │   ├── IComplianceRepository.ts    # getEntries, getSummary
    │   ├── IContractRepository.ts      # getContracts, getApprovals
    │   ├── IRiskRepository.ts          # getItems, getManagement
    │   ├── IScorecardRepository.ts     # getScorecards, getVersions
    │   ├── IPmpRepository.ts           # getPlans, getSignatures
    │   ├── IProjectRepository.ts       # getProjects, getPortfolioSummary
    │   └── IAuthRepository.ts          # getCurrentUser, getRoles
    └── adapters/
        ├── base.ts                     # BaseRepository<T> abstract class
        ├── mock/
        │   ├── index.ts               # Barrel: all 11 Mock classes + helpers + seedData
        │   ├── helpers.ts             # paginate(), genId(), resetId()
        │   ├── seedData.ts            # Seed data constants (11 domains)
        │   ├── types.ts               # MockAdapterConfig
        │   ├── constants.ts           # MOCK_DEFAULT_PAGE_SIZE, MOCK_DELAY_MS
        │   ├── MockLeadRepository.ts
        │   ├── MockEstimatingRepository.ts
        │   ├── MockScheduleRepository.ts
        │   ├── MockBuyoutRepository.ts
        │   ├── MockComplianceRepository.ts
        │   ├── MockContractRepository.ts
        │   ├── MockRiskRepository.ts
        │   ├── MockScorecardRepository.ts
        │   ├── MockPmpRepository.ts
        │   ├── MockProjectRepository.ts
        │   └── MockAuthRepository.ts
        ├── sharepoint/
        │   ├── index.ts               # Stub barrel + re-exports (Phase 5)
        │   ├── types.ts               # SharePointConfig, SharePointAdapterOptions
        │   └── constants.ts           # DEFAULT_BATCH_SIZE, SHAREPOINT_LIST_NAMES
        ├── proxy/
        │   ├── index.ts               # Stub barrel + re-exports (Phase 4)
        │   ├── types.ts               # ProxyConfig
        │   └── constants.ts           # DEFAULT_TIMEOUT_MS, DEFAULT_RETRY_COUNT
        └── api/
            ├── index.ts               # Stub barrel + re-exports (Phase 7+)
            ├── types.ts               # ApiConfig
            └── constants.ts           # DEFAULT_API_VERSION
```

### Importing

```ts
// Port types
import type { ILeadRepository } from '@hbc/data-access';

// Factory (creates adapter based on runtime mode)
import { createLeadRepository, createProjectRepository } from '@hbc/data-access';
const repo = createLeadRepository(); // defaults to 'mock'

// Direct mock import for tests
import { MockLeadRepository } from '@hbc/data-access';

// Error handling
import { NotFoundError, AdapterNotImplementedError } from '@hbc/data-access';

// Base class for custom adapters
import { BaseRepository } from '@hbc/data-access';
```

### Factory Modes

Set `HBC_ADAPTER_MODE` environment variable to switch adapters:

| Value | Context | Status |
|-------|---------|--------|
| `mock` (default) | Dev-harness, unit tests | Implemented (all 11 domains) |
| `sharepoint` | SPFx webparts | Stub |
| `proxy` | PWA via Azure Functions | Stub |
| `api` | REST API / Azure SQL | Stub |

### Building

```bash
pnpm turbo run build --filter=@hbc/data-access
```

### Related Documentation

- [ADR-0002: Ports/Adapters for Data Access](../../architecture/adr/0002-ports-adapters-data-access.md)
- [ADR-0013: Data Access Comprehensive Rebuild](../../architecture/adr/0013-data-access-comprehensive-rebuild.md)
- [Ports & Adapters Architecture (Explanation)](../../explanation/ports-adapters-architecture.md)
- [Data Access Ports API Reference](../../reference/api/data-access-ports.md)
- [Data Access Adapters API Reference](../../reference/api/data-access-adapters.md)

---

## 2.3 @hbc/query-hooks

**Blueprint Reference:** §1c — TanStack Query hooks per domain, §2g — Query key factory
**Foundation Plan Reference:** Phase 2, step 2.3

### Overview

`@hbc/query-hooks` is the TanStack Query v5 wrapper layer that sits between the UI and the data-access repositories. It provides caching, mutations, and server state management via React hooks. Depends on `@hbc/data-access` and `@hbc/models`.

### Package Location

```
packages/query-hooks/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # Barrel re-export of all hooks + keys + defaults
    ├── keys.ts           # Centralized query key factory (§2g)
    ├── defaults.ts       # Default staleTime/gcTime/retry options
    ├── leads/index.ts    # useLeads, useLeadById, useCreateLead, useUpdateLead, useDeleteLead, useSearchLeads
    ├── schedule/index.ts # useScheduleActivities, useScheduleMetrics, CRUD mutations
    ├── buyout/index.ts   # useBuyoutLog, useBuyoutSummary, CRUD mutations
    ├── scorecard/index.ts# useScorecards, useSubmitDecision, useScorecardVersions
    └── project/index.ts  # useActiveProjects, useProjectDashboard, CRUD mutations
```

### Importing

```ts
// Individual hooks
import { useLeads, useCreateLead } from '@hbc/query-hooks';

// Query key factory (for manual invalidation)
import { queryKeys } from '@hbc/query-hooks';

// Default options (for QueryClientProvider config)
import { defaultQueryOptions } from '@hbc/query-hooks';
```

### Query Key Factory (§2g)

All cache keys are centralized in `keys.ts` using `as const` for type safety:

```ts
queryKeys.leads.all          // ['leads']
queryKeys.leads.detail(42)   // ['leads', 'detail', 42]
queryKeys.schedule.metrics('PRJ-A1B2C3')  // ['schedule', 'metrics', 'PRJ-A1B2C3']
```

Mutations automatically invalidate the parent key (e.g., `queryKeys.leads.all`) on success.

### Default Cache Options

| Option | Value | Purpose |
|--------|-------|---------|
| `staleTime` | 5 min (300,000 ms) | Data considered fresh; no background refetch |
| `gcTime` | 10 min (600,000 ms) | Unused cache entries garbage-collected |
| `retry` | 2 (queries), 0 (mutations) | Automatic retry on query failure |
| `refetchOnWindowFocus` | `false` | No surprise refetches on tab switch |

### Repository Resolution

Each hook module creates its repository via the `create*Repository()` factory from `@hbc/data-access`. The factory auto-resolves adapter mode (`mock`/`sharepoint`/`proxy`/`api`) so hooks are runtime-context-agnostic.

**Note:** Scorecard and project hooks use type-safe placeholders until their factory functions are exported from `@hbc/data-access` in a later phase. The hooks compile and cache keys are established; they will throw at runtime if called before the adapters are wired.

### Building

```bash
pnpm turbo run build --filter=@hbc/query-hooks
```

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| `@hbc/data-access` | runtime | Repository factories |
| `@hbc/models` | runtime | Domain type imports |
| `@tanstack/react-query` | runtime | Query/mutation hooks |
| `react` | peer | React context for hooks |
| `@types/react` | dev | Type checking |

---

## 2.4 @hbc/auth

**Blueprint Reference:** §1e — Dual-mode auth & permissions, §2b — Authentication dual-mode locked, §2e — Zustand stores
**Foundation Plan Reference:** Phase 2, step 2.4

### Overview

`@hbc/auth` provides dual-mode authentication and authorization for both the PWA (MSAL) and SPFx (SharePoint context) deployment modes. It uses Zustand exclusively (no React Context) for auth state management, exposes React guard components for declarative access control, and includes convenience hooks for permission/feature-flag checks. Depends on `@hbc/models`.

### Package Location

```
packages/auth/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # Barrel re-export of all modules
    ├── stores/
    │   ├── index.ts          # Barrel for stores
    │   ├── authStore.ts      # useAuthStore (currentUser, isLoading, error)
    │   └── permissionStore.ts# usePermissionStore (permissions[], featureFlags{})
    ├── guards/
    │   ├── index.ts          # Barrel for guards
    │   ├── RoleGate.tsx      # Role-based access gate
    │   ├── FeatureGate.tsx   # Feature-flag gate
    │   └── PermissionGate.tsx# Permission-action gate
    ├── hooks/
    │   └── index.ts          # useCurrentUser, usePermission, useFeatureFlag
    └── adapters/
        └── index.ts          # AuthMode, resolveAuthMode, MSAL/SPFx stubs
```

### Importing

```ts
// Stores (Zustand — §2e)
import { useAuthStore, usePermissionStore } from '@hbc/auth';

// Guard components (§1e)
import { RoleGate, FeatureGate, PermissionGate } from '@hbc/auth';

// Convenience hooks
import { useCurrentUser, usePermission, useFeatureFlag } from '@hbc/auth';

// Dual-mode adapter utilities (§2b)
import { resolveAuthMode } from '@hbc/auth';
import type { AuthMode, IMsalConfig } from '@hbc/auth';
```

### Zustand Stores (§2e)

**`useAuthStore`** — manages the authenticated user state:

| Selector / Action | Type | Purpose |
|-------------------|------|---------|
| `currentUser` | `ICurrentUser \| null` | Currently authenticated user |
| `isLoading` | `boolean` | Auth initialization in progress |
| `error` | `string \| null` | Last auth error message |
| `setUser(user)` | action | Set user (clears error) |
| `setLoading(flag)` | action | Set loading state |
| `setError(msg)` | action | Set error (stops loading) |
| `clear()` | action | Reset all state |

**`usePermissionStore`** — manages permissions and feature flags:

| Selector / Action | Type | Purpose |
|-------------------|------|---------|
| `permissions` | `string[]` | Active permission action strings |
| `featureFlags` | `Record<string, boolean>` | Feature flag map |
| `hasPermission(action)` | derived | Check if action is in permissions |
| `hasFeatureFlag(feature)` | derived | Check if flag is enabled |
| `setPermissions(list)` | action | Replace permissions array |
| `setFeatureFlags(flags)` | action | Replace feature flags map |
| `clear()` | action | Reset all state |

### Guard Components (§1e)

All guards accept `children` and an optional `fallback` prop:

```tsx
<RoleGate requiredRole="admin">
  <AdminPanel />
</RoleGate>

<FeatureGate feature="dark-mode">
  <ThemeToggle />
</FeatureGate>

<PermissionGate action="project:create">
  <NewProjectButton />
</PermissionGate>
```

### Dual-Mode Auth (§2b)

`resolveAuthMode()` auto-detects the runtime context:

| Mode | Detection | Status |
|------|-----------|--------|
| `spfx` | `_spPageContextInfo` or `__spfxContext` on globalThis | Stub (Phase 5) |
| `msal` | `HBC_AUTH_MODE=msal` env var | Stub (Phase 4) |
| `mock` (default) | Fallback | Active |

`extractSpfxUser()` and `initMsalAuth()` are stubs that throw until wired in Phase 5 and Phase 4 respectively.

### Building

```bash
pnpm turbo run build --filter=@hbc/auth
```

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| `@hbc/models` | runtime | ICurrentUser, IRole types |
| `zustand` | runtime | State management (§2e) |
| `@azure/msal-browser` | optional | MSAL auth for PWA (Phase 4) |
| `@azure/msal-react` | optional | MSAL React bindings (Phase 4) |
| `react` | peer | React components and hooks |
| `@types/react` | dev | Type checking |

---

## 2.5 @hbc/shell

**Blueprint Reference:** §1f — Shell package structure, §2c — Procore-aligned navigation, §2e — Zustand stores
**Foundation Plan Reference:** Phase 2, step 2.5

### Overview

`@hbc/shell` provides the Procore-inspired application shell with Zustand navigation stores, structural React components, and dual-mode support (full PWA vs simplified SPFx). It depends on `@hbc/models` and `@hbc/auth`.

### Package Location

```
packages/shell/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts               # Barrel re-export of all modules
    ├── types.ts               # WorkspaceId, WORKSPACE_IDS, ToolPickerItem, SidebarItem, WorkspaceDescriptor
    ├── stores/
    │   ├── index.ts           # Barrel for stores
    │   ├── projectStore.ts    # useProjectStore (activeProject, availableProjects)
    │   └── navStore.ts        # useNavStore (activeWorkspace, toolPickerItems, sidebarItems)
    ├── HeaderBar/index.tsx     # 3-section header: left + center tool-picker + right
    ├── AppLauncher/index.tsx   # M365 waffle button + 14-workspace grid panel
    ├── ProjectPicker/index.tsx # Project selector dropdown
    ├── BackToProjectHub/index.tsx  # "Back to the Project Hub {name}" link
    ├── ContextualSidebar/index.tsx # Tool-specific sidebar nav
    └── ShellLayout/index.tsx  # Root orchestrator: header + sidebar + main content
```

### Importing

```ts
// Types
import type { WorkspaceId, ToolPickerItem, SidebarItem } from '@hbc/shell';
import { WORKSPACE_IDS } from '@hbc/shell';

// Stores (Zustand — §2e)
import { useProjectStore, useNavStore } from '@hbc/shell';

// Components (§1f, §2c)
import { ShellLayout, HeaderBar, AppLauncher, ProjectPicker } from '@hbc/shell';
```

### Zustand Stores (§2e)

**`useProjectStore`** — manages active project context:

| Selector / Action | Type | Purpose |
|-------------------|------|---------|
| `activeProject` | `IActiveProject \| null` | Currently selected project |
| `availableProjects` | `IActiveProject[]` | All projects available to user |
| `isLoading` | `boolean` | Project loading state |
| `setActiveProject(p)` | action | Set active project |
| `setAvailableProjects(list)` | action | Set available projects |
| `clear()` | action | Reset all state |

**`useNavStore`** — manages navigation state:

| Selector / Action | Type | Purpose |
|-------------------|------|---------|
| `activeWorkspace` | `WorkspaceId \| null` | Currently active workspace |
| `toolPickerItems` | `ToolPickerItem[]` | Center header tool items |
| `sidebarItems` | `SidebarItem[]` | Sidebar navigation items |
| `isSidebarOpen` | `boolean` | Sidebar visibility |
| `isAppLauncherOpen` | `boolean` | App launcher panel visibility |
| `setActiveWorkspace(ws)` | action | Set workspace (atomically clears items) |
| `toggleSidebar()` | action | Toggle sidebar |
| `toggleAppLauncher()` | action | Toggle app launcher |

### Dual-Mode Shell (§2c)

`ShellLayout` accepts a `mode` prop:

| Mode | Context | Behavior |
|------|---------|----------|
| `full` (default) | PWA | Full shell with ProjectPicker, AppLauncher, BackToProjectHub |
| `simplified` | SPFx / HB Site Control | Unmounts ProjectPicker + AppLauncher entirely (tree-shaken from bundle) |

### Navigation Rules (§2c)

1. `ProjectPicker` — rendered only when `mode === 'full' && activeWorkspace === 'project-hub'`
2. `BackToProjectHub` — rendered when `mode === 'full' && activeWorkspace !== 'project-hub'`
3. `AppLauncher` — rendered only when `mode === 'full'`
4. `ContextualSidebar` — conditional on navStore items or sidebarSlot prop

### Building

```bash
pnpm turbo run build --filter=@hbc/shell
```

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| `@hbc/models` | runtime | IActiveProject type |
| `@hbc/auth` | runtime | Auth integration |
| `zustand` | runtime | State management (§2e) |
| `react` | peer | React components |
| `@types/react` | dev | Type checking |

### Related Documentation

- [ADR-0003: Shell Navigation with Zustand](../../architecture/adr/0003-shell-navigation-zustand.md)

---

## 2.6 @hbc/ui-kit (HB Intel Design System)

**Blueprint Reference:** §1d — ui-kit (Enhanced – Critical for Leadership Pitch & Brand Recognition)
**Foundation Plan Reference:** Phase 2, step 2.6

### Overview

`@hbc/ui-kit` is the shared component library implementing the HB Intel Design System. Built on heavily customized Fluent UI v9 + Griffel, it provides a signature color palette, typography scale, elevation system, animations, and 8 Blueprint components. The design system ensures HB Intel is instantly recognizable as a premium construction-technology platform.

### Package Location

```
packages/ui-kit/
├── package.json
├── tsconfig.json
├── .storybook/
│   ├── main.ts             # Storybook 8 config (react-vite, addon-essentials, addon-a11y)
│   └── preview.tsx          # FluentProvider decorator with hbcLightTheme
└── src/
    ├── index.ts             # Package barrel
    ├── assets/logos/         # HB brand logos (hb_icon_blueBG.jpg, hb_logo_icon-NoBG.svg)
    ├── theme/
    │   ├── tokens.ts        # BrandVariants ramp, HBC_PRIMARY_BLUE, HBC_ACCENT_ORANGE, semantic colors
    │   ├── theme.ts         # hbcLightTheme + hbcDarkTheme
    │   ├── animations.ts    # Griffel keyframes + transition presets
    │   ├── typography.ts    # Signature type scale (displayHero → caption + monospace)
    │   ├── elevation.ts     # 5-level shadow system
    │   └── index.ts         # Theme barrel
    ├── HbcStatusBadge/      # Status variant → semantic color mapping
    ├── HbcEmptyState/       # Centered layout with fadeIn + slideInUp entrance
    ├── HbcErrorBoundary/    # React class error boundary with retry
    ├── HbcForm/             # HbcTextField, HbcSelect, HbcCheckbox, HbcFormLayout
    ├── HbcPanel/            # Fluent v9 OverlayDrawer wrapper (sm/md/lg)
    ├── HbcCommandBar/       # Toolbar with SearchBox + filters + actions
    ├── HbcDataTable/        # @tanstack/react-table + react-virtual (10k+ rows)
    └── HbcChart/            # React.lazy ECharts wrapper (~800KB lazy-loaded)
```

### Importing

```ts
// Theme
import { hbcLightTheme, hbcDarkTheme, HBC_PRIMARY_BLUE, HBC_ACCENT_ORANGE } from '@hbc/ui-kit';
import type { HbcTheme } from '@hbc/ui-kit';

// Components
import { HbcDataTable, HbcChart, HbcStatusBadge, HbcPanel } from '@hbc/ui-kit';
import { HbcTextField, HbcSelect, HbcCheckbox, HbcFormLayout } from '@hbc/ui-kit';
import { HbcCommandBar, HbcEmptyState, HbcErrorBoundary } from '@hbc/ui-kit';

// Theme utilities
import { hbcTypeScale, hbcElevation, useAnimationStyles } from '@hbc/ui-kit';
```

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| HB Blue Primary | `#004B87` | Dominant brand, BrandVariants shade 80, headers |
| HB Orange Accent | `#F37021` | CTAs, active states, highlights |

The `hbcBrandRamp` provides 16 shades (10→160) interpolated from `#004B87` for the full Fluent theme gradient.

### Component Patterns

- All components use Griffel `makeStyles` with theme tokens — no raw CSS or inline styles
- Props interfaces in separate `types.ts` files for clean re-exports
- Controlled component pattern (value/onChange) — no internal form state
- `data-hbc-ui="*"` attributes on root elements as styling hooks
- HbcDataTable uses `@tanstack/react-virtual` for 10,000+ row virtualization
- HbcChart lazy-loads ECharts (~800KB) via `React.lazy` + `Suspense`

### Building

```bash
pnpm turbo run build --filter=@hbc/ui-kit
```

### Running Storybook

```bash
cd packages/ui-kit && pnpm storybook
```

Note: Individual `.stories.tsx` files are created in Phase 3 (dev-harness). Storybook config is bootstrapped here.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| `@fluentui/react-components` | runtime | Fluent UI v9 base components |
| `@griffel/react` | runtime | Atomic CSS-in-JS styling |
| `@tanstack/react-table` | runtime | Table state management |
| `@tanstack/react-virtual` | runtime | Virtualized row rendering |
| `echarts` | runtime | Chart rendering engine |
| `echarts-for-react` | runtime | React ECharts bindings |
| `react`, `react-dom` | peer | React runtime |
| `@storybook/react-vite` | dev | Storybook framework |
| `@storybook/addon-essentials` | dev | Storybook core addons |
| `@storybook/addon-a11y` | dev | WCAG accessibility testing |
| `vite` | dev | Storybook build tool |

### Related Documentation

- [ADR-0004: UI Kit Design System](../../architecture/adr/0004-ui-kit-design-system.md)
