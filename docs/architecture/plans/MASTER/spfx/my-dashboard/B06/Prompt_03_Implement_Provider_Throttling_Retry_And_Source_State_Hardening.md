# Prompt 03 — Implement Provider Throttling, Retry, and Source-State Hardening

## Role

Act as a backend integration engineer working inside the existing My Work / Adobe Sign provider architecture. Implement B06 resilience semantics without reopening B05 architecture.

## Objective

Implement the B06 backend resilience posture for the Adobe queue provider and its route-to-envelope mapping:

- classify provider failures,
- honor 429 / `Retry-After`,
- keep retries finite and transient-only,
- map refresh-token failure to `authorization-required`,
- preserve B04 route-envelope taxonomy,
- do not add queue caching.

## Preconditions

- Prompt 01 confirmed B05 runtime seams exist.
- B05 delegated OAuth/token/provider architecture must remain intact.

## Required implementation

### A. Safe provider failure classes
Introduce or refine a provider failure classification model that can represent:
- `authorization-required`,
- `configuration-required`,
- `principal-unresolved`,
- `rate-limited`,
- `source-transient-failure`,
- `source-unavailable`,
- `unexpected-provider-shape`.

Naming may follow existing repo conventions, but the semantic distinction must be preserved.

### B. 429 / Retry-After behavior
When Adobe returns 429:
- classify as rate-limited,
- read `Retry-After` or equivalent provider signal where available,
- avoid blind immediate retry,
- retry only if the server-directed delay is short enough and the route’s bounded interactive budget allows it,
- otherwise produce a controlled degraded read-model outcome.

### C. Retry posture
Retries may occur only for true transient classes.

Permitted candidates:
- selected timeouts,
- 502/503/504 style transient failures,
- carefully bounded 429 where the provider explicitly permits a short retry path.

Forbidden:
- endless retry,
- retries for auth/config/principal failures,
- layered retries that amplify load across multiple abstractions.

### D. Source-state mapping
Preserve B04 taxonomy.

Expected mappings:
- missing/expired/revoked grant or refresh failure → `authorization-required`
- missing provider config → `configuration-required`
- actor/grant mismatch → `principal-unresolved`
- 429 / throttling with no safe current result → `source-unavailable`
- true safe partial current result → `partial`
- unhandled internal backend exception → ordinary backend error path, not a fabricated source state.

### E. No durable queue cache
Do not add:
- persisted queue snapshots,
- last-known queue replay,
- browser persistence,
- backend durable read-model cache.

## Testing requirements

Add/update tests for:
1. 429 classification,
2. Retry-After parsing/handling,
3. no endless retry,
4. refresh-token failure → authorization-required,
5. config failure → configuration-required,
6. principal mismatch → principal-unresolved,
7. source-unavailable/partial route mapping remains contract-safe,
8. no cache write path introduced.

## Scope limits

Do not:
- change route URLs,
- change query contract (`pageSize`, `cursor`),
- broaden Adobe status unions,
- implement webhooks,
- refactor generic shared telemetry wrappers globally unless a narrow reusable helper is already established and strictly necessary.

## Closeout

Report:
- provider classes introduced/refined,
- mapping matrix implemented,
- retry posture,
- tests run/results,
- proof that no durable queue cache was added.
