# 03 — B05 Validation and Closeout Requirements

## 1. Validation objective

Prove that the B05 implementation:

- preserves the delegated OAuth architecture,
- exposes the locked route contract,
- rejects personal-queue access for app-only HB identities,
- protects tokens/codes/secrets,
- uses explicit configuration/readiness gating,
- maps Adobe/source failures to B04/B05 read-model states,
- keeps source handoff optional and policy-validated,
- documents the exact OAuth registration posture.

---

## 2. Required validation families

### 2.1 Type and package validation

Run the repo-appropriate equivalents of:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
```

If B05 touches app/client-facing files, also run the relevant My Dashboard typecheck/test commands introduced by prior batches.

### 2.2 Unit tests

Required test coverage should include:

- actor normalizer:
  - delegated user accepted,
  - app-only token rejected/non-ready,
  - missing `oid` rejected/non-ready;
- state store:
  - generated state is unique/unpredictable by construction,
  - one-time consumption,
  - expiry,
  - actor binding,
  - return path binding;
- OAuth start route:
  - requires HB auth,
  - derives actor from `AuthContext`,
  - returns only safe authorization URL metadata;
- OAuth callback:
  - rejects invalid/missing/expired state,
  - does not exchange code when state invalid,
  - persists grant through store abstraction when success path is mocked,
  - redirects without secrets/tokens/codes;
- token service:
  - usable token path,
  - refresh success,
  - refresh revoked/expired → `authorization-required`,
  - refresh source failure → `source-unavailable`;
- search adapter:
  - exact six-status contract,
  - no unsupported status leakage,
  - bounded query translation,
  - no raw Adobe payload leakage;
- source handoff:
  - allowed URL passes,
  - non-HTTPS fails,
  - private host fails,
  - credential-like query param fails,
  - CTA omission remains valid.

### 2.3 Route registration validation

Prove exact paths:

```text
POST /api/my-work/me/adobe-sign/oauth/start
GET  /api/my-work/adobe-sign/oauth/callback
```

Prove:
- start route is protected through auth middleware,
- callback route is not under `/me/...`,
- callback path is the same path referenced by OAuth configuration docs,
- no accidental route with a conflicting older `authorization/start` or `oauth/callback` variant remains.

### 2.4 Logging/redaction validation

Prove there is no logging of:
- Adobe client secret,
- Adobe access token,
- Adobe refresh token,
- OAuth authorization code,
- raw OAuth callback URL with code/state query,
- raw provider response bodies where sensitive content could appear.

### 2.5 Readiness-state validation

Prove:
- missing Adobe config maps to `configuration-required`,
- no grant record maps to `authorization-required`,
- app-only actor maps to `principal-unresolved`,
- provider outage maps to `source-unavailable`,
- safe partial search/enrichment maps to `partial`.

---

## 3. OAuth configuration validation

### 3.1 Exact configured redirect URI

The implementation documentation must preserve:

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback
```

### 3.2 Host verification note

The closeout must state whether:
- the code agent only preserved the repo-captured dev host decision, or
- the operator separately confirmed the live Azure hostname before Adobe registration.

The code agent should not claim a live Azure confirmation it did not perform.

### 3.3 Adobe screen values

The closeout must restate:

| Field | Value |
|---|---|
| Redirect URI | exact URI above |
| Scope | `agreement_read` |
| Modifier | `self` |
| Other scopes | unchecked |

---

## 4. Suggested grep checks

Use repo-appropriate grep/ripgrep checks to prove absence/presence.

### Presence
```text
my-work/me/adobe-sign/oauth/start
my-work/adobe-sign/oauth/callback
agreement_read:self
configuration-required
authorization-required
principal-unresolved
```

### Absence or prohibited patterns
```text
?user=
?email=
?principal=
client_secret in frontend/app files
refresh_token in frontend/app files
access_token in frontend/app files
shared Adobe principal fallback
```

Exact grep commands should be adapted to shell/repo norms.

---

## 5. Closeout report format

The final agent report must include:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files created
4. Files updated
5. Route contract implemented
6. OAuth configuration route/redirect URI preserved
7. Validation commands executed
8. Test results
9. Readiness-gate outcomes
10. Operator dependencies still pending for live Adobe enablement
11. Confirmation that no tokens/secrets were committed
12. Recommended commit title and description

---

## 6. Minimum acceptance matrix

| Requirement | Acceptance |
|---|---|
| OAuth start route | Implemented, protected, actor-bound |
| Callback route | Implemented, public callback path, state-validated |
| Redirect URI | Exact dev redirect URI documented |
| Actor binding | Tenant context + `oid` |
| App-only tokens | Not eligible for personal queue reads |
| Grant store | Backend-only abstraction wired |
| Refresh token | Backend-only encrypted-persistence requirement preserved |
| Search baseline | Bounded `POST v6/search` posture preserved |
| Source handoff | Optional + validated only |
| Live enablement | Explicitly gated, not falsely claimed |
