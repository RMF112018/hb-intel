# ADR-0079: Shared Feature Packages (`packages/features/[domain]/`)

**Status:** Accepted
**Date:** 2026-03-07
**Deciders:** Architecture team
**Plan Reference:** `docs/architecture/plans/PH7-BW-0-Shared-Feature-Package.md`

> **Note:** The original plan specified ADR-0013 for this decision, but ADR-0013 was already allocated. This ADR uses the next available number (0079).

## Context

HB Intel serves two deployment targets per domain: a standalone PWA and an SPFx webpart embedded in SharePoint. Both targets render the same feature page components with the same data access patterns, UI components, and permission checks. The only differences between the two — routing context, shell mode, and auth adapter — are already handled by the shared infrastructure packages (`@hbc/shell`, `@hbc/auth`, `@hbc/data-access`).

Without a shared location for feature page components, each page would need to exist in two places:

```
apps/pwa/src/pages/estimating/ProjectSetupPage.tsx        ← PWA version
apps/estimating/src/pages/ProjectSetupPage.tsx            ← SPFx version
```

This creates duplication that scales with every new page across 11 domains.

## Decision

All assembled feature page components live in `packages/features/[domain]/`. App directories (`apps/pwa/` and `apps/[domain]/`) contain only routing configuration, entry points, and app-specific bootstrapping. No feature page component is ever written directly into an app directory.

### Package naming convention

Each domain gets a workspace package named `@hbc/features-[domain]` (e.g., `@hbc/features-estimating`, `@hbc/features-accounting`).

### Dependency rules

- Feature packages depend on `@hbc/query-hooks` and `@hbc/ui-kit` — never on `@hbc/data-access` directly
- Feature packages do **not** depend on other feature packages (no cross-domain imports)
- Feature packages do **not** depend on any `apps/*` package
- Feature packages are `private: true` — not published externally

### Environment-specific behavior

For the rare case where a page needs environment-specific behavior, use **composition overrides** (prop callbacks) rather than forking the page component.

## Consequences

- **Single source of truth** for all feature UI across both deployment targets
- SPFx-specific behavior is handled via props overrides, not file forks
- All domain feature plans must target `packages/features/` as their output directory
- Apps become thin routing/entry-point shells that import from feature packages
- Tree-shaking ensures no bundle overhead — Vite resolves source aliases at build time
- 11 new workspace packages added to the monorepo

## Affected Packages

| Package | Purpose |
|---|---|
| `@hbc/features-accounting` | Accounting domain pages |
| `@hbc/features-estimating` | Estimating domain pages |
| `@hbc/features-project-hub` | Project Hub domain pages |
| `@hbc/features-business-development` | Business Development domain pages |
| `@hbc/features-leadership` | Leadership domain pages |
| `@hbc/features-admin` | Admin domain pages |
| `@hbc/features-safety` | Safety domain pages |
| `@hbc/features-quality-control-warranty` | Quality Control & Warranty domain pages |
| `@hbc/features-risk-management` | Risk Management domain pages |
| `@hbc/features-operational-excellence` | Operational Excellence domain pages |
| `@hbc/features-human-resources` | Human Resources domain pages |
