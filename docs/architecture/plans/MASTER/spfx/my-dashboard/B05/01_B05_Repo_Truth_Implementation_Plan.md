# 01 — B05 Repo-Truth Implementation Plan

## 1. Target end state

The B05 runtime implementation should produce a backend architecture that:

1. preserves all B01–B05 closed decisions,
2. creates the OAuth route pair at the locked public/protected paths,
3. exposes configuration/readiness gates rather than pretending live enablement exists when it does not,
4. binds Adobe authorization to stable Entra actor identity,
5. uses provider abstractions and queue DTO mappings compatible with B04,
6. never leaks tokens, codes, or raw Adobe payloads to SPFx,
7. validates source-handoff URLs before they reach the frontend,
8. ships with tests and closeout evidence.

---

## 2. Predecessor implementation dependency

Before runtime B05 implementation proceeds, the working tree should contain or consciously scaffold against:

- B02 runtime auth/config foundation,
- B03 My Work shell/module foundation,
- B04 My Work read-model models/routes/fixtures/client seams.

If any predecessor implementation is absent, Prompt 01 must identify the gap and determine whether the agent should:
- stop with a precise dependency finding, or
- create only B05-contained interfaces/tests that do not pretend missing lower-layer app/runtime files exist.

---

## 3. Recommended code placement

### 3.1 Existing host family to extend

Batch 04 defined:

```text
backend/functions/src/hosts/my-work-read-model/
```

B05 should extend that domain rather than introduce a new unrelated host.

### 3.2 Suggested backend files

```text
backend/functions/src/hosts/my-work-read-model/
├── adobe-sign-oauth-routes.ts
├── read-models/
│   ├── my-work-read-model-provider.ts
│   └── adobe-sign/
│       ├── adobe-sign-actor-normalizer.ts
│       ├── adobe-sign-principal-resolver.ts
│       ├── adobe-sign-grant-store.ts
│       ├── adobe-sign-oauth-state-store.ts
│       ├── adobe-sign-oauth-service.ts
│       ├── adobe-sign-token-service.ts
│       ├── adobe-sign-search-client.ts
│       ├── adobe-sign-search-request-builder.ts
│       ├── adobe-sign-action-queue-adapter.ts
│       ├── adobe-sign-source-handoff-policy.ts
│       └── adobe-sign-types.ts
```

The code agent may align filenames to existing repo naming conventions, but the seam separation above must survive.

### 3.3 Suggested configuration files

Prefer the repository’s existing backend configuration patterns. An Adobe-specific config module should centralize:

- OAuth client ID presence,
- OAuth client secret presence,
- redirect URI,
- callback URL/path consistency,
- approved Adobe scope string,
- token/grant store readiness,
- optional Adobe host/domain policy inputs.

A reasonable target is a config module such as:

```text
backend/functions/src/config/adobe-sign-config.ts
```

unless the codebase has a closer established location.

### 3.4 Suggested tests

```text
backend/functions/src/hosts/my-work-read-model/
├── adobe-sign-oauth-routes.test.ts
└── read-models/adobe-sign/
    ├── adobe-sign-actor-normalizer.test.ts
    ├── adobe-sign-principal-resolver.test.ts
    ├── adobe-sign-oauth-state-store.test.ts
    ├── adobe-sign-oauth-service.test.ts
    ├── adobe-sign-token-service.test.ts
    ├── adobe-sign-search-request-builder.test.ts
    ├── adobe-sign-action-queue-adapter.test.ts
    └── adobe-sign-source-handoff-policy.test.ts
```

Tests should be grouped or colocated according to repo standards if a different convention is already dominant.

---

## 4. Route contract

### 4.1 Protected start route

```http
POST /api/my-work/me/adobe-sign/oauth/start
```

#### Required behavior

- wrapped with existing HB auth middleware,
- rejects/returns a governed non-ready response for app-only identities,
- creates cryptographically unpredictable, single-use, expiring OAuth state,
- binds state to actor key + return destination,
- returns a backend-generated Adobe authorization URL,
- never returns client secret, refresh token, or token exchange material.

### 4.2 Public callback route

```http
GET /api/my-work/adobe-sign/oauth/callback
```

#### Required behavior

- not under `/me/...`,
- reachable by Adobe browser redirect without HB bearer token,
- validates state before exchanging code,
- reads `code`, `api_access_point`, `web_access_point`, and `state`,
- exchanges the code server-side,
- persists/rotates grant record through the grant-store abstraction,
- returns a safe browser redirect to My Dashboard with a non-secret outcome indicator,
- never echoes tokens, secrets, or codes.

---

## 5. Actor and grant contract

### 5.1 Actor key

Closed design:

```text
tenantId + ":" + claims.oid
```

Where `tenantId` is trusted backend configuration unless the code agent intentionally extends validated claims to expose a verified `tid`.

### 5.2 Delegated-user gate

The actor normalizer must reject or non-readily classify:

- `idtyp === 'app'`,
- missing `oid`,
- missing delegated-user context.

### 5.3 Grant-record contract

Use B05’s backend-only grant-record structure as the governing target:

- actor tenant ID,
- actor Entra object ID,
- optional UPN/display snapshots,
- Adobe API access point,
- Adobe web access point,
- encrypted refresh token,
- lifecycle timestamps,
- granted scopes,
- grant state,
- failure/audit metadata.

---

## 6. OAuth configuration and environment gates

### 6.1 Operator-visible config runbook

The implementation package includes an operator runbook with the exact Adobe registration values. The code agent should not rewrite those values unless the operator changes the live hostname decision.

### 6.2 Backend configuration expectations

At minimum, the backend config layer must represent readiness for:

```text
ADOBE_SIGN_OAUTH_CLIENT_ID
ADOBE_SIGN_OAUTH_CLIENT_SECRET
ADOBE_SIGN_OAUTH_REDIRECT_URI
ADOBE_SIGN_OAUTH_SCOPE_SET or equivalent fixed governed scope config
```

The exact env variable names may be adapted to repo naming doctrine, but:
- the client secret remains backend-only,
- the redirect URI must exactly match Adobe app registration and token exchange use,
- the scope posture remains `agreement_read:self`.

### 6.3 Configuration-required mapping

Missing app-registration values, redirect URI, or selected token/grant-store prerequisites must map to:

```text
configuration-required
```

at the My Work read-model boundary.

---

## 7. Search adapter and status mapping

### 7.1 Live retrieval baseline

Use bounded:

```http
POST v6/search
```

through backend service code only.

### 7.2 Exact six statuses

Do not exceed the six-status contract already closed by B04/B05.

### 7.3 Source-state mapping

Map:

- missing grant or expired/revoked refresh token → `authorization-required`
- no stable actor → `principal-unresolved`
- missing Adobe app config/store → `configuration-required`
- provider throttling/outage → `source-unavailable` or `partial` if safe subset exists.

### 7.4 Detail enrichment

Do not create an unbounded `search -> N detail calls` pattern. If a bounded enrichment proves strictly necessary, cap it and test degradation to `partial`.

---

## 8. Source handoff

### 8.1 Row CTA rule

Only include `sourceOpenUrl` when:

- backend supplied,
- URL policy accepted,
- no sensitive query parameters,
- no guessed path construction.

### 8.2 Module-level fallback

A general Adobe launch CTA may exist only if:
- derived from stored `web_access_point`,
- vetted as a durable product route,
- URL policy accepted.

### 8.3 Signing URL prohibition

Do not use Adobe signing URL endpoints as the default queue-row “open” mechanism.

---

## 9. Prompt sequencing logic

| Prompt | Purpose |
|---|---|
| 01 | Preflight foundation and dependency check |
| 02 | Actor/grant contracts and configuration gates |
| 03 | OAuth start + callback routes |
| 04 | Grant-store/token-service seams |
| 05 | Search client + queue adapter |
| 06 | Source handoff policy + module seams |
| 07 | Validation/readiness/closeout |

---

## 10. Non-negotiable drift controls

Do not:
- place Adobe config in SPFx property panes,
- add user/actor query override paths,
- use shared Adobe principals,
- use mutable UPN/email as the grant primary key,
- introduce unbounded queue polling,
- log tokens/codes/raw Adobe bodies,
- change the locked OAuth callback route or redirect URI without explicit operator instruction,
- add speculative staging/prod redirect URIs.
