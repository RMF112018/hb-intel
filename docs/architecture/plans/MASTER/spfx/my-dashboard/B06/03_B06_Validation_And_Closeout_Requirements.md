# 03 — B06 Validation and Closeout Requirements

## 1. Validation objectives

B06 validation must prove:

1. The planning authority path drift is corrected.
2. The My Dashboard authority index is current through B06.
3. Focused-module manual refresh exists and is safe.
4. Auto-polling and hidden refresh triggers do not exist.
5. Durable queue caching and queue replay persistence do not exist.
6. Provider resilience behavior handles rate limits and transient source failures as designed.
7. Token-refresh failure maps to `authorization-required`.
8. Unsafe provider errors cannot flow into telemetry/error-message paths.
9. Telemetry excludes queue-row metadata and credential material.
10. Evidence sanitation blocks sensitive payloads and unsafe artifact classes.
11. Section 18 HTTP/source-state taxonomy remains intact.

---

## 2. Required code-level checks

### 2.1 My Dashboard frontend
Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

If the package has a targeted unit-test subset or CI alias for My Dashboard, use it as well.

### 2.2 Backend functions
Run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

If a host-specific test pattern exists for `my-work-read-model`, include that narrower run in the closeout.

---

## 3. Required targeted tests

### Frontend manual refresh tests
Prove:
- refresh control exists only in focused Adobe module,
- it disables while in flight,
- repeated activation does not fire duplicate concurrent requests,
- no `setInterval`/timer polling implementation exists,
- state copy avoids unsupported “real-time” claims,
- existing result remains coherent during a refresh transition.

### Backend resilience tests
Prove:
- `429` maps to a safe provider failure class,
- `Retry-After` is read where present,
- retries are finite,
- auth/config/principal failures are not retried,
- refresh-token failure maps to `authorization-required`,
- source-unavailable/partial mapping preserves B04 taxonomy.

### Privacy/error tests
Prove:
- raw provider body is not used as telemetry `errorMessage`,
- tokens/codes/URLs are not logged,
- agreement title/sender metadata is not emitted into telemetry,
- safe classification fields remain available.

### Evidence tests
Prove:
- sanitizers redact credential-shaped text and emails,
- unsafe artifact paths are filtered,
- queue-specific strings are not blindly written into curated evidence,
- auth/session/storage-state artifacts are blocked.

---

## 4. Static search / grep requirements

Use repo-appropriate search commands to verify the following. Adapt syntax to the local shell, but preserve the intent.

### Forbidden polling / hidden fetch triggers
Search for suspicious patterns in My Dashboard runtime:
```text
setInterval
visibilitychange
document.visibilityState
window.addEventListener('focus'
requestAnimationFrame + fetch-like usage
```

### Forbidden queue persistence
Search for:
```text
localStorage
sessionStorage
QueueCache
queueCache
lastKnownQueue
staleReplay
AdobeQueueSnapshot
```

Review any hits manually; false positives in docs/tests are acceptable only when intentional.

### Forbidden logging/telemetry patterns
Search for:
```text
access_token
refresh_token
authorization code
callback?
sourceOpenUrl
agreementName
senderEmail
senderName
response.text()
error.message copied from provider body
```

The goal is not to ban all string occurrences in tests/docs, but to confirm runtime logging/evidence paths do not leak these values.

---

## 5. Documentation checks

Prompt 00 should leave:

- B06 predecessor reference corrected to the actual committed B05 artifact filename.
- My Dashboard dev-plan README updated through B06.
- No contradictory duplicate naming for the B05 predecessor.

---

## 6. Closeout format

The final B06 closeout should include:

### 6.1 Verdict
```text
PASS / FAIL
```

### 6.2 Branch / HEAD
- branch name,
- starting HEAD,
- ending HEAD.

### 6.3 File changes grouped by domain
- docs,
- frontend,
- backend,
- tests/evidence.

### 6.4 Validation commands
List exact commands and result.

### 6.5 B06 hard-gate confirmation
Explicitly confirm:
- no auto-polling,
- no durable queue cache,
- no browser queue persistence,
- no token/provider-body/queue metadata logging,
- rate-limit handling classified and bounded,
- evidence sanitation enhanced or proven sufficient,
- route taxonomy preserved.

### 6.6 Residual risk register
Call out:
- any deferred webhook work,
- any deferred advanced cache discussion,
- any dependency on completion of B05 runtime seams,
- any still-open hosted tenant validation items.

### 6.7 Suggested commit
Provide:
- concise commit title,
- detailed commit description.

---

## 7. Failure conditions

B06 must be marked FAIL if any of the following remain true:

- manual refresh is implemented through polling,
- queue data is durably cached or persisted in browser storage,
- provider raw error bodies can reach telemetry or evidence,
- `Retry-After` behavior is ignored with a blind immediate retry loop,
- token-refresh failure maps to generic 500/source-unavailable rather than `authorization-required`,
- agreement titles/sender metadata are written to telemetry/evidence,
- B06’s predecessor filename remains inconsistent,
- dev-plan authority index still omits B04/B05/B06.
