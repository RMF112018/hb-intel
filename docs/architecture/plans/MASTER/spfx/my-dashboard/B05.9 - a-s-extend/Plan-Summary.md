# Plan Summary — Adobe Sign Direct Actionability

## Objective

Bring the My Dashboard Adobe Sign module to a flagship-level actionability posture by allowing users to move from a dashboard row to the **specific Adobe Sign action experience** they need, rather than merely seeing a queue row or navigating Adobe Sign manually.

## Current repo truth established by audit

The implementation already has the following plumbing:

- `sourceOpenUrlCandidate` can enter the backend search-client seam.
- URL-policy evaluation can emit `sourceOpenUrl`.
- `sourceOpenUrl` exists on Action Queue and Recent Completions contracts.
- Frontend VMs preserve it.
- Row rendering already shows an `Open` link when `sourceOpenUrl` exists.
- OAuth/grant storage is user-specific and already protected by the existing Adobe Sign OAuth flow.

However:

- The live adapter currently depends on candidate fields such as `viewURL` / `agreementViewUrl`.
- The implementation itself notes that Adobe `/search` wire-shape assumptions were verification-pending when authored.
- The current policy explicitly excludes signing-endpoint URLs from durable row targets.
- Therefore, the current path can at best provide a safe view/open link, not a trustworthy direct action handoff.

## Target architecture

### Primary design

```text
Dashboard row
  → Act now button
    → HB backend resolver route
      → validate authenticated actor + Adobe grant
      → acquire token
      → optionally confirm agreement status
      → call Adobe signing URL endpoint
      → choose actor-relevant URL
      → apply transient URL safety policy
      → redirect or return one-time handoff result
```

### Durable-link design

```text
Completed/history item
  → View button when policy-approved sourceOpenUrl exists
```

### Explicit non-designs

- No `esignUrl` persisted in read models.
- No per-row signing URL fanout during list load.
- No broad policy relaxation that allows sensitive action links to enter durable item DTOs.
- No embedded signing experience in this phase.

## Decision-closed implementation steps

1. Revalidate repo truth locally and freeze the file map.
2. Add resolver request/response contracts and backend route skeleton.
3. Implement the live signing URL client and provider normalization.
4. Add transient-action URL policy, safe redirect posture, and telemetry.
5. Extend read-model items with non-sensitive `actionHandoff` capability metadata.
6. Update frontend row UX:
   - `Act now` for action queue;
   - `View` for completed rows;
   - loading and failure states;
   - fallback to durable view link when relevant.
7. Verify OAuth scope and reconsent posture:
   - current env governed by `ADOBE_SIGN_OAUTH_SCOPES`;
   - signing URL path may require `agreement_write`;
   - existing grants lacking the required scope must produce a reconnect path.
8. Harden tests and final closeout.

## Agent execution posture

Every prompt in this package is designed to:

- be repo-truth-first;
- preserve the existing read-model-first architecture;
- avoid unrelated drift;
- avoid lockfile or dependency mutation;
- prove closure through exact validation outputs;
- use explicit staging rather than broad staging;
- produce a clean commit summary and body for each implementation slice.

## What “done” means

Done means the feature is **operationally useful**:

- A user who sees an actionable Adobe Sign row can initiate the relevant Adobe handoff directly from the card.
- The application handles unavailable URLs, scope gaps, provider not-ready states, throttling, and unsupported action types without lying to the user.
- The implementation is test-backed, telemetry-safe, and security-conscious.
