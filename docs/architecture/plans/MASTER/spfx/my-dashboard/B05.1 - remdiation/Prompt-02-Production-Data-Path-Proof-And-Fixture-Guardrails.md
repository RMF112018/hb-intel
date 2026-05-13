# Prompt 02 — Production Data-Path Proof and Fixture Guardrails

## Objective
Make it operationally impossible to mistake fixture data for production-live Adobe queue data in hosted testing and deployment acceptance.

## Why This Issue Exists Now
The hosted screenshot contains Adobe agreement rows/counts that exactly match committed fixtures. The repo supports legitimate fixture mode for `ui-review`, but the hosted surface currently lacks a sufficiently explicit production/non-production data-path proof.

## Why It Matters
Operators need to distinguish:
- live backend data,
- backend-unavailable fallback,
- explicit UI-review fixture mode,
- backend mock provider mode.

Without that distinction, realistic fixture rows can be mistaken for live personalization.

## Current Repo-Truth Condition
Inspect and verify:
- `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts`
- `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/src/config/runtimeConfig.ts`
- `apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx`
- existing package/runtime markers and tests.

Known behavior:
- fixture client default returns `available` fixture data,
- backend client failures degrade to `backend-unavailable`,
- package build now refuses production-intended missing Function URL/API audience.

## Required Future State
Implement a truthful proof model for data-path posture. At minimum:
1. Expose a non-user-confusing runtime marker/evidence seam that identifies current read-model data path:
   - backend-live attempt,
   - backend-unavailable fallback,
   - explicit fixture/ui-review.
2. Prevent production acceptance tests from treating fixture-identical rows as valid.
3. Preserve explicit `ui-review` fixture capability for non-production review if still intended.
4. Add a regression detector for the known sample Adobe title set so production-targeted acceptance fails if those fixture rows render.

## Exact Files / Seams / Symbols to Inspect
- `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts`
- `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx`
- `apps/my-dashboard/src/config/runtimeConfig.ts`
- any My Dashboard package-truth/evidence helpers
- any current Playwright or hosted smoke harness for My Dashboard.

## Required Implementation Scope
1. Add data-path classification metadata suitable for tests/evidence.
2. Ensure fixture mode is explicit and not visually indistinguishable from production.
3. Add unit/integration tests around:
   - production backend mode,
   - explicit ui-review fixture mode,
   - backend-unavailable fallback mode.
4. Add production acceptance guard that fails when known fixture agreement titles appear.
5. Document the diagnostic interpretation.

## Explicit Non-Scope
- Do not remove fixture infrastructure outright if still needed for UI review.
- Do not rewrite provider resolver in this prompt.
- Do not alter Adobe OAuth business logic.

## Required Tests
- Factory/data-path classification tests.
- Acceptance-regression test for fixture title leakage.
- Any shell/card marker tests required to expose path state for hosted proof.

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
