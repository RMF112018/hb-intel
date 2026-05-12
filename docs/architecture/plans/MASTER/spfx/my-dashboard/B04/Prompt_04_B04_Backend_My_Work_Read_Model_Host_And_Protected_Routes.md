# Prompt 04 — B04 Backend My Work Read-Model Host and Protected Routes

## 1. Objective

Implement the backend-for-frontend My Work read-model host, deterministic mock provider, and exactly two protected GET route registrations defined by B04.

## 2. Why this work exists

The My Dashboard SPFx app needs a protected backend BFF/read-model host. This backend layer must derive actor context from auth, normalize queue responses, and preserve stable envelope semantics without leaking raw provider details to the frontend.

## 3. Current repo-truth problem or gap

No `backend/functions/src/hosts/my-work-read-model/` namespace or `/api/my-work/me/...` route family exists in the repo. PCC route hosts provide a pattern, but My Work must be actor-contextual and use the exact B04 routes and query semantics.

## 4. Attached B04 authority / plan basis

Use the attached **B04 — My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development** artifact as the authoritative batch plan. Preserve these closed decisions:

- Backend host namespace:
  `backend/functions/src/hosts/my-work-read-model/`
- Exactly two routes:
  - `GET /api/my-work/me/home`
  - `GET /api/my-work/me/adobe-sign/action-queue`
- Routes protected with `withAuth`
- Expected source/business states return 200 + envelope
- Query validation returns 400 for invalid `pageSize`
- No actor override route/query
- No live Adobe provider/OAuth in B04; use mock provider backed by deterministic fixtures.

## 5. Exact files, folders, docs, and symbols to inspect

Inspect:
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/utils/response-helpers.ts`
- `backend/functions/src/utils/withTelemetry.ts`
- Prompt 01–02 model/fixture outputs.

## 6. Required implementation outcome

Create:
```text
backend/functions/src/hosts/my-work-read-model/
├── my-work-read-model-routes.ts
├── my-work-read-model-routes.test.ts
└── read-models/
    ├── my-work-read-model-provider.ts
    └── my-work-mock-read-model-provider.ts
```

Add any co-located tests that align with the repo’s current host/provider test style.

## 7. Detailed change instructions

1. Create a backend-only provider interface/context file:
   - `IMyWorkReadModelProvider`
   - backend auth-derived read context type if needed
   - provider methods:
     - `getMyWorkHome(...)`
     - `getAdobeSignActionQueue(..., query)`

2. Create a deterministic mock provider that:
   - returns B04 fixture-backed envelopes,
   - accepts or can be configured with deterministic time/scenario inputs where consistent with repo practice,
   - never calls Adobe or external services.

3. Create route registration file using the PCC route-host pattern:
   - `app.http(...)`
   - GET-only
   - `authLevel: 'anonymous'` at Azure registration level if repo pattern requires it
   - `handler: withAuth(withTelemetry(...))`
   - request-id extraction and shared response helpers.

4. Register exactly:
   - `getMyWorkHome`
   - `getMyWorkAdobeSignActionQueue`

5. Route paths:
   - `my-work/me/home`
   - `my-work/me/adobe-sign/action-queue`

6. Queue route query validation:
   - parse `pageSize`,
   - default 25 if omitted,
   - reject non-integer, <1, >50 with repo-standard validation error,
   - pass opaque `cursor` through only after basic bounded validation if the route helper currently validates shape,
   - do not parse or accept actor/email/principal/user parameters.

7. Return:
   - `successResponse(envelope)` for expected provider states,
   - `errorResponse(500, ...)` for unhandled route/provider exceptions,
   - repo-standard 400 response for validation defects.

8. Add tests proving:
   - exact route registrations,
   - GET-only methods,
   - auth wrapper posture,
   - response helper posture,
   - validation behavior,
   - no actor override routes or queries,
   - provider route calls use the expected fixture scenario outputs.

## 8. What done looks like

Done means:
- the backend host namespace exists,
- exactly two B04 routes exist,
- protected route posture is preserved,
- mock provider and route tests pass,
- no live Adobe integration or actor-override route drift was introduced.

## 9. Strict constraints / prohibitions

- Do not add live Adobe API calls.
- Do not add OAuth/token-store logic.
- Do not create cross-user routes.
- Do not introduce a one-off RFC 9457/Problem Details body format.
- Do not add POST/PATCH/PUT/DELETE routes.
- Do not implement B07 provider internals prematurely.

## 10. Validation requirements

Run:
```text
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## 11. Proof of closure

Provide:
- exact route registrations,
- mock provider summary,
- validation/error behavior coverage,
- proof that auth wrapper posture matches repo pattern,
- test command results.

## 12. Commit / closeout expectations

Do not commit unless asked. Report any external blocker only if the repo baseline prevents route registration/testing independent of B04 scope.

## 13. Do not re-read files already in active context unless needed to confirm drift

Do not re-read files that are still available in your active context or memory unless you need to confirm repo drift, resolve a conflict, or verify an implementation detail that cannot be trusted from the current context.
