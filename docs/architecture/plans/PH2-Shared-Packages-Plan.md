**Phase 2 Development Plan – @hbc/models and @hbc/data-access Packages**

**Version:** 1.0 (fully aligned with HB-Intel-Blueprint-V4.md §1a, §1b, §2d and all Option C decisions locked during the structured interview) 
 
**Purpose:** This document provides exhaustive, numbered, manual step-by-step instructions with complete copy-paste-ready code and file names for every file in the two core shared packages. It is designed so that any developer unfamiliar with the project can execute Phase 2 flawlessly and produce production-ready, comprehensively documented packages. All decisions follow the comprehensive Option C choices we finalized (per-domain file organization, comprehensive naming conventions, full JSDoc, typed configurations, BaseRepository abstract class, typed error handling, mode-aware factory with fallback, comprehensive mock adapter with seeding, root barrel exports with usage examples, domain-specific markdown files, and ADRs).

## Refined Blueprint Section for Phase 2 (Updated for Interview-Locked Decisions)

**Phase 2: Core Shared Packages – Models & Data Access**  
Implement `@hbc/models` (zero-dependency domain models & enums) and `@hbc/data-access` (ports/adapters pattern that replaces the legacy IDataService god-interface).  

**Locked Decisions (All Option C):**  
- Comprehensive file organization per domain (one file per major model/enum + `types.ts` + `constants.ts` + barrel `index.ts`).  
- Comprehensive naming (`I*` prefix for interfaces, domain clarity, required one-line JSDoc).  
- Comprehensive root barrel exports with detailed JSDoc, grouped sections, usage examples, and documentation links.  
- Comprehensive shared/ folder (per-type files + `types.ts` + `constants.ts` + `README.md`).  
- Comprehensive port interfaces (`I*Repository` with full CRUD + search using shared types).  
- Comprehensive mode-aware factory (`resolveAdapterMode()` helper, type-safe getters, fallback to mock).  
- Comprehensive adapter structure (one file per domain per adapter type + `types.ts` + `constants.ts` + `README.md` per adapter folder + abstract `BaseRepository`).  
- Comprehensive typed error handling (`HbcDataAccessError` hierarchy + wrapper).  
- Comprehensive SharePoint configuration (typed `SharePointConfig` + startup validation).  
- Comprehensive mock adapter (in-memory storage + automatic seeding + reset simulation).  
- Full JSDoc on every file, one dedicated markdown file per domain in `docs/reference/api/`, adapter folder READMEs, and one ADR per major pattern.  

**Success Criteria:** Both packages build cleanly with `pnpm turbo run build --filter=@hbc/models` and `--filter=@hbc/data-access`. The factory correctly resolves all four adapter modes in the dev-harness. All ports are swappable, typed, and fully documented for any new developer.

## Exhaustive Step-by-Step Implementation Instructions

### 2.1 @hbc/models Package

1. From the monorepo root, create the package directory structure:  
   ```bash
   mkdir -p packages/models/src/{leads,estimating,schedule,buyout,compliance,contracts,risk,scorecard,pmp,project,auth,shared}
   cd packages/models
   ```

2. Create `package.json` with the following exact content:  
   ```json
   {
     "name": "@hbc/models",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch"
     },
     "dependencies": {},
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

4. For each of the 12 domain folders (leads/, estimating/, schedule/, buyout/, compliance/, contracts/, risk/, scorecard/, pmp/, project/, auth/, shared/), create the five files exactly as follows (repeat the pattern; example shown for leads/):  
   - `src/leads/ILead.ts` (main interface with full JSDoc)  
   - `src/leads/ILeadFormData.ts`  
   - `src/leads/LeadStage.ts` (enum)  
   - `src/leads/types.ts` (domain-specific helper types)  
   - `src/leads/constants.ts` (fixed values)  
   - `src/leads/index.ts` (barrel re-export)  

   **Exact example for `src/leads/ILead.ts`** (use analogous fields for other domains per Blueprint §1a):  
   ```ts
   /**
    * Main interface representing a potential construction project lead.
    * Used by Business Development and Project Hub workspaces.
    */
   export interface ILead {
     id: number;
     projectCode: string;
     clientName: string;
     projectName: string;
     estimatedValue: number;
     stage: LeadStage;
     createdDate: string;
     // additional fields as defined in Blueprint §1a
   }
   ```

   **Exact example for `src/shared/IPagedResult.ts`** (create identical pattern for ICursorPageResult.ts and IListQueryOptions.ts):  
   ```ts
   /**
    * Generic paged result wrapper used by every repository getAll/search method.
    */
   export interface IPagedResult<T> {
     items: T[];
     totalCount: number;
     page: number;
     pageSize: number;
     hasNext: boolean;
   }
   ```

5. Create the comprehensive root barrel export `src/index.ts` with the exact structure we locked (detailed JSDoc at top, grouped sections, explicit named re-exports, usage example, and link to docs):  
   ```ts
   /**
    * @hbc/models – Central domain models and shared types for HB Intel.
    * Import example: import { ILead, LeadStage, IPagedResult } from '@hbc/models';
    * See docs/reference/models/ for full domain documentation.
    */

   // Leads domain
   export * from './leads';
   // Estimating domain
   export * from './estimating';
   // ... (repeat for all 12 domains)

   // Commonly used shared types (explicit re-export for convenience)
   export type { IPagedResult, ICursorPageResult, IListQueryOptions } from './shared';
   ```

6. Run the build and verify:  
   ```bash
   pnpm turbo run build --filter=@hbc/models
   ```
   Expected output: 1 task succeeded.

7. Add documentation (as decided in Option C):  
   - One markdown file per domain in `docs/reference/models/` (e.g., `leads.md` explaining every type).  
   - Create ADR `docs/architecture/adr/0002-models-comprehensive-structure.md`.  
   - Update `docs/how-to/developer/phase-2-shared-packages-guide.md` (models section).

### 2.2 @hbc/data-access Package

1. From the monorepo root, create the package directory structure:  
   ```bash
   mkdir -p packages/data-access/src/{ports,adapters/{sharepoint,proxy,mock,api},errors}
   cd packages/data-access
   ```

2. Create `package.json` and `tsconfig.json` (exact content mirrors @hbc/models but with dependency on `@hbc/models` workspace:* and appropriate scripts).

3. Create the 11 port interfaces in `src/ports/` (one file per domain):  
   `ILeadRepository.ts`, `IEstimatingRepository.ts`, `IScheduleRepository.ts`, `IBuyoutRepository.ts`, `IComplianceRepository.ts`, `IContractRepository.ts`, `IRiskRepository.ts`, `IScorecardRepository.ts`, `IPmpRepository.ts`, `IProjectRepository.ts`, `IAuthRepository.ts`.  
   Each uses the comprehensive method signatures we locked (getAll, getById, create, update, delete, search + full JSDoc).

   **Exact example for `src/ports/ILeadRepository.ts`:**  
   ```ts
   /**
    * Lead repository port – defines the contract every adapter must implement.
    * Uses shared IPagedResult and IListQueryOptions.
    */
   export interface ILeadRepository {
     getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>>;
     getById(id: number): Promise<ILead | null>;
     create(data: ILeadFormData): Promise<ILead>;
     update(id: number, data: Partial<ILeadFormData>): Promise<ILead>;
     delete(id: number): Promise<boolean>;
     search(options: IListQueryOptions): Promise<IPagedResult<ILead>>;
   }
   ```

4. Create `src/errors/index.ts` with the comprehensive typed error hierarchy and wrapper function (exact code as decided).

5. Create the comprehensive mode-aware factory `src/factory.ts` (with `resolveAdapterMode()` helper, type-safe getters for every repository, fallback logic, and full JSDoc).

6. Create the abstract `BaseRepository` class at `src/adapters/base.ts` (shared logic for error wrapper, config validation, logging hooks).

7. For each of the four adapter folders (sharepoint/, proxy/, mock/, api/):  
   - Create one implementation file per domain (e.g., `SharePointLeadRepository.ts` that extends `BaseRepository` and implements `ILeadRepository`).  
   - Create `types.ts`, `constants.ts`, and `README.md` (explaining purpose and special rules).  
   - For the mock adapter only: add `seedData.ts` with realistic construction seed data and reset functionality.

8. Create the comprehensive root barrel export `src/index.ts` (detailed JSDoc, grouped sections, usage examples, links to domain markdown files).

9. Run the build and verify:  
   ```bash
   pnpm turbo run build --filter=@hbc/data-access
   ```
   Expected output: 2 tasks succeeded.

10. Add documentation (as decided in Option C):  
    - One markdown file per domain in `docs/reference/api/` (explaining the port + field mappings).  
    - Adapter folder READMEs.  
    - Create ADR `docs/architecture/adr/0006-ports-adapters-comprehensive.md`.  
    - Update `docs/how-to/developer/phase-2-shared-packages-guide.md` (data-access section).

## Verification & Phase Completion
1. Switch to the dev-harness (already built in Phase 3) and set `HBC_ADAPTER_MODE=mock` (or sharepoint/proxy).  
2. Confirm all repositories resolve correctly and basic CRUD operations work in the demo data-grid component.  
3. All packages are now ready for use by query-hooks, auth, shell, and future apps.

**Phase 2 is complete.** Update the implementation progress notes in the main foundation plan and proceed to Phase 3 (dev-harness integration).  

If you would like me to provide the exact copy-paste code for any specific file (e.g., full factory.ts, BaseRepository, a complete SharePointLeadRepository stub, or the error hierarchy), or if you are ready to begin actual file creation in the repository, please let me know. I remain available for the next phase or any clarification.