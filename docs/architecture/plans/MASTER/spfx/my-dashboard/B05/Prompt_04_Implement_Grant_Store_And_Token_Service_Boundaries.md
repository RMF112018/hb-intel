# Prompt 04 — Implement Grant Store and Token Service Boundaries

You are Claude Code using Opus 4.7. Implement the B05 grant/token lifecycle seams. Do not re-read files that are still within your current context or memory.

## Objective

Implement backend-only grant/token service boundaries that allow B05 OAuth callback and future live action-queue reads to operate without leaking credentials or overstating production readiness.

## Required architecture

### Grant store abstraction
Implement an interface for:
- get grant by actor key,
- upsert active grant,
- mark reauthorization-required,
- mark revoked/disabled where applicable.

### Store posture
- If a secure production store is already established in the current repo and clearly appropriate, align to it.
- If no approved store is present, implement the interface + deterministic mock/test adapter and explicit production configuration gating.
- Do not invent a weak plaintext or frontend-adjacent persistence shortcut.

### Token service
Implement a service boundary for:
- obtaining usable access token,
- refreshing when needed,
- recording refresh lifecycle metadata through store seam,
- mapping expired/revoked refresh to `authorization-required`,
- mapping provider/token endpoint source failure to `source-unavailable`,
- no token text in thrown/public errors.

## Required tests

- active grant with valid cached token path,
- expired token refresh success,
- refresh revoked/invalid → reauthorization-required,
- source/token endpoint unavailable → source-unavailable,
- no token strings in public error messages,
- no refresh/access token values in telemetry-safe structures.

## Security rules

- refresh tokens backend-only,
- encryption requirement preserved in interfaces/contracts/config gates,
- no browser/SPFx exposure,
- no raw Adobe OAuth payload passthrough.

## Closeout

Return:
- store implementation posture chosen,
- what remains operator-gated,
- tests run,
- whether Prompt 05 may proceed.
