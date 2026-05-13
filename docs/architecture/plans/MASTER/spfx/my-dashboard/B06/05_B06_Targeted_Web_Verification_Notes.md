# 05 — B06 Targeted Web Verification Notes

## Purpose

This note records the narrow current external-verification posture supporting B06’s load-bearing operational/security claims. It is not a new research paper and does not expand B06 scope.

---

# 1. Adobe throttling and `Retry-After`

## Verified
Adobe’s current Acrobat Sign developer guidance states that:
- API requests are subject to throttling,
- HTTP `429` is returned when throttling limits are exceeded,
- `Retry-After` communicates the minimum wait before a subsequent request,
- high-frequency polling of GET endpoints can trigger provider-side limits.

## B06 implication
B06’s direction remains appropriate:
- no auto-polling in MVP,
- bounded retries only,
- honor `Retry-After`,
- avoid retry storms,
- map rate-limit conditions into controlled degraded states.

Primary reference:
- Adobe Acrobat Sign Developer Guide — API Usage / API Throttling

---

# 2. Webhooks as future-state, not MVP runtime

## Verified
Adobe describes webhooks as push-based HTTPS notifications for workflow events and positions them as a way to avoid continuous polling.

## B06 implication
B06’s posture remains sound:
- webhooks are a future enhancement for better freshness and reduced polling,
- webhook runtime should not be prematurely introduced in MVP,
- no queue-cache architecture should be justified merely by vague future webhook intent.

Primary references:
- Adobe Acrobat Sign Webhook Guide
- Adobe Acrobat Sign API Best Practices

---

# 3. Cache-aside and sensitive/stale data caution

## Verified
Microsoft’s cache-aside pattern guidance warns that:
- caches can become stale,
- consistency is not guaranteed,
- sensitive or security-related data may be inappropriate to cache,
- cache TTL and invalidation strategy must match the data’s characteristics.

## B06 implication
B06’s no-durable-queue-cache MVP posture remains justified because the Adobe queue is:
- user-specific,
- action-sensitive,
- subject to source changes,
- not yet governed by a webhook/invalidation layer.

Primary reference:
- Microsoft Learn — Cache-Aside Pattern

---

# 4. Retry behavior

## Verified
Microsoft’s transient-fault guidance states that:
- retries should be limited to transient faults,
- 429 and 5xx may be retry candidates,
- retry counts and intervals must fit the user-facing latency budget,
- exponential backoff, jitter, and finite retry counts reduce retry amplification.

## B06 implication
B06’s bounded retry posture remains sound:
- no endless retry loops,
- no retries for configuration/auth/principal failures,
- controlled limited retries only where route latency allows.

Primary reference:
- Microsoft Learn — Best Practices for Transient Fault Handling

---

# 5. OAuth and token handling

## Verified
Adobe documents:
- access tokens expire in one hour,
- refresh tokens expire after 60 days of inactivity,
- refresh token use resets inactivity expiry.

RFC 9700 identifies refresh tokens as sensitive OAuth credentials and tightens modern best-practice expectations around secure token handling and restricted privileges.

## B06 implication
B06’s token secrecy posture remains sound:
- refresh tokens backend-only,
- no tokens in SPFx,
- no token logging or evidence artifacts,
- refresh failure maps to authorization-required.

Primary references:
- Adobe Acrobat Sign — Managing OAuth Tokens
- RFC 9700 — OAuth 2.0 Security Best Current Practice

---

# 6. Telemetry/privacy minimization

## Verified
Microsoft’s Azure Monitor guidance recommends:
- filtering, obfuscating, anonymizing, or otherwise avoiding unnecessary personal data collection,
- treating custom telemetry as a likely personal-data surface,
- excluding sensitive data where possible before collection rather than relying on later cleanup.

## B06 implication
B06’s telemetry/evidence minimization posture remains justified:
- classify, count, and correlate;
- do not log tokens, queue contents, agreement titles, sender identities, source URLs, or raw provider bodies.

Primary references:
- Microsoft Learn — Manage Personal Data in Azure Monitor Logs
- Microsoft Learn — Filter Azure Monitor OpenTelemetry / avoid sensitive data collection

---

# 7. Package conclusion

The external verification supports preserving B06’s operational/security decisions as closed planning authority. No contradiction was found that would require weakening:
- the no-auto-poll rule,
- the no-durable-cache MVP rule,
- the retry/throttling posture,
- the telemetry minimization posture,
- or the token/evidence privacy guardrails.
