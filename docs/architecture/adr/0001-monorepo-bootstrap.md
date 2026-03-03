# ADR-0001: Monorepo Bootstrap Decisions

**Status:** Accepted
**Date:** 2026-03-03
**Decision Makers:** HB Intel development team
**Blueprint Reference:** Blueprint §1 (Monorepo Structure), Foundation Plan Phase 1

## Context

HB Intel is being built as a pnpm + Turborepo monorepo (Blueprint §1). The Foundation Plan Phase 1 specifies bootstrapping from `create-turbo@latest --example basic` and creating root configuration files per Blueprint §1 specifications. One decision arose where the Blueprint's literal text references syntax from an older tooling version.

## Decision

### turbo.json uses `tasks` key (not `pipeline`)

**Blueprint says:** `{"pipeline": {"build": {...}}}`
**Decision:** Use `{"tasks": {"build": {...}}}` (Turbo v2 syntax)
**Rationale:** The `pipeline` key was deprecated in Turborepo v2. The current version (v2.8.12) and the official starter template use `tasks`. The Blueprint also states the config is "bootstrapped from the official Turborepo starter template," which now generates `tasks`. Using deprecated syntax would cause warnings and would not align with the starter.

## Root Configuration Files (Blueprint §1)

All five root configuration files were created as standalone files with no external config packages:

| File | Key Specifications |
|------|--------------------|
| `turbo.json` | Turbo v2 `tasks` syntax; build, lint, check-types, test, dev |
| `pnpm-workspace.yaml` | Globs: apps/*, packages/*, backend/*, tools/* |
| `tsconfig.base.json` | Standalone; strict mode, ES2022, @hbc/* path aliases |
| `.eslintrc.base.js` | Standalone; extends eslint:recommended + @typescript-eslint/recommended |
| `vitest.workspace.ts` | defineWorkspace(['packages/*']) |

## Consequences

- All team members and AI agents must use `tasks` (not `pipeline`) in turbo.json
- ESLint uses legacy config format (`.eslintrc.base.js`) per Blueprint §1 specification
- TypeScript path aliases for `@hbc/*` are defined in root tsconfig.base.json
- Per-package vitest configs will be created in Phase 2 when shared packages are built
