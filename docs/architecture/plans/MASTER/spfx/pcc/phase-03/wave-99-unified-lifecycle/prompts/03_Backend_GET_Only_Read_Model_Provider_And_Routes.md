# 03 — Backend GET-Only Read-Model Provider and Routes

## Objective

Implement or verify backend GET-only read-model provider and route support for the unified lifecycle aggregate and leaf route families. This prompt is no-op aware.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Likely Files To Inspect/Edit

```text
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/hosts/pcc-read-model/read-models/
backend/functions/src/services/__tests__/
packages/models/src/pcc/
backend/functions/package.json
```

## Required Route Families

GET-only:

```text
/api/pcc/projects/{projectId}/unified-lifecycle
/api/pcc/projects/{projectId}/project-memory
/api/pcc/projects/{projectId}/project-lenses
/api/pcc/projects/{projectId}/project-traceability
/api/pcc/projects/{projectId}/warranty-trace
/api/pcc/projects/{projectId}/cross-project-knowledge
/api/pcc/projects/{projectId}/unified-search
```

## Required Deliverables

Verify or implement:

- provider interface methods;
- deterministic mock provider responses;
- known project response;
- unknown project/degraded response behavior;
- GET-only route registration;
- query parameter handling for unified search without leaking viewer persona into URL unless existing repo convention permits it;
- no write routes;
- no external calls;
- no Graph/PnP/SharePoint/Procore/Sage/LLM/vector/search runtime imports;
- backend tests.

## Prohibited Scope

- No SPFx UI changes.
- No live source-system calls.
- No POST/PUT/PATCH/DELETE behavior.
- No persistence store.
- No package/lockfile changes unless explicitly approved.

## Validation

After inspecting backend package scripts, run repo-correct validation. Likely:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Always run git/lockfile/diff gates.

## Commit Summary

If committing:

```text
feat(functions-pcc): add unified lifecycle read-model routes
```

## Final Output Requirements

Report route/provider shape, test evidence, no-write/no-external-call proof, files changed, validation results, and lockfile MD5.
