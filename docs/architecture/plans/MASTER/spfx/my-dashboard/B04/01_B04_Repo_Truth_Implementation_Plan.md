# B04 Repo-Truth Implementation Plan

## 1. Objective

Translate the B04 planning artifact into a practical repository change sequence that aligns with current HB Intel patterns while making the necessary My Dashboard-specific departures explicit.

## 2. Repo-truth findings that govern implementation

### 2.1 Existing PCC precedent to reuse conceptually
PCC already demonstrates:
- a central route registry and typed client interface,
- fixture/backend client factory selection,
- safe fallback envelopes,
- deterministic fixture clients with injected clock,
- protected backend route registration with `withAuth`,
- `successResponse(...)` / `errorResponse(...)` helper posture,
- provider indirection behind route handlers.

### 2.2 Deliberate B04 divergence from PCC
My Dashboard B04 must not copy PCC blindly:
- PCC’s current shared read-model mode literals are not copied; My Work uses `fixture | backend`.
- PCC’s current app backend client does not add auth headers, while My Dashboard B02/B04 requires a bearer-token route client for protected user-context routes.
- PCC is project-contextual; My Work is actor-contextual and does not accept a project ID or actor override parameter.

### 2.3 Current gaps to remediate
The implementation sequence must create:
- new shared My Work DTO/model folder,
- new model exports,
- deterministic fixture files,
- My Dashboard frontend client files,
- My Work backend host/provider/routes,
- contract and route tests,
- closeout validation notes.

## 3. Dependency logic

### Independent of the My Dashboard app scaffold
These can be implemented even if B02/B03 app runtime files are not yet present:
- Prompt 01 shared contracts and model exports,
- Prompt 02 shared fixtures,
- Prompt 04 backend host/routes/mock provider.

### Requires B02/B03 app scaffold
These require `apps/my-dashboard/` to exist:
- Prompt 03 frontend client seam,
- parts of Prompt 05 that validate frontend client integration,
- Prompt 06 app-specific closeout checks.

## 4. Exact implementation target map

### 4.1 Shared model layer

| Path | Purpose |
|---|---|
| `packages/models/src/myWork/MyWorkReadModels.ts` | Envelope, status/warning literals, home DTOs, route response map |
| `packages/models/src/myWork/AdobeSignActionQueue.ts` | Adobe status/action unions, item/summary/pagination/freshness DTOs |
| `packages/models/src/myWork/index.ts` | Barrel exports |
| `packages/models/src/myWork/MyWorkReadModels.test.ts` | Contract shape/literal/purity tests |
| `packages/models/src/myWork/AdobeSignActionQueue.test.ts` | Queue literal/mapping/shape tests |
| `packages/models/src/myWork/fixtures/index.ts` | Fixture barrel |
| `packages/models/src/myWork/fixtures/myWorkHomeReadModels.ts` | Home envelope fixtures |
| `packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts` | Adobe queue fixtures |
| `packages/models/src/index.ts` | Root models barrel export for `myWork` |

### 4.2 Frontend app client layer

| Path | Purpose |
|---|---|
| `apps/my-dashboard/src/api/myWorkReadModelClient.ts` | Route IDs/path registry + typed client interface |
| `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts` | Fixture/backend mode resolution |
| `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts` | Deterministic fixture client |
| `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` | Protected backend HTTP client with bearer token callback |
| matching tests | URL construction, fallback, auth header, query serialization |

### 4.3 Backend host layer

| Path | Purpose |
|---|---|
| `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts` | Route registration |
| `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.test.ts` | Route cardinality/method/auth/error tests |
| `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts` | Provider interface/context |
| `backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts` | Fixture-backed deterministic provider |
| optional provider tests, per repo convention | Scenario coverage |

## 5. Contract decisions that may not drift

### 5.1 Route family
```ts
home -> 'my-work/me/home'
'adobe-sign-action-queue' -> 'my-work/me/adobe-sign/action-queue'
```

### 5.2 Frontend client
```ts
getMyWorkHome()
getAdobeSignActionQueue(query?)
```

### 5.3 Queue query
```ts
pageSize?: number
cursor?: string
```

No other query surface.

### 5.4 Envelope
```ts
mode: 'fixture' | 'backend'
sourceStatus:
  | 'available'
  | 'partial'
  | 'configuration-required'
  | 'authorization-required'
  | 'principal-unresolved'
  | 'source-unavailable'
  | 'backend-unavailable'
readOnly: true
warnings: structured warnings
generatedAtUtc: string
data: T
```

### 5.5 Adobe queue action statuses
Exactly six recipient statuses and six normalized required actions. No frontend interpretation of raw provider states.

## 6. Sequencing recommendation

### Prompt 01 — Shared contracts first
The type layer is the contract anchor. Everything else imports from it.

### Prompt 02 — Fixtures second
The frontend client and backend mock provider both need deterministic fixture content.

### Prompt 03 — Frontend client seam third
Only after types/fixtures exist and the app scaffold is present.

### Prompt 04 — Backend host/routes fourth
This can be executed before or after Prompt 03, but it should happen before cross-layer validation.

### Prompt 05 — Cross-layer hardening
Verify:
- route IDs/paths align,
- envelope shapes align,
- query validation aligns,
- no actor override surfaces exist,
- fallback semantics are consistent.

### Prompt 06 — Closeout
Run validations and produce implementation evidence.

## 7. Potential conflicts to avoid

1. Do not “improve” B04 by introducing live Adobe API code.
2. Do not add actor/email/path override conveniences for debugging.
3. Do not replace repo error helpers with a new isolated Problem Details body.
4. Do not import `@hbc/my-work-feed` into DTO files merely to create superficial coupling.
5. Do not use PCC project IDs or persona arguments in My Work actor-context routes.
6. Do not make B04 UI cards. B03/B05 own shell and detailed UI boundaries.
7. Do not expose raw upstream Adobe statuses as the UI’s primary behavior contract.
