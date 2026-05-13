# Prompt 10 — Backend Route Registration, Auth Claim Discipline, and Route Tests

## Objective

Register the new protected backend endpoint:

```http
GET /api/my-work/me/project-links
```

inside the existing My Work read-model Azure Functions host, using the provider work from Prompt 09 and preserving the existing home/Adobe route behavior.

This prompt must prove:

- actor identity derives from validated auth claims;
- no actor/user/email/UPN query override is accepted;
- response envelope is wrapped in the same `{ data: envelope }` shape used by current routes.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 09 closeout
- Prompt 08 closeout

---

## Repo-truth references to inspect

- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.test.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- project-links provider/service from Prompt 09
- `packages/models/src/myWork/MyWorkReadModels.ts`

---

## Implementation scope

### 1. Register the new protected GET route

Add a route registration consistent with existing route style:

```ts
app.http('getMyWorkProjectLinks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-work/me/project-links',
  handler: withAuth(withTelemetry(...)),
});
```

Match current repo conventions for:

- request ID extraction;
- telemetry metadata;
- success/error responses;
- provider invocation.

### 2. Actor claim discipline

Build context actor using validated auth claims, consistent with current `actorFromClaims` posture.

The route must:

- pass auth-derived actor to the provider;
- not parse or accept:
  - `actor`
  - `user`
  - `principal`
  - `email`
  - `upn`
  - or similar query values.

### 3. Query behavior

MVP route accepts no project-specific query parameters. It should ignore unrelated actor override query parameters rather than binding them into provider context.

If the repo route standard treats unsupported query parameters differently, follow current convention and document it.

### 4. Tests

Expand route tests to cover:

- exactly three My Work read-model routes now register:
  - home;
  - Adobe queue;
  - project-links;
- project-links route path and method/auth level;
- provider invoked with auth-derived actor and request ID;
- missing displayName fallback to UPN if current helper applies uniformly;
- actor override query parameters are ignored;
- provider errors return repo-standard 500 response;
- response is:
  - HTTP 200;
  - `{ data: envelope }`.

### 5. Provider wiring

If the route host currently instantiates a mock provider directly, wire the new project-links provider in the cleanest repo-native way that preserves:

- fixture/mock behavior where currently expected;
- live project-links provider behavior where intended by Prompt 09.

Do not leave the project-links route permanently fixture-only if Prompt 09 implemented live behavior. If a config factory is needed to combine current mock routes and new live project-links behavior, implement the smallest clean seam and test it.

---

## Required non-goals

- Do not modify frontend clients.
- Do not build UI.
- Do not change route paths for existing home/Adobe endpoints.
- Do not add query filtering or pagination to project-links MVP.
- Do not mutate SharePoint tenant data.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Targeted searches:

```bash
rg -n "getMyWorkProjectLinks|my-work/me/project-links|actor=|principal=|email=|upn=" \
  backend/functions/src/hosts/my-work-read-model
```

Confirm existing routes remain present:

```bash
rg -n "my-work/me/home|my-work/me/adobe-sign/action-queue|my-work/me/project-links" \
  backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
```

---

## Evidence requirements

Closeout must include:

- route registration summary;
- provider-wiring summary;
- route-test additions;
- validation outcomes;
- confirmation that no actor override surface exists.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): register protected project-links read-model route
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Route registration shape
5. Actor-claim discipline proof
6. Provider wiring posture
7. Validation commands and outcomes
8. Recommended next prompt:
   - Prompt 11

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes.
- No route redesign outside the new endpoint.
- Preserve current withAuth/telemetry/response helper conventions.
