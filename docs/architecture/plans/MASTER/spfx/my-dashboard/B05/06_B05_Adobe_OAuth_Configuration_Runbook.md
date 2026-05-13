# 06 — B05 Adobe OAuth Configuration Runbook

## Objective

Finalize the Adobe Sign OAuth configuration values that must match the B05 backend route contract so the Acrobat Sign **Configure OAuth** screen can be completed without route/config drift.

---

## 1. Locked backend OAuth route contract

### Protected authorization-start route

```http
POST /api/my-work/me/adobe-sign/oauth/start
```

Use:
- HB bearer-token auth,
- actor resolution from validated Entra claims,
- one-time OAuth `state` generation,
- backend-generated Adobe authorization URL response.

### Public callback route

```http
GET /api/my-work/adobe-sign/oauth/callback
```

Use:
- Adobe browser redirect intake,
- no HB bearer token requirement,
- `state` validation,
- code exchange,
- grant persistence,
- safe return redirect.

---

## 2. Current dev public Function App origin

Use the current dev HB Intel Function App host recorded in repo-captured Azure resource evidence:

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
```

### Important operator verification

Before clicking **Save** in Adobe, confirm in Azure that the Function App’s live default hostname is still:

```text
hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
```

If Azure now shows a different hostname, use:

```text
https://{current-live-function-app-host}/api/my-work/adobe-sign/oauth/callback
```

instead.

---

## 3. Exact Adobe Redirect URI to enter

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback
```

This exact URI must remain consistent across:
- Adobe app registration,
- backend runtime configuration,
- OAuth authorization request,
- OAuth token exchange.

---

## 4. Adobe Configure OAuth screen values

| Field | Final value |
|---|---|
| Redirect URI | `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback` |
| Enabled scope | `agreement_read` |
| Modifier | `self` |
| All other scopes | Leave unchecked |

The effective architectural permission remains:

```text
agreement_read:self
```

---

## 5. Adobe app posture

Use:

```text
CUSTOMER
```

for the current internal HB deployment.

Do not select or design around a partner/multi-customer posture unless HB deliberately changes the product strategy later.

---

## 6. Do not add speculative future Redirect URIs

Do **not** add guessed staging or production callback URIs today.

Only add additional values when those public origins actually exist and the deployed callback route is finalized, e.g.:

```text
https://{future-staging-origin}/api/my-work/adobe-sign/oauth/callback
https://{future-production-origin}/api/my-work/adobe-sign/oauth/callback
```

---

## 7. Configuration readiness checklist

Before live OAuth validation:

- [ ] Adobe app type is `CUSTOMER`
- [ ] Redirect URI entered exactly as above or updated to the confirmed live host equivalent
- [ ] Scope `agreement_read` enabled
- [ ] Modifier `self` selected
- [ ] Other scopes left unchecked
- [ ] Backend callback route implemented at `/api/my-work/adobe-sign/oauth/callback`
- [ ] Backend start route implemented at `/api/my-work/me/adobe-sign/oauth/start`
- [ ] OAuth client ID configured backend-side
- [ ] OAuth client secret configured backend-side
- [ ] Redirect URI configured backend-side with the exact registered value
- [ ] Secret/token logging prohibited
- [ ] Grant/token store readiness understood before production-live claims are made

---

## 8. Final operator verdict

Proceed with:

```text
POST /api/my-work/me/adobe-sign/oauth/start
GET  /api/my-work/adobe-sign/oauth/callback
```

and register this current dev Redirect URI:

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback
```

after confirming the Function App hostname is still current in Azure.
