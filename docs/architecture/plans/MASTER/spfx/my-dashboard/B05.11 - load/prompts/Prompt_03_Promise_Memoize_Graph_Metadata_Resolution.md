# Prompt 03 — Promise-Memoize Graph Metadata Resolution

## 1. Objective

Reduce cold-path duplicate Graph metadata work by adding in-flight Promise memoization to the Graph-backed list client.

Current issue:
- successful site/list resolution is cached after completion,
- but concurrent cold callers can race before cache state is set,
- `Projects` and `Legacy Project Fallback Registry` loads begin in parallel and can duplicate metadata lookups.

## 2. Repo-truth context

Inspect:

- `backend/functions/src/services/legacy-fallback/graph-list-client.ts`
- existing tests for the client, or nearest repository-conventional test location if a focused test file must be added

Context-efficiency rule:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
If a file has already been loaded and remains reliable in context, use that context instead of reopening it.
Only re-read a file if it may have changed, an exact interface or line-level detail is required, or validation/evidence requires a fresh read.

## 3. Architectural guardrails

- Do not change Graph API authorization posture.
- Do not change Graph route shapes except where Promise memoization naturally reuses the same existing fetch.
- Do not alter list-items fetch semantics.
- Do not introduce external dependencies.
- Do not modify provider logic in this prompt.
- Do not modify package, lockfile, manifest, workflow, CI, or deployment files.

Mandatory preflight:
1. Run and record:
   - `git status --short`
   - `git branch --show-current`
   - `git log --oneline -20`
   - `md5 pnpm-lock.yaml`
2. Identify unrelated pre-existing changes. Do not edit, stage, or absorb them.
3. Never use broad `git add .`. Stage exact intended paths only.
4. Before commit, run:
   - `git diff --check`
   - `git diff --cached --name-only`
5. After validation, run `md5 pnpm-lock.yaml` again and report before/after values.

## 4. Implementation instructions

Implement in-flight memoization for:

### A. `resolveSiteId()`
Required behavior:
1. return `cachedSiteId` when already resolved,
2. return the same in-flight Promise when resolution is underway,
3. populate `cachedSiteId` on success,
4. clear the in-flight Promise on failure.

### B. List catalog resolution behind `resolveListId(title)`
Required behavior:
1. keep using `listIdByTitle`,
2. coalesce concurrent catalog fetches used to populate the map,
3. after the shared catalog completes, resolve requested title from the map,
4. on catalog failure, clear the in-flight Promise so later calls may retry.

### C. Preserve retry safety
A failed cold-path metadata lookup may not permanently poison future requests.

## 5. Verification

Run:

```bash
git diff --check
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

Add tests proving:

1. two concurrent `resolveSiteId()` calls issue one underlying site fetch,
2. two concurrent `resolveListId(...)` calls issue one list-catalog fetch when the map is empty,
3. failed site resolution can retry,
4. failed list-catalog resolution can retry.

## 6. Documentation updates

None required in this prompt. Prompt 04 owns telemetry/docs closeout.

## 7. Deliverables / exit criteria

Return:
- files changed,
- exact concurrency tests added,
- validation outcomes,
- lockfile MD5 before/after,
- staged-file proof,
- explanation of how failure-path retry remains possible.

### Expected commit language

```text
Commit summary
perf(graph): coalesce cold-path site and list metadata lookups

Commit description
Promise-memoize Graph site ID and list-catalog resolution so parallel My Projects source reads can share in-flight metadata requests during cold or uncached execution.

Retain existing cache semantics after success and clear failed in-flight promises for future retries. No provider contract, tenant, package, lockfile, manifest, workflow, deployment, or external-system changes.
```
