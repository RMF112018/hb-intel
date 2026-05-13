# Prompt 06 — Package Runtime, Deployment Proof, and Hosted Evidence

## Objective
Produce a governed proof chain from source `main` to packaged `.sppkg` to hosted tenant runtime so operators can determine whether the page is actually running the intended backend production posture.

## Why This Issue Exists Now
Current source packaging appears hardened, but the hosted symptom remains fixture-like. That means repo truth and tenant deployment truth are not yet reconciled.

## Why It Matters
Without artifact/runtime proof, developers can fix code repeatedly while the tenant serves stale or explicitly non-production assets.

## Current Repo-Truth Condition
Inspect and verify:
- `apps/my-dashboard/config/package-solution.json`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
- `tools/build-spfx-package-production-runtime-config.ts`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js`
- any existing package-truth evidence output for My Dashboard.

Known condition:
- source version aligned at `1.0.0.005`,
- production-intended build requires Function URL + API audience,
- shell injects runtime constants.

## Required Future State
1. Strengthen or formalize My Dashboard package-truth evidence so it records:
   - package version,
   - runtime config presence,
   - relevant source fingerprints,
   - emitted bundle/package alignment.
2. Add a concise operator runbook for:
   - rebuilding My Dashboard `.sppkg`,
   - checking API access permission state,
   - verifying App Catalog version,
   - confirming hosted network route calls.
3. If a hosted smoke harness exists, extend it to detect fixture leakage and route invocation. If not, create the smallest governed evidence checklist or script suited to the repo.

## Exact Files / Seams / Symbols to Inspect
- package-solution and webpart manifest
- build package orchestrator
- runtime config gate
- shell define injection
- any current evidence/docs under My Dashboard plans/supporting docs.

## Required Implementation Scope
- Code and docs needed for reproducible proof.
- Tests for package-runtime config guard if altered.
- Evidence instructions that an operator can execute immediately.

## Explicit Non-Scope
- Do not modify tenant directly.
- Do not rebuild unrelated SPFx packages.
- Do not broaden scope to PCC or other apps.

## Required Tests
- Package-runtime config guard tests if applicable.
- Any package-truth generation tests if existing pattern supports them.
- Verification that current domain remains in the production runtime requirement set.

## Validation Commands
Run the closest available equivalent commands in the repo. At minimum, execute the relevant package checks for changed areas, such as:

```bash
pnpm --filter @hbc/my-dashboard check-types
pnpm --filter @hbc/my-dashboard test
pnpm --filter @hbc/functions test
```

Also run any narrower Vitest files or package-specific test commands that directly cover the changed files. If the repo exposes an existing SPFx package verification command for My Dashboard, use it when the prompt changes packaging/runtime proof seams.

## Proof-of-Closure Artifacts
Provide:
- changed-file inventory,
- test command results,
- concise before/after behavior summary,
- any new fixtures/snapshots/evidence docs,
- any remaining operator-only proof items.

## Completion Standard
The prompt is complete only when:
- the required future state is implemented,
- tests are added/updated,
- validation commands are executed or clearly documented if unavailable,
- the closure evidence is produced,
- no out-of-scope surface was disturbed.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
