# Prompt 02 — Implement Registry Source Cache and Request Coalescing

## 1. Objective

Add a short-lived, worker-local, request-coalesced cache for **filtered registry source rows** so repeated My Projects reads do not refetch the same registry row set on every request.

Current issue:
- registry source loading dominates handler latency,
- the source row set is shared across users,
- repeated requests can re-read the same filtered registry source unnecessarily.

## 2. Repo-truth context

Inspect only:

- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- immediately adjacent provider tests
- any existing cache/coalescing pattern in nearby backend services only if exact reuse is needed

Context-efficiency rule:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
If a file has already been loaded and remains reliable in context, use that context instead of reopening it.
Only re-read a file if it may have changed, an exact interface or line-level detail is required, or validation/evidence requires a fresh read.

## 3. Architectural guardrails

- Cache shared registry source rows only.
- Do **not** cache per-user rendered My Projects envelopes.
- Do **not** cache failures.
- Preserve source-status behavior.
- Preserve actor-specific reconciliation.
- Do not modify Adobe or frontend modules.
- Do not introduce external cache infrastructure.
- Do not change package, lockfile, manifest, workflow, or deployment files.

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

Implement a cache seam with these closed decisions:

### TTL
```text
60 seconds
```

### Cache state model
At minimum support:
- `hit`
- `miss`
- `coalesced`

### Required mechanics
1. Cache the successful filtered registry source result.
2. Store cache write time.
3. On a cache hit within TTL:
   - return the cached result,
   - avoid Graph call.
4. On a miss:
   - launch one registry source load.
5. On concurrent misses:
   - reuse the same in-flight Promise.
6. On failure:
   - clear in-flight state,
   - do not populate cache.
7. On expiry:
   - reload source rows normally.

### Suggested implementation posture
Prefer implementing this within the provider’s source dependency composition so the cache remains clearly scoped to the registry source lane and does not change public provider contracts.

## 5. Verification

Run:

```bash
git diff --check
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

Add tests proving:

1. first call = miss + underlying loader invoked,
2. second call inside TTL = hit + no second loader invocation,
3. concurrent calls = one underlying loader invocation + coalesced path,
4. failure is not cached,
5. expired cache triggers reload,
6. final read-model correctness remains unchanged.

## 6. Documentation updates

None required yet. Prompt 04 will update telemetry/KQL docs after the runtime shape is final.

## 7. Deliverables / exit criteria

Return:
- files changed,
- exact tests added/updated,
- exact command outcomes,
- lockfile MD5 before/after,
- staged-file proof,
- explicit note that cache scope is shared registry source rows only.

### Expected commit language

```text
Commit summary
perf(my-projects): cache filtered registry source rows with request coalescing

Commit description
Add a bounded 60-second in-process cache around the filtered legacy fallback registry source lane so repeated My Projects reads can reuse shared registry rows and concurrent cache misses share one underlying load.

Keep caching scoped to source rows only, never per-user rendered envelopes. Do not cache failures. Preserve read-model correctness, status semantics, and existing backend boundaries without frontend, Adobe, tenant, package, lockfile, manifest, workflow, or deployment changes.
```
