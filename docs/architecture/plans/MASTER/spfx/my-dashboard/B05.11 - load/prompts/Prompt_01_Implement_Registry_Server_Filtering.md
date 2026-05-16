# Prompt 01 — Implement Registry Server-Side Filtering

## 1. Objective

Implement the first targeted backend optimization: narrow the `Legacy Project Fallback Registry` source acquisition before mapping/reconciliation.

The proven current issue is that the Project Links provider fetches a broad registry source set and only later excludes rows in application logic. Live telemetry showed 825 registry rows being acquired per request while only 5 final assigned project items were emitted.

## 2. Repo-truth context

Inspect only what you need to edit and validate:

- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- directly adjacent provider unit tests for that module
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `backend/functions/src/services/legacy-fallback/graph-list-client.ts` only to confirm the `filter` query seam

Context-efficiency rule:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
If a file has already been loaded and remains reliable in context, use that context instead of reopening it.
Only re-read a file if it may have changed, an exact interface or line-level detail is required, or validation/evidence requires a fresh read.

## 3. Architectural guardrails

- Preserve GET/read-model-only posture.
- Preserve current row-eligibility semantics.
- Do not modify reconcile logic except where a test fixture must reflect the new source universe.
- Do not modify Adobe modules.
- Do not modify frontend modules.
- Do not mutate tenant schema or external systems.
- Do not change package files, lockfiles, manifests, workflows, CI, or deployment configuration.

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

Implement a dedicated registry filter constant and use it in `loadRegistryRows()`.

### Required logical predicate

```text
IsActive == true
AND MatchStatus in { matched, unmatched, review-required }
```

### Required behavior

1. Pass the filter through the existing `GraphListClient.listItems(..., { filter })` seam.
2. Preserve:
   - existing `select` fields,
   - existing `top: MAX_SOURCE_ROWS`,
   - existing mapping,
   - existing source failure behavior.
3. Do not widen the target row set.
4. Do not remove the post-fetch defensive eligibility checks from reconciliation unless current code proves they are strictly redundant and tests are expanded accordingly. Default behavior: keep them as defense-in-depth.

### Expected exact files in scope

Allowed:
- provider implementation file
- provider tests

Forbidden:
- Graph client implementation
- runtime diagnostics implementation
- package/lockfile/manifest/workflow/deployment files
- docs outside the closeout note only if Prompt 00 explicitly required a docs correction

## 5. Verification

Run:

```bash
git diff --check
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

Add or update tests proving:

1. the registry Graph request includes the intended filter,
2. launch-eligible statuses remain included,
3. inactive/excluded statuses do not need to be carried into source rows,
4. final read-model correctness does not regress.

## 6. Documentation updates

None required unless a nearby implementation comment is necessary for maintainability. Do not create broad architecture docs in Prompt 01.

## 7. Deliverables / exit criteria

Close out with:

- files changed,
- exact validation outcomes,
- lockfile MD5 before/after,
- staged-file proof,
- confirmation that only registry-source filtering was implemented,
- confirmation that Adobe/frontend/reconcile architecture was not modified.

### Expected commit language

```text
Commit summary
perf(my-projects): filter registry source rows before reconciliation

Commit description
Narrow the My Projects legacy fallback registry acquisition path so the backend requests only active, launch-eligible registry rows before mapping and reconciliation.

Preserve the existing read-model contract, reconcile behavior, telemetry posture, and all source-status semantics. No frontend, Adobe, tenant, package, lockfile, manifest, workflow, or deployment changes.
```
