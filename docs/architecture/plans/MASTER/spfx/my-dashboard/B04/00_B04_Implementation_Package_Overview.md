# B04 Implementation Package Overview

## Objective

Implement the Batch 04 data-contract architecture for **HB Intel My Dashboard** so the My Work shell and Adobe Sign Action Queue can consume stable, protected, deterministic read-model envelopes without direct Adobe calls or frontend-owned source interpretation.

## Why this work exists

B01 established the My Dashboard product boundary and the requirement not to create a competing personal-work primitive beside `@hbc/my-work-feed`.

B02 established the My Dashboard app/package/auth/runtime posture and reserved the API client seam.

B03 established the My Work shell, home/focused-module UX states, and the specific card choreography that the data layer must serve.

B04 now supplies the missing contract layer:

- the DTOs required by those surfaces,
- the route family that serves them,
- the fixture matrix needed for deterministic implementation,
- the frontend/backend client-host separation,
- the HTTP/source-state taxonomy that prevents misleading UX.

## Current repo truth captured by this package

At the package-authoring audit baseline:

- the B04 planning artifact is not yet present in the live repo,
- no `packages/models/src/myWork/` read-model family exists,
- no `my-work-read-model` backend host exists,
- no `my-work/me/...` route family exists,
- the B02/B03 planning artifacts exist in repo,
- the B02/B03 runtime implementation may or may not be present in the local working tree depending on the execution sequence.

## Architectural target state

### Shared contract family
Create:
```text
packages/models/src/myWork/
```

This namespace is a **My Dashboard route DTO family**, not a new cross-product personal-work platform.

### Backend BFF/read-model host
Create:
```text
backend/functions/src/hosts/my-work-read-model/
```

The host must:
- derive actor context from protected backend auth,
- expose exactly two GET endpoints,
- return `successResponse(envelope)` for expected business/source states,
- preserve repo-standard `errorResponse(...)` for 400/401/403/500 classes,
- avoid Adobe/provider details leaking to SPFx.

### Frontend client seam
Create:
```text
apps/my-dashboard/src/api/
```

The app must call a typed client interface rather than raw `fetch` from React components.

## Six implementation lanes

1. **Contracts**
   - Envelope literals
   - Status vocabulary
   - Home read model
   - Adobe queue DTOs
   - Route response map
   - Model exports

2. **Fixtures**
   - Deterministic timestamp
   - Available/empty/paged/partial/non-ready scenarios
   - One populated fixture row per actionable Adobe status
   - Optional source-open URL coverage
   - Stable warning codes

3. **Frontend client**
   - Route registry
   - Fixture client
   - Backend client
   - Token callback support
   - URL/query serialization
   - Backend failure fallback to fixture `backend-unavailable`

4. **Backend host**
   - Provider interface
   - Mock provider
   - GET-only route registration
   - `withAuth`
   - request-id / telemetry / helper reuse
   - pageSize/cursor validation
   - no actor override surfaces

5. **Validation hardening**
   - Cross-layer route/path agreement
   - Query restrictions
   - State semantics
   - Contract purity
   - No raw Adobe payload or one-off HTTP format drift

6. **Closeout**
   - Type/test/lint/build commands
   - changed-file summary
   - residual blocker statement only where truly external
   - handoff to B05/B07

## Closure standard

This package is successful only if the implementation remains:

- **read-model first,**
- **source-authority explicit,**
- **deterministic in fixtures,**
- **protected in transport,**
- **non-duplicative of `@hbc/my-work-feed`,**
- **compatible with B03 shell/card choreography,**
- **narrow enough not to pre-implement B05 or B07.**
