# Prompt 04 — Implement Production Refresh Client and Token-Service Runtime

## Objective

Complete the delegated Adobe OAuth token lifecycle by implementing the production refresh-token adapter and wiring it into the existing token-service seam.

After this prompt, a stored delegated grant should be able to mint a fresh Adobe access token in production runtime using the encrypted refresh token persisted by Prompt 02 and the grant created by Prompt 03.

---

## Governing closed decisions

- Refresh-token plaintext remains backend-only and never persists in plaintext.
- Refresh exchange uses:
  - `POST {api_access_point}/oauth/v2/refresh`
  - form-urlencoded body with:
    - `refresh_token`
    - `client_id`
    - `client_secret`
    - `grant_type=refresh_token`
- Invalid/revoked refresh token:
  - transitions grant to `requires-reauth`
  - surfaces `authorization-required`
- Network/5xx/token-store unavailability:
  - surfaces `source-unavailable`
  - does not mutate grant into false invalidity.
- Access-token caching remains in-process/transient only, as already designed by the token service; do not add durable queue/token replay caching.

---

## Repo-truth references to inspect

Only inspect what is required and avoid redundant re-reading where context is still active.

### Required files
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-refresh-client.ts`
- `.../adobe-sign-token-service.ts`
- `.../adobe-sign-config.ts`
- `.../adobe-sign-grant-store.ts`
- Prompt 02’s refresh-token encryption/persistence module
- `.../adobe-sign-grant-record.ts`

### Tests
- `adobe-sign-token-service.test.ts`
- Add/extend refresh-client implementation tests.

---

## Implementation scope

Implement:

1. Production refresh-token client.
2. Safe decryption/read of encrypted refresh token through Prompt 02’s narrow persistence boundary.
3. Adobe `/oauth/v2/refresh` HTTP call.
4. Normalized response parsing.
5. Updated encrypted refresh-token reference persistence when the provider rotates refresh token material.
6. Proper token-service integration and grant-state transitions.

---

## Exact files or file families likely to change

Likely modify:
- `.../adobe-sign-refresh-client.ts`
- `.../adobe-sign-token-service.ts`
- Prompt 02’s encrypted token persistence module where integration hooks are required.
- `.../adobe-sign-config.ts` if additional runtime keys are necessary and were not introduced in Prompt 02.

Likely add:
- `.../adobe-sign-live-refresh-client.ts`
  or another repo-conforming file for the production implementation.

Tests:
- refresh-client tests,
- token-service tests.

---

## Required non-goals

Do not:
- implement search-client/provider composition,
- change OAuth route paths,
- redesign grant schema beyond what is necessary for refresh persistence,
- add durable access-token caching,
- log refresh tokens or decoded provider bodies,
- change frontend code,
- broaden OAuth scopes.

---

## Detailed execution steps

### Step 1 — Session preflight
Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Report unrelated WIP and avoid it.

### Step 2 — Implement refresh-token material resolution
The live refresh client should:
1. read the opaque encrypted-refresh-token reference from the grant record,
2. use the Prompt 02 storage/crypto boundary to recover plaintext only within the narrow refresh call,
3. avoid copying plaintext into logs/errors/telemetry.

If token material cannot be resolved:
- return a normalized `unreachable`/store-unavailable outcome,
- do not throw raw storage errors through user-facing or generic telemetry paths.

### Step 3 — Implement live refresh HTTP adapter
POST to:

```text
{grant.adobeApiAccessPoint}/oauth/v2/refresh
```

Form fields:

```text
refresh_token={plaintextRefreshToken}
client_id={clientId}
client_secret={clientSecret}
grant_type=refresh_token
```

Use production-configured client id/secret from the centralized config boundary only.

### Step 4 — Normalize Adobe refresh responses
Required mapping:
- success → existing `ok` result shape:
  - access token,
  - absolute expiry timestamp,
  - updated encrypted refresh-token reference,
  - granted scopes.
- invalid/revoked refresh token → `invalid-grant`
- transport/network/5xx → `unreachable`
- malformed body → normalized failure, not raw throw.

If the refresh response rotates the refresh token:
- persist new encrypted token material,
- return the updated opaque reference.

If the response does not rotate the refresh token:
- preserve or refresh the existing token reference according to the chosen storage model.

### Step 5 — Integrate into token service
Ensure `createAdobeSignTokenService(...)` can use the new production refresh client without contract drift.

Verify existing behavior remains:
- active cached access token returns without unnecessary refresh,
- revoked/requires-reauth grants do not attempt refresh,
- invalid grant triggers `markReauthorizationRequired(...)`,
- source-unavailable does not corrupt grant state.

### Step 6 — Tests
Add/extend tests covering:
- exact `/oauth/v2/refresh` URL,
- form body fields,
- no client secret outside backend request body construction,
- successful refresh path updates grant metadata/reference,
- invalid-grant path marks reauthorization required,
- unreachable path does not mutate grant,
- decryption/store failure maps safely,
- access-token in-process cache remains behaviorally intact,
- no token values appear in exposed diagnostics.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/functions test -- adobe-sign-refresh
pnpm --filter @hbc/functions test -- adobe-sign-token-service
pnpm --filter @hbc/functions check-types
```

Adapt if repository filtering syntax differs and report actual commands.

Run targeted searches:

```bash
rg -n "oauth/v2/refresh|refresh_token|client_secret|accessToken" backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign
```

Explain that expected references exist in internal service code while leak-prone logs/docs/surfaces remain absent.

---

## Evidence requirements

Provide:
- summary of refresh adapter behavior,
- summary of token-service runtime behavior,
- tests executed,
- residual operator settings required.

---

## Commit / closeout expectations

Suggested commit title:

```text
feat(my-dashboard): implement Adobe refresh-token runtime and token-service wiring
```

Final response format:

```text
HB: Prompt 04 — Production Adobe Refresh Client and Token-Service Runtime

Verdict:
- PASS / FAIL

Branch / HEAD:
- Starting:
- Ending:

Implemented:
1. Refresh-token material resolution:
2. `/oauth/v2/refresh` adapter:
3. Token-service integration:
4. Grant reauth transitions:
5. Secret-handling posture:

Files changed:
- ...

Validation:
- ...

Residual operator requirements:
- ...

Suggested commit:
- ...
```

---

## Risks / guardrails

- Treat refresh-token invalidity separately from provider/network unavailability.
- Do not leak refresh token plaintext into errors.
- Do not add persistent access-token caching.
- Do not mutate a healthy grant into reauth state due to network outages.
