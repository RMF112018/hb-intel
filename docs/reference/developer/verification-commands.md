# Verification Commands

Purpose: help agents and developers choose the smallest meaningful verification set for HB Intel work without over-running the workspace on every task.

This file is referenced by `CLAUDE.md` and `.claude/rules.md`. It should stay aligned with current root scripts, package-level scripts, active prompt-package validation matrices, and safety gates.

---

## Verification Policy

Start with the narrowest verification that can catch mistakes in the changed scope.

Escalate only when the change is cross-package, architecture-affecting, release-critical, runtime-sensitive, or explicitly requested.

Do not claim completion without stating exactly what was run and what was not run.

Validation is not deployment. Tenant mutation, hosted smoke tests, app catalog operations, Graph/PnP live calls, Procore probes, Azure deployment, and CI/CD execution require explicit user authorization and the applicable gatekeeper review.

---

## Command Routing Order

1. Changed-file or local editor-level checks.
2. Affected package lint, typecheck, tests, build, or storybook checks.
3. Affected consumer package checks when shared contracts or exports changed.
4. Workspace-level validation only when the change crosses package boundaries or the risk profile justifies it.
5. Browser or end-to-end validation only when UI/runtime behavior changed or the task specifically requires it.
6. Hosted/tenant validation only when explicitly authorized.

---

## Root Workspace Commands

These commands are currently defined in the root `package.json` and should be preferred over ad hoc alternatives when they match the validation need.

### Core Workspace Commands

- `pnpm lint` — run workspace lint via Turbo.
- `pnpm check-types` — run workspace type checks via Turbo.
- `pnpm build` — run workspace builds via Turbo.
- `pnpm test` — run the currently configured root test subset. Do **not** imply this is full-workspace coverage unless the script is changed and verified.
- `pnpm test:fallback` — fallback test path for auth/shell coverage.
- `pnpm format:check` — verify formatting.
- `pnpm format` — apply formatting. Use only when formatting changes are authorized.

### Additional Repository Checks

- `pnpm scan-stubs` — scan for non-approved stubs.
- `pnpm scan-stubs:all` — include approved stubs in the scan output.
- `pnpm guarded:commit` — guarded auto-commit helper. Use only when explicitly requested.
- `pnpm e2e` — Playwright end-to-end suite.
- `pnpm e2e:install` — install Playwright browser dependencies. Use only when explicitly authorized because it changes local environment dependencies.
- `pnpm test:webparts:e2e` — webparts end-to-end suite.
- `pnpm test:webparts:e2e:ui` — interactive webparts Playwright run.

---

## Prohibited by Default / Requires Explicit Authorization

Do not run these unless explicitly authorized by the user and supported by the governing prompt:

- `npm install`
- `pnpm install`
- `pnpm add`
- `npm update`
- `pnpm update`
- dependency manager commands whose main purpose is changing `package.json` or lockfiles
- `az`
- `m365`
- `pnp`
- `gh workflow run`
- app catalog upload/deployment commands
- Azure deployment commands
- SharePoint list/site/group/permission mutation commands
- live Graph/PnP tenant calls
- Procore probes or API calls
- `curl` against live tenant/backend/external-system endpoints
- `.sppkg` generation or deployment unless the prompt explicitly authorizes SPFx packaging
- destructive git commands
- package publishing commands

Use:

- `.claude/agents/hb-security-and-secrets-auditor.md` for secrets/auth-proof/token/app-setting risk;
- `.claude/agents/hb-tenant-deployment-gatekeeper.md` for tenant/deployment/Graph/PnP/Procore/CI/CD risk;
- `.claude/agents/hb-spfx-runtime-parity-auditor.md` for SPFx source/build/manifest/runtime/hosted parity risk.

---

## Preferred Verification Patterns

### Docs-Only Change

Prefer:

- `git diff -- <changed docs>`
- `git status --short`
- `pnpm format:check` only if expected by repo convention or requested

Do not run broad builds or tests for docs-only work unless the docs change affects generated docs, command references, package behavior, or repo tooling.

### Local Package or Package-Internal Change

Prefer:

- package-local unit tests;
- package-local type checks;
- package-local lint/build commands when available;
- storybook build or scenario validation for UI package changes;
- the smallest relevant root command only if package-local commands are absent.

### Shared Package or Cross-Package Change

Prefer:

- affected package tests;
- affected consumer package tests when behavior is shared across boundaries;
- root `pnpm check-types`;
- root `pnpm lint`;
- broader build validation only if the change affects exports, shared contracts, workspace wiring, or runtime behavior.

### App Runtime or Routing Change

Prefer:

- affected app build and type checks;
- relevant package tests;
- targeted runtime validation;
- Playwright only when runtime behavior actually changed or the task calls for it.

### UI / SPFx Change

Prefer:

- affected package/app typecheck;
- affected package/app tests;
- UI snapshot/storybook/build checks when available;
- SPFx/runtime parity review when source/build/manifest/runtime behavior matters;
- webparts E2E only when SharePoint-hosted behavior, page layout, or runtime mounting changed and the prompt authorizes it.

Use `hb-ui-ux-conformance-reviewer` for UI/UX quality, accessibility, basis-of-design fit, and reusable UI ownership.
Use `hb-spfx-runtime-parity-auditor` for source/build/manifest/runtime/hosted parity.

### Architecture, Workspace, or Manifest Change

Prefer:

- root `pnpm check-types`;
- root `pnpm lint`;
- root `pnpm build` when build output or workspace wiring changed;
- manifest validation when applicable;
- stub scans when touched areas are known to use scaffold or placeholder patterns.

Any package or manifest version change must be explicitly authorized by the governing prompt.

### Backend Code Change

Prefer:

- affected backend package typecheck;
- affected backend package tests;
- targeted service tests;
- packaging-artifact validation only if artifact packaging changed;
- hosted parity only if explicitly authorized.

Do not run live backend endpoint probes without explicit authorization.

### Provisioning / SharePoint / Tenant Change

Prefer deterministic dry-run/proof validation first.

Do not run tenant mutation, live Graph/PnP, SharePoint provisioning, app catalog, or permission mutation commands unless explicitly authorized.

Use `hb-tenant-deployment-gatekeeper` before execution.

---

## Backend Deploy Artifact

These commands prove the `@hbc/functions` deploy artifact and its runtime identity. Use only when touching the backend deploy pipeline, packaging helper, `/api/health`, or diagnosing artifact/runtime drift.

### Local / deterministic checks

- `pnpm exec tsx scripts/package-functions-artifact.ts --output functions-artifact.zip --staging .tmp/functions-deploy`
  Builds the backend-scoped zip locally. Emits `artifact-manifest.json` next to the zip with `packageVersion`, `commitSha`, `buildTimestamp`, `sha256`, and `stagedWorkspacePackages`.

- `shasum -a 256 functions-artifact.zip`
  Local zip checksum. Must equal `.sha256` in `artifact-manifest.json`.

- `jq . artifact-manifest.json`
  Inspect the deterministic stamp that drives CI runtime identity setting and post-deploy proof.

- `pnpm --filter @hbc/functions test` / `pnpm --filter @hbc/functions check-types`
  Gate both the telemetry version stamp and the `/api/health` artifact block.

### Hosted / tenant-gated checks

The following are not normal local validation. They require explicit user authorization and `hb-tenant-deployment-gatekeeper` review:

- resolving the live Azure Function host with `az`;
- calling live `/api/health` or `/api/health/ready` with `curl`;
- running `scripts/verify-functions-live-parity.ts` against a live app;
- collecting admin-token or delegated-token proof.

If hosted proof is authorized, all outputs must be redacted and reviewed for secret leakage.

Interpretation quick table:

| Signature | Meaning | Verdict |
| --- | --- | --- |
| `/api/health` missing `artifact.*` | Deployed host does not expose current artifact-identity contract | Fail |
| `/api/health` contains readiness-only fields such as `configTiers` | Public health surface leaked privileged readiness detail | Fail |
| Expected Safety route returns `404` | Expected route not registered on host | Fail, stale/divergent runtime |
| `GET /api/health/ready` returns `404` | Protected readiness route not registered | Fail |
| `GET /api/health/ready` no auth returns `401` or `403` | Route exists and remains protected | Pass |
| `GET /api/health/ready` malformed bearer returns non-`401` | Auth handling drift on protected readiness route | Fail |
| `GET /api/health/ready` with admin token returns `200` + readiness keys | Privileged readiness surface healthy | Pass |
| Missing `HBC_FUNCTIONS_BUILD_*` app settings | Runtime identity stamp missing/incomplete | Fail |
| Identity + routes + stamp checks all pass | Live runtime parity proven for deployed artifact | Pass |

---

## Safety Reporting-Period Seam

Use when triaging Safety ingest/preview failures around reporting-period lookup.

- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-reporting-period-contract.test.ts`
  Verifies canonical contract enforcement: `reportingPeriodId=period-{id}` and companion-ID mismatch rejection.

- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-graph-repository.test.ts`
  Verifies reporting-period Graph read uses normalized numeric item ID and emits seam diagnostics.

- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-graph-data-plane.test.ts`
  Verifies Graph failure classification/telemetry for 401/403/404 on item reads.

---

## Safety Parser-Authority Preview Seam

Use when triaging preview/ingest readiness failures for markered templates.

- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-preview-evaluator.test.ts src/services/__tests__/safety-ingestion-failure-classifier.test.ts src/services/__tests__/safety-ingestion-application-service.test.ts`
  Verifies parser-authority enforcement (`PARSER_AUTHORITY_VIOLATION`), failure-class mapping (`parser-authority-violation`), and ingest commit-gate blocking behavior.

- `pnpm --filter @hbc/features-safety test -- src/parser/validateTemplate.test.ts src/parser/extractMetadata.test.ts`
  Verifies parser-meta/named-range precedence and that legacy fallback is allowed only for markerless templates.

---

## Safety Prompt 05 Release-Proof Checks

Use when proving Safety is backend-wired before release. These checks are not appropriate for unrelated docs, UI, or local package changes.

### Deterministic repo checks

- `pnpm --filter @hbc/functions test -- src/test/release-gates.test.ts src/test/infra-readiness.test.ts scripts/verify-functions-live-parity.test.ts`
  Verifies release gates for route/auth/request-id posture, tenant-origin CORS config assumptions, and parity evidence contract checks.

- `pnpm --filter @hbc/functions test -- src/test/smoke/post-deploy-smoke.test.ts`
  Verifies smoke-check definitions for unauthenticated preview `401`, non-admin provisioning denial `403`, and `X-Request-Id` response proof seams.

- `pnpm --filter @hbc/spfx-safety test -- src/runtime/healthReadyProof.test.ts src/test/safetyWebPartBackendBinding.test.ts src/test/appRuntimeContractGate.test.tsx`
  Verifies SharePoint fail-closed contract, delegated token acquisition proof seam, and webpart backend property plumbing.

- `pnpm --filter @hbc/features-safety test -- src/adapters/sharepoint/SafetyBackendCommandClient.test.ts src/hooks/queries.test.tsx`
  Verifies command-client auth classification + hook wiring to preview/ingest/replay command routes.

- `npx tsx tools/build-spfx-package.ts --domain safety`
  Verifies clean package build + artifact freshness (`safety-package-truth-proof.json`). Use only when SPFx packaging validation is explicitly in scope.

### Hosted-environment proof required for release sign-off

These checks require tenant + Entra context and explicit authorization. They are not considered complete by assumption and must be redacted.

- `pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name <function-app> --resource-group <rg> --non-admin-token "$NON_ADMIN_TOKEN" --output /tmp/safety-live-parity.json`
- `SMOKE_TEST_BASE_URL=https://<host> NON_ADMIN_AUTH_TOKEN="$NON_ADMIN_TOKEN" pnpm --filter @hbc/functions test -- src/test/smoke/post-deploy-smoke.test.ts`

Use `hb-security-and-secrets-auditor` before preserving any auth proof or token-derived output.

---

## How to Choose the Right Level

Use the smallest level below that matches the risk.

### Level 1 — Narrow Verification

Use when:

- the change is local;
- behavior is small in scope;
- no exports or shared contracts changed;
- no runtime or deployment behavior changed.

### Level 2 — Affected Package Verification

Use when:

- behavior changed;
- tests should protect the change;
- exports changed within a package;
- a shared package changed but the impact appears bounded.

### Level 3 — Cross-Package Verification

Use when:

- public contracts changed;
- multiple packages or apps are affected;
- ownership or dependency direction changed;
- runtime wiring changed.

### Level 4 — Broader Workspace or End-to-End Verification

Use when:

- release-critical behavior changed;
- runtime surface behavior changed;
- deployment, provisioning, routing, manifests, or other platform-level concerns changed;
- the user requested broad validation.

### Level 5 — Hosted / Tenant-Gated Verification

Use only when explicitly authorized and scoped.

Examples:

- app catalog deployment proof;
- Azure Functions live parity;
- Graph/PnP tenant calls;
- SharePoint provisioning validation;
- Procore live integration proof;
- production or non-production rollout proof.

---

## Reporting Standard

When finishing work, report verification in this structure:

- **Verified:** what was actually run.
- **Not run:** important checks not run.
- **Why this set:** why the chosen verification level was appropriate.
- **Residual risk:** anything still unverified that could matter.

For failed or partial validation, include:

- whether the failure appears new, pre-existing, flaky, environmental, or ambiguous;
- the smallest recommended next validation or remediation step.

---

## Guardrails

- Do not imply that `pnpm test` is full-workspace coverage unless you verified the current script scope.
- Do not run expensive whole-repo commands by default for tiny local changes.
- Do not skip tests when behavior changed unless you clearly explain why no meaningful automated test exists.
- Prefer package-local commands when they exist and are sufficient.
- Do not run dependency install or update commands without explicit authorization.
- Do not run tenant/deployment/external-system commands without explicit authorization.
- Do not preserve raw tokens, keys, app settings, bearer strings, or auth payloads in validation reports.
- When repo scripts evolve, update this file rather than hard-coding stale command habits into prompt files.
