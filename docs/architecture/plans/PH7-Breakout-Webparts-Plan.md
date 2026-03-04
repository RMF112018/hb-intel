# PH7-Breakout-Webparts-Plan.md

**Phase 7 Development Plan – Breakout SPFx Webparts (All 11 Independent Webparts)**

**Version:** 1.0 (fully aligned with HB-Intel-Blueprint-V4.md §1, §2 and all decisions locked during the structured interview)  
**Purpose:** This document provides exhaustive, numbered, manual step-by-step instructions with complete copy-paste-ready code and file names for implementing all 11 breakout SPFx webparts (project-hub, estimating, business-development, accounting, safety, quality-control-warranty, risk-management, leadership, operational-excellence, human-resources, and admin). It is designed so that any developer unfamiliar with the project can execute Phase 7 flawlessly and produce production-ready, comprehensively documented SPFx components. All decisions follow the choices we finalized (template folder with scripted duplication, template-driven simplified shell with basic overrides, sequential prioritization by business value, template with route factory for domain-specific routes, comprehensive testing with 95% coverage, CI/CD-integrated deployment, adapter-based proxy integration for backend, domain-specific RBAC with guidelines, full rewrite using new patterns for pages/components, advanced automated performance optimizations, guided domain-specific error handling/audit logging, and dedicated Diátaxis-aligned phase guide). This plan incorporates the enhanced additional details (SPFx & Vite setup, security & permissions, monitoring & observability, testing strategy, performance & bundle considerations, and legacy code mapping & migration).

## Refined Blueprint Section for Phase 7 (Updated for Interview-Locked Decisions)

**Phase 7: Breakout SPFx Webparts (All 11 Independent Webparts)**  
Convert the functionality from the monolithic SPFx webpart into 11 independent breakout SPFx webparts using the new shared packages and simplified shell.

**Locked Decisions:**  
- Template Folder with Scripted Duplication (Option B: Shared template in `tools/spfx-template/` with duplication script for efficient, consistent setup of all 11 webparts).  
- Template-Driven Simplified Shell with Basic Overrides (Option B: Baseline shell integration in template, with props for domain-specific tool picker/sidebar overrides).  
- Sequential Prioritization by Business Value (Option A: Migrate one webpart at a time starting with Accounting and Estimating, ensuring each is complete before proceeding).  
- Template with Route Factory for Domain-Specific Routes (Option B: Reusable `createDomainRoutes()` factory in template for type-safe, customizable routing per webpart).  
- Comprehensive Testing with Full Coverage Goals (Option A: 95% coverage using Vitest, Playwright, and Storybook, enforced sequentially per webpart).  
- CI/CD-Integrated Deployment (Option C: Automated bundling, App Catalog uploads, and installations via GitHub Actions workflows with manual approvals).  
- Adapter-Based Proxy Integration (Option B: Extend `@hbc/data-access` adapters for secure backend calls in SPFx mode, e.g., for provisioning).  
- Domain-Specific Integration with Guidelines (Option B: Baseline RBAC in template, with plan guidelines for tailored guards/hooks per domain).  
- Full Rewrite Using New Patterns (Option C: Complete rewrite of pages/components with TanStack Query, Zustand, and ui-kit during migration, superseding wrappers).  
- Advanced Automated Optimizations (Option C: CI/CD-integrated Vite plugins for compression, tree-shaking, budgets, and alerts).  
- Guided Domain-Specific Enhancements (Option B: Baseline error boundaries/logging in template, with guidelines for domain-tailored toasts/logs).  
- Dedicated Phase Guide with Diátaxis Alignment (Option B: Structured docs in `docs/how-to/developer/phase-7-spfx-webparts-guide.md` plus ADRs).

**Additional Enhancements:**  
- Comprehensive SPFx & Vite Setup (pinned SPFx 1.18+, Vite configs with aliases, unique manifests, dev ports 4001–4011).  
- Comprehensive Security & Permissions (SPFx context auth, least-privilege adapters, runbook for Azure AD/SP groups).  
- Comprehensive Monitoring & Observability (App Insights metrics for loads/errors, correlation IDs, alerts, observability runbook).  
- Comprehensive Testing Strategy (unit/integration/end-to-end/chaos, CI enforcement with thresholds).  
- Comprehensive Performance & Bundle Considerations (automated budgets <1MB, lazy loading, metrics, production runbook).  
- Comprehensive Legacy Code Mapping & Migration (detailed references to monolithic files, phased rollout with flags, risk mitigation, onboarding guide).

**Success Criteria:** These 11 webparts are production-deployable and fully functional inside SharePoint sites.  
**Deliverables:** Complete set of 11 focused SPFx webparts.

## Exhaustive Step-by-Step Implementation Instructions

### 7.1 Tools & Template Setup

1. From the monorepo root, create the SPFx template folder:  
   ```bash
   mkdir -p tools/spfx-template
   ```

2. In `tools/spfx-template/package.json`, add the baseline dependencies (copy-paste-ready):  
   ```json
   {
     "name": "@hbc/spfx-template",
     "version": "0.0.0",
     "private": true,
     "dependencies": {
       "@hbc/models": "workspace:*",
       "@hbc/data-access": "workspace:*",
       "@hbc/query-hooks": "workspace:*",
       "@hbc/ui-kit": "workspace:*",
       "@hbc/auth": "workspace:*",
       "@hbc/shell": "workspace:*",
       "react": "^18.0.0",
       "@tanstack/react-router": "^1.0.0",
       "@tanstack/react-query": "^5.0.0",
       "zustand": "^5.0.0",
       "@microsoft/sp-core-library": "^1.18.0",
       "@microsoft/sp-webpart-base": "^1.18.0",
       "@pnp/sp": "^3.0.0"
     },
     "devDependencies": {
       "vite": "^6.0.0",
       "@vitejs/plugin-react": "^4.0.0"
     }
   }
   ```

3. Create `tools/spfx-template/vite.config.ts` with SPFx optimizations (code splitting, aliases):  
   ```ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     build: {
       rollupOptions: {
         output: {
           entryFileNames: '[name].js',
           chunkFileNames: '[name].js'
         }
       }
     },
     server: {
       port: 4000 // Placeholder, overridden per webpart
     },
     resolve: {
       alias: {
         '@hbc': '/packages' // Monorepo alias
       }
     }
   });
   ```

4. Add baseline `tools/spfx-template/src/App.tsx` with simplified shell, auth, router factory, error boundary:  
   ```ts
   import { ShellLayout } from '@hbc/shell';
   import { FluentProvider } from '@hbc/ui-kit';
   import { QueryClientProvider } from '@tanstack/react-query';
   import { RouterProvider } from '@tanstack/react-router';
   import { bootstrapSpfxAuth } from '@hbc/auth';
   import { HbcErrorBoundary } from '@hbc/ui-kit';
   import { createDomainRoutes } from './router/factory'; // Factory from template

   // Bootstrap auth (SPFx mode)
   bootstrapSpfxAuth();

   const router = createDomainRoutes('workspaceId'); // Replaced with actual ID

   export function App() {
     return (
       <FluentProvider theme="hbcLightTheme">
         <QueryClientProvider>
           <HbcErrorBoundary>
             <ShellLayout mode="simplified">
               <RouterProvider router={router} />
             </ShellLayout>
           </HbcErrorBoundary>
         </QueryClientProvider>
       </FluentProvider>
     );
   }
   ```

5. Implement the route factory in `tools/spfx-template/src/router/factory.ts`:  
   ```ts
   import { createRouter, rootRoute } from '@tanstack/react-router';

   export function createDomainRoutes(workspaceId: string) {
     const root = rootRoute.addChildren([
       // Domain-specific routes added here via overrides
     ]);
     return createRouter({ routeTree: root });
   }
   ```

6. Create the duplication script `tools/generate-webpart.ts` (Node.js executable):  
   ```ts
   import fs from 'fs-extra';
   import path from 'path';

   const webpartName = process.argv[2];
   if (!webpartName) throw new Error('Provide webpart name');

   const targetDir = path.join(__dirname, '../../apps', webpartName);
   fs.copySync(path.join(__dirname, 'spfx-template'), targetDir);

   // Customize: Update manifest.json, port, etc.
   const manifestPath = path.join(targetDir, 'src/webparts', webpartName, `${webpartName}.manifest.json`);
   fs.writeJSONSync(manifestPath, { id: `unique-${webpartName}-id`, alias: webpartName });

   console.log(`Generated ${webpartName}`);
   ```

7. Run the script for all 11 webparts (example for accounting):  
   ```bash
   node tools/generate-webpart.ts accounting
   ```
   Repeat for estimating, project-hub, leadership, business-development, admin, risk-management, safety, quality-control-warranty, operational-excellence, human-resources.

8. Update `pnpm-workspace.yaml` to include all new apps/* folders.

### 7.2 Sequential Migration & Full Rewrites

1. Start with Accounting: Navigate to `apps/accounting/`.  
   Reference legacy: `src/webparts/hbcProjectControls/components/pages/Accounting.tsx`, `AccountingSetup.tsx`.  
   Rewrite `src/pages/AccountingSetup.tsx` using new patterns (example snippet):  
   ```ts
   import { useMutation } from '@hbc/query-hooks';
   import { HbcForm, HbcDataTable } from '@hbc/ui-kit';
   import { PermissionGate } from '@hbc/auth';

   export function AccountingSetup() {
     const mutation = useMutation('provisionSite', async (data) => {
       // Use adapter-based proxy for backend call
     });

     return (
       <PermissionGate permission="provision:write">
         <HbcForm onSubmit={mutation.mutateAsync}>
           {/* Form fields with ui-kit */}
         </HbcForm>
       </PermissionGate>
     );
   }
   ```

2. Apply domain-specific overrides: Add tool picker items to shell props, custom routes via factory.  
   Integrate provisioning trigger with adapter proxy.

3. Add guided RBAC: Use `RoleGate` for sections, per guidelines.

4. Implement error handling: Wrap in `HbcErrorBoundary`, add domain toasts/logs.

5. Repeat sequentially for Estimating (reference: `Estimating.tsx`, `EstimatingTracker.tsx`), rewriting with query hooks/ui-kit.  
   Integrate real-time checklist if applicable (cross-phase note).

6. Proceed to Project Hub, Leadership, etc., following the order. For each, map legacy files, rewrite pages (e.g., `ProjectDashboard.tsx` for project-hub), apply overrides/guidelines.

### 7.3 Testing & Performance

1. For each webpart, add Vitest tests in `src/**/*.test.ts` (aim 95% coverage):  
   ```ts
   import { render } from '@testing-library/react';
   test('AccountingSetup renders', () => {
     const { getByText } = render(<AccountingSetup />);
     expect(getByText('Provision Site')).toBeInTheDocument();
   });
   ```

2. Configure Playwright E2E in `e2e/accounting.spec.ts` (example):  
   ```ts
   import { test } from '@playwright/test';
   test('Provisioning trigger', async ({ page }) => {
     await page.goto('/accounting');
     await page.click('button[aria-label="Save + Provision"]');
     // Assert redirect and checklist
   });
   ```

3. Update Storybook stories for UI components.

4. Integrate advanced optimizations: In root `vite.config.ts`, add plugins; in CI/CD `cd.yml`, add budget checks:  
   ```yaml
   jobs:
     deploy-spfx:
       runs-on: ubuntu-latest
       steps:
         - name: Bundle Analysis
           run: pnpm analyze-bundle --max-size 1MB
   ```

### 7.4 CI/CD & Deployment

1. Update `.github/workflows/cd.yml` for SPFx: Add jobs for .sppkg build, upload via PnPjs, install to sites.  
   Use env vars for credentials.

2. For each webpart, verify deployment: Trigger pipeline, confirm in App Catalog.

### 7.5 Documentation

1. Create `docs/how-to/developer/phase-7-spfx-webparts-guide.md` (Diátaxis: tutorials for migration, references for templates).  
2. Add ADR `docs/architecture/adr/0012-spfx-breakout.md`.  
3. Update `docs/explanation/design-decisions/phase-7.md` with rationale.

## Verification & Phase Completion

1. In dev-harness, set `HBC_ADAPTER_MODE=sharepoint` and load each webpart preview.  
2. Confirm:  
   - Simplified shell renders without picker/launcher.  
   - Rewritten pages fetch data via query hooks, apply RBAC guards.  
   - Backend calls (e.g., provisioning) succeed via adapters.  
   - Error boundaries catch failures, logs audit actions.  
   - Performance: Bundles <1MB, loads <5s in SPFx iframe simulation.  
3. Success Criteria Checklist:  
   - All 11 webparts deploy via CI/CD and function in SharePoint sites.  
   - 95% test coverage passed in pipeline.  
   - Legacy mappings verified with side-by-side diff.  
   - Security: Permissions enforced, no unauthorized access.  
4. Incremental Migration: Use feature flags for rollout; rollback via git branches if needed.