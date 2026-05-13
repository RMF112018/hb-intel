# Target Architecture — Readiness Rendering and Runtime Packaging

## 1. Runtime Composition

### Inputs
The app mount contract already provides:
- SPFx context
- optional `getApiToken`
- runtime config via `initializeRuntimeConfig(...)`

The remediation must treat these as active runtime dependencies, not dormant seams.

### Required runtime composition
Create a single application-level composition seam that:

1. Resolves runtime mode:
   - `production` → backend client intent
   - `ui-review` → fixture presentation intent
2. Resolves backend config:
   - Function App base URL
   - API audience
3. Uses `getApiToken` when available.
4. Creates:
   - backend read-model client when backend prerequisites exist,
   - fallback typed fixture/backend-unavailable client when they do not.
5. Makes the client available to live surfaces via props, context, or a narrowly scoped hook.

## 2. Readiness State Mapping

The live read-model envelope is authoritative. Surface variant and visible card family must derive from envelope status.

### Suggested semantic mapping

| Envelope status | Home/focused surface behavior |
|---|---|
| `available` | Ready/live surface |
| `partial` | Ready/live surface with bounded warning presentation |
| `authorization-required` | Non-ready source authorization guidance |
| `configuration-required` | Non-ready operator/admin configuration guidance |
| `principal-unresolved` | Non-ready identity/principal resolution guidance |
| `source-unavailable` | Non-ready provider/service unavailable guidance |
| `backend-unavailable` | Non-ready backend unavailable guidance |

Do not use a single hardcoded `non-ready` default in production render paths once data is available.

## 3. React Surface Contract

### `MyWorkHomeSurface`
Should accept:
- envelope/read-model data or a view model derived from it,
- readiness variant derived upstream,
- callback for module selection.

### `AdobeSignActionQueueModuleSurface`
Should accept:
- envelope/read-model data or a view model derived from it,
- readiness variant derived upstream,
- connection/start authorization action if this is part of current repo truth.

### `MyWorkSurfaceRouter`
Should receive enough runtime props to pass real readiness/data into child surfaces.

### `MyWorkShell`
Should stop discarding `getApiToken` and should connect the runtime data composition seam to router/surfaces.

## 4. Card Contract

Card components should not call backend APIs directly. They should remain presentation components that receive stable props/view models.

This preserves:
- testability,
- separation of concerns,
- reuse,
- strict data-flow traceability.

## 5. Packaging Runtime Contract

### Required build-time runtime values for production package
At minimum:
- `FUNCTION_APP_URL`
- `API_AUDIENCE`
- `BACKEND_MODE=production`

### Expected packaging behavior
For `--domain my-dashboard`:
- if `BACKEND_MODE=production` or production defaulting is in effect, missing `FUNCTION_APP_URL` or `API_AUDIENCE` must be treated as a build/package truth failure.
- package-truth evidence should prove the artifact contains the intended runtime markers.

## 6. Success Criteria

The implementation is successful only if all of the following are true:

1. Authenticated SharePoint user + valid runtime backend config can trigger backend read-model calls.
2. UI surfaces no longer remain frozen in default `non-ready` purely because components have presentation defaults.
3. Non-ready states still appear when backend/provider envelopes truly require them.
4. Uploaded `.sppkg` package truth can be reconciled with source truth and runtime build inputs.
5. Existing route security and backend fail-closed semantics are preserved.
