# Prompt 03 — Implement OAuth Start and Public Callback Routes

You are Claude Code using Opus 4.7. Implement the locked B05 OAuth route pair. Do not re-read files that are still within your current context or memory.

## Objective

Implement the Adobe OAuth route contract:

```http
POST /api/my-work/me/adobe-sign/oauth/start
GET  /api/my-work/adobe-sign/oauth/callback
```

while preserving the B05 public/protected split and server-side OAuth flow.

## Route A — Protected start route

### Required posture
- route is actor-bound and protected through existing backend auth middleware,
- no actor override query/body input,
- app-only personal queue identities are rejected or mapped to governed non-ready behavior,
- creates one-time, unpredictable, expiring OAuth state,
- state binds to actor key and return flow,
- returns only safe authorization-launch metadata.

### Recommended response
```ts
{
  authorizationUrl: string;
  stateExpiresAtUtc: string;
}
```

## Route B — Public callback route

### Required posture
- route path exactly:
  ```text
  /api/my-work/adobe-sign/oauth/callback
  ```
- not nested under `/me/...`,
- validates state before any code exchange,
- reads `code`, `state`, `api_access_point`, `web_access_point`,
- invokes OAuth service/token exchange seam,
- persists/rotates grant through the grant-store abstraction,
- redirects safely back to My Dashboard with non-secret UX status only,
- no tokens/codes/raw query strings in logs.

## State-store seam

If no production store is yet selected, implement:
- interface,
- deterministic/mock test store,
- explicit configuration/readiness gate for production,
- never an unsafe memory fallback that silently claims production readiness.

## Tests

Add route and state tests for:
- exact route path registration,
- protected start route requiring auth,
- callback is not in `/me/...`,
- missing/invalid/expired/consumed state blocks exchange,
- success path uses the store/service seam,
- redirect contains no secret query values,
- route paths match OAuth configuration docs.

## Prohibitions

Do not:
- use a different route name such as `/authorization/start`,
- weaken state validation,
- use a frontend-controlled redirect target without allowlisting/validation,
- log callback raw query strings.

## Validation

Run focused route tests and typechecks.

## Closeout

Return:
- exact implemented paths,
- route auth posture,
- state behavior summary,
- validation output,
- whether operator Adobe registration may now be prepared using the runbook.
