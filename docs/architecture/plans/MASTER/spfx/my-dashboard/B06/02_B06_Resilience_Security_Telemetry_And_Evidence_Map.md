# 02 — B06 Resilience, Security, Telemetry, and Evidence Map

## 1. B06 target flow

```text
Focused Adobe queue module
        |
        | manual refresh only
        v
My Work frontend read-model client
        |
        | bearer-authenticated read
        v
GET /api/my-work/me/adobe-sign/action-queue
        |
        | withAuth + withTelemetry + request correlation
        v
Adobe queue provider/service seam
        |
        | bounded query, no cache replay
        v
Adobe source / OAuth grant / token-refresh path
        |
        v
Provider failure classification
        |
        v
Typed My Work envelope
        |
        v
Focused module state rendering
```

---

## 2. Refresh trigger matrix

| Trigger | Allowed in MVP | Notes |
|---|---:|---|
| Initial focused-module render | Yes | Standard data dependency |
| Explicit user refresh button | Yes | Debounced and no duplicate in-flight request |
| My Work home render | Yes | Home read model only |
| Visibility/focus event | No | Prevent hidden polling |
| Window resize | No | Layout-only concern |
| Hover | No | Never a fetch trigger |
| Animation lifecycle | No | Never a fetch trigger |
| Timer/interval polling | No | B06 hard stop |
| Every local filter toggle | No by default | Filter already-loaded data locally where possible |

---

## 3. Cache and staleness matrix

| Concern | MVP posture |
|---|---|
| Durable queue cache | Prohibited |
| Shared replay store | Prohibited |
| Browser localStorage/sessionStorage queue persistence | Prohibited |
| In-memory React state for current page session | Allowed |
| Request-local backend variables | Allowed |
| Access-token transient local variable | Allowed |
| Durable refresh-token grant store | Required by B05; separate from queue caching |
| `generatedAtUtc` | Required |
| `isStale` | True only when intentionally stale data is served by a future reopened architecture |

---

## 4. Provider failure mapping

| Provider condition | Safe provider class | Route envelope posture |
|---|---|---|
| Adobe grant missing | `authorization-required` | `authorization-required` |
| Refresh token revoked/expired | `authorization-required` | `authorization-required` |
| OAuth/client config missing | `configuration-required` | `configuration-required` |
| Actor/grant cannot resolve | `principal-unresolved` | `principal-unresolved` |
| Adobe returns 429 | `rate-limited` | `source-unavailable` or true `partial` only if current partial response exists |
| Network timeout / temporary 5xx | `source-transient-failure` | `source-unavailable` |
| Provider shape not safely parsable | `unexpected-provider-shape` | `source-unavailable` |
| Frontend cannot safely consume backend route | n/a | client fallback `backend-unavailable` |

---

## 5. Retry policy map

| Condition | Retry posture |
|---|---|
| 429 with actionable `Retry-After` beyond user-facing route budget | No same-request retry; return controlled envelope |
| 429 with very short server-directed wait and bounded budget | At most one controlled retry if explicitly justified |
| 408 / network timeout | Optional one bounded retry |
| 502 / 503 / 504 | Optional one bounded retry |
| 400 / 401 / 403 from provider | No retry |
| Refresh-token failure | No retry loop |
| Missing configuration | No retry |
| Principal unresolved | No retry |
| Endless retries | Prohibited |

---

## 6. Telemetry allow/prohibit matrix

### Allowed
| Field | Rationale |
|---|---|
| operation | Identify execution path |
| domain | Group telemetry |
| correlationId | Cross-layer tracing |
| durationMs | Performance diagnostics |
| statusCode | Route outcome |
| sourceStatus | Business-state diagnostics |
| providerFailureClass | Operational failure classification |
| retryable | Triage |
| retryAttemptCount | Resilience tuning |
| manualRefreshInvoked | UX/ops correlation |
| queueItemCount total/band | Optional high-level operational metric only |

### Prohibited
| Value | Why |
|---|---|
| access token | Credential |
| refresh token | Credential |
| authorization code | Credential |
| callback query string | Credential/state leak risk |
| client secret | Credential |
| bearer token | Credential |
| raw JWT claims dump | Excess identity exposure |
| agreement title | Sensitive work-item metadata |
| sender name/email | Personal/commercial metadata |
| sourceOpenUrl | Potentially sensitive |
| raw provider error body | Uncontrolled detail exposure |
| full queue JSON | Excess sensitive payload capture |

---

## 7. Sanitized error boundary

### Safe error object concept
```ts
interface SafeMyWorkOperationalError {
  readonly code: string;
  readonly classification: string;
  readonly retryable: boolean;
  readonly safeMessage: string;
  readonly statusCode?: number;
}
```

### Safe messages
- `Adobe Sign authorization is required before this queue can be refreshed.`
- `Adobe Sign is temporarily unavailable for this request.`
- `The provider limited request volume; retry later.`

### Unsafe messages
- raw provider body,
- raw OAuth callback URL,
- raw stack text copied from third-party body,
- agreement title or sender identity in message text.

---

## 8. Evidence sanitation posture

### Baseline to inherit
- redact email-like values,
- redact credential keywords,
- redact long token-like blobs,
- strip query strings,
- block unsafe artifact path classes,
- avoid raw Playwright traces/HARs/videos in curated evidence.

### My Dashboard-specific add-ons
- no live queue row JSON,
- no live agreement title text,
- no live sender metadata,
- no source URL dumps,
- no callback URL query data,
- no auth/session storage-state curation.

---

## 9. Section 18 route taxonomy preservation

| Scenario | HTTP | Envelope `sourceStatus` |
|---|---:|---|
| Queue available | 200 | `available` |
| Empty queue | 200 | `available` |
| Configuration missing | 200 | `configuration-required` |
| User Adobe grant absent | 200 | `authorization-required` |
| Grant/principal unresolved | 200 | `principal-unresolved` |
| Adobe source temporarily unavailable | 200 | `source-unavailable` |
| Adobe throttled | 200 | `source-unavailable` or true `partial` |
| Frontend backend fallback | client-side fallback | `backend-unavailable` |
| Missing/invalid HB API token | 401 | n/a |
| Malformed route query | 400 | n/a |
| Later policy-denied operation | 403 | n/a |
| Unhandled HB backend exception | 500 | n/a |

---

## 10. Design maxims

1. **Snapshot, not stream.**
2. **Manual refresh, not polling.**
3. **Classification, not raw payload logging.**
4. **Credential store is not queue cache.**
5. **Evidence proves structure, not personal work-item content.**
6. **Retries reduce noise only when bounded; they create noise when careless.**
7. **Source degradation is a contract state, not a hidden exception string.**
