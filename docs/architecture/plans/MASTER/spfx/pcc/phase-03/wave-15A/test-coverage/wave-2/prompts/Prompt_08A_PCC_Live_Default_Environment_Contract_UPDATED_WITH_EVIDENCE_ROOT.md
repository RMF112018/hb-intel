# Prompt 08A — PCC Live Default Environment Contract, Evidence Output Root, and Manifest-Version Resolver — Updated

## Role

You are the local code agent working in the `RMF112018/hb-intel` repository.

You are implementing a controlled Playwright evidence-harness enhancement for the PCC live suite. This prompt belongs to the Playwright Immediate ROI package and should land before final closeout validation.

## Non-Negotiable Agent Instructions

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, contradictory, or newly changed repo truth.
- Start with:
  ```bash
  git status --short
  git branch --show-current
  git rev-parse --short HEAD
  md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
  ```
- Do not touch unrelated dirty files.
- Do not modify product UI runtime files.
- Do not change dependencies, `pnpm-lock.yaml`, package metadata, SPFx manifests, or package-solution files.
- Do not add tenant write actions.
- Do not add final score, hard-stop pass/fail, EV final-capture, WCAG/accessibility pass/fail, or Phase 4 readiness claims.
- Do not commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, raw `playwright-report/`, or tenant auth artifacts.
- Defaults may point to local safe paths, but secret/auth file contents must remain outside the repo and uncommitted.
- Explicit environment variables passed by the operator must override defaults.
- Reuse the shared PCC live sanitizer from Prompt 08 for safe error/message text where practical. Do not reintroduce broad phone over-redaction.

## Objective

Update the PCC live Playwright environment loader so the suite can run with safe defaults unless alternate variables are explicitly provided.

The suite should default to:

```bash
PCC_LIVE_SITE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject"
PCC_LIVE_PAGE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/CollabHome.aspx"
PCC_LIVE_STORAGE_STATE="$HOME/.pcc-live-auth/pcc-live-storage-state.json"
PCC_EVIDENCE_OUTPUT_DIR="<repo-root>/docs/architecture/evidence/pcc-live"
PCC_EXPECTED_PACKAGE_VERSION=<derived from apps/project-control-center/config/package-solution.json>
```

Do **not** hard-code the current version. At the time this prompt was reviewed, `apps/project-control-center/config/package-solution.json` held `solution.version = 1.0.0.17` and feature version `1.0.0.17`. The implementation must derive whatever value is present at runtime.

The operator may still override any default by passing the corresponding env var.

## Current Repo-Truth Baseline

- `e2e/pcc-live/pcc-live.env.ts` currently treats these as required env variables:
  - `PCC_LIVE_SITE_URL`
  - `PCC_LIVE_PAGE_URL`
  - `PCC_LIVE_STORAGE_STATE`
  - `PCC_EVIDENCE_OUTPUT_DIR`
  - `PCC_EXPECTED_PACKAGE_VERSION`
- `e2e/pcc-live/pcc-live.runtime.spec.ts` currently has a simple self-skip configuration test plus live hosted-page tests.
- `apps/project-control-center/config/package-solution.json` stores the SPFx package-solution version and feature version.
- Prompt 08 introduced:
  - `e2e/pcc-live/pcc-live.sanitization.ts`
  - `sanitizePccLiveText`
  - `sanitizePccLiveArtifactPath`
  - `isPccLiveUnsafeArtifactPath`
- `package.json` already exposes `pnpm pcc:e2e:live` and `pnpm pcc:e2e:live:list`; do not add scripts unless a test proves it is necessary.
- Existing runbooks describe env vars as required; update wording to explain default behavior plus override behavior.

## Primary Files to Inspect

```text
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
e2e/pcc-live/pcc-live.sanitization.ts
e2e/pcc-live/pcc-live.sanitization.spec.ts
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
apps/project-control-center/config/package-solution.json
package.json
.gitignore
```

Only inspect additional files if needed to keep tests compiling or to verify existing env-loader usage.

## Required Implementation

### 1. Replace Required Env Model With Defaulted Env Model

Update `e2e/pcc-live/pcc-live.env.ts` so these variables default when absent:

```text
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EVIDENCE_OUTPUT_DIR
PCC_EXPECTED_PACKAGE_VERSION
```

Recommended default constants:

```ts
const PCC_DEFAULT_LIVE_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject';

const PCC_DEFAULT_LIVE_PAGE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/CollabHome.aspx';

const PCC_DEFAULT_STORAGE_STATE_RELATIVE_TO_HOME =
  '.pcc-live-auth/pcc-live-storage-state.json';

const PCC_DEFAULT_EVIDENCE_OUTPUT_RELATIVE_TO_REPO =
  'docs/architecture/evidence/pcc-live';
```

Use `os.homedir()` and `path.join()` for storageState.

Use a deterministic repo-root resolver for the evidence output root. Prefer `process.cwd()` when it is the repo root. If needed, walk upward until both of these are found:

```text
package.json
apps/project-control-center/config/package-solution.json
```

Default output directory must resolve to:

```text
<repo-root>/docs/architecture/evidence/pcc-live
```

In Bobby’s local repo, that resolves to:

```text
/Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/
```

Do not hard-code `/Users/bobbyfetting/hb-intel` in source.

### 2. Preserve Explicit Overrides

If the operator exports any of these env vars, the exported value must win over the default:

```text
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EVIDENCE_OUTPUT_DIR
PCC_EXPECTED_PACKAGE_VERSION
```

Keep optional env vars optional:

```text
PCC_LIVE_BRAVE_EXECUTABLE_PATH
PCC_LIVE_EDIT_PAGE_URL
PCC_LIVE_UNAUTHORIZED_STORAGE_STATE
PCC_LIVE_UNAUTHORIZED_PAGE_URL
PCC_LIVE_ENABLE_CONDITIONAL
```

Optional conditional behavior:

- `PCC_LIVE_ENABLE_CONDITIONAL` defaults to disabled.
- Only string value `true` should enable it, case-insensitive.
- Absence, blank string, `false`, `0`, or any non-`true` value should be disabled unless current repo truth already defines stricter behavior.

### 3. Derive Default Expected Package Version From Package Solution

Implement a resolver that reads:

```text
apps/project-control-center/config/package-solution.json
```

Default `PCC_EXPECTED_PACKAGE_VERSION` should equal:

```text
solution.version
```

Validate:

- `solution.version` is present and non-empty.
- Every `solution.features[].version`, when present, matches `solution.version`.
- If versions mismatch, return an explicit safe status:
  - prefer `package-version-mismatch`; or
  - `invalid-config` if the implementation keeps fewer status types.
- If `package-solution.json` is missing/unreadable or malformed, return `invalid-config` with a safe message.
- If the operator explicitly sets `PCC_EXPECTED_PACKAGE_VERSION`, that explicit value may override the default expected version, but package-solution internal mismatch must still be detected and reported.

Do not modify `package-solution.json`.

### 4. Update Env Status Semantics

The suite should no longer self-skip because the five defaulted vars are absent.

It may still self-skip when:

- the default or provided storageState file does not exist;
- package-solution version cannot be resolved;
- package-solution solution/features versions mismatch;
- explicitly supplied required path/value is invalid.

Expand status types from:

```ts
'ready' | 'missing-env' | 'missing-storage-state'
```

to include:

```ts
'invalid-config'
'package-version-mismatch'
```

Keep status naming simple and testable. Preserve existing caller compatibility:

```ts
checkPccLiveEnv()
skipIfMissingPccLiveEnv(test)
```

### 5. Add Testable Resolver Inputs

Avoid brittle tests that depend on the real process env, real `$HOME`, or the real storageState file.

Add internal helper functions or exported test-only helpers as appropriate. Recommended approach:

```ts
export interface PccLiveEnvResolverInput {
  readonly env?: NodeJS.ProcessEnv;
  readonly cwd?: string;
  readonly homeDir?: string;
  readonly fileExists?: (path: string) => boolean;
  readonly readFile?: (path: string) => string;
}

export function resolvePccLiveEnv(input?: PccLiveEnvResolverInput): PccLiveEnvCheck;
```

`checkPccLiveEnv()` can delegate to `resolvePccLiveEnv()` using real `process.env`, `process.cwd()`, `os.homedir()`, `fs.existsSync`, and `fs.readFileSync`.

Tests should exercise `resolvePccLiveEnv()` with injected env/home/cwd/file/read behavior. Do not require real storageState in unit coverage.

### 6. Evidence Output Directory Behavior

The env loader should ensure the evidence output root is safe and deterministic:

- default root: repo `docs/architecture/evidence/pcc-live/`;
- explicit override: use `PCC_EVIDENCE_OUTPUT_DIR`;
- normalize path safely;
- default evidence root must not be OS temp;
- default evidence root must not be `test-results` or `playwright-report`;
- writer/capture flows may still create run subfolders as they already do;
- tests should prove the default evidence root is repo evidence path.

Do not commit generated evidence outputs from this prompt unless they are synthetic test temp outputs outside the repo or explicitly reviewed docs.

### 7. Sanitized Messages and Safe Path Display

Use Prompt 08 sanitizer helpers for messages and path display where practical:

```ts
sanitizePccLiveText
sanitizePccLiveArtifactPath
isPccLiveUnsafeArtifactPath
```

Requirements:

- Missing storageState messages must not include file contents.
- Config errors must not include cookies, tokens, auth/session contents, raw sensitive query strings, or storageState contents.
- Safe evidence output paths and safe package-solution paths may remain navigable.
- Do not reintroduce broad `PHONE_RE` logic into `pcc-live.env.ts`.

### 8. Focused Tests

Add or update tests, preferably in `e2e/pcc-live/pcc-live.runtime.spec.ts` or a new focused env spec if cleaner.

Test cases must cover:

1. With no five primary env vars set, resolver defaults to:
   - specified site URL;
   - specified CollabHome page URL;
   - `$HOME/.pcc-live-auth/pcc-live-storage-state.json`;
   - repo-root `docs/architecture/evidence/pcc-live`;
   - package-solution `solution.version`.
2. Explicit env vars override defaults.
3. Missing default storageState path returns `missing-storage-state`, not `missing-env`.
4. Package-solution version is derived from `solution.version`.
5. Feature version mismatch returns `package-version-mismatch` or `invalid-config`.
6. Missing/unreadable/malformed package-solution returns `invalid-config`.
7. Optional conditional env defaults to disabled unless `PCC_LIVE_ENABLE_CONDITIONAL=true`.
8. No storageState contents are read or emitted in messages.
9. Error messages do not include cookies, tokens, auth/session contents, or raw sensitive file contents.
10. Repo-root resolution works from a nested working directory through injected cwd/read/file helpers.
11. Explicit `PCC_EXPECTED_PACKAGE_VERSION` overrides the default expected value while package-solution internal mismatch is still handled.
12. Existing live runtime tests still self-skip safely when default storageState file is absent.

### 9. Update Runbooks

Update:

```text
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

Add:

- Default live site URL.
- Default live page URL.
- Default storageState path.
- Default evidence output root:
  ```text
  docs/architecture/evidence/pcc-live/
  ```
  and explanatory local resolution:
  ```text
  /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/
  ```
- `PCC_EXPECTED_PACKAGE_VERSION` is derived from:
  ```text
  apps/project-control-center/config/package-solution.json
  ```
- Operator override examples.
- Safe storageState capture command using the new default path:
  ```bash
  mkdir -p "$HOME/.pcc-live-auth"
  pnpm exec playwright codegen "https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/CollabHome.aspx" --save-storage "$HOME/.pcc-live-auth/pcc-live-storage-state.json"
  ```
- Evidence output policy:
  - outputs default to `docs/architecture/evidence/pcc-live/`;
  - screenshots remain operator-review required;
  - raw artifacts remain never-commit;
  - curated evidence remains review/scrub required before commit.

### 10. Do Not Add A Committed `.env`

Do not create or commit:

```text
.env
.env.local
.pcc-live-auth/
*.storageState.json
pcc-live-storage-state.json
```

Check `.gitignore` for coverage of `.pcc-live-auth/` or storage-state files. If a clear gap exists, report it. Only update `.gitignore` if the omission is clear and the change is narrowly scoped.

## Validation Commands

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.runtime.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.sanitization.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.env.ts e2e/pcc-live/pcc-live.runtime.spec.ts e2e/pcc-live/pcc-live.sanitization.ts e2e/pcc-live/pcc-live.sanitization.spec.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If the implementation creates a separate env spec file, include it in the Playwright validation and Prettier command.

## Acceptance Criteria

- PCC live suite can resolve defaults with no manually exported site/page/storage/evidence/version vars.
- Missing default storageState returns `missing-storage-state`, not `missing-env`.
- Default storageState path is `$HOME/.pcc-live-auth/pcc-live-storage-state.json`.
- Default evidence output root resolves to repo `docs/architecture/evidence/pcc-live/`, which is `/Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/` in the local repo.
- Default expected package version derives from `apps/project-control-center/config/package-solution.json`.
- Solution version and feature versions are validated for consistency.
- Explicit env vars override defaults.
- Existing `checkPccLiveEnv()` / `skipIfMissingPccLiveEnv(test)` call sites remain compatible.
- Missing storageState self-skips clearly and safely.
- No secret/auth/session contents are stored, printed, committed, or embedded in docs.
- No broad phone over-redaction is reintroduced.
- No dependency, lockfile, package metadata, SPFx manifest, or package-solution change.
- No product UI runtime change.
- No final score, hard-stop pass/fail, EV final-capture, WCAG/accessibility pass/fail, or Phase 4 readiness claim.
