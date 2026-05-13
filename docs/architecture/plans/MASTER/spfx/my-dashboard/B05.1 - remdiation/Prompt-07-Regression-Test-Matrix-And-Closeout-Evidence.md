# Prompt 07 — Regression Test Matrix and Closeout Evidence

## Objective
Add the missing cross-seam regression coverage so the exact failure observed by the operator cannot silently recur.

## Why This Issue Exists Now
Existing tests cover local component and provider behavior, but the hosted defect crossed multiple seams:
- preview hero binding,
- fixture queue rendering,
- CTA branch suppression,
- unresolved deployment/runtime proof,
- My Projects actor/data compatibility.

## Why It Matters
Without integrated regression coverage, future changes can reintroduce visually plausible but operationally false hosted states.

## Current Repo-Truth Condition
Inspect and verify:
- My Dashboard factory tests,
- Adobe focused module tests,
- My Projects provider tests,
- any shell tests,
- any package/runtime tests,
- any hosted/e2e harness for My Dashboard.

Known coverage already exists for:
- fixture/backend fallback basics,
- CTA visibility basics,
- provider reconciliation basics.

## Required Future State
Add a test/evidence matrix that covers at least:

1. **Hero/envelope coherence**
   - no static preview values when envelope state exists.

2. **Production fixture leakage guard**
   - known sample agreement titles cannot appear in production acceptance.

3. **Adobe no-grant CTA path**
   - `authorization-required` renders Connect Adobe Sign and invokes start client.

4. **Config/backend degraded path**
   - `configuration-required` and `backend-unavailable` remain non-actionable but truthful.

5. **My Projects actor/data classification**
   - principal unresolved vs zero-match vs match vs source unavailable are distinct.

6. **Package/runtime proof**
   - production-intended build rejects missing Function URL/API audience.
   - domain remains covered by runtime config gate.

7. **Evidence closeout**
   - add or update a closeout template documenting operator proof requirements and remaining tenant-only validation.

## Exact Files / Seams / Symbols to Inspect
- All changed files from Prompts 01–06
- existing Vitest suites
- package-runtime guard tests
- evidence docs/runbooks.

## Required Implementation Scope
- Add missing tests.
- Update snapshots only where intentional and justified.
- Provide closeout document summarizing what is now code-proven vs still tenant-proven.

## Explicit Non-Scope
- Do not start unrelated feature work.
- Do not broaden to downstream Adobe document actions.
- Do not mutate tenant data.

## Required Tests
This prompt is itself test-centric. Create the test inventory, implement the missing tests, and run the full relevant validation suite.

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
