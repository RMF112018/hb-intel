# Prompt 08A — PCC Live Default Environment Contract, Evidence Output Root, and Manifest-Version Resolver

## Role

You are the local code agent working in the `RMF112018/hb-intel` repository.

You are implementing a controlled Playwright evidence-harness enhancement for the PCC live suite. This prompt belongs to the Playwright Immediate ROI package and should land before the final Prompt 09 closeout validation.

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
- Do not add final score, hard-stop pass/fail, EV final-capture, or Phase 4 readiness claims.
- Do not commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, raw `playwright-report/`, or tenant auth artifacts.
- Defaults may point to local safe paths, but secret/auth file contents must remain outside the repo and uncommitted.
- Explicit environment variables passed by the operator must override defaults.

## Objective

Update the PCC live Playwright environment loader so the suite can run with safe defaults unless alternate variables are explicitly provided.

The suite should default to:

```bash
PCC_LIVE_SITE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject"
PCC_LIVE_PAGE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/CollabHome.aspx"
PCC_LIVE_STORAGE_STATE="$HOME/.pcc-live-auth/pcc-live-storage-state.json"
PCC_EVIDENCE_OUTPUT_DIR="/Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/"
PCC_EXPECTED_PACKAGE_VERSION=<derived from apps/project-control-center/config/package-solution.json>
```

Where practical, implement the evidence output default as the repository-root-relative path:

```text
docs/architecture/evidence/pcc-live/
```

When the local repo root is `/Users/bobbyfetting/hb-intel`, this must resolve to:

```text
/Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/
```

The operator may still override any default by passing the corresponding env var.

## Current Repo-Truth Baseline

- `e2e/pcc-live/pcc-live.env.ts` currently treats the following as required env variables:
  - `PCC_LIVE_SITE_URL`
  - `PCC_LIVE_PAGE_URL`
  - `PCC_LIVE_STORAGE_STATE`
  - `PCC_EVIDENCE_OUTPUT_DIR`
  - `PCC_EXPECTED_PACKAGE_VERSION`
- `apps/project-control-center/config/package-solution.json` currently stores the SPFx package-solution version and feature version. The default `PCC_EXPECTED_PACKAGE_VERSION` should be derived from that file, and the loader should validate that the solution version and all feature versions match.
- `package.json` already exposes `pnpm pcc:e2e:live` and `pnpm pcc:e2e:live:list`, so do not add scripts unless a test proves it is necessary.
- Current runbook describes these as required env variables; update wording to explain default behavior plus override behavior.

## Primary Files to Inspect

```text
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
apps/project-control-center/config/package-solution.json
package.json
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

Use a deterministic repo-root resolver for the evidence output root. Prefer `process.cwd()` when it is the repo root. If needed, walk upward until `package.json` and `apps/project-control-center/config/package-solution.json` are found.

The default output directory must resolve to:

```text
<repo-root>/docs/architecture/evidence/pcc-live
```

In Bobby’s local repo this is:

```text
/Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/
```

Do not hard-code `/Users/bobbyfetting/hb-intel` in source unless repo-root resolution is impossible.

### 2. Preserve Explicit Overrides

If the operator exports any env var, the exported value must win over the default:

```bash
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

### 3. Derive Default Expected Package Version From Package Solution

Implement a small resolver that reads:

```text
apps/project-control-center/config/package-solution.json
```

Default `PCC_EXPECTED_PACKAGE_VERSION` should equal:

```text
solution.version
```

Also validate:

- `solution.version` is present and non-empty.
- Each `solution.features[].version`, when present, matches `solution.version`.
- If versions mismatch, return `missing-env` or a clearer new status such as `invalid-config` with a safe message.
- If the operator explicitly sets `PCC_EXPECTED_PACKAGE_VERSION`, that value may override the default, but tests should verify mismatch handling remains explicit and safe.

Do not modify `package-solution.json`.

### 4. Update Env Status Semantics

The suite should no longer self-skip because the five defaulted vars are absent.

It may still self-skip when:

- the default or provided storageState file does not exist;
- package-solution version cannot be resolved;
- package-solution solution/features versions mismatch;
- an explicitly supplied required path is invalid.

Consider expanding status types from:

```ts
'ready' | 'missing-env' | 'missing-storage-state'
```

to include one or both:

```ts
'invalid-config'
'package-version-mismatch'
```

Keep status naming simple and testable.

### 5. Evidence Output Directory Behavior

The env loader should ensure the evidence output root is safe and deterministic:

- default root: repo `docs/architecture/evidence/pcc-live/`;
- explicit override: use `PCC_EVIDENCE_OUTPUT_DIR`;
- normalize path safely;
- create the root directory if it does not exist when a live evidence run writes into it, or ensure existing writer/capture flows already create run subfolders;
- never redirect outputs to raw `test-results/` or `playwright-report/` by default;
- tests should prove the default evidence root is repo evidence path, not OS temp.

Do not commit generated evidence outputs from this prompt unless they are synthetic test temp outputs outside the repo or explicitly reviewed docs.

### 6. Add Focused Tests

Add or update tests, preferably in `e2e/pcc-live/pcc-live.runtime.spec.ts` or a new focused env spec if cleaner.

Test cases must cover:

1. With no env vars set, env defaults to:
   - specified site URL;
   - specified CollabHome page URL;
   - `$HOME/.pcc-live-auth/pcc-live-storage-state.json`;
   - repo-root `docs/architecture/evidence/pcc-live`;
   - package-solution version.
2. Explicit env vars override defaults.
3. Missing default storageState path returns `missing-storage-state`, not `missing-env`.
4. Package-solution version is derived from `solution.version`.
5. Feature version mismatch returns explicit invalid status or safe error.
6. Optional conditional env still defaults to disabled unless `PCC_LIVE_ENABLE_CONDITIONAL=true`.
7. No storageState contents are read or emitted in messages.
8. Error messages do not include cookies, tokens, auth/session contents, or raw sensitive file contents.
9. If possible, test repo-root resolution from a nested working directory or by injecting a resolver input.

Use dependency injection or small helper functions to make this testable without modifying real process env globally in a brittle way.

### 7. Update Runbooks

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
  /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/
  ```
  and/or repo-relative:
  ```text
  docs/architecture/evidence/pcc-live/
  ```
- `PCC_EXPECTED_PACKAGE_VERSION` is derived from `apps/project-control-center/config/package-solution.json`.
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

### 8. Do Not Add A Committed `.env`

Do not create or commit:

```text
.env
.env.local
.pcc-live-auth/
*.storageState.json
pcc-live-storage-state.json
```

If a `.gitignore` gap is found for `.pcc-live-auth/` or storage-state files, report it. Only update `.gitignore` if it is clearly missing and the change is narrowly scoped.

## Validation Commands

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.runtime.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.env.ts e2e/pcc-live/pcc-live.runtime.spec.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If the implementation creates a separate env spec file, include it in the Playwright validation and Prettier command.

## Acceptance Criteria

- PCC live suite can run with no manually exported site/page/storage/evidence/version vars except for the existence of the default storageState file.
- Default storageState path is `$HOME/.pcc-live-auth/pcc-live-storage-state.json`.
- Default evidence output root resolves to repo `docs/architecture/evidence/pcc-live/`, which is `/Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/` in the local repo.
- Default expected package version derives from `apps/project-control-center/config/package-solution.json`.
- Solution version and feature versions are validated for consistency.
- Explicit env vars override defaults.
- Missing storageState self-skips clearly and safely.
- No secret/auth/session contents are stored, printed, committed, or embedded in docs.
- No dependency, lockfile, package metadata, SPFx manifest, or package-solution change.
- No product UI runtime change.
- No final score, hard-stop pass/fail, EV final-capture, or Phase 4 readiness claim.
