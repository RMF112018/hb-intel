# Verification Commands

Purpose: help agents and developers choose the smallest meaningful verification set for HB Intel work without over-running the workspace on every task.

## Verification policy

Start with the narrowest verification that can catch mistakes in the changed scope.
Escalate only when the change is cross-package, architecture-affecting, release-critical, or explicitly requested.

Do not claim completion without stating exactly what was run and what was not run.

## Command routing order

1. changed-file or local editor-level checks,
2. affected package lint, typecheck, and tests,
3. workspace-level validation only when the change crosses package boundaries or the risk profile justifies it,
4. browser or end-to-end validation only when UI/runtime behavior changed or the task specifically requires it.

## Root workspace commands

These commands are currently defined in the root `package.json` and should be preferred over ad hoc alternatives when they match the validation need.

### Core workspace commands

- `pnpm lint` — run workspace lint via Turbo
- `pnpm check-types` — run workspace type checks via Turbo
- `pnpm build` — run workspace builds via Turbo
- `pnpm test` — run the currently configured root test subset
- `pnpm test:fallback` — fallback test path for auth/shell coverage
- `pnpm format:check` — verify formatting
- `pnpm format` — apply formatting

### Additional repository checks

- `pnpm scan-stubs` — scan for non-approved stubs
- `pnpm scan-stubs:all` — include approved stubs in the scan output
- `pnpm e2e` — Playwright end-to-end suite
- `pnpm e2e:install` — install Playwright browser dependencies
- `pnpm test:webparts:e2e` — webparts end-to-end suite
- `pnpm test:webparts:e2e:ui` — interactive webparts Playwright run

## Preferred verification patterns

### Local package or package-internal change

Prefer:
- the package's own test, lint, typecheck, or storybook validation commands when available,
- then the smallest relevant root command if package-local commands are absent.

Typical examples:
- package-local unit tests,
- package-local type checks,
- storybook build or scenario validation for UI package changes,
- root `pnpm lint` or `pnpm check-types` only if no narrower command exists.

### Shared package or cross-package change

Prefer:
- affected package tests,
- affected consumer package tests when behavior is shared across boundaries,
- root `pnpm check-types`,
- root `pnpm lint`,
- broader build validation only if the change affects exports, shared contracts, or workspace wiring.

### App runtime or routing change

Prefer:
- affected app build and type checks,
- relevant package tests,
- targeted runtime validation,
- Playwright only when runtime behavior actually changed or the task calls for it.

### Architecture, workspace, or manifest change

Prefer:
- root `pnpm check-types`,
- root `pnpm lint`,
- root `pnpm build`,
- manifest validation when applicable,
- stub scans when touched areas are known to use scaffold or placeholder patterns.

## Backend deploy artifact

These commands prove the `@hbc/functions` deploy artifact and its runtime identity. Use when touching the backend deploy pipeline, the packaging helper, `/api/health`, or when diagnosing artifact/runtime drift (phase-02 audit G-01 / G-10).

- `pnpm exec tsx scripts/package-functions-artifact.ts --output functions-artifact.zip --staging .tmp/functions-deploy`
  Build the backend-scoped zip locally. Emits `artifact-manifest.json` next to the zip with `packageVersion`, `commitSha`, `buildTimestamp`, `sha256`, and `stagedWorkspacePackages`.
- `shasum -a 256 functions-artifact.zip`
  Local zip checksum — must equal `.sha256` in `artifact-manifest.json`.
- `jq . artifact-manifest.json`
  Inspect the deterministic stamp that drives CI's runtime identity setting and post-deploy proof.
- `HOST=$(az functionapp list --query "[?name=='hb-intel-function-app'].defaultHostName | [0]" -o tsv); curl -s "https://$HOST/api/health" | jq .artifact`
  Live artifact identity from the resolved Flex host. After a successful deploy, `artifact.version` must equal `manifest.packageVersion` and `artifact.commitSha` must equal the deployed git SHA.
- `pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name hb-intel-function-app --resource-group hb-intel --output /tmp/live-parity-evidence.json`
  Canonical live parity check. Fails fast unless identity parity, route truth (`ingest`, `ingest/preview`, `replay`), `/api/health/ready` route presence, and deploy-stamp app settings all pass.
- `pnpm --filter @hbc/functions test` / `pnpm --filter @hbc/functions check-types`
  Gate both the telemetry version stamp and the `/api/health` artifact block.

Interpretation quick table:

| Signature | Meaning | Verdict |
| --- | --- | --- |
| `/api/health` missing `artifact.*` | Deployed host does not expose current artifact-identity contract | Fail |
| `POST /api/safety-records/ingest/preview` or `/replay` returns `404` | Expected Safety route not registered on host | Fail (stale/divergent runtime) |
| Missing `HBC_FUNCTIONS_BUILD_*` app settings | Runtime identity stamp missing/incomplete | Fail |
| Identity + routes + stamp checks all pass | Live runtime parity proven for deployed artifact | Pass |

## How to choose the right level

Use the smallest level below that matches the risk:

### Level 1 — narrow verification
Use when:
- the change is local,
- behavior is small in scope,
- no exports or shared contracts changed.

### Level 2 — affected package verification
Use when:
- behavior changed,
- tests should protect the change,
- exports changed within a package,
- a shared package changed but the impact appears bounded.

### Level 3 — cross-package verification
Use when:
- public contracts changed,
- multiple packages or apps are affected,
- ownership or dependency direction changed,
- runtime wiring changed.

### Level 4 — broader workspace or end-to-end verification
Use when:
- release-critical behavior changed,
- runtime surface behavior changed,
- deployment, provisioning, routing, manifests, or other platform-level concerns changed,
- the user requested broad validation.

## Reporting standard

When finishing work, report verification in this structure:

- **Verified:** what was actually run
- **Not run:** important checks not run
- **Why this set:** why the chosen verification level was appropriate
- **Residual risk:** anything still unverified that could matter

## Guardrails

- Do not imply that `pnpm test` is full-workspace coverage unless you verified the current script scope.
- Do not run expensive whole-repo commands by default for tiny local changes.
- Do not skip tests when behavior changed unless you clearly explain why no meaningful automated test exists.
- Prefer package-local commands when they exist and are sufficient.
- When the repo scripts evolve, update this file rather than hard-coding stale command habits into prompt files.
