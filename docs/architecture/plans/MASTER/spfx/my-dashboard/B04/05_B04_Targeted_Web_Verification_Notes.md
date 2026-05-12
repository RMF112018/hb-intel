# B04 Targeted Web Verification Notes

## Purpose

This note records the external claims that materially inform B04 implementation. These findings should be used as supporting context, not as an excuse to reopen the closed B04 contract decisions.

## 1. BFF/read-model seam

**Verified posture:** Microsoft’s Backends for Frontends guidance supports a UI-specific backend layer when a frontend benefits from a tailored interface rather than generic/raw source payloads.

**B04 implementation consequence:**  
The My Dashboard SPFx app should consume My Work DTO envelopes from HB backend routes, not raw Adobe Sign payloads.

## 2. HTTP semantics vs. source-state semantics

**Verified posture:**  
HTTP semantics distinguish successful representation responses from malformed request/auth/server failure classes. RFC 9457 defines a standardized problem-details format for HTTP APIs, but the HB Intel repo already uses shared response helpers.

**B04 implementation consequence:**  
- Keep expected source/business degradation inside HTTP 200 My Work envelopes.
- Keep malformed query/auth/unhandled failure cases as repo-standard HTTP errors.
- Do not introduce a My Work-only `application/problem+json` format in this batch.

## 3. Adobe Sign actionable recipient statuses

**Verified posture:**  
Adobe documents current-recipient statuses that correspond to actions such as:
- signature,
- approval,
- acceptance,
- acknowledgement,
- form filling,
- delegation.

**B04 implementation consequence:**  
Normalize exactly the six MVP statuses closed in B04. Do not let the frontend parse raw Adobe statuses directly.

## 4. Adobe query boundedness and throttling

**Verified posture:**  
Adobe’s developer guidance emphasizes bounded/paginated retrieval patterns and documents throttling behavior such as `429 Too Many Requests` and `Retry-After`.

**B04 implementation consequence:**  
- Keep queue pagination explicit.
- Do not build broad unbounded frontend/source polling patterns.
- A throttled or degraded upstream provider should translate into `source-unavailable` or `partial` read-model states, not raw error leakage to SPFx.

## 5. Scenario-based contract testing

**Verified posture:**  
Provider-state testing guidance from Pact emphasizes explicit isolated scenario states rather than brittle cross-test mutation.

**B04 implementation consequence:**  
Use named fixture scenarios:
- available populated,
- available empty,
- paged,
- partial,
- config/auth/principal/source unavailable,
- backend fallback.

These scenarios should be independently testable and reusable by later provider verification.

## 6. What this verification does not authorize

These research notes do not authorize:
- direct Adobe API calls from SPFx,
- cross-user queue routes,
- wider Adobe status intake than B04 defines,
- RFC 9457 backend-wide migration within B04,
- live OAuth/provider implementation ahead of B07.
