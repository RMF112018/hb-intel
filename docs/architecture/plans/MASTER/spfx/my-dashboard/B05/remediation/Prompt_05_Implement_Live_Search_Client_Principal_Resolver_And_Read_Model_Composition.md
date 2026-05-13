# Prompt 05 — Implement Live Search Client, Principal Resolver, and Read-Model Composition

## Objective

Complete the live Adobe Sign read-model runtime by implementing:

1. a production Adobe Sign search-client adapter,
2. a concrete principal resolver,
3. production provider composition for My Work routes,
4. live/home read-model behavior that replaces the current hard-wired mock-only route posture when configured.

This prompt is the point where the previously implemented OAuth/grant/token runtime becomes usable by the protected My Work read endpoints.

---

## Governing closed decisions

- Live queue retrieval uses bounded:
  - `POST {api_access_point}/api/rest/v6/search`
- OAuth scope remains:
  - `agreement_read:self`
- Search results remain mapped only to the existing six current-user action statuses already governed by B04/B05.
- Route queries remain bounded to:
  - `pageSize`
  - `cursor`
- No per-row unbounded detail-fetch loop.
- No direct Adobe calls from SPFx.
- No durable queue-data cache.
- Expected source/business degradation returns typed envelopes rather than raw provider payloads.

---

## Repo-truth references to inspect

Only inspect what is necessary. Avoid re-reading files still active in current context unless drift is suspected or prior steps changed them.

### Required files
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- `.../my-work-mock-read-model-provider.ts`
- `.../adobe-sign/adobe-sign-principal-resolution.ts`
- `.../adobe-sign/adobe-sign-grant-store.ts`
- `.../adobe-sign/adobe-sign-config.ts`
- `.../adobe-sign/adobe-sign-token-service.ts`
- `.../adobe-sign/adobe-sign-search-client.ts`
- `.../adobe-sign/adobe-sign-search-request.ts`
- `.../adobe-sign/adobe-sign-action-queue-adapter.ts`
- `packages/models/src/myWork/MyWorkReadModels.ts`
- the relevant Adobe queue DTO files under `packages/models/src/myWork/`

### Tests
- `my-work-read-model-routes.test.ts`
- `adobe-sign-search-client.test.ts`
- `adobe-sign-action-queue-adapter.test.ts`
- add resolver/provider tests as needed.

---

## Implementation scope

Implement:

1. Production Adobe search HTTP adapter.
2. Principal resolver implementation that converts authenticated My Work context into governed Adobe source status based on:
   - actor normalization,
   - config readiness,
   - grant store lookup,
   - grant lifecycle state.
3. A live Adobe-backed read-model provider or equivalent composition root.
4. Route-level provider selection/composition so configured backend mode can use live implementation instead of `MyWorkMockReadModelProvider` only.
5. Home read-model integration so the My Work home route reflects live Adobe readiness/summary/preview when live provider mode is selected.

---

## Exact files or file families likely to change

Likely modify:
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- `.../adobe-sign-principal-resolution.ts` only if a factory/helper belongs there.

Likely add:
- `.../adobe-sign-live-search-client.ts`
- `.../adobe-sign-principal-resolver.ts`
- `.../my-work-adobe-sign-live-read-model-provider.ts`
  or repo-conforming equivalents.

Tests:
- production search client tests,
- principal resolver tests,
- provider tests,
- route-composition tests.

---

## Required non-goals

Do not:
- add polling/UI refresh logic,
- add queue-data caching,
- broaden frontend scope,
- change the B04 route contracts,
- synthesize client-side Adobe URLs,
- broaden supported Adobe statuses beyond governed action states,
- remove mock/fixture mode support.

---

## Detailed execution steps

### Step 1 — Session preflight
Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Report unrelated WIP and avoid it.

### Step 2 — Implement principal resolver
Create a concrete resolver that returns the existing closed `AdobeSignPrincipalResolutionResult` union.

Expected mapping:
- config/store not ready → `configuration-required`
- app-only or malformed actor → `principal-unresolved`
- no grant or reauth-required grant → `authorization-required`
- store/provider transient failure → `source-unavailable`
- valid active grant → `resolved`

The resolver must:
- use actor key semantics already established by B05,
- never resolve by email/UPN,
- never create a shared-principal fallback.

### Step 3 — Implement live search-client adapter
Implement the production HTTP adapter behind `IAdobeSignSearchClient`.

Request posture:
- POST to:
  ```text
  {apiAccessPoint}/api/rest/v6/search
  ```
- bearer access token only in the Authorization header,
- body shape derived from current official Adobe API requirements and the existing internal search-request seam.

The client must:
- remain bounded/paginated,
- never expose raw vendor body,
- map success into the existing closed intermediate item shape,
- map 401/403-style invalid token behavior to `unauthorized`,
- map transport/5xx-style behavior to `unreachable`,
- keep any 429/rate-limit behavior compatible with the existing B06 hardening package rather than inventing contradictory behavior.

### Step 4 — Preserve B05 action-queue mapping
Confirm `adobe-sign-action-queue-adapter.ts` remains the canonical mapping layer:
- no row bypass,
- no raw search payload directly to routes,
- unsupported statuses filtered with governed warnings,
- source URL policy applied only where applicable.

Only edit the adapter if actual live-search integration exposes a narrowly required contract gap.

### Step 5 — Implement live provider composition
Add a real backend provider composition that satisfies `IMyWorkReadModelProvider`.

Required behavior:
- `getAdobeSignActionQueue(...)` delegates to the governed action-queue adapter.
- `getMyWorkHome(...)` returns:
  - actor summary from existing route context,
  - source-readiness derived from live Adobe principal/token/search readiness,
  - Adobe queue summary + preview items within existing B04 limits,
  - typed source states on degradation rather than throwing.

Do not silently keep the home route fixture-only while the focused module becomes live.

### Step 6 — Replace hard-wired mock-only route posture
`my-work-read-model-routes.ts` currently hard-wires:

```ts
const provider: IMyWorkReadModelProvider = new MyWorkMockReadModelProvider();
```

Replace this with a governed provider factory/composition pattern that:
- preserves mock/test fixture mode,
- supports live configured mode,
- cleanly maps missing production dependencies to typed source states rather than runtime crashes.

Do not break existing route auth/query handling.

### Step 7 — Tests
Add/extend tests covering:
- resolver status mapping,
- search client URL/body/headers,
- search client normalized error mapping,
- live provider queue route behavior,
- live provider home route behavior,
- route provider composition in mock vs live modes,
- no actor override remains possible,
- no route sends raw Adobe provider JSON.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/functions test -- adobe-sign-search
pnpm --filter @hbc/functions test -- adobe-sign-action-queue
pnpm --filter @hbc/functions test -- my-work-read-model-routes
pnpm --filter @hbc/functions check-types
```

Adapt to actual repo test filtering syntax and report exact commands used.

Run targeted inspections:

```bash
rg -n "MyWorkMockReadModelProvider\\(\\)|new MyWorkMockReadModelProvider|POST .*v6/search|AdobeSignPrincipalResolutionResult|sourceStatus" backend/functions/src/hosts/my-work-read-model
```

Interpret findings:
- mock provider should remain available,
- but route composition should no longer be permanently mock-only when live runtime is configured.

---

## Evidence requirements

Provide:
- provider composition summary,
- resolver status mapping summary,
- search client behavior summary,
- validation outputs,
- any remaining operator configuration requirements.

---

## Commit / closeout expectations

Suggested commit title:

```text
feat(my-dashboard): wire live Adobe Sign search provider into My Work routes
```

Final response format:

```text
HB: Prompt 05 — Live Search Client, Principal Resolver, and Read-Model Composition

Verdict:
- PASS / FAIL

Branch / HEAD:
- Starting:
- Ending:

Implemented:
1. Principal resolver:
2. Live search client:
3. Live provider composition:
4. Home route live projection:
5. Route provider selection:

Files changed:
- ...

Validation:
- ...

Residual operator requirements:
- ...

Suggested commit:
- ...
```

---

## Risks / guardrails

- Do not leave the home route mock-only if the focused Adobe route goes live.
- Do not bypass the existing action-queue adapter.
- Do not create unbounded detail-fetch fan-out.
- Do not return raw Adobe payload fragments through route envelopes.
