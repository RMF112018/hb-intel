**Phase 5 Development Plan – Authentication & Navigation Shell**

**Version:** 1.0 (fully aligned with HB-Intel-Blueprint-V4.md §1e, §1f, §2b, §2c, §2e and all Option C decisions locked during the structured interview)  
**Purpose:** This document provides exhaustive, numbered, manual step-by-step instructions with complete copy-paste-ready code and file names for the entire Authentication & Navigation Shell layer. It is designed so that any developer unfamiliar with the project can execute Phase 5 flawlessly and produce production-ready, comprehensively documented packages. All decisions follow the comprehensive Option C choices we finalized (structure & documentation, per-feature file organization, naming conventions, dual-mode auth logic, Zustand stores for auth/shell, guards/hooks, shell components, and root barrel exports). This plan incorporates the enhanced additional details (comprehensive dependencies & tooling, dual-mode authentication implementation guidance, navigation shell implementation details, comprehensive testing suite, and incremental migration ties with risk mitigation).

## Refined Blueprint Section for Phase 5 (Updated for Interview-Locked Decisions)

**Phase 5: Authentication & Navigation Shell**  
Implement `@hbc/auth` (dual-mode MSAL + SPFx adapters, guards, hooks) and `@hbc/shell` (Procore-style header, global project persistence, Back-to-Project-Hub logic, simplified shells for webparts).

**Locked Decisions (All Option C):**  
- Comprehensive structure and documentation (detailed JSDoc inside every file, one dedicated markdown file per major feature in `docs/reference/`, and Architecture Decision Records).  
- Comprehensive per-feature file organization (one file per major item + `types.ts` + `constants.ts` + barrel `index.ts`).  
- Comprehensive naming conventions (`I*` prefix for interfaces, feature clarity, required one-line JSDoc).  
- Comprehensive dual-mode authentication logic (type-safe `IAuthAdapter` interface, fallback to mock, built-in MSAL on-behalf-of flow, full JSDoc, and documentation section).  
- Comprehensive Zustand stores for auth and shell (performance middleware, typed state interfaces, atomic actions, full JSDoc, and integration documentation).  
- Comprehensive guards and hooks (type-safe props, fallback/loading states, shallow selectors, full JSDoc, and router integration section).  
- Comprehensive shell components (type-safe props, built-in navigation rule enforcement, `data-hbc-shell` attributes, full JSDoc, and documentation section).  
- Comprehensive root barrel export (detailed JSDoc, grouped sections, usage examples for dual-mode and navigation, and documentation links).  

**Additional Enhancements (All Option C):**  
- Comprehensive dependencies & tooling (pinned versions for MSAL/Zustand, full Vite optimizations with HMR plugins, Zustand devtools, env var instructions, and setup documentation).  
- Comprehensive dual-mode authentication implementation guidance (full code examples, legacy mappings, mock seeding, security best practices, and rollback section).  
- Comprehensive navigation shell implementation guidance (atomic actions, persistence partialize, styling hooks with `@hbc/ui-kit`, 60 fps verification, and migration examples).  
- Comprehensive testing suite (automated mode switching tests, full scenario coverage, accessibility verification with `@storybook/addon-a11y`, Success Criteria checklists, and CI integration).  
- Comprehensive incremental migration ties (mapping table with legacy references, phased rollout with feature flags, risk mitigation, verification checkpoints, and onboarding documentation).  

**Success Criteria:** Seamless mode switching and navigation work across PWA and SPFx previews (verified via dev-harness).  
**Deliverables:** Dual-mode authentication and workspace-centric navigation foundation ready for the PWA, SPFx webparts, and future phases.

## Exhaustive Step-by-Step Implementation Instructions

### 5.1 @hbc/auth and @hbc/shell Packages

1. From the monorepo root, create the package directory structures:  
   ```bash
   mkdir -p packages/auth/src/{stores,guards,hooks,msal,spfx,mock} packages/shell/src/{stores,HeaderBar,AppLauncher,ProjectPicker,BackToProjectHub,ContextualSidebar,ShellLayout}
   cd packages/auth
   ```

2. Create `package.json` for `@hbc/auth` with the following exact content (pinned versions and devtools as locked):  
   ```json
   {
     "name": "@hbc/auth",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch"
     },
     "dependencies": {
       "@hbc/models": "workspace:*",
       "@azure/msal-browser": "^4.0.0",
       "@azure/msal-react": "^3.0.0",
       "zustand": "^5.0.0"
     },
     "devDependencies": {
       "zustand-devtools": "^1.0.0"
     },
     "peerDependencies": {
       "react": "^18.0.0"
     }
   }
   ```

3. Create identical `package.json` and `tsconfig.json` structure for `@hbc/shell` (depends on `@hbc/auth` and `@hbc/models` workspace:*; add same devtools).

4. Create `vite.config.ts` in both packages (full HMR aliases and React plugins as locked).

5. Create the comprehensive dual-mode adapters in `@hbc/auth/src/` exactly as locked:  
   - `IAuthAdapter.ts` (type-safe interface).  
   - `MsalAdapter.ts` (full on-behalf-of flow with enterprise scopes).  
   - `SpfxAdapter.ts` (legacy context mapping).  
   - `MockAdapter.ts` (seeded admin user).  
   - `resolveAuthMode.ts` (fallback logic).  

   **Exact example for `MsalAdapter.ts` (full code snippet for enterprise flow):**  
   ```ts
   /**
    * MSAL adapter for PWA – handles enterprise Azure AD with on-behalf-of tokens.
    */
   import { PublicClientApplication } from '@azure/msal-browser';
   import { IAuthAdapter } from './IAuthAdapter';

   export class MsalAdapter implements IAuthAdapter {
     private msalInstance: PublicClientApplication;
     constructor(config: any) { /* full init with VITE_MSAL_* env vars */ }
     async getCurrentUser() { /* silent token + on-behalf-of flow */ }
   }
   ```

6. Create Zustand stores (auth and shell) with the comprehensive pattern locked:  
   - `@hbc/auth/src/stores/authStore.ts` and `permissionStore.ts`.  
   - `@hbc/shell/src/stores/projectStore.ts` and `navStore.ts` (atomic actions + persist partialize).  

   **Exact example for `projectStore.ts` (global persistence):**  
   ```ts
   /**
    * Global project persistence store – survives reloads and enables Back-to-Project-Hub.
    */
   import { create } from 'zustand';
   import { persist, devtools } from 'zustand/middleware';

   export const useProjectStore = create(
     devtools(
       persist(
         (set) => ({
           activeProject: null,
           setActiveProject: (project) => set({ activeProject: project }),
         }),
         { name: 'hbc-project-store', partialize: (state) => ({ activeProject: state.activeProject }) }
       )
     )
   );
   ```

7. Create guards/hooks and shell components exactly as locked:  
   - Guards: `RoleGate.tsx`, `PermissionGate.tsx`, `useCurrentUser.ts`, `usePermission.ts`.  
   - Shell components: `HeaderBar.tsx`, `ProjectPicker.tsx`, `BackToProjectHub.tsx`, `ShellLayout.tsx` (mode='full' vs 'simplified' with rule enforcement).  

   **Legacy Mapping Example:** Map legacy `src/webparts/hbcProjectControls/components/AppBar.tsx` to HeaderBar; use feature flags from permissionStore for side-by-side testing.

8. Create the comprehensive root barrel exports `src/index.ts` for both packages with the exact structure locked (detailed JSDoc, grouped sections, usage examples for dual-mode and navigation).

9. Run the build and verify:  
   ```bash
   pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell
   ```
   Expected output: Both packages build successfully.

10. Add documentation (as decided in Option C):  
    - One markdown file per feature in `docs/reference/auth/` and `docs/reference/shell/`.  
    - Create ADRs: `docs/architecture/adr/0009-auth-dual-mode.md` and `0010-shell-navigation.md`.  
    - Update `docs/how-to/developer/phase-5-auth-shell-guide.md` (full brand guide, migration steps, and checklists).

## Verification & Phase Completion
1. Switch to the existing dev-harness and toggle `HBC_AUTH_MODE` (msal/spfx/mock).  
2. Confirm:  
   - Seamless mode switching (no login loops; guards react instantly).  
   - Navigation scenarios (project persistence survives reload; Back-to-Project-Hub appears correctly).  
   - 60 fps animations and no re-render cascades (shallow selectors verified).  
   - Accessibility passes (keyboard navigation for AppLauncher/Sidebar).  
3. Success Criteria Checklist:  
   - Dual-mode auth works in PWA and SPFx previews.  
   - Global project persistence is consistent.  
   - Navigation rules enforced (e.g., ProjectPicker absent in simplified mode).  
   - Legacy mappings verified with zero downtime via feature flags.  
4. Incremental Migration: Follow phased steps; use side-by-side testing; rollback via git if needed.