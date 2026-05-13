# 02 — B05 Target Architecture, OAuth, and Configuration Map

## 1. Target architecture diagram

```text
SPFx My Dashboard
    |
    | HB backend bearer token
    v
Protected My Work route
    |
    | AuthContext + validated claims
    v
Actor normalizer
    |
    | actor key = trusted tenant context + claims.oid
    v
Adobe principal resolver
    |
    | grant lookup
    v
Grant store abstraction
    |
    | encrypted refresh-token record / access-point metadata
    v
Token service
    |
    | refresh when needed
    v
Adobe Sign search client
    |
    | POST v6/search
    v
Action queue adapter
    |
    | B04 DTO + B05 source states
    v
My Work envelope to SPFx
```

---

## 2. OAuth route architecture

### 2.1 Protected start route

```http
POST /api/my-work/me/adobe-sign/oauth/start
```

**Route registration posture**
- Azure Functions auth level may remain `anonymous` at function registration when consistent with repo practice,
- actual protection must be enforced through `withAuth(...)`,
- the actor must be derived from `AuthContext`, never caller-supplied query/body identity.

**Recommended response payload**
```ts
interface AdobeSignOAuthStartResponse {
  readonly authorizationUrl: string;
  readonly stateExpiresAtUtc: string;
}
```

The response must not include:
- client secret,
- refresh token,
- access token.

### 2.2 Public callback route

```http
GET /api/my-work/adobe-sign/oauth/callback
```

**Purpose**
- consume Adobe browser redirect,
- validate one-time OAuth state,
- exchange code server-side,
- persist grant context,
- return user to a safe My Dashboard page.

**Required query inputs**
- `state`
- `code`
- `api_access_point`
- `web_access_point`

**Failure handling**
- invalid/missing state should not produce token exchange,
- callback failures should route to a safe end-user return state or controlled non-secret error surface,
- no raw callback query should be logged.

---

## 3. State-binding architecture

### 3.1 State requirements

The state record must be:

- cryptographically unpredictable,
- single-use,
- short-lived,
- actor-bound,
- return-flow-bound,
- resistant to replay and mix-up.

### 3.2 Suggested record

```ts
interface AdobeSignOAuthStateRecord {
  readonly stateId: string;
  readonly stateHash: string;
  readonly actorTenantId: string;
  readonly actorEntraObjectId: string;
  readonly returnPath: string;
  readonly createdAtUtc: string;
  readonly expiresAtUtc: string;
  readonly consumedAtUtc?: string;
}
```

### 3.3 Storage posture

A production implementation must use a secure backend state store. In tests and fixture mode, a deterministic/mock store may be used. The callback route must not fall back to unsafe “accept missing state” behavior.

---

## 4. Actor and principal resolution

### 4.1 Actor normalization

Current backend validated claims support:

```ts
{
  upn,
  oid,
  roles,
  displayName?,
  jobTitle?,
  tokenVersion?,
  scp?,
  idtyp?
}
```

The B05 actor normalizer must produce:

```ts
interface MyWorkAuthenticatedActor {
  readonly actorKey: {
    readonly tenantId: string;
    readonly entraObjectId: string;
  };
  readonly delegated: true;
  readonly upn: string;
  readonly displayName?: string;
  readonly tokenVersion?: string;
  readonly scopes?: readonly string[];
}
```

### 4.2 Ineligible actor outcomes

Return or classify as governed non-ready states when:

- token is app-only,
- no stable user object ID exists,
- delegated user context cannot be asserted.

### 4.3 Principal resolver outcomes

```ts
type AdobeSignPrincipalResolution =
  | { status: 'resolved'; ... }
  | { status: 'authorization-required'; ... }
  | { status: 'principal-unresolved'; ... }
  | { status: 'configuration-required'; ... }
  | { status: 'source-unavailable'; ... };
```

These map directly to B04/B05 My Work envelope statuses.

---

## 5. Grant-store architecture

### 5.1 Durable grant-record contract

The grant record should preserve:

- stable HB actor key,
- Adobe API access point,
- Adobe web access point,
- encrypted refresh token,
- scope set,
- authorization timestamp,
- token lifecycle timestamps,
- grant state,
- last failure metadata.

### 5.2 Store abstraction

Recommended minimal interface:

```ts
interface IAdobeSignGrantStore {
  getByActorKey(actorKey: MyWorkActorKey): Promise<AdobeSignDelegatedGrantRecord | null>;
  upsertGrant(record: AdobeSignDelegatedGrantRecord): Promise<void>;
  markReauthorizationRequired(grantId: string, failureCode?: string): Promise<void>;
  markRevoked(grantId: string, failureCode?: string): Promise<void>;
}
```

### 5.3 Implementation posture

Because B05 architecture closes the **need** for a secure store but does not select the final storage technology, the prompt package should:
- implement the interface and tests,
- wire read-model/provider logic through that interface,
- support deterministic mock/test store,
- gate production-live mode until a secure durable implementation is approved and configured.

---

## 6. Token service architecture

### 6.1 Responsibilities

The token service owns:

- reading the encrypted refresh token via grant store/service boundary,
- obtaining a usable access token,
- refreshing when needed,
- updating lifecycle metadata,
- mapping revoked/expired failures to `authorization-required`,
- mapping source availability failures to `source-unavailable`,
- never leaking token text in errors.

### 6.2 Access-token cache posture

Access-token caching may be transient backend memory/cache only, with:
- cache key: grant ID or actor key,
- TTL shorter than actual token lifetime,
- no frontend exposure.

### 6.3 Refresh outcomes

| Token event | Provider outcome |
|---|---|
| access token still valid | proceed |
| refresh succeeds | proceed and update metadata |
| refresh token expired/revoked | `authorization-required` |
| Adobe/token endpoint unavailable | `source-unavailable` |

---

## 7. Search client architecture

### 7.1 Baseline

```http
POST {api_access_point}/api/rest/v6/search
```

### 7.2 Locked statuses

```text
WAITING_FOR_MY_SIGNATURE
WAITING_FOR_MY_APPROVAL
WAITING_FOR_MY_ACCEPTANCE
WAITING_FOR_MY_ACKNOWLEDGEMENT
WAITING_FOR_MY_FORM_FILLING
WAITING_FOR_MY_DELEGATION
```

### 7.3 Route query boundary

My Work route accepts only:
- `pageSize`
- `cursor`

The adapter owns any translation into Adobe’s request format.

### 7.4 Prohibitions

- no raw search JSON pass-through from SPFx,
- no user-controlled Adobe status list,
- no broad retrieve-all then browser-filter approach,
- no unbounded per-row detail fetch loop.

---

## 8. Source handoff policy

### 8.1 URL decision

Use the existing HB/PCC URL-policy posture as the template:
- HTTPS only,
- no local/private hosts,
- no credential-like query parameters,
- approved host rules when configured,
- structured allow/deny reason codes,
- no thrown parser errors.

### 8.2 SourceOpenUrl semantics

```ts
sourceOpenUrl?: string
```

is still optional.

A queue item may be valid and actionable even if no safe row-level CTA is available.

---

## 9. Environment and configuration map

### 9.1 Operator-controlled Adobe values

| Config item | Purpose |
|---|---|
| OAuth client ID | Adobe app identity |
| OAuth client secret | Backend-only code exchange/refresh dependency |
| Redirect URI | Must match Adobe registration and callback route |
| Scope posture | `agreement_read:self` |
| Grant store readiness | Enables live persistence |
| Encryption readiness | Enables refresh-token storage |

### 9.2 Recommended repo-facing env inventory

Use names aligned with backend naming doctrine. A target set could be:

```text
ADOBE_SIGN_OAUTH_CLIENT_ID
ADOBE_SIGN_OAUTH_CLIENT_SECRET
ADOBE_SIGN_OAUTH_REDIRECT_URI
ADOBE_SIGN_OAUTH_SCOPE=agreement_read:self
ADOBE_SIGN_INTEGRATION_ENABLED
```

Final exact names may be normalized against existing backend config conventions, but the semantic inventory must exist.

### 9.3 Configuration-state mapping

| Missing dependency | B04/B05 state |
|---|---|
| OAuth client ID/secret missing | `configuration-required` |
| redirect URI missing/mismatch | `configuration-required` |
| grant store disabled/unconfigured | `configuration-required` |
| no grant record | `authorization-required` |
| app-only actor | `principal-unresolved` |

---

## 10. OAuth configuration decision for current dev

Locked current redirect URI:

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback
```

The code implementation must use the same redirect URI for:
- Adobe authorization request,
- Adobe token exchange,
- environment/readiness checks,
- runbook/registration documentation.
