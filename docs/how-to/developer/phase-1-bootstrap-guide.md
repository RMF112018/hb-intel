# Phase 1: Bootstrap Monorepo Root Configuration Files

**Foundation Plan Reference:** Phase 1 (steps 1-4)
**Blueprint Reference:** §1 (Monorepo Structure)
**Date Completed:** 2026-03-03

## Overview

This guide documents how the HB Intel monorepo root was bootstrapped using the official Turborepo starter template and customized to match the Blueprint V4 specifications.

## What Was Done

### 1. Scaffolded from Turborepo Starter

The monorepo was initialized using `npx create-turbo@latest --example basic` with pnpm as the package manager. Only `.npmrc` and `.vscode/settings.json` were retained from the scaffold.

### 2. Removed All Starter Example Content

All starter artifacts were removed, including:
- `apps/web`, `apps/docs` (Next.js examples -- HB Intel uses Vite)
- `packages/ui` (generic UI -- replaced by `@hbc/ui-kit` in Phase 2)
- `packages/typescript-config/` (Blueprint mandates root tsconfig only)
- `packages/eslint-config/` (Blueprint mandates root .eslintrc only)

### 3. Created Five Root Configuration Files (Blueprint §1)

| File | Purpose |
|------|---------|
| `turbo.json` | Turborepo task definitions (build, lint, test, dev, check-types) |
| `pnpm-workspace.yaml` | Workspace globs: apps/*, packages/*, backend/*, tools/* |
| `tsconfig.base.json` | Standalone TypeScript config; strict mode, ES2022, @hbc/* path aliases |
| `.eslintrc.base.js` | Standalone ESLint config; extends @typescript-eslint/recommended |
| `vitest.workspace.ts` | Vitest workspace configuration for monorepo testing |

### 4. Created Supporting Files

| File | Purpose |
|------|---------|
| `package.json` | Root scripts, devDependencies (turbo, eslint, typescript, vitest, prettier) |
| `.gitignore` | JS/TS monorepo patterns (node_modules, .turbo, dist, SPFx, Azure Functions) |
| `.npmrc` | pnpm configuration (from starter) |
| `.vscode/settings.json` | VS Code ESLint workspace settings (from starter) |

### 5. Added GitHub Templates

- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/question.md`
- `.github/PULL_REQUEST_TEMPLATE.md`

## File Structure After Phase 1

```
hb-intel/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── question.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .vscode/
│   └── settings.json
├── docs/                          (existing documentation tree)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .eslintrc.base.js
├── vitest.workspace.ts
├── .gitignore
├── .npmrc
├── CLAUDE.md
├── LICENSE
└── README.md
```

## Verification

```bash
pnpm install
pnpm turbo run build        # Succeeds (0 build tasks -- no packages yet)
```

## Key Decisions

See [ADR-0001: Monorepo Bootstrap Decisions](../../architecture/adr/0001-monorepo-bootstrap.md) for rationale on turbo.json v2 `tasks` syntax adaptation.

## Next Phase

Phase 2: Shared Packages -- creates `@hbc/models`, `@hbc/data-access`, `@hbc/query-hooks`, `@hbc/ui-kit`, `@hbc/auth`, and `@hbc/shell`.
