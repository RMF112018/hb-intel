# Prompt 03 — Implement Live OAuth Code Exchange and Callback Grant Persistence

## Objective

Replace the placeholder Adobe Sign authorization-code exchange runtime with a production HTTP implementation and update the public callback completion logic so a successful OAuth redirect creates a genuinely usable delegated grant.

This prompt should make the existing start/callback route pair materially functional once Prompt 02’s durable storage foundation and operator configuration are present.

---

## Governing closed decisions

### OAuth protocol decision
- The browser-facing authorization URL does **not** contain `client_secret`.
- The backend code-exchange request **does** use:
  - `authorization_code`
  - `client_id`
  - `client_secret`
  - `redirect_uri`
- Use the commercial Acrobat Sign code-exchange endpoint:
  - `POST {api_access_point}/oauth/v2/token`
- Document in comments/tests that Adobe’s quickstart prose names `/oauth/v2/token` even though one inline example still displays `/oauth/token`; this remediation closes on `/oauth/v2/token`.

### Callback safety decision
- The callback remains public/anonymous and must rely on:
  - single-use state validation,
  - safe return path,
  - strict callback parameter validation.
- No raw callback query string, authorization code, state string, token, or client secret may be logged.

---

## Repo-truth references to inspect

Inspect only what is necessary; avoid re-reading files still available in active context unless drift is suspected or prior changes affected them.

### Required files
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts`
- `.../read-models/adobe-sign/adobe-sign-oauth-service.ts`
- `.../adobe-sign-config.ts`
- `.../adobe-sign-oauth-state-store.ts`
- `.../adobe-sign-grant-store.ts`
- `.../adobe-sign-refresh-token-store.ts` or Prompt 02’s final equivalent
- `.../adobe-sign-grant-record.ts`

### Tests
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.test.ts`
- New or existing test file for the live OAuth service adapter.

---

## Implementation scope

Implement:

1. A production Adobe Sign OAuth code-exchange client.
2. Safe response parsing for Adobe token payloads.
3. Normalized error mapping into the existing `AdobeSignTokenExchangeResult` union.
4. Callback validation for callback-supplied:
   - `state`,
   - `code`,
   - `api_access_point`,
   - `web_access_point`.
5. Durable refresh-token storage and grant creation on successful exchange.
6. Removal of the callback’s placeholder grant record behavior that stores an empty refresh-token reference.

---

## Exact files or file families likely to change

Likely modify:
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts`
- `.../read-models/adobe-sign/adobe-sign-oauth-service.ts`
- `.../adobe-sign-grant-record.ts` only if Prompt 02 introduced the final ref shape.
- docs/comments/tests local to the OAuth service and route files.

Likely add:
- `.../adobe-sign-live-oauth-client.ts`
  or another repo-conforming feature-local implementation file.

Tests:
- focused OAuth service adapter tests,
- callback-route tests.

---

## Required non-goals

Do not:
- implement refresh-token exchange in this prompt,
- implement Adobe search/read model provider wiring,
- modify frontend UI,
- alter OAuth route paths,
- broaden scopes,
- change durable store architecture from Prompt 02,
- introduce raw Adobe body passthrough,
- use callback `api_access_point` or `web_access_point` without validation.

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

### Step 2 — Implement live OAuth exchange client
Implement an HTTP adapter behind `IAdobeSignOAuthService`.

Input:
- authorization code,
- client id,
- client secret,
- redirect URI,
- callback-supplied API access point,
- callback-supplied web access point.

Request:
- POST form-urlencoded to:
  ```text
  {apiAccessPoint}/oauth/v2/token
  ```
- Body:
  ```text
  grant_type=authorization_code
  code={authorizationCode}
  client_id={clientId}
  client_secret={clientSecret}
  redirect_uri={redirectUri}
  ```

The adapter must:
- never log body/token values,
- reject obviously invalid/non-HTTPS access-point URLs before fetch,
- normalize network/5xx to `unreachable`,
- normalize invalid/expired code-style outcomes to `invalid-code`,
- normalize granted-scope divergence to `scope-mismatch`,
- normalize success into the existing success contract:
  - access token,
  - refresh token,
  - scopes,
  - expires-in.

### Step 3 — Parse Adobe response safely
Do not pass through raw vendor JSON.

Expected success fields may include:
- `access_token`
- `refresh_token`
- `expires_in`
- access-point values

Required parsing posture:
- required token fields must exist,
- expiry must be finite and positive,
- scopes must be evaluated against governed configured scopes when available,
- malformed body → normalized failure, never raw throw.

### Step 4 — Wire default route deps to the live OAuth adapter
Replace the placeholder route dependency that currently returns a non-live `service-not-wired` result.

Production route deps should select:
- live OAuth exchange adapter in real configured runtime,
- deterministic/mock injected adapter in tests.

The route factory must remain testable.

### Step 5 — Harden callback input validation
Before token exchange, validate:
- state present,
- code present,
- API access point present and allowed,
- web access point present and allowed,
- state store and grant/token stores are actually ready.

If callback input is missing or invalid:
- do not exchange,
- redirect safely with a controlled UX status,
- log only safe classifications.

### Step 6 — Persist a real grant on successful exchange
Remove placeholder behavior equivalent to:
- `storeKind: 'pending-selection'`
- `address: ''`

Instead:
1. persist encrypted refresh-token material via Prompt 02’s token persistence boundary,
2. receive the opaque encrypted-token reference,
3. persist the grant record with:
   - actor key from consumed state,
   - Adobe API access point,
   - Adobe web access point,
   - granted scopes,
   - grant timestamp,
   - active grant state,
   - real encrypted refresh-token reference.

### Step 7 — Callback failure mapping
Ensure:
- invalid/expired/consumed state maps to existing safe UX statuses,
- code exchange failures map to:
  - invalid grant,
  - configuration required,
  - or source unavailable,
  depending on closed result type,
- no raw Adobe error text is propagated.

### Step 8 — Tests
Add/extend tests for:
- exact `/oauth/v2/token` target URL,
- form-urlencoded body shape,
- no secret in authorization URL builder,
- successful callback persists real opaque refresh-token reference,
- callback does not persist grant when exchange fails,
- callback does not call exchange when state/input invalid,
- callback rejects missing/invalid access points,
- raw query data is not logged in telemetry payloads if telemetry assertions exist.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/functions test -- adobe-sign-oauth
pnpm --filter @hbc/functions check-types
```

If repo test filtering differs, adapt and report exact commands.

Then inspect for forbidden placeholder remnants:

```bash
rg -n "service-not-wired|pending-selection|address:\\s*''" backend/functions/src/hosts/my-work-read-model
```

Expected:
- no production callback success path should still persist an empty refresh-token reference.

---

## Evidence requirements

Provide:
- summary of the live token-exchange adapter,
- summary of callback grant persistence changes,
- tests proving the token endpoint path and no-secret auth URL rule,
- any remaining operator config dependencies.

---

## Commit / closeout expectations

Suggested commit title:

```text
feat(my-dashboard): wire Adobe OAuth code exchange and grant callback persistence
```

Final response format:

```text
HB: Prompt 03 — Live Adobe OAuth Code Exchange and Callback Grant Persistence

Verdict:
- PASS / FAIL

Branch / HEAD:
- Starting:
- Ending:

Implemented:
1. Live code exchange:
2. Callback input validation:
3. Grant persistence:
4. Placeholder removal:
5. Secret/logging posture:

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

- Never place `client_secret` in the authorization URL.
- Never emit raw OAuth code/state/token details to telemetry.
- Do not create grants with unusable or empty refresh-token references.
- Do not trust callback access-point strings without URL validation.
