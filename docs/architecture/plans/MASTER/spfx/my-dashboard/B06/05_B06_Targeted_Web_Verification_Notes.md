# 05 — B06 Targeted Web Verification Notes

## Purpose

This file preserves the time-sensitive external guidance that materially informs B06. It is not a general literature review. It records only the points that should remain visible to a local implementation agent when converting B06 into runtime code and tests.

---

## 1. Adobe Acrobat Sign throttling

Current Adobe Acrobat Sign API guidance states that API requests can be rejected with HTTP `429 Too Many Requests` and that responses may include a `Retry-After` signal. Adobe guidance also warns against excessive polling and points toward webhooks for event-driven updates.

### Implementation implications
- Treat 429 as a first-class provider failure class.
- Honor server-directed delay where feasible.
- Do not implement blind immediate retry loops.
- Do not add auto-polling to the queue UI.
- Treat webhooks as future-state architecture, not MVP runtime scope.

---

## 2. OAuth token handling

Current Adobe guidance states:
- access tokens expire on a short lifecycle,
- refresh tokens can expire after prolonged inactivity,
- token-refresh use extends viability only when properly managed.

Current OAuth security best practice treats refresh tokens as high-value credentials and stresses protecting redirect flows and token material from leakage.

### Implementation implications
- Token material remains backend-only.
- Refresh-token persistence must not be casually mixed with queue data retention.
- Raw callback URLs and authorization codes are never loggable.
- Refresh failure maps to `authorization-required`, not generic outage.

---

## 3. Retry behavior

Current Microsoft resilience guidance favors:
- retrying transient failures only,
- finite retry caps,
- delay/backoff and jitter,
- respecting `Retry-After`,
- avoiding cascading retry storms.

### Implementation implications
- Retry only when the failure class is truly transient.
- Distinguish provider throttling from configuration/auth failures.
- Do not apply retries at multiple layers in a way that multiplies source load.
- Keep interactive route retry budgets tight.

---

## 4. Caching and sensitive data

Current Microsoft cache-aside guidance warns that caches can return stale data and may be inappropriate for sensitive or security-related data.

### Implementation implications
- Do not add durable queue caching in MVP.
- Do not present persisted last-known queue snapshots as current source truth.
- A later cache proposal must reopen this decision explicitly with TTL, privacy, invalidation, and stale-state semantics.

---

## 5. Telemetry and personal-data minimization

Current Microsoft logging/privacy guidance emphasizes:
- avoiding unnecessary personal data collection,
- filtering or obfuscating personal data where possible,
- not logging secrets,
- preserving correlation IDs and structured diagnostics without overcollecting payload content.

### Implementation implications
- Keep telemetry classification-first, payload-minimized.
- Store route/source/failure classes, not agreement row text.
- Avoid actor emails, sender emails, and source URLs in routine telemetry.
- Treat logs as durable operational records subject to data-governance scrutiny.

---

## 6. B06 design conclusion

The external guidance supports the B06 posture exactly:

```text
manual refresh, not polling
classification, not raw payload logging
bounded retry, not brute-force retries
credential storage, not queue caching
sanitized evidence, not live payload dumps
```
