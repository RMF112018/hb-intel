# Prompt 11 — Frontend Read-Model Client and Fallback Integration

## Objective

Extend the My Dashboard frontend read-model client stack to support:

```ts
getMyProjectLinks()
```

across:

- the client interface;
- backend bearer-token client;
- deterministic fixture client;
- route ID registry.

This prompt connects the new backend route and shared contracts to the UI layer without yet implementing the visible My Projects module.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 08 closeout
- Prompt 10 closeout

---

## Repo-truth references to inspect

- `apps/my-dashboard/src/api/myWorkReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts`
- any client factory file used by My Dashboard surfaces
- `packages/models/src/myWork/MyWorkReadModels.ts`
- fixtures created in Prompt 08

---

## Implementation scope

### 1. Extend route ID registry

Add:

```ts
'project-links'
```

to the route IDs collection, ensuring it remains type-safe against the shared route-key type.

### 2. Extend frontend interface

Add:

```ts
getMyProjectLinks(): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>>;
```

### 3. Extend backend client

Implement:

```ts
async getMyProjectLinks()
```

by calling:

```ts
this.callBackend('project-links', () => this.fallback.getMyProjectLinks());
```

No query string is required.

### 4. Extend fixture client

Return:

- available project-links fixture by default;
- backend-unavailable project-links fixture when `simulateBackendUnavailable === true`.

### 5. Keep fallback semantics intact

The backend client must continue to:

- fail safely to fixture fallback on:
  - token acquisition error;
  - empty token;
  - fetch error;
  - non-2xx response;
  - malformed JSON;
  - missing wrapped envelope;
  - invalid envelope shape.

### 6. Tests

Add/update tests proving:

- route IDs include project-links;
- backend URL assembly targets:
  - `/api/my-work/me/project-links`;
- fallback invoked on backend failure;
- fixture client returns expected project-links scenario;
- existing home/Adobe behavior is not regressed.

---

## Required non-goals

- Do not build UI.
- Do not change backend provider/route logic.
- Do not alter My Work home shell composition.
- Do not add query or filter parameters.
- Do not mutate package manifests or lockfiles unless an already existing build step forces a scoped change.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Use targeted search:

```bash
rg -n "getMyProjectLinks|project-links|my-work/me/project-links" \
  apps/my-dashboard/src/api \
  packages/models/src/myWork
```

---

## Evidence requirements

Closeout must include:

- exact client files changed;
- backend URL construction posture;
- fallback behavior confirmation;
- validation command outcomes;
- statement that UI rendering remains deferred to Prompt 12.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): connect frontend read-model clients to project-links route
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Interface/backend/fixture changes
5. Fallback behavior proof
6. Validation commands and outcomes
7. Recommended next prompt:
   - Prompt 12

---

## Guardrails

- Protect unrelated active work.
- No speculative client refactor.
- No lockfile/package changes unless strictly required.
- Preserve existing backend-failure fallback posture exactly.
