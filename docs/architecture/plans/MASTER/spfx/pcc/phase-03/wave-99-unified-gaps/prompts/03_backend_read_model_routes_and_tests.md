# Prompt 03 — Add Backend PCC Read-Model Routes and Provider Fixtures

## Objective

Extend the PCC backend read-model host so the unified lifecycle model contracts from Prompts 01 and 02 are available through preview-safe, GET-only, fixture-backed read models.

Do not create write routes. Do not call live Graph, Procore, Sage, CRM, Autodesk, Document Crunch, or other external systems. Do not mutate tenant data.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only backend route/provider/tests and model exports required to verify conventions.

## Files to Inspect

- `backend/functions/src/hosts/pcc-read-model/`
- `backend/functions/src/services/__tests__/`
- `packages/models/src/pcc/`
- `packages/models/src/pcc/fixtures/`
- `packages/models/src/index.ts`
- `backend/functions/package.json`

## Required Endpoints

Add GET-only read-model routes consistent with existing PCC read-model route patterns.

At minimum, implement fixture-backed routes for:

- `GET /api/pcc/projects/{projectId}/lifecycle-timeline`
- `GET /api/pcc/projects/{projectId}/project-memory`
- `GET /api/pcc/projects/{projectId}/project-lenses`
- `GET /api/pcc/projects/{projectId}/traceability-graph`
- `GET /api/pcc/projects/{projectId}/warranty-trace`
- `GET /api/pcc/projects/{projectId}/closed-project-references`
- `GET /api/pcc/projects/{projectId}/unified-search`

If the existing route style omits `/api` internally, follow existing implementation conventions while preserving the external route contract in tests/docs.

## Required Provider Behavior

Extend the mock/read-model provider to return deterministic envelopes for the new models.

Each route must return the existing `PccReadModelEnvelope` or equivalent current envelope pattern.

Each envelope must include:

- `projectId`;
- `mode`/preview/mock posture if current envelope supports it;
- source status;
- warnings where data is preview, redacted, unresolved, or insufficiently evidenced;
- traceable source lineage inside records;
- stable deterministic fixture data.

## Unified Search Preview Requirements

The unified search endpoint must be fixture-backed only. It must not use an LLM or live index.

It should support a minimal query parameter pattern if existing backend conventions allow it, for example:

```text
?q=warranty%20product
```

The response must show the intended HBI grounding posture:

- answer or answer fragments are cited to source records;
- results include source record type, source system, evidence link, lifecycle stage, and sensitivity posture;
- if evidence is insufficient, the response says so rather than fabricating a conclusion;
- restricted records are represented as redacted or omitted according to fixture metadata.

## Tests

Add/update backend tests to prove:

- each new route is GET-only;
- each route returns the expected envelope shape;
- unknown project behavior is consistent with existing PCC read-model routes;
- unsupported methods are rejected consistently;
- unified search never returns uncited answer material;
- warranty trace never assigns responsibility when evidence status is insufficient;
- closed-project references include security/redaction posture;
- provider imports do not introduce prohibited runtime dependencies.

## Constraints

- No write routes.
- No live external-system calls.
- No Graph/Procore/Sage/CRM/Autodesk writes.
- No new dependencies.
- No lockfile change.
- No tenant mutation.
- No SPFx implementation in this prompt.

## Validation

Run relevant backend/model gates:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
md5 pnpm-lock.yaml
```

If exact scripts differ, inspect package scripts and run the closest equivalent.

## Required Response

Return:

1. Routes added.
2. Provider methods added.
3. Fixtures consumed.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps passed to Prompt 04.
