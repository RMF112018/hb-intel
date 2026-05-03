# Prompt 04A — SPFx Unified Lifecycle Client + Fixture Client Parity

## Objective

Add typed SPFx client access for the seven canonical PCC unified lifecycle backend read-model routes added in Prompt 03, plus fixture-client parity. This prompt must not build UI components or surface integration.

Use the canonical Prompt 03 route IDs and methods. Do not use older/non-canonical names such as `lifecycle-timeline`, `traceability-graph`, or `closed-project-references`.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Current Backend Truth

Prompt 03 commit:

```text
8d55565bd91ec9f67bf11bbd9e245452327e3113
```

Canonical backend GET routes:

- `pcc/projects/{projectId}/unified-lifecycle`
- `pcc/projects/{projectId}/project-memory`
- `pcc/projects/{projectId}/project-lenses`
- `pcc/projects/{projectId}/project-traceability`
- `pcc/projects/{projectId}/warranty-trace`
- `pcc/projects/{projectId}/cross-project-knowledge`
- `pcc/projects/{projectId}/unified-search`

Canonical backend provider methods:

- `getUnifiedLifecycle`
- `getProjectMemory`
- `getProjectLenses`
- `getProjectTraceability`
- `getWarrantyTrace`
- `getCrossProjectKnowledge`
- `getUnifiedSearch`

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify all uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Preserve unrelated and user-owned changes, especially:

- existing `apps/project-control-center/src/surfaces/constraintsLog/**` changes;
- existing constraints-log tests;
- the wave-99 docs prompt file under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-99-unified-gaps/`.

Do not stage or normalize unrelated files.

## Files to Inspect

Inspect current conventions in:

- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/package.json`
- `packages/models/src/pcc/`

Do not re-read files still in current context or memory unless required to verify current repo truth.

## Required SPFx Client Methods

Add typed client methods matching the canonical backend routes:

- `getUnifiedLifecycle(projectId)`
- `getProjectMemory(projectId)`
- `getProjectLenses(projectId)`
- `getProjectTraceability(projectId)`
- `getWarrantyTrace(projectId)`
- `getCrossProjectKnowledge(projectId)`
- `getUnifiedSearch(projectId, query?)`

Use the existing PCC client/helper pattern. Do not invent a second API pattern.

Each method must return the appropriate `PccReadModelEnvelope<T>` type from `@hbc/models/pcc`.

## Required Fixture Client Parity

Add fixture-backed implementations for the same methods using existing `@hbc/models/pcc` fixture envelopes or read-model fixtures.

Fixture client methods must return deterministic `PccReadModelEnvelope<T>` values and preserve:

- `readOnly: true`;
- fixture/mock mode posture consistent with existing SPFx fixture-client conventions;
- source status;
- warnings;
- generated timestamp posture;
- source-lineage/citation safety.

If current SPFx fixture clients return raw read models instead of envelopes, follow current repo convention, but keep the type boundary explicit and covered by tests.

## Unified Search Query Handling

`getUnifiedSearch(projectId, query?)` must map `query` to backend query parameter `q`.

Rules:

- omit `q` when `query` is blank/undefined;
- URL-encode query values through the existing request helper;
- do not fabricate uncited answers in the fixture client;
- no live search, no background work, no external integration.

## Explicitly Forbidden Route Names

Do not add client routes or methods for:

- `lifecycle-timeline`
- `traceability-graph`
- `closed-project-references`

These are internal read-model structures only.

## Constraints

- No UI components.
- No shell navigation changes.
- No Project Home integration.
- No Project Readiness integration.
- No backend edits.
- No model edits unless required for a compile-blocking export issue.
- No package/dependency/lockfile changes.
- No live external calls.
- No tenant mutation.
- No broad formatting.

## Tests

Add/update SPFx tests proving:

- each client method constructs the expected canonical backend route path;
- fixture client returns expected typed envelope/data;
- unified-search passes optional `query` as `q`;
- blank/undefined unified-search query does not add `q`;
- no non-canonical route paths are used:
  - no `lifecycle-timeline`;
  - no `traceability-graph`;
  - no `closed-project-references`;
- client methods do not require live external integrations;
- no route name drift from Prompt 03.

Prefer focused client/fixture tests over broad rendering tests in this prompt.

## Validation

Run and report:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
md5 pnpm-lock.yaml
```

If model export issues arise, run:

```bash
pnpm --filter @hbc/models check-types
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Client methods added.
4. Fixture client methods added.
5. Tests added/updated.
6. Validation results.
7. Lockfile MD5 before/after.
8. Remaining gaps for Prompt 04B.
9. Commit hash if committed.
10. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 04A-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): add unified lifecycle read-model client parity
```
