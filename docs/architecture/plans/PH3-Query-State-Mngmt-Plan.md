**Phase 3 Development Plan – Query & State Management Layer**

**Version:** 1.0 (fully aligned with HB-Intel-Blueprint-V4.md §1c, §2g, §2e and all Option C decisions locked during the structured interview)  
**Purpose:** This document provides exhaustive, numbered, manual step-by-step instructions with complete copy-paste-ready code and file names for the entire Query & State Management Layer. It is designed so that any developer unfamiliar with the project can execute Phase 3 flawlessly and produce production-ready, comprehensively documented packages. All decisions follow the comprehensive Option C choices we finalized (per-domain file organization, query-key factory with helpers, defaults & mutation strategy with optimistic updates, repository resolver hook with dependency injection, root barrel export with usage examples, and Zustand client-state stores with performance middleware).

## Refined Blueprint Section for Phase 3 (Updated for Interview-Locked Decisions)

**Phase 3: Query & State Management Layer**  
Build `@hbc/query-hooks` (TanStack Query hooks per domain, centralized query-key factory, defaults) and Zustand stores for client state.

**Locked Decisions (All Option C):**  
- Comprehensive structure and documentation (detailed JSDoc inside every file, one dedicated markdown file per business domain in `docs/reference/`, Architecture Decision Records, and clear integration notes for Zustand client-state stores alongside TanStack Query).  
- Comprehensive file organization inside each domain folder (one file per major hook + `types.ts` + `constants.ts` + barrel `index.ts`).  
- Comprehensive query-key factory (`createQueryKeys` helper, fully type-safe functions for every action, JSDoc with invalidation examples).  
- Comprehensive defaults file and mutation strategy (`useOptimisticMutation` helper, automatic query invalidation using the keys factory, built-in typed error handling).  
- Comprehensive repository resolver hook (type-safe generic `useRepository` with dependency injection and test overrides).  
- Comprehensive root barrel export (detailed JSDoc, grouped sections, usage examples for optimistic updates, and documentation links).  
- Comprehensive Zustand pattern for client state (multiple focused stores with shallow selectors, performance middleware, typed selectors, stores barrel file, and full integration documentation with TanStack Query).  

**Success Criteria:** Optimistic updates, caching, and invalidation work correctly in the dev-harness (verified via the existing demo data-grid and demo forms).  
**Deliverables:** Modern server-state (TanStack Query) and client-state (Zustand) management layer, ready for use by the PWA, SPFx webparts, and future phases.

## Exhaustive Step-by-Step Implementation Instructions

### 3.1 @hbc/query-hooks Package (including Zustand Client-State Stores)

1. From the monorepo root, create the package directory structure:  
   ```bash
   mkdir -p packages/query-hooks/src/{leads,estimating,schedule,buyout,compliance,contracts,risk,scorecard,pmp,project,stores}
   cd packages/query-hooks
   ```

2. Create `package.json` with the following exact content:  
   ```json
   {
     "name": "@hbc/query-hooks",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch"
     },
     "dependencies": {
       "@hbc/data-access": "workspace:*",
       "@hbc/models": "workspace:*",
       "@tanstack/react-query": "^5.75.0"
     },
     "peerDependencies": {
       "react": "^18.0.0"
     },
     "devDependencies": {}
   }
   ```

3. Create `tsconfig.json` with the following exact content:  
   ```json
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

4. Create the centralized query-key factory `src/keys.ts` with the exact comprehensive structure we locked:  
   ```ts
   /**
    * @hbc/query-hooks/keys – Type-safe query key factory for TanStack Query.
    * Usage: queryKeys.leads.detail(123) or queryClient.invalidateQueries({ queryKey: queryKeys.leads.all() })
    * See docs/reference/query-hooks/ for full examples including optimistic updates.
    */
   import { createQueryKeys } from './utils/createQueryKeys'; // helper defined below

   export const queryKeys = {
     leads: createQueryKeys('leads'),
     estimating: createQueryKeys('estimating'),
     schedule: createQueryKeys('schedule'),
     // ... (repeat for all 10 domains)
   } as const;

   // Helper (placed in src/utils/createQueryKeys.ts – create this file first)
   export function createQueryKeys(domain: string) {
     return {
       all: () => [domain] as const,
       detail: (id: number) => [domain, 'detail', id] as const,
       search: (options: any) => [domain, 'search', options] as const,
     };
   }
   ```

5. Create the defaults and mutation helper `src/defaults.ts` with the comprehensive strategy:  
   ```ts
   /**
    * @hbc/query-hooks/defaults – Rich defaults and optimistic mutation helper.
    * Every hook uses useOptimisticMutation for instant UI feedback.
    */
   import { QueryClient } from '@tanstack/react-query';

   export const defaultQueryOptions = {
     queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, retry: 2 },
     mutations: { retry: 0 },
   };

   export function useOptimisticMutation<TData, TVariables>(
     mutationFn: (variables: TVariables) => Promise<TData>,
     queryKey: any[]
   ) {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn,
       onMutate: async (variables) => {
         await queryClient.cancelQueries({ queryKey });
         const previousData = queryClient.getQueryData(queryKey);
         queryClient.setQueryData(queryKey, (old: any) => ({ ...old, ...variables })); // optimistic update
         return { previousData };
       },
       onError: (err, variables, context) => {
         queryClient.setQueryData(queryKey, context?.previousData);
       },
       onSettled: () => queryClient.invalidateQueries({ queryKey }),
     });
   }
   ```

6. Create the repository resolver hook `src/useRepository.ts` with the comprehensive type-safe implementation:  
   ```ts
   /**
    * @hbc/query-hooks/useRepository – Type-safe resolver that connects hooks to the mode-aware factory.
    * Supports test overrides for the dev-harness.
    */
   import { useMemo } from 'react';
   import { getLeadRepository /* and all others */ } from '@hbc/data-access';

   type RepositoryMap = { /* type-safe mapping of every repository */ };

   export function useRepository<K extends keyof RepositoryMap>(key: K) {
     return useMemo(() => {
       switch (key) {
         case 'lead': return getLeadRepository();
         // ... (repeat for all repositories)
         default: throw new Error(`Unknown repository: ${key}`);
       }
     }, [key]);
   }
   ```

7. For each of the 10 domain folders (leads/, estimating/, etc.), create the files exactly as follows (repeat the pattern; example shown for leads/):  
   - `src/leads/useLeads.ts`  
   - `src/leads/useLeadById.ts`  
   - `src/leads/useCreateLead.ts` (uses `useOptimisticMutation`)  
   - `src/leads/useUpdateLead.ts`  
   - `src/leads/useDeleteLead.ts`  
   - `src/leads/useSearchLeads.ts`  
   - `src/leads/types.ts`  
   - `src/leads/constants.ts`  
   - `src/leads/index.ts` (barrel re-export)  

   **Exact example for `src/leads/useCreateLead.ts`** (analogous for others):  
   ```ts
   /**
    * Creates a new lead with optimistic UI update and automatic invalidation.
    */
   export function useCreateLead() {
     const repository = useRepository('lead');
     return useOptimisticMutation(
       (data: ILeadFormData) => repository.create(data),
       queryKeys.leads.all()
     );
   }
   ```

8. Create the Zustand client-state stores in `src/stores/` (focused stores following the exact pattern locked in Option C):  
   - `src/stores/useUiStore.ts`  
   - `src/stores/useFilterStore.ts`  
   - `src/stores/useFormDraftStore.ts`  
   - `src/stores/index.ts` (barrel with shallow selectors)  

   **Exact example for `src/stores/useFilterStore.ts`**:  
   ```ts
   import { create } from 'zustand';
   import { shallow } from 'zustand/shallow';

   export const useFilterStore = create((set) => ({
     filters: {},
     setFilter: (key: string, value: any) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
   }));

   export const useFilterValue = (key: string) => useFilterStore((state) => state.filters[key], shallow);
   ```

9. Create the comprehensive root barrel export `src/index.ts` with the exact structure we locked:  
   ```ts
   /**
    * @hbc/query-hooks – TanStack Query hooks + Zustand client state for HB Intel.
    * Import example: import { useLeads, useCreateLead, queryKeys, useFilterStore } from '@hbc/query-hooks';
    * See docs/reference/query-hooks/ for optimistic update examples.
    */

   // Domain hooks
   export * from './leads';
   export * from './estimating';
   // ... (repeat for all domains)

   // Core utilities
   export { queryKeys } from './keys';
   export { defaultQueryOptions, useOptimisticMutation } from './defaults';
   export { useRepository } from './useRepository';

   // Client-state stores
   export * from './stores';
   ```

10. Run the build and verify:  
    ```bash
    pnpm turbo run build --filter=@hbc/query-hooks
    ```
    Expected output: 1 task succeeded.

11. Add documentation (as decided in Option C):  
    - One markdown file per domain in `docs/reference/query-hooks/` (e.g., `leads.md` explaining every hook and optimistic behavior).  
    - Create ADR `docs/architecture/adr/0007-query-hooks-comprehensive.md`.  
    - Update `docs/how-to/developer/phase-3-query-hooks-guide.md` (full section covering Zustand integration).

## Verification & Phase Completion
1. Switch to the existing dev-harness (already built in Phase 3 of the foundation plan).  
2. Set `HBC_ADAPTER_MODE=mock` and confirm:  
   - The DemoDataGrid uses `useLeads` and shows optimistic create/update/delete.  
   - Caching works (no extra network calls on re-render).  
   - Invalidation refreshes the grid after mutations.  
   - Zustand client-state stores (filters, form drafts) combine seamlessly without re-render cascades.  
3. All packages are now ready for use by the PWA, SPFx webparts, and future phases.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 3.1 (@hbc/query-hooks Comprehensive Rebuild) completed: 2026-03-03
Implementation followed §3.1 Option C exactly (10-step sequence):
- Step 1: createQueryKeys utility + barrel (src/utils/)
- Step 2: keys.ts rebuilt for 11 domains using createQueryKeys base + domain-specific extensions
- Step 3: useOptimisticMutation added to defaults.ts (additive, no breaking changes)
- Step 4: useRepository.ts with RepositoryMap, factoryMap, DI overrides
- Step 5: 5 existing domains refactored to per-file structure, scorecard/project placeholders removed
- Step 6: 6 new domain folders created (estimating, compliance, contracts, risk, pmp, auth)
- Step 7: 3 Zustand stores (useUiStore, useFilterStore, useFormDraftStore)
- Step 8: zustand ^5.0.0 added to package.json
- Step 9: Root barrel rewritten with 66 hooks + stores + utilities
- Step 10: 14 documentation files (11 reference, ADR-0014, developer guide, progress notes)
Verification: pnpm turbo run build — 21/21 tasks pass
ADR created: docs/architecture/adr/0014-query-hooks-comprehensive.md (not 0007 as originally planned — ADR numbering has progressed)
-->