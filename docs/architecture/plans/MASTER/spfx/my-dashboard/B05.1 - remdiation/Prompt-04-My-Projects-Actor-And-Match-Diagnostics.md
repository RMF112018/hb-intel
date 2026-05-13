# Prompt 04 — My Projects Actor and Match Diagnostics

## Objective
Make My Projects personalization diagnostically explicit so operators can distinguish:
- backend not reached,
- principal unresolved,
- zero valid assignments,
- source unavailable,
- tenant actor/list mismatch.

## Why This Issue Exists Now
The repo has a deterministic actor-matching path, but the hosted issue cannot be closed from code alone without a trustworthy evidence seam that connects:
token claims → normalized actor principal → source row matching → result classification.

## Why It Matters
A valid authenticated user can still see zero projects for multiple reasons. The system needs to identify which reason applies without exposing sensitive token contents.

## Current Repo-Truth Condition
Inspect and verify:
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- current telemetry/logging/evidence patterns.

Known behavior:
- route passes `claims.upn` / `claims.oid`,
- provider normalizes UPN and exact-matches list role storage,
- zero matches can be legitimate and are currently rendered as an empty list.

## Required Future State
1. Add non-sensitive diagnostic classification for My Projects, suitable for logs/tests/evidence:
   - backend-route-invoked,
   - principal-normalized,
   - principal-unresolved,
   - source-readiness status,
   - zero-role-match vs item match.
2. Do **not** log raw bearer tokens or excessive PII.
3. Consider exposing stable test/evidence markers in the response metadata or sanitized telemetry, not necessarily in user-facing UI unless clearly appropriate.
4. Preserve current read-only read-model contract.

## Exact Files / Seams / Symbols to Inspect
- `validateToken.ts`
- `my-work-read-model-routes.ts`
- `my-project-links-read-model-provider.ts`
- any logger/telemetry helpers
- `MyProjectsHomeCard.tsx`
- route/provider tests.

## Required Implementation Scope
- Add operator-grade diagnostics or evidence hooks.
- Add tests verifying diagnostic classification.
- Improve documentation/runbook language for interpreting:
  - no assignments,
  - principal unresolved,
  - source unavailable,
  - runtime fallback.

## Explicit Non-Scope
- Do not change list schema in this prompt.
- Do not switch My Projects to OID-based storage in this prompt.
- Do not modify Adobe OAuth.

## Required Tests
- Principal unresolved classification.
- Zero-match but available source classification.
- Successful match classification.
- Source unavailable classification.
- Any telemetry/evidence redaction tests needed.

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
