# Prompt 02 — Implement Actor, Grant Contracts, and Configuration Gates

You are Claude Code using Opus 4.7. Implement the B05 actor/principal/configuration foundation. Do not re-read files that are still within your current context or memory.

## Objective

Implement the backend-only contracts and readiness seams required for delegated Adobe OAuth and personal queue reads:

- authenticated actor normalization,
- stable actor key,
- app-only rejection/non-ready classification,
- Adobe grant-record contracts,
- configuration/readiness checks for OAuth prerequisites,
- provider-resolution states that map cleanly to B04/B05 source statuses.

## Binding decisions

Use these closed decisions:
- actor/grant lookup key = trusted tenant context + `claims.oid`,
- UPN/display name are display/diagnostic only,
- app-only HB identities are not eligible for personal Adobe queue retrieval,
- no shared Adobe principal fallback,
- missing app/OAuth/token-store config maps to `configuration-required`.

## Implementation lanes

### Lane A — Actor normalization

Create or update a backend module such as:
```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-actor-normalizer.ts
```

Implement a pure-ish adapter from current `AuthContext` / `IValidatedClaims` to a My Work actor representation. Preserve existing repo auth conventions.

Required tests:
- delegated actor success,
- app-only actor non-ready/rejection outcome,
- missing object ID non-ready/rejection outcome,
- UPN not used as primary key.

### Lane B — Principal resolution contracts

Implement the principal-resolution result union matching B05 outcomes:
- resolved,
- authorization-required,
- principal-unresolved,
- configuration-required,
- source-unavailable.

### Lane C — Grant-record shape

Define a backend-only grant-record contract containing:
- actor tenant ID,
- actor Entra object ID,
- optional UPN/display snapshots,
- Adobe API/web access points,
- encrypted refresh-token placeholder contract,
- lifecycle timestamps,
- granted scopes,
- state/failure metadata.

### Lane D — Configuration gates

Add a centralized Adobe Sign config/readiness helper aligned to backend config conventions. It must report readiness for:
- OAuth client ID,
- OAuth client secret,
- redirect URI,
- governed scope posture,
- grant/token-store readiness indicator if the final store adapter is not selected yet.

### Lane E — Tests

Tests must prove:
- no config secret reaches returned public objects,
- missing config maps to `configuration-required`,
- grant lookup is not email-based,
- app-only actors cannot resolve as valid personal queue principals.

## Prohibitions

Do not:
- implement route handlers yet,
- choose an irreversible production durable store if B05/B06 governance has not selected one,
- log or echo secrets,
- change the locked route paths.

## Validation

Run focused tests/typechecks for touched packages.

## Closeout

Return:
- files created/updated,
- validation results,
- residual dependencies,
- whether Prompt 03 may proceed.
