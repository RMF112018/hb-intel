# Phase 8: CI/CD Pipeline — Developer Guide

## Overview

Phase 8 introduces three GitHub Actions workflows that automate quality gates, deployment, and security auditing for the HB Intel monorepo.

## Workflows

### CI (`ci.yml`)

Runs on every pull request and push to `main`. Five jobs execute in parallel (except E2E which depends on build):

| Job                 | What it does                                                                        |
| ------------------- | ----------------------------------------------------------------------------------- |
| **lint-and-format** | `prettier --check` + `turbo run check-types`                                        |
| **test**            | `turbo run test` with coverage artifact upload                                      |
| **build**           | `turbo run build` (all 21 tasks) + artifact upload for PWA, Site Control, Functions |
| **storybook**       | Builds `@hbc/ui-kit` Storybook + artifact upload                                    |
| **e2e**             | Installs Playwright, builds PWA, runs smoke tests, uploads report on failure        |

### CD (`cd.yml`)

Triggered automatically when CI completes on `main`. Deploys three targets:

- **PWA** — Vercel via `amondnet/vercel-action@v25`
- **HB Site Control** — Vercel (separate project ID)
- **Azure Functions** — `azure/functions-action@v1`
- **SPFx** — Stubbed (`if: false`) pending `.sppkg` packaging pipeline

### Security (`security.yml`)

Runs on PRs, weekly (Monday 6 AM UTC), and manual dispatch. Executes `pnpm audit --audit-level=high` and uploads a JSON report.

## Running checks locally

```bash
# Format check (same as CI)
pnpm format:check

# Auto-fix formatting
pnpm format

# Type-check all packages
pnpm turbo run check-types

# Run all tests
pnpm turbo run test

# Full build
pnpm turbo run build

# E2E (requires Playwright installed)
pnpm e2e:install          # One-time setup
pnpm turbo run build --filter=@hbc/pwa...
pnpm e2e

# Storybook build
pnpm --filter @hbc/ui-kit build-storybook

# Dependency audit
pnpm audit --audit-level=high
```

## Turborepo remote caching

CI uses remote caching to share build artifacts across jobs. This requires two secrets:

- `TURBO_TOKEN` — Generated from Vercel or self-hosted Turborepo server
- `TURBO_TEAM` — Your Turborepo team slug

These are set as repository secrets in GitHub Settings > Secrets and variables > Actions.

## Required GitHub secrets

| Secret                              | Used by | Purpose                               |
| ----------------------------------- | ------- | ------------------------------------- |
| `TURBO_TOKEN`                       | CI + CD | Turborepo remote cache authentication |
| `TURBO_TEAM`                        | CI + CD | Turborepo team identifier             |
| `VERCEL_TOKEN`                      | CD      | Vercel deployment authentication      |
| `VERCEL_ORG_ID`                     | CD      | Vercel organization identifier        |
| `VERCEL_PROJECT_ID_PWA`             | CD      | Vercel project ID for PWA             |
| `VERCEL_PROJECT_ID_SITE_CONTROL`    | CD      | Vercel project ID for HB Site Control |
| `AZURE_FUNCTIONAPP_NAME`            | CD      | Azure Functions app name              |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | CD      | Azure Functions publish profile XML   |

## Adding new tests

1. Create test files alongside source code (e.g., `foo.test.ts` next to `foo.ts`)
2. Use Vitest — it's already configured in the root and workspace config
3. Tests run automatically in CI via `turbo run test`
4. Coverage reports upload as artifacts — download from the Actions run summary

## Debugging CI failures

1. Check the failed job in GitHub Actions
2. Expand the failed step to see the error output
3. Reproduce locally using the commands in "Running checks locally" above
4. Common issues:
   - **Format check fails** — Run `pnpm format` to auto-fix, then commit
   - **Type errors** — Run `pnpm turbo run check-types` locally
   - **Build failures** — Run `pnpm turbo run build` locally; check for missing dependencies
   - **E2E failures** — Download the Playwright report artifact for traces and screenshots

## Playwright configuration

- **Config file:** `playwright.config.ts` (repo root)
- **Test directory:** `e2e/`
- **Browser:** Chromium only
- **CI settings:** 2 retries, single worker, GitHub reporter

### Test projects (Phase 9 expansion)

The Playwright config now uses two test projects with independent web servers:

| Project       | Base URL                | Web Server                 | Test Files                       |
| ------------- | ----------------------- | -------------------------- | -------------------------------- |
| `chromium`    | `http://localhost:4000` | `@hbc/pwa preview`         | All except `dev-harness.spec.ts` |
| `dev-harness` | `http://localhost:3000` | `@hbc/dev-harness preview` | `dev-harness.spec.ts` only       |

```bash
# Run all E2E tests (both projects)
pnpm e2e

# Run only PWA tests
pnpm exec playwright test --project=chromium

# Run only dev-harness tests
pnpm exec playwright test --project=dev-harness
```
