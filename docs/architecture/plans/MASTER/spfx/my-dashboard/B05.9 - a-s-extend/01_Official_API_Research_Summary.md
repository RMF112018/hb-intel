# Official Adobe API Research Summary — Implementation Basis

## Research conclusion

The most appropriate official Adobe API capability for direct user action handoff is:

```text
GET /agreements/{agreementId}/signingUrls
```

This endpoint is suited to a **click-time resolver**, not to durable prehydration of every row.

## Key API findings

| Area | Implementation implication |
|---|---|
| Signing URL endpoint | Use as the resolver’s primary direct-action mechanism. |
| Signing URL response | Normalize participant-specific signing URL structures and match them to the current user when possible. |
| Scope | Adobe’s v6 guidance identifies `agreement_write` as required for Signing URL access. |
| Readiness | Adobe documents not-ready behavior such as `DOCUMENT_NOT_YET_AVAILABLE`; the resolver must surface a safe failure and avoid blind retries. |
| Search endpoint | Keep `/search` as the read-model discovery mechanism; do not rely on it as the long-term direct-handoff URL source. |
| Agreement detail/status | Use agreement detail/status retrieval where needed to distinguish not-ready, not-actionable, or completion states. |
| Deliverable/view access | Relevant to view-only use cases, but not selected as the primary Action Queue architecture. |
| Embedded signing | Officially supported in broader product contexts, but intentionally rejected for this dashboard phase because it is heavier than the current quick-action launch-pad objective. |
| Rate limits | Resolve URLs on click only; respect 429 / Retry-After semantics; do not prefetch signing URLs per row. |

## Product decision informed by research

### Selected
- **Click-time action resolver** backed by Signing URL API.
- **Durable safe view links** only for completed/history or fallback contexts.
- **Structured failure outcomes** for unsupported, unavailable, scope-insufficient, not-ready, or rate-limited cases.

### Rejected
- Prehydrating signing URLs into every row.
- Persisting signing URLs in read models or fixtures.
- Replacing the dashboard card with an embedded signing UI.

## Action-type posture

The HB model supports:

- signature
- approval
- acceptance
- acknowledgement
- form filling
- delegation

The resolver should be implemented generically for all six action queue types and return a clear structured outcome when Adobe does not yield a usable participant action URL for a specific row. Hosted validation must specifically test at least:

1. one pending signature action; and
2. one non-signature pending action when a valid tenant test case exists.

## Scope posture

The codebase already externalizes governed scopes through:

```text
ADOBE_SIGN_OAUTH_SCOPES
```

Implementation must:

- verify current scope string;
- detect when existing stored grants lack the scope needed for direct action handoff;
- surface reconnect / reauthorization guidance rather than failing opaquely.
