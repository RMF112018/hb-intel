# B04 Validation and Closeout Requirements

## 1. Objective

Define the minimum validation, proof, and closeout standards required before B04 implementation can be declared complete.

## 2. Required validation lanes

### 2.1 Shared models
Run:
```text
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Required proof:
- My Work model files compile.
- New `myWork` barrel exports resolve.
- Model tests cover literals, DTO shapes, and fixture exports.
- Contract-only source files do not gain runtime service/client logic.

### 2.2 Backend functions
Run:
```text
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Required proof:
- My Work route host compiles.
- Route tests cover exactly two GET routes.
- Route handlers preserve `withAuth` posture.
- Query validation behavior is tested.
- No raw actor override path/query is exposed.
- Mock provider returns valid deterministic envelopes.

### 2.3 My Dashboard app
When the B02/B03 app scaffold exists, run:
```text
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

If the final B02 app package name differs from `@hbc/spfx-my-dashboard`, use the actual package name recorded in `apps/my-dashboard/package.json`, and state the exact command used in closeout.

Required proof:
- Frontend client files compile.
- Client tests cover fixture/backend mode selection.
- Backend client applies Bearer auth through the injected token callback.
- URL/query construction exactly matches route registry.
- Fetch rejection/non-2xx/malformed body returns deterministic `backend-unavailable` fallback envelopes.

## 3. Required repo searches / grep checks

Validate the following conditions:

### 3.1 Route path agreement
Search for:
```text
my-work/me/home
my-work/me/adobe-sign/action-queue
```

Expected:
- shared/app/backend files use the same exact route slugs,
- no alternate slugs such as `myWork`, `adobeSign`, or `agreements` are invented for the MVP route family.

### 3.2 No actor override surfaces
Search for relevant terms in the My Work route/client files:
```text
email=
user=
principal=
actor=
/users/
```

Expected:
- no actor override route or query parameter,
- no cross-user impersonation convenience surface.

### 3.3 No direct Adobe SPFx calls
Search `apps/my-dashboard/` for:
```text
adobesign
api.na1.adobesign
api.eu1.adobesign
api.in1.adobesign
api.jp1.adobesign
fetch(
```

Expected:
- no Adobe endpoint calls from UI/cards,
- the only network client in B04 is the backend read-model client toward HB backend routes.

### 3.4 No one-off HTTP problem-details drift
Search `backend/functions/src/hosts/my-work-read-model/` for:
```text
application/problem+json
type:
title:
detail:
instance:
```

Expected:
- B04 routes use repo-standard `successResponse(...)` / `errorResponse(...)`,
- no isolated response standard is introduced.

### 3.5 No competing My Work platform vocabulary
Review files under:
```text
packages/models/src/myWork/
```

Expected:
- narrow route DTOs only,
- no registry/ranking/dedupe replacement for `@hbc/my-work-feed`,
- no broad “canonical My Work platform” language in code comments.

## 4. Required test coverage matrix

### 4.1 Models
- envelope mode/status literal coverage,
- warning-code literal coverage,
- `MyWorkHomeReadModel` shape,
- Adobe queue DTO shape,
- status/action mapping,
- response-map coverage,
- source URL optionality,
- count-basis literal coverage.

### 4.2 Fixtures
- `available` populated,
- `available` empty,
- `available` paged,
- `partial`,
- `configuration-required`,
- `authorization-required`,
- `principal-unresolved`,
- `source-unavailable`,
- `backend-unavailable`,
- deterministic timestamp override.

### 4.3 Frontend client
- route URL normalization with/without trailing `/api`,
- query serialization for `pageSize` and `cursor`,
- no serialization of actor/user overrides,
- token callback adds Authorization header,
- fallback on network reject,
- fallback on non-2xx,
- fallback on malformed JSON,
- fallback on invalid `{ data }` wrapper.

### 4.4 Backend host
- exactly two registrations,
- GET-only,
- `withAuth`,
- correct route slugs,
- `successResponse` wrapper,
- `errorResponse` on unhandled failure,
- `400` on invalid page size,
- no actor override query/path handling,
- mock provider scenario envelopes.

## 5. Version / lockfile posture

B04 should not require dependency additions. Therefore:
- `pnpm-lock.yaml` should remain unchanged unless the local agent discovers a pre-existing workspace resolution effect caused by a necessary change outside the scope; such a condition must be documented explicitly.
- If lockfile changes unexpectedly, stop and explain the cause before commit.

## 6. Closeout summary requirements

The local agent closeout must include:

1. **Verdict**
   - PASS / PARTIAL / FAIL

2. **Branch and HEAD**
   - branch name
   - starting HEAD if captured
   - ending HEAD

3. **B04 implementation summary**
   - shared models created
   - fixtures created
   - app client seam created, if app scaffold existed
   - backend host/routes created
   - validation hardening completed

4. **Exact files changed**
   - grouped by models / app / backend / docs/tests

5. **Validation commands run**
   - exact commands
   - pass/fail outcome

6. **Residual blockers**
   - only real blockers, such as missing prerequisite B02/B03 runtime files in the working tree
   - no vague “future enhancement” filler

7. **Scope guardrail confirmation**
   - no live Adobe provider/OAuth implementation
   - no cross-user routes
   - no direct Adobe SPFx calls
   - no one-off HTTP error format drift
   - no My Work Feed platform duplication

8. **Recommended commit summary**
   - concise subject line
   - body bullets, if the user asks for a commit message

## 7. B04 done standard

B04 is closed only when the repo contains a coherent and test-backed My Work read-model contract/route/fixture layer ready for B05/B07 to consume without reopening the Batch 04 data-contract decisions.
