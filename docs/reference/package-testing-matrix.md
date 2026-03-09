# Package Testing Matrix — P1 Platform Packages

**Version:** 1.0
**Created:** 2026-03-09 (PH7.8)
**Purpose:** Single reference for P1 package test governance, coverage expectations, and CI participation.

---

## P1 Package Matrix

| Package | Environment | Coverage Thresholds | Local Config | Workspace Entry | CI Gate |
|---------|-------------|---------------------|--------------|-----------------|---------|
| `@hbc/auth` | `node` | L:95 F:95 B:90 S:95 | `packages/auth/vitest.config.ts` | Yes | `unit-tests-p1` |
| `@hbc/shell` | `happy-dom` | L:95 F:95 B:90 S:95 | `packages/shell/vitest.config.ts` | Yes | `unit-tests-p1` |
| `@hbc/sharepoint-docs` | `jsdom` | L:95 F:95 B:95 S:95 | `packages/sharepoint-docs/vitest.config.ts` | Yes | `unit-tests-p1` |
| `@hbc/bic-next-move` | `jsdom` | L:95 F:95 B:95 S:95 | `packages/bic-next-move/vitest.config.ts` | Yes | `unit-tests-p1` |
| `@hbc/complexity` | `jsdom` | L:95 F:95 B:95 S:95 | `packages/complexity/vitest.config.ts` | Yes | `unit-tests-p1` |

**Legend:** L = lines, F = functions, B = branches, S = statements.

---

## Coverage Threshold Rationale

- **`@hbc/auth` and `@hbc/shell`** use `branches: 90`. These were the first workspace entries and have deferred branch-threshold alignment. Revisiting to 95 is tracked separately.
- **`@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`** use `branches: 95`, matching their local configs to avoid silently lowering the bar at workspace level.

---

## Dual-Config Arrangement: `@hbc/sharepoint-docs`

`@hbc/sharepoint-docs` has two coverage configurations that intentionally diverge in scope:

| Aspect | Workspace (`vitest.workspace.ts`) | Local (`vitest.config.ts`) |
|--------|-----------------------------------|---------------------------|
| **Governs** | CI and release-gate checks | Local developer runs |
| **Coverage include** | Broad: `src/**/*.ts`, `src/**/*.tsx` | Targeted: five core service/api files |
| **Coverage exclude** | Named exclusions (tests, types, constants) | Minimal (matches targeted includes) |
| **Thresholds** | L:95 F:95 B:95 S:95 | L:95 F:95 B:95 S:95 |

**Authoritative source:** The workspace config governs CI and release-gate checks. The local config governs developer runs. The intentional scope difference means CI measures broader coverage while local runs focus on core business logic files.

---

## Alias Requirements

Packages that depend on workspace siblings at source level require `resolve.alias` blocks in the workspace entry. Without these, workspace-routed test runs fail to resolve cross-package imports.

| Package | Aliases Required |
|---------|-----------------|
| `@hbc/auth` | None |
| `@hbc/shell` | `@hbc/complexity` (PH7.8.2 — DevToolbar transitively reaches complexity dist CSS; alias redirects to source) |
| `@hbc/sharepoint-docs` | None (aliases in local config only) |
| `@hbc/bic-next-move` | `@hbc/bic-next-move/testing`, `@hbc/complexity`, `@hbc/ui-kit/app-shell`, `@hbc/ui-kit`, `@hbc/notification-intelligence` |
| `@hbc/complexity` | `@hbc/complexity/testing`, `@hbc/ui-kit/app-shell`, `@hbc/ui-kit` (vitest aliases only — no package.json dependency on ui-kit; removed in PH7.8.1 to break cycle) |

---

## CI Jobs

| Job | Packages | Azurite | Workflow |
|-----|----------|---------|----------|
| `unit-tests` | `backend-functions`, `@hbc/provisioning` | Yes | `.github/workflows/ci.yml` |
| `unit-tests-p1` | All 5 P1 packages | No | `.github/workflows/ci.yml` |

Both jobs run independently (no `needs:` dependency) and must pass before PR merge.

---

## Ambient Type Declarations

| Package | File | Purpose |
|---------|------|---------|
| `@hbc/complexity` | `src/env.d.ts` | Minimal ambient `process.env.NODE_ENV` declaration. Required because complexity uses `process.env.NODE_ENV` for dev-only warnings, and consumers with restricted `types` (e.g., `types: ["vite/client"]`) would otherwise get TS2591 errors when resolving complexity source via path aliases. The barrel (`src/index.ts`) includes a `/// <reference path="./env.d.ts" />` directive so the declaration is automatically available to all consumers. (Added PH7.8.3) |

---

## CSS Artifact Copy Requirement

| Package | Asset | Build Script Detail | Reason |
|---------|-------|---------------------|--------|
| `@hbc/complexity` | `src/components/complexity.css` | Post-build `cp` copies CSS to `dist/src/components/complexity.css` | tsc transpiles `.tsx` → `.js` but does not copy non-TS assets. The compiled `.js` files retain `import './complexity.css'` statements. Without the copy step, any consumer resolving to `dist/` (e.g., SPFx webparts, or apps without source aliases) encounters a Rollup/bundler error on the missing CSS file. Consuming apps with Vite source aliases (dev-harness, accounting-pwa, hb-site-control) resolve to source where Vite handles CSS natively, but the dist must still be complete for non-aliased consumers. (Added PH7.8.4) |
