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

[Identical exhaustive pattern repeated for @hbc/data-access (ports + 4 adapters + factory), @hbc/query-hooks (domain hooks + keys.ts + defaults.ts), @hbc/auth (Zustand stores + guards + MSAL/SPFx adapters), and @hbc/shell (Zustand stores + HeaderBar + ProjectPicker + ShellLayout). Every file is provided as copy-paste-ready code in this plan.]

### 2.4 @hbc/ui-kit (HB Intel Design System)
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
-->