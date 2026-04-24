# Safety Route/Auth/Token Release Proof

This guide is the release checklist and operator proof surface for the Safety SPFx command contract against Azure Functions.

## Scope

- Command routes:
  - `/api/safety-records/ingest/preview`
  - `/api/safety-records/ingest`
  - `/api/safety-records/replay`
- Auth contract:
  - Bearer token required
  - `aud` must match backend `API_AUDIENCE`
  - delegated scope `access_as_user` required for delegated command calls
  - Safety role matrix enforced per action (`preview`, `ingest`, `replay`)
- Health route:
  - `/api/health/ready` is admin-only proof surface

## API Permission Ownership Proof (SPFx)

Safety package owns delegated API permission declaration in:

- `apps/safety/config/package-solution.json`

Expected declaration:

- `resource`: `hb-intel-api-production`
- `scope`: `access_as_user`

Validation command:

- `pnpm --filter @hbc/spfx-safety test -- src/test/safetyApiPermissionContract.test.ts`

## Packaged Artifact Route/Auth Proof

Build command:

- `pnpm tsx tools/build-spfx-package.ts --domain safety`

Generated release proof artifact:

- `dist/sppkg/safety-route-auth-proof.json`

Required checks in the artifact:

- `checks.commandRouteMarkersPresent.pass === true`
- `checks.configContractMarkersPresent.pass === true`
- `checks.accessAsUserPermissionDeclared.pass === true`

Route-marker proof confirms packaged bundle contains:

- `/api/safety-records/ingest/preview`
- `/api/safety-records/ingest`
- `/api/safety-records/replay`

## Hosted Token Proof (SPFx)

1. Configure Safety webpart properties:
   - `functionAppUrl`: deployed function app origin (no query string)
   - `apiAudience`: backend audience expected by `validateToken` (`API_AUDIENCE`)
2. Load hosted Safety page with query gate:
   - `?hbSafetyProof=healthReadyNonAdmin`
3. In browser devtools console, inspect:
   - `window.__hbIntel_safetyProof`
4. Validate:
   - `acquisition.success === true`
   - `tokenClassification.audMatchesExpected === true`
   - `tokenClassification.scopes` includes `access_as_user`
   - non-admin expectation: `probe.status === 403` and `statusMatchesExpected === true`

## Non-Hosted Token Proof

1. Acquire a bearer token for the same audience used by Safety (`API_AUDIENCE`).
2. Decode and inspect claims:
   - `aud` equals `API_AUDIENCE`
   - delegated token includes `scp` with `access_as_user`
   - role claims align with required Safety action
3. Exercise command routes with token:
   - missing/invalid bearer -> `401`/`403` auth-class failures
   - valid token + insufficient role/scope -> `403` auth-class failure

Backend-side token claim inspection utility reference:

- `tools/inspect-token-claims.sh`

## Health/Ready Expected Outcomes

- `GET /api/health`:
  - anonymous allowed
  - expected `200`
- `GET /api/health/ready`:
  - bearer token required through `withAuth`
  - admin role required (`Admin` or `HBIntelAdmin`)
  - non-admin expected outcome: `403`
  - admin expected outcome: `200` with readiness envelope payload

## Frontend Error Classification Proof

Run:

- `pnpm --filter @hbc/features-safety test -- src/adapters/sharepoint/SafetyBackendCommandClient.test.ts`

Required assertions covered:

- token acquisition failure -> `errorKind: auth`
- missing/invalid bearer responses (`401`/`403`) -> `errorKind: auth`
- `403` role/scope denial not collapsed into transport/network classification
- HTTP success without `.data` -> `errorKind: contract`
- `422` failure envelope preserves `failureClass`, `previewFailureClass`, and request IDs
