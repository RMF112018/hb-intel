# 03 — Frontend / Backend Wiring Assessment

## 1. Route authority in the backend

Backend route source of truth defines these routes:
- `POST /api/safety-records/provision-sharepoint`
- `POST /api/safety-records/ingest`
- `POST /api/safety-records/ingest/preview`
- `POST /api/safety-records/replay`

The backend also:
- requires delegated scope for interactive calls,
- issues/propagates request IDs,
- returns structured 422 failure envelopes with failure-class data,
- and exposes admin-gated readiness separately from public liveness.

## 2. What the frontend actually calls

### Implemented in frontend/shared package
- `POST /api/safety-records/ingest`
- `POST /api/safety-records/replay`

### Not implemented in frontend/shared package
- `POST /api/safety-records/ingest/preview`

This is the single clearest repo-truth misalignment.

## 3. Request construction

### Ingest
The frontend repository constructs:
- `fileName`
- `fileContentBase64`
- `context`

The payload shape broadly matches the backend parser for ingest/preview.

### Replay
The frontend repository constructs:
- `parentRunId`
- `supersedePrior`

That also broadly matches the backend route contract.

### Preservation problem
The request body is adequate.
The response/error handling is not.

## 4. Response parsing and diagnostic loss

Backend success envelope:
- `{ data: operation }`

Backend ingest success path:
- frontend expects `payload.data.result`

That is compatible.

Backend failure envelope:
- `message`
- `code`
- `requestId`
- `failureClass`
- `previewFailureClass`
- `graphContext`
- `data`

Current frontend behavior:
- if `!response.ok` or `!payload.data?.result`, throw a generic `SafetyAdapterFetchError`
- collapse backend detail into `httpStatus` + short body snippet

Lost information:
- request ID
- failure class
- preview failure class
- graph context
- operation diagnostics list
- support-grade operator context

This is a critical observability/supportability defect.

## 5. Token and auth propagation

### What the frontend does
When backend ingestion config is present, the app asks SPFx for a token via:
- `aadTokenProviderFactory.getTokenProvider()`
- `provider.getToken(apiAudience)`

Then it sends `Authorization: Bearer <token>` using bare `fetch`.

### What the backend expects
The backend auth layer validates tokens and enforces:
- delegated scope `access_as_user` for interactive flows
- admin role for admin-only readiness/provisioning surfaces

### Major risk
The direct SPFx webpart render path does not pass `apiAudience` or `functionAppUrl` into `App`. That means the sharepoint-mode repository can exist without the backend ingestion config it needs to acquire and send the token for ingest/replay.

## 6. Production-entry mismatch

### Direct SPFx entry
`SafetyWebPart.tsx`
- bootstraps auth
- binds hosted GUIDs
- renders `<App spfxContext={this.context} />`

### Shell/IIFE entry
`mount.tsx`
- bootstraps auth
- binds hosted GUIDs
- renders `<App spfxContext={...} functionAppUrl={config?.functionAppUrl} apiAudience={config?.apiAudience} />`

Assessment:
- the shell/IIFE path has the backend binding seam
- the direct SPFx path does not
- unless some hidden host contract mutates this later, the direct webpart path is not truthfully wired for backend ingest/replay

## 7. Preview / commit / replay alignment

### Preview
Backend has a first-class preview operation.
Frontend has no first-class preview operation.

### Commit
Backend commit is gated by preview.
Frontend asks users to submit directly for commit.

### Replay
Frontend does expose replay from Review queue, which aligns better with backend capability, but still loses backend diagnostic detail when replay fails.

## 8. Readiness-gate truthfulness

The backend has:
- anonymous liveness (`/api/health`)
- admin-gated readiness (`/api/health/ready`)
- config/rollout/binding validation

The frontend currently does not expose or meaningfully consume backend readiness posture in any operator-facing way. For a production Safety surface, that is acceptable only if release proof guarantees the mount/config/backend contract before users ever reach the upload flow. That proof does not yet exist strongly enough.

## 9. Final wiring verdict

The frontend is **partially wired** to the current backend:
- route shapes are partly correct,
- token acquisition intent exists,
- replay exists,
- ingest body shape is broadly aligned.

But it is **not truthfully wired end-to-end** because:
- preview route is missing,
- direct SPFx mount path appears under-configured,
- backend error/detail semantics are discarded,
- and the UI workflow still reflects an older direct-commit mental model.
