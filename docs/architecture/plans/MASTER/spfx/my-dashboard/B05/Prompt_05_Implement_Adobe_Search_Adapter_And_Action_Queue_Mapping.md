# Prompt 05 — Implement Adobe Search Adapter and Action Queue Mapping

You are Claude Code using Opus 4.7. Implement the B05 Adobe queue provider seam. Do not re-read files that are still within your current context or memory.

## Objective

Implement a backend-only Adobe Sign action-queue adapter that preserves:

- bounded `POST v6/search` retrieval posture,
- exact six-status MVP union,
- B04 DTO mapping,
- source-state translation,
- safe partial/source-unavailable outcomes,
- no raw provider leakage to SPFx.

## Binding status union

Use exactly:
```text
WAITING_FOR_MY_SIGNATURE
WAITING_FOR_MY_APPROVAL
WAITING_FOR_MY_ACCEPTANCE
WAITING_FOR_MY_ACKNOWLEDGEMENT
WAITING_FOR_MY_FORM_FILLING
WAITING_FOR_MY_DELEGATION
```

Do not add:
- verification,
- prefill,
- terminal agreement statuses,
- broad agreement-level statuses outside B04/B05.

## Implementation lanes

### Search request builder
Create a bounded request builder using:
- approved status list,
- cursor,
- page size,
- any verified Adobe search criteria needed for current-user action relevance.

Do not allow raw SPFx search JSON passthrough.

### Search client
Implement a backend service seam for the Adobe search HTTP call. The exact final Adobe request-body property names must be verified against current official docs or repo-authorized source before coding.

### Action queue adapter
Map provider results into B04 queue DTOs:
- agreement ID/name,
- requiredAction,
- raw Adobe recipient status where B04 requires it,
- optional sender/time/expiration fields,
- optional validated handoff URL only after Prompt 06 policy decisions, or leave safe seam if Prompt 06 follows.

### Source-state mapping
Map:
- config missing → `configuration-required`,
- grant missing/reauth → `authorization-required`,
- actor unresolved → `principal-unresolved`,
- upstream availability failure → `source-unavailable`,
- safe subset/enrichment degradation → `partial`.

## Tests

Required:
- exact six-status mapping,
- unsupported statuses filtered/flagged, never emitted as valid queue rows,
- no unbounded N+1 detail fetch loop,
- pagination/cursor opacity preserved,
- source-state mappings,
- no raw Adobe payload returned to DTO caller.

## Closeout

Return:
- provider seams added,
- query posture,
- tests run,
- what remains for Prompt 06 handoff policy.
