# Prompt 04 — Implement Sanitized Telemetry and Error Boundaries

## Role

Act as a backend privacy and operational-observability engineer. Harden My Dashboard / Adobe queue telemetry so operations remain diagnosable without leaking secrets or work-item metadata.

## Objective

Implement B06 telemetry and error-boundary rules:

- sanitized operational error messages only,
- classification-first telemetry,
- no raw provider bodies in logs,
- no token/callback/queue-row metadata leakage,
- continued use of existing repo auth/telemetry/correlation patterns.

## Required repo-truth anchor

The existing generic telemetry wrapper can record `errorMessage` for thrown exceptions. This means provider/service code must guarantee that thrown messages are already safe.

## Implementation requirements

### A. Safe operational error contract
Create or refine a My Work / Adobe provider error model that carries:
- stable safe code,
- safe classification,
- retryable flag,
- safe message,
- optional HTTP status where useful.

Raw provider strings must never become the safe message by default.

### B. Sanitize before throw/log
Before any exception can pass through a generic telemetry path:
- sanitize it,
- or convert it into a contract-safe operational error.

Do not emit:
- provider response bodies,
- OAuth callback URLs,
- authorization codes,
- tokens,
- agreement titles,
- sender identities,
- source URLs.

### C. Add safe telemetry fields where useful
Use safe classifications such as:
- `providerFailureClass`,
- `sourceStatus`,
- `retryable`,
- `retryAttemptCount`,
- `manualRefreshInvoked`,
- high-level total count metrics only where operationally justified.

Do not add queue item detail telemetry.

### D. Preserve existing correlation posture
Use the established route-correlation and auth/telemetry wrappers. Do not replace them with ad hoc console logging.

## Testing requirements

Add/update tests proving:
1. raw Adobe/provider body content is not used as telemetry error message,
2. tokens/codes/callback URLs do not appear in telemetry/log strings,
3. agreement titles/sender metadata do not enter telemetry,
4. safe classification fields remain available,
5. provider exception conversion preserves B04/B06 state mapping.

## Scope limits

Do not:
- globally redesign the entire logger,
- add PII toggles that permit production logging of sensitive queue data,
- add verbose raw body logging “for diagnostics,”
- weaken existing telemetry wrappers.

## Closeout

Report:
- safe error model,
- telemetry fields added/refined,
- sanitization tests,
- any narrowly scoped shared helper introduced,
- confirmation that sensitive values are not emitted.
