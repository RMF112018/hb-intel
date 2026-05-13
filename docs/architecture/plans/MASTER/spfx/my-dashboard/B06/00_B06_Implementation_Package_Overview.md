# 00 — B06 Implementation Package Overview

## Objective

Implement the runtime and evidence-hardening work required by the committed B06 planning artifact for HB Intel My Dashboard and the Adobe Sign Action Queue. B06 is the batch that prevents the initiative from becoming fragile, noisy, privacy-leaky, or operationally misleading as the Adobe provider path becomes live.

This package translates B06 into focused local-agent execution prompts.

---

## 1. Why B06 matters

B06 closes the operational architecture for five areas that otherwise tend to drift during implementation:

1. **Refresh behavior**  
   Load data on render, allow deliberate manual refresh in the focused module, and prohibit auto-polling in MVP.

2. **Caching and staleness**  
   Do not persist queue snapshots or present replayed queue data as current source truth. `generatedAtUtc` is required; `isStale` means intentionally stale data, not merely “the screen has been open for a while.”

3. **Throttling and retry behavior**  
   Rate-limited Adobe responses must be classified, controlled, and translated into contract-safe My Work source states. B06 rejects brute-force retry loops.

4. **Telemetry and privacy**  
   Instrument the system with classifications, timings, statuses, and counts where justified, but do not log tokens, callback URLs, provider bodies, agreement titles, sender identities, source URLs, or queue payloads.

5. **Evidence sanitation**  
   Hosted/curated evidence must prove behavior without becoming a privacy or auth artifact repository.

---

## 2. Repo-truth findings that shape this package

### 2.1 B06 planning authority already exists
The canonical B06 dev-plan artifact is already committed on current `main`. This package does **not** re-add that artifact; it implements it.

### 2.2 B06 contains a narrow B05 predecessor-path drift
The B06 artifact points to a long-form B05 predecessor name, while the active committed B05 dev-plan artifact is:

```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

Prompt 00 corrects that path drift and refreshes the authority index before runtime work begins.

### 2.3 My Work backend route foundation already exists
Current repo truth already includes protected My Work read-model route registration for:

```text
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

Those routes already use `withAuth(withTelemetry(...))` and return typed read-model envelopes through provider indirection. B06 must harden this foundation rather than replace it.

### 2.4 Generic telemetry can leak message text if unsafe errors are thrown
The current `withTelemetry(...)` wrapper emits `handler.error` with `errorMessage` if an exception is thrown. This is a useful baseline, but B06 requires My Work provider/service layers to ensure any thrown message is already sanitized and operationally safe.

### 2.5 Existing PCC evidence sanitation is a strong reusable baseline
The PCC live evidence utilities already sanitize:

- email addresses,
- token-like blobs,
- auth/session/storage-state references,
- sensitive query strings,
- unsafe artifact path classes,
- raw artifact references such as traces, HARs, and videos.

B06 requires My Dashboard hosted evidence to inherit this doctrine and add queue-specific restrictions.

---

## 3. Target B06 runtime shape

### Frontend
- Focused Adobe module owns manual refresh interaction.
- Manual refresh is disabled while in flight.
- Repeated refresh actions are debounced.
- Home surface does not expose a dedicated refresh control.
- No timer polling, hover polling, visibility refresh, or focus refresh.

### Backend
- Provider failures are classified before route translation.
- `429` rate limiting is preserved as an operational class.
- `Retry-After` is honored where present and practical.
- Retries are finite and only applied to eligible transient failures.
- Refresh-token failure becomes `authorization-required`, not generic failure.
- No raw upstream body/error string reaches logs, telemetry, or response envelopes.

### Telemetry
Allowed:
- operation name,
- correlation ID,
- duration,
- status class,
- source-state class,
- provider failure class,
- retry count,
- manual-refresh invoked flag,
- high-level counts where justified.

Prohibited:
- token material,
- authorization codes,
- callback query strings,
- raw provider bodies,
- agreement titles,
- sender names/emails,
- source URLs,
- full queue JSON.

### Evidence
- Structural, sanitized, fixture-first.
- No auth/session artifacts.
- No raw live queue payloads.
- No row content dumps.
- No confidential queue screenshots by default.

---

## 4. Package structure rationale

The package is split into eight execution prompts so that the local agent can remain focused:

| Prompt | Primary focus |
|---|---|
| 00 | Documentation authority correction |
| 01 | Runtime dependency preflight |
| 02 | Frontend refresh behavior |
| 03 | Provider throttling/retry/source-state hardening |
| 04 | Telemetry/error privacy boundary |
| 05 | Evidence sanitation and hosted proof constraints |
| 06 | Cross-layer regression validation |
| 07 | Final closeout and residual risk synthesis |

This sequence prevents the agent from mixing frontend refresh work, backend retry behavior, telemetry redaction, and evidence curation into a single broad pass.

---

## 5. Main assumptions

1. B05 runtime provider work is the immediate predecessor to B06 code execution.
2. B04 read-model routes remain the route contract authority.
3. B06 does not change the two protected My Work GET routes.
4. B06 may add or refine supporting types, view-model logic, provider failure classifications, and tests, but it must not change the product/domain taxonomy.
5. Webhook runtime remains future-state only.

---

## 6. Decision summary

| Area | B06 decision |
|---|---|
| Initial data load | On render |
| Focused queue refresh | Manual only |
| Auto-polling | Prohibited |
| Queue persistence | No durable cache |
| Stale replay | Prohibited |
| Rate limiting | Classify and honor `Retry-After` |
| Retry | Bounded and transient-only |
| Tokens | Backend-only, never log |
| Telemetry | Classification-first, payload-minimized |
| Evidence | Sanitized, fixture-first, no sensitive queue rows |
| Webhooks | Future-state only |
