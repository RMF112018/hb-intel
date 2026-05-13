# 00 — B05 Runtime Integration + OAuth Configuration Package Overview

## Objective

Implement the Batch 05 Adobe Sign integration architecture as a backend-mediated, delegated-user OAuth backbone for **My Dashboard / My Work**, while also closing the operator-facing OAuth configuration decision required to complete Acrobat Sign app registration safely.

This package is **not** a restatement of the docs-only B05 package already in the repository. It is a runtime/backend implementation package that assumes the authoritative B05 planning artifact remains the governing architecture reference.

---

## 1. Repo-truth findings that control this package

### 1.1 B05 architecture is already committed

The canonical Batch 05 artifact exists in the My Dashboard dev-plan folder and closes:

- delegated OAuth as the live-auth baseline,
- CUSTOMER app posture,
- stable actor/grant binding,
- exact six-status queue search baseline,
- source handoff limitations,
- production-live dependency gates.

### 1.2 Existing B05 package is docs-only

The repository B05 prompt package under:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05/
```

is a documentation alignment package. It does not implement runtime provider code, OAuth routes, token/grant stores, or Adobe clients. This runtime package intentionally fills that gap.

### 1.3 Backend claim truth supports stable actor binding

Current backend auth claims expose:

- `oid`
- `upn`
- `displayName`
- `idtyp`
- `scp`
- token version metadata

The Batch 05 actor contract must therefore use:

```text
trusted tenant context + claims.oid
```

for grant lookup, while preserving UPN only for display/diagnostics.

### 1.4 Public callback route must be distinct from protected `/me/...` routes

Adobe redirects a browser without an HB bearer token. The callback route must therefore remain public/anonymous at the Function App registration level, while validating one-time state internally.

Locked route contract:

```http
POST /api/my-work/me/adobe-sign/oauth/start
GET  /api/my-work/adobe-sign/oauth/callback
```

### 1.5 Dev Function App redirect URI is known, but must be live-confirmed

The repo-captured Azure resource record and backend deployment documentation support this current dev redirect URI:

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback
```

Because Azure Flex hosts may include generated suffixes and repo-captured resource JSON is not a live metadata read, the runbook requires hostname confirmation before saving the OAuth configuration in Adobe.

---

## 2. B05 implementation scope

### In scope

- backend actor normalization and delegated-user eligibility gate,
- grant-record contracts and lookup interface,
- OAuth configuration/readiness contract,
- protected OAuth start route,
- public OAuth callback route,
- state-binding and return-flow contract,
- token-service abstraction for access/refresh lifecycle,
- queue provider integration seam,
- Adobe search-client adapter posture,
- source-handoff URL policy adaptation,
- source-state mapping to B04/B05 envelope semantics,
- validation and closeout,
- exact Adobe OAuth registration runbook.

### Out of scope

- inventing a production durable token store without an approved storage/security choice,
- placing Adobe secrets in frontend/SPFx config,
- direct Adobe API calls from browser code,
- using shared/admin Adobe principals as fallback,
- broadening queue status scope beyond the six locked statuses,
- implementing B06 resilience/security work that is deliberately deferred,
- adding speculative staging/production callback URLs.

---

## 3. Implementation philosophy

The work should be implemented as **production-shaped seams with explicit operational gates**:

- interfaces and services are real,
- route paths and callback mechanics are real,
- token/secret movement constraints are real,
- tests are real,
- live enablement remains gated where the architecture says a secure operator dependency is still needed.

This is preferable to:
- fake “live” behavior,
- a shared-account workaround,
- silently returning empty queues when authorization is missing,
- or hardcoding configuration in ways that create future drift.

---

## 4. Expected outcome

After executing this package, the repo should have a clear B05 backbone that a later secure-enablement phase can activate without reopening architecture:

```text
HB authenticated actor
  -> stable actor key
  -> grant lookup / authorization state
  -> OAuth callback persistence seam
  -> usable access token or authorization-required state
  -> bounded Adobe search adapter
  -> B04/B05 My Work envelopes
```
