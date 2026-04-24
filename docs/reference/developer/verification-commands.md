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
- `pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name hb-intel-function-app --resource-group hb-intel --admin-token "$API_TOKEN" --output /tmp/live-parity-evidence.json`
  Canonical live parity check. Fails fast unless identity parity, route truth (`ingest`, `ingest/preview`, `replay`), `/api/health` public contract, readiness auth behavior (`no auth => 200|401|403`, malformed bearer => `401`), optional admin readiness contract (`200` + required keys when `--admin-token` is supplied), and deploy-stamp app settings all pass.
- `pnpm --filter @hbc/functions test` / `pnpm --filter @hbc/functions check-types`
  Gate both the telemetry version stamp and the `/api/health` artifact block.

Interpretation quick table:

| Signature | Meaning | Verdict |
| --- | --- | --- |
| `/api/health` missing `artifact.*` | Deployed host does not expose current artifact-identity contract | Fail |
| `/api/health` contains readiness-only fields (for example `configTiers`) | Public health surface leaked privileged readiness detail | Fail |
| `POST /api/safety-records/ingest/preview` or `/replay` returns `404` | Expected Safety route not registered on host | Fail (stale/divergent runtime) |
| `GET /api/health/ready` returns `404` | Protected readiness route not registered | Fail |
| `GET /api/health/ready` no auth returns `401` or `403` | Route exists and remains protected | Pass |
| `GET /api/health/ready` malformed bearer returns non-`401` | Auth handling drift on protected readiness route | Fail |
| `GET /api/health/ready` with admin token returns `200` + readiness keys | Privileged readiness surface healthy | Pass |
| Missing `HBC_FUNCTIONS_BUILD_*` app settings | Runtime identity stamp missing/incomplete | Fail |
| Identity + routes + stamp checks all pass | Live runtime parity proven for deployed artifact | Pass |

## Safety reporting-period seam

Use when triaging Safety ingest/preview failures around reporting-period lookup.

- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-reporting-period-contract.test.ts`
  Verifies canonical contract enforcement: `reportingPeriodId=period-{id}` and companion-ID mismatch rejection.
- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-graph-repository.test.ts`
  Verifies reporting-period Graph read uses normalized numeric item ID and emits seam diagnostics.
- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-graph-data-plane.test.ts`
  Verifies Graph failure classification/telemetry for 401/403/404 on item reads.

## Safety parser-authority preview seam

Use when triaging preview/ingest readiness failures for markered templates.

- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-preview-evaluator.test.ts src/services/__tests__/safety-ingestion-failure-classifier.test.ts src/services/__tests__/safety-ingestion-application-service.test.ts`
  Verifies parser-authority enforcement (`PARSER_AUTHORITY_VIOLATION`), failure-class mapping (`parser-authority-violation`), and ingest commit-gate blocking behavior.
- `pnpm --filter @hbc/features-safety test -- src/parser/validateTemplate.test.ts src/parser/extractMetadata.test.ts`
  Verifies parser-meta/named-range precedence and that legacy fallback is allowed only for markerless templates.

## Safety Prompt 05 release-proof checks

Use when proving Safety is backend-wired (not just visually rendered) before release.

### Deterministic repo checks (CI/local executable)

- `pnpm --filter @hbc/functions test -- src/test/release-gates.test.ts src/test/infra-readiness.test.ts scripts/verify-functions-live-parity.test.ts`
  Verifies release gates for route/auth/request-id posture, tenant-origin CORS config assumptions, and parity evidence contract checks.
- `pnpm --filter @hbc/functions test -- src/test/smoke/post-deploy-smoke.test.ts`
  Verifies smoke-check definitions for unauthenticated preview `401`, non-admin provisioning denial `403`, and `X-Request-Id` response proof seams.
- `pnpm --filter @hbc/spfx-safety test -- src/runtime/healthReadyProof.test.ts src/test/safetyWebPartBackendBinding.test.ts src/test/appRuntimeContractGate.test.tsx`
  Verifies SharePoint fail-closed contract, delegated token acquisition proof seam, and webpart backend property plumbing.
- `pnpm --filter @hbc/features-safety test -- src/adapters/sharepoint/SafetyBackendCommandClient.test.ts src/hooks/queries.test.tsx`
  Verifies command-client auth classification + hook wiring to preview/ingest/replay command routes.
- `npx tsx tools/build-spfx-package.ts --domain safety`
  Verifies clean package build + artifact freshness (`safety-package-truth-proof.json`).

### Hosted-environment proof required (tenant + Entra context)

These checks are required for release sign-off and are not considered complete by assumption.

- `pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name <function-app> --resource-group <rg> --non-admin-token \"$NON_ADMIN_TOKEN\" --output /tmp/safety-live-parity.json`
  Required hosted proof:
  - unauthenticated preview path returns `401`
  - non-admin delegated preview/ingest are not auth-rejected
  - non-admin provisioning route is denied (`403`)
  - malformed preview bearer returns `401` with `X-Request-Id`
  - health/ready and deploy identity parity remain valid
- `SMOKE_TEST_BASE_URL=https://<host> NON_ADMIN_AUTH_TOKEN=\"$NON_ADMIN_TOKEN\" pnpm --filter @hbc/functions test -- src/test/smoke/post-deploy-smoke.test.ts`
  Required hosted proof:
  - preview unauthenticated rejection (`401`)
  - delegated non-admin preview/ingest route access posture
  - provisioning denial for non-admin (`403`)
  - response `X-Request-Id` presence on safety command routes

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
