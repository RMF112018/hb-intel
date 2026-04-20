# PH7-BW-0 — Shared Feature Package: packages/features/[domain]/ Pattern

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §1 (monorepo structure), §2d (ports/adapters), §2f (TanStack Router per app)
**Date:** 2026-03-07
**Priority:** HIGH — Architectural decision that must be locked before any feature page is written
**Depends on:** Nothing (pre-requisite; defines the target before any BW-1 through BW-11 feature work)
**Blocks:** All domain feature plan implementation (PH7-BD-*, PH7-ProjectHub-*, PH7-Accounting-*, etc.)

---

## Decision: Lock This Before Writing Any Feature Pages

> **Locked decision:** All assembled feature page components live in `packages/features/[domain]/`. App directories (`apps/pwa/` and `apps/[domain]/`) contain only routing configuration, entry points, and app-specific bootstrapping. No feature page component is ever written directly into an app directory.

This document formalizes that decision, specifies the package structure, and defines the exact pattern that every domain feature plan must follow. Writing any feature page in `apps/pwa/src/pages/` or `apps/estimating/src/pages/` before this pattern is adopted creates duplication debt that grows with every domain.

---

## The Problem Being Solved

Without a shared feature package, Estimating's `ProjectSetupPage.tsx` would need to exist in two places:

```
apps/pwa/src/pages/estimating/ProjectSetupPage.tsx        ← PWA version
apps/estimating/src/pages/ProjectSetupPage.tsx            ← SPFx version
```

These two files would call the same `useEstimatingTracker()` hook, render the same `HbcDataTable`, and produce the same UI. The only differences — routing context, shell mode, auth adapter — are already handled by the shared packages. Writing the component twice is pure maintenance burden.

The shared packages already handle environment differences below the page level:

| Layer | Handled by | Environment-aware? |
|---|---|---|
| Domain models | `@hbc/models` | No (pure types) |
| Data adapters | `@hbc/data-access` factory | Yes (swaps per mode) |
| Query hooks | `@hbc/query-hooks` | No (calls adapters) |
| UI components | `@hbc/ui-kit` | No (pure presentation) |
| Auth / permissions | `@hbc/auth` | Yes (dual-mode) |
| Shell layout | `@hbc/shell` | Yes (full vs. simplified) |
| **Page components** | **`@hbc/features/[domain]`** ← **new** | **No (environment-agnostic)** |
| Routing / entry | `apps/[app]/src/router/` | Yes (per-app) |

---

## Target Monorepo Structure

```
packages/
  features/
    estimating/
      src/
        ProjectSetupPage.tsx
        BidsPage.tsx
        TemplatesPage.tsx
        RequestDetailPage.tsx
        NewRequestPage.tsx
        index.ts                   ← barrel export of all pages
      package.json                 ← { "name": "@hbc/features-estimating" }
      tsconfig.json

    accounting/
      src/
        OverviewPage.tsx
        ProvisioningForm.tsx        ← Save + Provision Site (MVP critical)
        InvoicesPage.tsx
        BudgetsPage.tsx
        index.ts
      package.json                 ← { "name": "@hbc/features-accounting" }
      tsconfig.json

    project-hub/
      src/
        DashboardPage.tsx
        PreconstructionPage.tsx
        DocumentsPage.tsx
        TeamPage.tsx
        FinancialForecastingPage.tsx
        # ... (all 16 ProjectHub pages)
        index.ts
      package.json                 ← { "name": "@hbc/features-project-hub" }
      tsconfig.json

    business-development/
    leadership/
    admin/
    safety/
    quality-control-warranty/
    risk-management/
    operational-excellence/
    human-resources/
```

---

## Package Naming Convention

| Domain | Package Name |
|---|---|
| estimating | `@hbc/features-estimating` |
| accounting | `@hbc/features-accounting` |
| project-hub | `@hbc/features-project-hub` |
| business-development | `@hbc/features-business-development` |
| leadership | `@hbc/features-leadership` |
| admin | `@hbc/features-admin` |
| safety | `@hbc/features-safety` |
| quality-control-warranty | `@hbc/features-quality-control-warranty` |
| risk-management | `@hbc/features-risk-management` |
| operational-excellence | `@hbc/features-operational-excellence` |
| human-resources | `@hbc/features-human-resources` |

---

## Feature Package Anatomy

### package.json (estimating example)

```json
{
  "name": "@hbc/features-estimating",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@hbc/models": "workspace:*",
    "@hbc/query-hooks": "workspace:*",
    "@hbc/ui-kit": "workspace:*",
    "@hbc/auth": "workspace:*",
    "@hbc/shell": "workspace:*"
  }
}
```

**Key rules:**
- Feature packages depend on `@hbc/query-hooks` and `@hbc/ui-kit` — never on `@hbc/data-access` directly (that's the query hooks layer's job)
- Feature packages **do not** depend on other feature packages (no cross-domain page imports)
- Feature packages **do not** depend on any `apps/*` package
- Feature packages are `private: true` — not published externally

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "references": [
    { "path": "../../packages/models" },
    { "path": "../../packages/query-hooks" },
    { "path": "../../packages/ui-kit" },
    { "path": "../../packages/auth" },
    { "path": "../../packages/shell" }
  ]
}
```

### index.ts (barrel export)

```typescript
// packages/features/estimating/src/index.ts
export { ProjectSetupPage } from './ProjectSetupPage.js';
export { BidsPage } from './BidsPage.js';
export { TemplatesPage } from './TemplatesPage.js';
export { RequestDetailPage } from './RequestDetailPage.js';
export { NewRequestPage } from './NewRequestPage.js';
```

---

## What a Feature Page Component Looks Like

A feature page component is **environment-agnostic**. It does not know or care whether it is running in the PWA or in an SPFx webpart. It receives data from query hooks, renders using ui-kit components, and enforces access control via auth guards.

```typescript
// packages/features/estimating/src/ProjectSetupPage.tsx

import { useEstimatingProjectSetup } from '@hbc/query-hooks';
import { useHasPermission } from '@hbc/auth';
import {
  HbcDataTable,
  HbcStatusBadge,
  HbcCommandBar,
  HbcEmptyState,
  ToolLandingLayout,
} from '@hbc/ui-kit';
import { ProvisioningStatusChecklist } from './components/ProvisioningStatusChecklist.js';

export function ProjectSetupPage(): React.ReactNode {
  const canWrite = useHasPermission('estimating:write');
  const { data, isLoading, error } = useEstimatingProjectSetup();

  if (isLoading) return <HbcDataTable.Shimmer />;
  if (error) return <HbcEmptyState variant="error" message="Failed to load project setup data." />;

  return (
    <ToolLandingLayout
      title="Estimating Project Setup"
      commandBar={
        canWrite && (
          <HbcCommandBar>
            <HbcCommandBar.NewButton label="New Request" />
          </HbcCommandBar>
        )
      }
    >
      {/* Real-time provisioning checklist — displayed when provisioning is active */}
      <ProvisioningStatusChecklist />
      <HbcDataTable
        data={data ?? []}
        columns={PROJECT_SETUP_COLUMNS}
      />
    </ToolLandingLayout>
  );
}
```

No mention of `ShellLayout`, no `createMemoryHistory`, no `bootstrapSpfxAuth`. Pure feature logic.

---

## How Apps Consume Feature Packages

### SPFx Webpart App (apps/estimating/)

The app's `pages/` directory becomes thin re-exports:

```typescript
// apps/estimating/src/pages/ProjectSetupPage.ts
// Re-export from shared feature package — no implementation here
export { ProjectSetupPage } from '@hbc/features-estimating';
```

Or the routes file imports directly (skipping the re-export entirely):

```typescript
// apps/estimating/src/router/routes.ts
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './root-route.js';

const projectSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup',
  component: lazyRouteComponent(
    () => import('@hbc/features-estimating').then((m) => ({ default: m.ProjectSetupPage })),
  ),
});

const bidsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bids',
  component: lazyRouteComponent(
    () => import('@hbc/features-estimating').then((m) => ({ default: m.BidsPage })),
  ),
});

export const webpartRoutes = [projectSetupRoute, bidsRoute, /* ... */];
```

The app's `src/pages/` directory may be **removed entirely** or kept only for any SPFx-specific page overrides (see §SPFx-Specific Overrides below).

### PWA App (apps/pwa/)

```typescript
// apps/pwa/src/router/estimating-routes.ts
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { estimatingRootRoute } from './estimating-root-route.js';

export const estimatingRoutes = [
  createRoute({
    getParentRoute: () => estimatingRootRoute,
    path: '/estimating/project-setup',
    component: lazyRouteComponent(
      () => import('@hbc/features-estimating').then((m) => ({ default: m.ProjectSetupPage })),
    ),
  }),
  createRoute({
    getParentRoute: () => estimatingRootRoute,
    path: '/estimating/bids',
    component: lazyRouteComponent(
      () => import('@hbc/features-estimating').then((m) => ({ default: m.BidsPage })),
    ),
  }),
  // ...
];
```

The PWA simply registers the same pages at longer URL paths (`/estimating/project-setup` instead of `/project-setup`).

---

## Handling SPFx-Specific Page Overrides

The vast majority of pages will be identical between PWA and SPFx. For the rare case where a page needs environment-specific behavior (e.g., a button that navigates to a different URL, or a field that only makes sense in one context), use a **composition override** rather than forking the page:

```typescript
// packages/features/estimating/src/ProjectSetupPage.tsx

interface ProjectSetupPageProps {
  /** Override the "View in Project Hub" link behavior */
  onNavigateToProjectHub?: (projectId: string) => void;
}

export function ProjectSetupPage({ onNavigateToProjectHub }: ProjectSetupPageProps): React.ReactNode {
  // Default behavior: use TanStack Router navigation (works in PWA)
  const navigate = useNavigate();
  const handleNavigate = onNavigateToProjectHub
    ?? ((id) => navigate({ to: '/project-hub', search: { projectId: id } }));

  // ...
}
```

The SPFx app passes a prop override:
```typescript
// apps/estimating/src/router/routes.ts
component: () => (
  <ProjectSetupPage
    onNavigateToProjectHub={(id) => {
      // In SPFx: navigate to the Project Hub SharePoint site directly
      window.location.href = `https://[tenant].sharepoint.com/sites/project-hub?projectId=${id}`;
    }}
  />
),
```

The PWA uses the default behavior (no prop needed). The page component itself is never forked.

---

## Migration Plan for Existing Stub Pages

All 11 webpart apps currently have stub pages directly in `apps/[domain]/src/pages/`. These need to migrate to the feature packages as each domain's feature work begins.

**Process per domain (execute at start of that domain's feature plan):**

1. Create `packages/features/[domain]/src/` and `package.json`
2. Move stub page files from `apps/[domain]/src/pages/` into `packages/features/[domain]/src/`
3. Update `apps/[domain]/src/router/routes.ts` to import from `@hbc/features-[domain]`
4. Delete `apps/[domain]/src/pages/` directory (or keep as empty placeholder with comment)
5. Add `@hbc/features-[domain]` dependency to `apps/pwa/package.json`
6. Register feature routes in `apps/pwa/src/router/`

**Migration tracking:**

| Domain | Stub Pages Exist In | Feature Package Created | PWA Wired |
|---|---|---|---|
| project-hub | `apps/project-hub/src/pages/` (4 files) | ❌ | ❌ |
| accounting | `apps/accounting/src/pages/` (3 files) | ❌ | ❌ |
| estimating | `apps/estimating/src/pages/` (5 files) | ❌ | ❌ |
| business-development | `apps/business-development/src/pages/` (2 files) | ❌ | ❌ |
| leadership | `apps/leadership/src/pages/` (2 files) | ❌ | ❌ |
| admin | `apps/admin/src/pages/` (3 files) | ❌ | ❌ |
| safety | `apps/safety/src/pages/` | ❌ | ❌ |
| quality-control-warranty | `apps/quality-control-warranty/src/pages/` | ❌ | ❌ |
| risk-management | `apps/risk-management/src/pages/` | ❌ | ❌ |
| operational-excellence | `apps/operational-excellence/src/pages/` | ❌ | ❌ |
| human-resources | `apps/human-resources/src/pages/` | ❌ | ❌ |

---

## pnpm-workspace.yaml Update

Add the features directory to workspace definitions:

```yaml
packages:
  - 'packages/*'
  - 'packages/features/*'   ← ADD THIS
  - 'apps/*'
  - 'backend/functions'
```

---

## Vite Alias Update (All Apps)

Every app's `vite.config.ts` (created in BW-4) must include aliases for feature packages. Add to the shared alias block in `tools/vitest-webpart.config.ts` and each `vite.config.ts`:

```typescript
// Add to every app's vite.config.ts resolve.alias block:
'@hbc/features-estimating': resolve(__dirname, '../../packages/features/estimating/src/index.ts'),
'@hbc/features-accounting': resolve(__dirname, '../../packages/features/accounting/src/index.ts'),
'@hbc/features-project-hub': resolve(__dirname, '../../packages/features/project-hub/src/index.ts'),
'@hbc/features-business-development': resolve(__dirname, '../../packages/features/business-development/src/index.ts'),
'@hbc/features-leadership': resolve(__dirname, '../../packages/features/leadership/src/index.ts'),
'@hbc/features-admin': resolve(__dirname, '../../packages/features/admin/src/index.ts'),
'@hbc/features-safety': resolve(__dirname, '../../packages/features/safety/src/index.ts'),
'@hbc/features-quality-control-warranty': resolve(__dirname, '../../packages/features/quality-control-warranty/src/index.ts'),
'@hbc/features-risk-management': resolve(__dirname, '../../packages/features/risk-management/src/index.ts'),
'@hbc/features-operational-excellence': resolve(__dirname, '../../packages/features/operational-excellence/src/index.ts'),
'@hbc/features-human-resources': resolve(__dirname, '../../packages/features/human-resources/src/index.ts'),
```

---

## Bundle Impact Analysis

Feature package code is not pre-bundled. Vite resolves `@hbc/features-estimating` as a source alias and tree-shakes it at build time per app. This means:

- `apps/estimating/vite.config.ts` builds only the Estimating feature pages + their shared deps
- `apps/pwa/vite.config.ts` builds all 11 feature packages + the full shell (but code-splits per route)
- **No feature package adds any bundle overhead** beyond what would be present if the code lived directly in the app directory
- The SPFx bundle budget (< 1 MB from BW-4) is not affected — Vite sees through the alias

---

## ADR Reference

This decision should be recorded in an Architecture Decision Record:

```
docs/architecture/adr/0013-shared-feature-packages.md
```

Key content:
- **Status:** Accepted
- **Context:** Two deployment targets (PWA + SPFx) per domain; avoiding duplication of page components
- **Decision:** Feature page components live in `packages/features/[domain]/`; apps contain only routing and entry points
- **Consequences:** Single source of truth for feature UI; SPFx-specific behavior via props overrides, not file forks; all domain feature plans must target `packages/features/` as their output directory

---

## Enforcement Rules (Mandatory for All Feature Plans)

These rules apply to every domain feature plan (PH7-BD-*, PH7-ProjectHub-*, PH7-Accounting-*, etc.):

1. **Never create a page component in `apps/*/src/pages/`** — move any existing stubs to `packages/features/[domain]/src/` at the start of each domain's feature plan
2. **Never import from another domain's feature package** — cross-domain data goes through `@hbc/query-hooks` only
3. **Never import from `apps/*` in a feature package** — dependency direction is always `apps/` → `packages/`, never reversed
4. **Never use `window.location.href` directly in a feature component** — use a prop callback for environment-specific navigation, or `useNavigate()` from TanStack Router for same-app navigation
5. **Never reference `ShellLayout`, `createMemoryHistory`, or `bootstrapSpfxAuth` in a feature package** — those belong to the app layer

---

## Verification

```bash
# After creating the first feature package (accounting, first by MVP priority):
ls packages/features/accounting/src/

# Verify the workspace resolves the new package
pnpm --filter="@hbc/features-accounting" exec tsc --noEmit

# Verify apps/accounting imports from package (not local pages/)
grep -rn "from '@hbc/features-accounting'" apps/accounting/src/router/routes.ts
# Expected: match found

# Verify no page components remain in apps/accounting/src/pages/
ls apps/accounting/src/pages/ 2>/dev/null && echo "WARN: pages/ still has content" || echo "OK: pages/ empty or removed"

# Verify apps/pwa also imports from the shared package
grep -rn "features-accounting" apps/pwa/src/router/
# Expected: match found (after PWA routing is wired)

# Check cross-domain import rule is not violated
grep -rn "features-estimating" packages/features/accounting/
# Expected: no output (accounting must not import estimating)
```

---

## Definition of Done

- [ ] `packages/features/` directory created and added to `pnpm-workspace.yaml`
- [ ] `packages/features/accounting/` scaffolded with `package.json`, `tsconfig.json`, `src/index.ts` (first, per MVP priority)
- [ ] Remaining 10 domain feature package directories scaffolded (empty `package.json` + `tsconfig.json`) to lock names before feature work begins
- [ ] All app `vite.config.ts` files updated with `@hbc/features-*` aliases
- [ ] `tools/vitest-webpart.config.ts` updated with `@hbc/features-*` aliases
- [ ] ADR created at `docs/architecture/adr/0013-shared-feature-packages.md`
- [ ] This decision referenced in the header of every domain feature plan file
- [ ] `pnpm install` resolves all 11 feature package workspace dependencies without errors
- [ ] TypeScript project references updated in `tsconfig.base.json` or root `tsconfig.json` to include `packages/features/*`

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-BW-0 completed: 2026-03-07
All 11 feature packages scaffolded: packages/features/[domain]/ with package.json, tsconfig.json, src/index.ts
pnpm-workspace.yaml updated with "packages/features/*" glob
tsconfig.base.json updated with 22 path entries (11 packages × bare + wildcard)
All 14 app vite.config.ts files updated with @hbc/features-* aliases
tools/vitest-webpart.config.ts created with shared Vitest alias config
tools/package.json created for workspace resolution
ADR-0079-shared-feature-packages.md created (ADR-0013 was already allocated; used next available number)
Corrected tsconfig extends path: ../../../tsconfig.base.json (3 levels, not 2 as in plan)
Corrected tsconfig references: ../../models (not ../../packages/models)
pnpm install + pnpm turbo run build: 24/24 tasks successful
Next: BW-1 (SPFx Entry Points)
-->
