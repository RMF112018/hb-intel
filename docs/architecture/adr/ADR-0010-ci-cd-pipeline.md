# ADR-0010: CI/CD Pipeline

**Status:** Accepted
**Date:** 2026-03-03
**Phase:** 8 — CI/CD Pipeline

## Context

Phases 0–7 delivered 22 workspaces (6 packages, 14 apps, 1 backend, root) with a working Turborepo build. All quality gates (lint, type-check, test, build) have been manual — running `pnpm turbo run build` locally. The team needs automated workflows for pull requests, continuous deployment, and security auditing.

## Decision

### Three-workflow split

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | PR + push to main | Quality gates: format, type-check, test, build, storybook, E2E |
| `cd.yml` | CI success on main (`workflow_run`) | Deploy PWA, HB Site Control, Azure Functions |
| `security.yml` | PR + weekly + manual | Dependency audit |

### Key choices

1. **Turborepo remote caching** — `TURBO_TOKEN`/`TURBO_TEAM` env vars enable cross-job cache sharing, dramatically reducing CI build times after the first run.

2. **Playwright for E2E** — Chromium-only, single smoke test against the PWA preview server on port 4000. Minimal footprint; expands as the app matures.

3. **Coverage starts at 0%** — No enforcement thresholds initially. Blueprint §2h mandates ramping to 95% as unit tests are added in later phases.

4. **SPFx deploy stubbed** — The Vite-to-`.sppkg` packaging pipeline is non-trivial. The deploy job exists with `if: false` and detailed TODO comments for future implementation.

5. **Vercel for web apps** — PWA and HB Site Control deploy via `amondnet/vercel-action@v25` with per-project IDs.

6. **Azure Functions Action** — `azure/functions-action@v1` with publish profile for serverless backend.

7. **CD uses `workflow_run`** — Deploys only trigger after CI completes successfully on main. Concurrency is set to never cancel in-progress deploys to avoid partial deployments.

## Consequences

- Every PR gets automated format, type-check, test, build, and storybook validation.
- Merges to main auto-deploy to staging/production environments.
- Security vulnerabilities surface weekly and on every PR.
- SPFx deployment remains manual until the `.sppkg` toolchain is built.
- No secret values are stored in code — all configured via GitHub Settings.

## Alternatives Considered

- **Single monolithic workflow** — Rejected; separation of concerns and independent concurrency control are more maintainable.
- **Self-hosted runners** — Deferred; GitHub-hosted runners are sufficient for current team size.
- **Azure DevOps Pipelines** — Rejected; team uses GitHub for source control, keeping CI/CD in GitHub Actions reduces toolchain sprawl.
