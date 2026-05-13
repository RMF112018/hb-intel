# 01 — B06 Repo-Truth Implementation Plan

## 1. Target end state

After B06 execution, the repository should demonstrate all of the following:

1. Planning authority references are coherent through B06.
2. The Adobe focused module supports manual refresh without auto-polling.
3. The backend/provider path classifies rate limits, retryability, and auth-refresh failures safely.
4. No durable queue cache or browser queue persistence exists.
5. Telemetry/error paths cannot leak tokens, OAuth callback detail, raw Adobe bodies, or queue-row metadata.
6. Hosted-evidence support for My Dashboard is explicitly sanitized and does not curate sensitive live payloads.
7. The B04 Section 18 HTTP/source-state taxonomy remains intact and is reinforced by tests.

---

## 2. Implementation lane A — documentation authority correction

### Required changes
Update only where repo truth confirms the drift:

1. Correct the B06 planning artifact’s immediate predecessor/binding predecessor path references so they point to:
   ```text
   B05_Adobe_Sign_Integration_Architecture_Development.md
   ```

2. Refresh:
   ```text
   docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
   ```
   so it indexes B04, B05, and B06, and states B06’s governed section set:
   - Sections 22, 23, and 27,
   - plus required operational refinements to Section 18.

3. Do not rewrite the substance of B06. This is a path/authority hygiene correction only.

---

## 3. Implementation lane B — B05 runtime preflight

B06 is a hardening batch. It should not invent provider seams if the B05 runtime package has not been executed.

Prompt 01 must inspect whether the working tree contains the B05 runtime surfaces needed for B06, such as:

- Adobe OAuth start/callback route code,
- provider/token/grant service boundaries,
- Adobe search adapter flow,
- focused module data flow that can expose refresh behavior.

### If present
Proceed.

### If absent
Report the predecessor gap and stop after Prompt 00’s documentation alignment. Do not implement alternate OAuth/provider architecture.

---

## 4. Implementation lane C — frontend refresh hardening

### Objective
Translate B06 refresh posture into the focused Adobe queue UX.

### Required behavior
- Initial route-backed load remains unchanged.
- Add or refine a **manual refresh** affordance only in the focused Adobe queue module.
- Disable the control during in-flight refresh.
- Debounce repeated activation.
- Avoid duplicate in-flight requests.
- Preserve current rendered state until a new response succeeds or an explicit source-state update should replace it.
- Show last-refreshed / generated timestamp copy without claiming “real-time” or continuous live sync.

### Explicitly forbidden
- `setInterval` polling.
- `setTimeout` loops that simulate polling.
- page-visibility refresh.
- window-focus refresh.
- hover-triggered refresh.
- refetch on resize.
- refetch on every local filter toggle if the existing dataset can be filtered locally.

---

## 5. Implementation lane D — backend throttling, retry, and source-state hardening

### Objective
Translate B06 resilience posture into provider/service behavior.

### Required provider taxonomy
The Adobe provider/service layer should use safe operational classes, such as:

```ts
type AdobeQueueProviderFailureClass =
  | 'authorization-required'
  | 'configuration-required'
  | 'principal-unresolved'
  | 'rate-limited'
  | 'source-transient-failure'
  | 'source-unavailable'
  | 'unexpected-provider-shape';
```

Equivalent names are acceptable if repo-local naming conventions favor another pattern.

### Required behavior
- Treat `429` as a rate-limited provider condition.
- Read and honor `Retry-After` when available.
- Avoid same-request retries where the provider instructs a wait beyond an interactive response budget.
- Permit at most a tightly bounded transient retry only when justified.
- Map refresh-token failure to `authorization-required`.
- Map configuration absence to `configuration-required`.
- Map unresolved actor/grant state to `principal-unresolved`.
- Preserve B04 route envelope semantics.

### No durable cache
Do not build:
- queue snapshot storage,
- last-known queue replay,
- SharePoint list persistence of queue rows,
- table storage replay of read models,
- browser queue persistence.

---

## 6. Implementation lane E — telemetry, privacy, and error sanitation

### Objective
Keep the system diagnosable without turning telemetry into a data-leak vector.

### Required behavior
- Use existing route wrappers and correlation conventions.
- Preserve `withAuth(withTelemetry(...))` route composition where already present.
- If provider/service code throws, the thrown messages must already be safe.
- Add targeted safe classifications/metrics rather than raw text.
- Avoid putting queue-row metadata into telemetry fields.

### Prohibited in logs/telemetry
- OAuth authorization code
- refresh token
- access token
- raw callback query string
- raw provider body
- raw Adobe response text
- agreement title
- sender email
- sender name
- sourceOpenUrl
- full queue JSON

### Recommended safe fields
- `providerFailureClass`
- `sourceStatus`
- `retryable`
- `retryAttemptCount`
- `manualRefreshInvoked`
- `queueItemCount` only if high-level/count-only and operationally justified

---

## 7. Implementation lane F — evidence sanitation and hosted-proof posture

### Objective
Adapt the PCC live-evidence sanitation doctrine to My Dashboard and the Adobe queue surface.

### Required proof posture
- curated evidence should be structural/state-based,
- fixture-first when row text would otherwise be sensitive,
- no committed auth/session/storage-state artifacts,
- no raw trace/HAR/video curation,
- no queue payload dumps.

### Acceptable evidence examples
- module selector present,
- state-card selector present,
- refresh button disabled during in-flight request in controlled fixture test,
- source-state matrix summary with sanitized labels,
- screenshot of fixture-only non-sensitive queue scenario if required.

### Unacceptable evidence examples
- live agreement titles,
- live sender identities,
- raw queue JSON,
- OAuth callback URL with query,
- network captures containing tokens.

---

## 8. Implementation lane G — validation and closeout

### Required validation categories
1. Type checks and relevant test suites.
2. Frontend interaction tests for manual refresh/no polling.
3. Backend tests for 429, Retry-After, refresh failure, and source-state mapping.
4. Telemetry/error tests ensuring unsafe payloads do not flow to message fields.
5. Evidence sanitizer tests or documentation tests.
6. Grep/static checks for forbidden persistence and polling patterns.
7. Closeout report with residual risks and deferred webhook/cache future-state.

---

## 9. Suggested touched areas

The agent must confirm actual repo truth before editing, but likely affected areas include:

### Frontend
```text
apps/my-dashboard/src/
```
Potentially:
- focused Adobe module component,
- queue hook/view-model/client usage,
- local refresh state helper,
- tests.

### Backend
```text
backend/functions/src/hosts/my-work-read-model/
```
Potentially:
- Adobe provider/service layer,
- provider failure mapping,
- token-refresh failure adapter,
- tests.

### Evidence
```text
e2e/
```
Potentially:
- My Dashboard evidence writer/sanitizer if an existing lane exists,
- otherwise a narrowly scoped future-proof evidence sanitizer or test utility without broad harness overreach.

### Docs
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
```

---

## 10. Non-negotiable guardrails

- Do not re-read large files already held in active session context unless drift is suspected.
- Do not alter unrelated PCC runtime behavior.
- Do not broaden the B06 scope into B07 evidence-sequence planning.
- Do not implement webhooks.
- Do not implement a cache “temporarily” for convenience.
- Do not weaken source-state taxonomy to hide operational distinctions.
- Do not convert source degradation into raw 5xx unless it is a true unhandled backend failure under B04 rules.
