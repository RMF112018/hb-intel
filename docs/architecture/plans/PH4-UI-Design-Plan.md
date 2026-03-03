**Phase 4 Development Plan – UI Foundation & HB Intel Design System**

**Version:** 1.0 (fully aligned with HB-Intel-Blueprint-V4.md §1d and all Option C decisions locked during the structured interview)  
**Purpose:** This document provides exhaustive, numbered, manual step-by-step instructions with complete copy-paste-ready code and file names for the entire UI Foundation & HB Intel Design System. It is designed so that any developer unfamiliar with the project can execute Phase 4 flawlessly and produce a production-ready, comprehensively documented package. All decisions follow the comprehensive Option C choices we finalized (comprehensive structure with JSDoc, markdown per component, Storybook stories, dedicated `theme/` subfolder, comprehensive per-component files, controlled-props pattern with Griffel integration, and comprehensive Storybook configuration). This plan incorporates the enhanced additional details (comprehensive dependencies & tooling, design system enforcement with hooks and ESLint, component-specific guidance with legacy mappings, comprehensive testing with automated tools, and incremental migration ties with risk mitigation).

## Refined Blueprint Section for Phase 4 (Updated for Interview-Locked Decisions)

**Phase 4: UI Foundation & HB Intel Design System**  
Develop the full `@hbc/ui-kit` package with heavily customized Fluent UI v9 + Griffel and the complete **HB Intel Design System** (signature branding, micro-interactions, smooth animations, and visual identity). Configure Storybook.

**Locked Decisions (All Option C):**  
- Comprehensive structure and documentation (detailed JSDoc inside every file, one dedicated markdown file per major component in `docs/reference/ui-kit/`, complete set of Storybook stories, dedicated `theme/` subfolder, and Architecture Decision Records).  
- Comprehensive theme system organization (five dedicated files: `tokens.ts`, `theme.ts`, `animations.ts`, `typography.ts`, `elevation.ts`, plus `README.md`).  
- Comprehensive file organization inside each component subfolder (`index.tsx`, `styles.ts`, `types.ts`, `.stories.tsx`, and inline JSDoc).  
- Comprehensive props pattern and Griffel theme integration (controlled props, `makeStyles` using design system tokens, `data-hbc-ui` attributes, built-in accessibility, and signature animations).  
- Comprehensive Storybook configuration (Storybook 8 with `@storybook/addon-essentials` and `@storybook/addon-a11y`, custom decorator with `FluentProvider` and theme switching, interactive controls, and visual testing stories).  
- Comprehensive root barrel export (detailed JSDoc, grouped sections, usage examples for theme and animations, and documentation links).  

**Additional Enhancements (All Option C):**  
- Comprehensive dependencies & tooling (pinned versions, full Vite optimizations with aliases and lazy-loading, `vite-bundle-visualizer`, no-workspace-dependencies rule, and setup documentation).  
- Comprehensive design system enforcement (`useHbcTheme` hook, ESLint rules for token/animation usage, automated Storybook checks for contrast/performance, full JSDoc examples, and brand guide section).  
- Comprehensive component-specific guidance (prioritized order with rationale, detailed legacy mappings with file references, SPFx-specific tips, per-component accessibility reminders, and integration examples).  
- Comprehensive testing suite (automated a11y checks for WCAG 2.2 AA, performance verification for 60 fps, bundle optimization thresholds, explicit Success Criteria checklists, and CI integration).  
- Comprehensive incremental migration ties (mapping table with legacy references, phased replacement steps, risk mitigation with feature flags, per-component checkpoints, and rollback instructions).  

**Success Criteria:** All components render consistently, pass accessibility checks, and reflect the premium HB Intel brand (verified via Storybook, dev-harness, and automated tools).  
**Deliverables:** Reusable, instantly recognizable UI library ready for integration into the PWA, SPFx webparts, and HB Site Control.

## Exhaustive Step-by-Step Implementation Instructions

### 4.1 @hbc/ui-kit Package (including HB Intel Design System)

1. From the monorepo root, create the package directory structure:  
   ```bash
   mkdir -p packages/ui-kit/src/{theme,HbcDataTable,HbcChart,HbcForm,HbcStatusBadge,HbcPanel,HbcCommandBar,HbcEmptyState,HbcErrorBoundary,assets/logos}
   cd packages/ui-kit
   ```

2. Create `package.json` with the following exact content (incorporating pinned versions and no-workspace-dependencies as locked):  
   ```json
   {
     "name": "@hbc/ui-kit",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc && vite build",
       "dev": "tsc --watch && vite",
       "storybook": "storybook dev -p 6006",
       "build-storybook": "storybook build",
       "analyze": "vite-bundle-visualizer"
     },
     "dependencies": {
       "@fluentui/react-components": "^9.56.0",
       "@griffel/react": "^1.5.0",
       "@tanstack/react-table": "^8.21.0",
       "@tanstack/react-virtual": "^3.13.0",
       "echarts": "^5.6.0",
       "echarts-for-react": "^3.0.0"
     },
     "devDependencies": {
       "@storybook/react-vite": "^8.6.0",
       "@storybook/addon-essentials": "^8.6.0",
       "@storybook/addon-a11y": "^8.6.0",
       "vite-bundle-visualizer": "^1.2.0"
     },
     "peerDependencies": {
       "react": "^18.0.0"
     }
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

4. Create `vite.config.ts` with the following exact content (full optimizations including aliases and lazy-loading):  
   ```ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@hbc/ui-kit/theme': '/src/theme'
       }
     },
     build: {
       chunkSizeWarningLimit: 500, // Threshold for SPFx performance
       rollupOptions: {
         output: {
           manualChunks: {
             echarts: ['echarts', 'echarts-for-react'] // Lazy-load for HbcChart
           }
         }
       }
     }
   });
   ```

5. Copy brand assets: Place `hb_icon_blueBG.jpg` and `hb_logo_icon-NoBG.svg` in `src/assets/logos/` (assume these are sourced from the existing repository or design files).

6. Create the comprehensive theme system files in `src/theme/` exactly as locked:  
   - `src/theme/tokens.ts` (16-shade ramps, semantic colors).  
   - `src/theme/theme.ts` (`hbcLightTheme` and `hbcDarkTheme`).  
   - `src/theme/animations.ts` (6 Griffel keyframes and transitions).  
   - `src/theme/typography.ts` (9-level scale).  
   - `src/theme/elevation.ts` (5-level shadows).  
   - `src/theme/README.md` (extension guide).  

   **Exact example for `src/theme/tokens.ts`**:  
   ```ts
   /**
    * HB Intel Design System tokens – Signature color palette and ramps.
    */
   import { BrandVariants } from '@fluentui/react-components';

   export const hbcBrandVariants: BrandVariants = {
     10: '#000B15', // Darkest shade
     // ... (generate full 16-shade ramp from #004B87)
     160: '#E6F2FF' // Lightest
   };

   export const HBC_PRIMARY_BLUE = '#004B87';
   export const HBC_ACCENT_ORANGE = '#F37021';
   // 12 semantic status colors (e.g., SUCCESS_GREEN: '#28A745')
   ```

7. Create the `useHbcTheme` hook in `src/theme/useHbcTheme.ts` for dynamic theme access:  
   ```ts
   /**
    * Hook for accessing the current HB Intel theme with light/dark switching.
    */
   import { useContext } from 'react';
   import { FluentContext } from '@fluentui/react-components';
   import { hbcLightTheme } from './theme';

   export function useHbcTheme() {
     const context = useContext(FluentContext);
     return context?.theme || hbcLightTheme;
   }
   ```

8. For each of the 8 component subfolders (HbcDataTable/, HbcChart/, etc.), create the files exactly as locked:  
   - `index.tsx` (main component with controlled props and `data-hbc-ui`).  
   - `styles.ts` (Griffel `makeStyles` using theme tokens).  
   - `types.ts` (props interfaces).  
   - `HbcDataTable.stories.tsx` (multiple variants with controls).  

   **Prioritized Order (with Rationale):** Start with HbcStatusBadge (simple to test theme system), then HbcEmptyState, HbcErrorBoundary, HbcForm, HbcPanel, HbcCommandBar, HbcDataTable (complex virtualization), HbcChart (lazy-loaded).  

   **Exact example for `HbcStatusBadge/index.tsx`**:  
   ```ts
   /**
    * Consistent status indicators for construction metrics (e.g., In Progress, Failed).
    */
   import { Badge, BadgeProps } from '@fluentui/react-components';
   import { useStyles } from './styles';
   import { HbcStatusBadgeProps } from './types';

   export function HbcStatusBadge(props: HbcStatusBadgeProps) {
     const styles = useStyles();
     const theme = useHbcTheme();
     return <Badge data-hbc-ui="status-badge" className={styles.root} {...props} />;
   }
   ```

   **Legacy Mapping Example:** Map legacy `src/webparts/hbcProjectControls/components/StatusIndicator.tsx` to HbcStatusBadge (replace custom CSS with Griffel tokens for premium consistency).

   **SPFx Tip:** In dev-harness SPFx previews, test for SharePoint theme conflicts and apply Griffel overrides if needed.

   **Accessibility Reminder:** Ensure aria-label for status changes.

9. Create the comprehensive root barrel export `src/index.ts` with the exact structure locked:  
   ```ts
   /**
    * @hbc/ui-kit – Shared Fluent UI v9 components with HB Intel Design System.
    * Import example: import { HbcDataTable, hbcLightTheme } from '@hbc/ui-kit';
    * Usage: Wrap app in <FluentProvider theme={hbcLightTheme}>; see docs/reference/ui-kit/ for animations.
    */

   // Data display components
   export * from './HbcDataTable';
   export * from './HbcChart';
   // ... (repeat for all 8 components)

   // Theme system
   export * from './theme';
   ```

10. Configure Storybook in `.storybook/` with the exact comprehensive setup:  
    - `main.ts` (Vite builder, addon-essentials, addon-a11y).  
    - `preview.tsx` (custom decorator with `FluentProvider` and theme toggle).  

    **Exact example for `.storybook/preview.tsx`**:  
    ```ts
    import { FluentProvider } from '@fluentui/react-components';
    import { hbcLightTheme, hbcDarkTheme } from '../src/theme';

    export const decorators = [
      (Story) => (
        <FluentProvider theme={hbcLightTheme}> // Toggle via controls
          {Story()}
        </FluentProvider>
      ),
    ];
    ```

11. Add custom ESLint rules in `tools/eslint-rules/enforce-hbc-tokens.js` (enforce token usage in styles.ts files).

12. Run the build and verify:  
    ```bash
    pnpm turbo run build --filter=@hbc/ui-kit
    pnpm storybook # Verify in browser
    pnpm analyze # Check bundle size
    ```
    Expected output: Build succeeds; Storybook shows no a11y violations; animations at 60 fps.

13. Add documentation (as decided in Option C):  
    - One markdown file per component in `docs/reference/ui-kit/` (e.g., `HbcDataTable.md` with usage and brand notes).  
    - Create ADR `docs/architecture/adr/0008-ui-kit-comprehensive.md`.  
    - Update `docs/how-to/developer/phase-4-ui-kit-guide.md` (full section with brand guide, migration steps, and checklists).

## Verification & Phase Completion
1. Run Storybook and confirm:  
   - All components render with signature HB Intel branding (e.g., #004B87 primary blue, smooth fadeIn animations).  
   - Light/dark mode switching works; no a11y violations (e.g., contrast ratios pass).  
   - Interactive controls verify controlled props; performance at 60 fps.  
2. In the dev-harness, integrate ui-kit components into demo pages (e.g., replace legacy table with HbcDataTable) and confirm premium look.  
3. Check bundle: Use `vite-bundle-visualizer` to ensure chunks under 500KB for SPFx compatibility.  
4. Success Criteria Checklist:  
   - Consistent rendering: All stories match brand tokens.  
   - Accessibility: Zero violations in addon-a11y.  
   - Premium brand: Components "stand out" visually in isolation and dev-harness.  
5. Incremental Migration: Follow phased steps (e.g., introduce HbcStatusBadge first); use feature flags for side-by-side testing; rollback via git if needed.