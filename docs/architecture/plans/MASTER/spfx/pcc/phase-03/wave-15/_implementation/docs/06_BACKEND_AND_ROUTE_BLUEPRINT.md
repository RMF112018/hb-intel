# Backend and Route Blueprint

## Existing Backend Pattern

The existing backend PCC read-model host uses:

```text
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

The pattern is GET-only, with `withAuth`, `withTelemetry`, and a mock provider returning `PccReadModelEnvelope<T>` values.

## Required Route Strategy

Add Wave 15 GET-only routes. Exact route names may vary, but must be stable and covered by tests.

Recommended route set:

```text
GET /api/pcc/projects/{projectId}/external-systems-launch-pad
GET /api/pcc/projects/{projectId}/external-systems-registry
GET /api/pcc/projects/{projectId}/external-systems/project-launch-links
GET /api/pcc/projects/{projectId}/external-systems/mappings
GET /api/pcc/projects/{projectId}/external-systems/review-items
GET /api/pcc/projects/{projectId}/external-systems/health
GET /api/pcc/projects/{projectId}/external-systems/audit-events
GET /api/pcc/projects/{projectId}/external-systems/hbi-lineage
```

If the repo prefers fewer routes, implement at least a composite route plus one route if needed for tests. Do not overbuild unless the current patterns support it cleanly.

## Provider Methods

Add provider methods aligned with route names:

```ts
getExternalSystemsLaunchPad(projectId, viewerPersona?)
getExternalSystemsRegistry(projectId, viewerPersona?)
getProjectExternalLaunchLinks(projectId, viewerPersona?)
getProjectExternalSystemMappings(projectId, viewerPersona?)
getExternalReviewItems(projectId, viewerPersona?)
getExternalSystemHealth(projectId, viewerPersona?)
getExternalSystemAuditEvents(projectId, viewerPersona?)
getExternalSystemsHbiLineage(projectId, viewerPersona?)
```

Do not serialize `viewerPersona` from HTTP query strings unless the existing backend pattern explicitly does so for the specific route family. Current route pattern should avoid deriving actor/persona from query string.

## Envelope Semantics

Each provider method must return:

```ts
PccReadModelEnvelope<T>
```

Required envelope behavior:

- known project: `sourceStatus: 'available'` unless a fixture intentionally models degraded source state inside data rows;
- unknown project: `sourceStatus: 'source-unavailable'`, empty/degraded data shape, warning;
- simulated backend unavailable: `sourceStatus: 'backend-unavailable'`, empty/degraded data shape, warning;
- `readOnly: true` always;
- no thrown exception for normal unknown-project/degraded fixture scenarios.

## No Runtime Imports

Backend implementation must not import:

- Graph clients;
- PnP/SP clients for live calls;
- Procore SDK/client;
- Sage client;
- AHJ/provider HTTP clients;
- camera provider clients;
- secret providers;
- provisioning executors;
- write repositories.

If existing backend files already import PnP for unrelated hosts, do not add such imports to the PCC read-model host for Wave 15.

## Route Tests

Add/extend tests to prove:

- routes are GET-only;
- route names and paths are registered;
- missing `projectId` returns validation error;
- known project returns wrapped success response and read-only envelope;
- unknown project returns source-unavailable envelope, not unhandled failure;
- simulated backend-unavailable provider branch works if existing test pattern supports injection;
- no prohibited runtime imports appear in the Wave 15 provider/route source;
- no POST/PATCH/DELETE routes are registered for Wave 15.

## Backend Validation Commands

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
md5 pnpm-lock.yaml
```

## Commit Scope

Allowed in Prompt 03:

- backend PCC read-model provider files;
- backend PCC read-model route files;
- backend PCC read-model tests;
- shared model imports required by backend.

Not allowed in Prompt 03:

- SPFx surface implementation;
- package/lockfile changes;
- command endpoints;
- tenant/list provisioning;
- external clients.
