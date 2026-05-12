# B06 — HB Intel My Dashboard Operational Resilience, Security, Telemetry, Privacy, and Risk Development

**Artifact status:** Batch 06 authoritative development-planning artifact  
**Prepared:** 2026-05-12  
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work shell**, and **Adobe Sign Action Queue** first module  
**Repo continuation anchor:** `43fdc9cfe4227ba82ef5fb15c2dc7f911f9cfe75`  
**Immediate predecessor:** `B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development.md`  
**Binding predecessors:**  
- `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`
- `B03_My_Work_Shell_Navigation_And_UX_Development.md`
- `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md`
- `B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development.md`

**Source outline:** `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`  
**Batch scope:** Detailed development of plan Sections **22**, **23**, and **27**, with required refinements to **18. Backend Route Family and Error Taxonomy** where operational behavior materially affects the route contract.  
**Session posture:** Closed-decision planning artifact. This is **not** runtime implementation and **not** a local code-agent prompt package.

---

# Executive Verdict

## Final verdict

**Proceed with the Adobe Sign Action Queue under a conservative, supportable operational posture: load queue data on render, permit deliberate manual refresh only in the focused module, prohibit auto-polling in MVP, avoid durable queue caching in MVP, honor upstream throttling signals, treat queue content as sensitive work-item metadata, and inherit the repository’s existing authenticated route, telemetry, correlation, and evidence-redaction doctrine with stricter My Dashboard-specific guardrails.**

Batch 06 closes the operational architecture as follows:

1. **Frontend refresh behavior is now closed.**  
   The MVP must:
   - load the My Work home projection and Adobe focused queue read models on render,
   - support **manual refresh in the focused Adobe Sign module** only,
   - debounce repeated refresh attempts,
   - avoid duplicate in-flight requests,
   - **not** auto-poll Adobe Sign in MVP.

2. **Backend cache posture is now closed.**  
   The MVP should use:
   - **no durable queue cache,**
   - **no shared cross-request queue replay store,**
   - **no “last known queue” fallback presented as current data,**
   - source freshness fields in read models so the UI can communicate when the currently rendered response was generated.

   A later webhook-backed or per-actor short-lived resilience layer may be considered only after a separate privacy, stale-data, and operational cost review.

3. **Staleness is explicit and never implied away.**  
   The read model already carries freshness metadata from Batch 04. Batch 06 closes the interpretation:
   - `generatedAtUtc` is mandatory route output metadata.
   - `isStale` is reserved for a genuine stale-data condition, not merely “not refreshed this second.”
   - The UI may say **“Last refreshed [time]”** when the response is available and non-stale.
   - The UI must **not** represent stale or provider-unavailable data as a live current queue.

4. **Adobe throttling handling is now closed.**  
   The provider must:
   - recognize `429` / rate-limited responses,
   - honor `Retry-After` when provided,
   - avoid tight retry loops,
   - use bounded retries only where the failure is transient and recovery can occur within the route’s acceptable execution window,
   - otherwise map the result to a controlled My Work degraded source state.

5. **Webhook posture is future-state only.**  
   Webhooks are the preferred future mechanism for:
   - reducing repeated polling demand,
   - improving responsiveness,
   - enabling notification workflows,
   - supporting later queue freshness improvements.

   Webhook ingestion, verification, deduplication, persistence, and notification fan-out remain **out of scope for MVP**.

6. **Telemetry is now governed by an explicit allow/prohibit matrix.**  
   My Dashboard may record:
   - route and operation identifiers,
   - correlation IDs,
   - duration and status class,
   - source-state categories,
   - high-level count metrics,
   - retryable vs. non-retryable classifications,
   - throttle occurrence and controlled failure class.

   It must not record:
   - Adobe access tokens,
   - refresh tokens,
   - OAuth authorization codes,
   - raw provider error bodies,
   - agreement titles,
   - sender emails,
   - sender names where not operationally essential,
   - source-open URLs,
   - raw Adobe response payloads,
   - credential-bearing query strings,
   - live personal-work queue contents in hosted evidence artifacts.

7. **The repo’s `withAuth()` / `withTelemetry()` / request-correlation posture is binding, but My Dashboard must harden what can enter error-message paths.**  
   Existing telemetry wrappers emit useful route lifecycle signals, but the generic `handler.error` path may capture `errorMessage`. My Dashboard providers and route adapters must therefore throw only sanitized, contract-safe operational errors and must never pass unsanitized provider strings into that path.

8. **Evidence sanitation inheritance is now closed.**  
   My Dashboard hosted evidence must inherit PCC live evidence sanitation doctrine:
   - redact emails, token-like blobs, credential keywords, sensitive query parameters, and unsafe artifact paths,
   - exclude auth/session/storage-state artifacts from curated evidence,
   - avoid queue-row payload dumps,
   - prove shell/module/source states through structural assertions, controlled fixture scenarios, and sanitized summaries rather than live content capture.

9. **Token secrecy and persistence rules are now explicit.**  
   Batch 05’s delegated OAuth baseline remains binding. Batch 06 adds:
   - refresh tokens are backend-only credentials,
   - access tokens are backend-only transient credentials,
   - grant/token stores must not become broad telemetry or evidence sources,
   - no queue resilience mechanism may persist token-bearing payloads or provider bodies,
   - failed refresh maps to `authorization-required`, not opaque generic failure.

10. **Section 18 route error taxonomy is refined, not replaced.**  
    The B04 contract remains:
    - expected integration/source/business states return **HTTP 200 + valid typed My Work envelope**,
    - missing/invalid HB API auth remains `401`,
    - authenticated but policy-denied operations remain `403` if such a policy surface is later introduced,
    - malformed query input remains `400`,
    - unhandled HB backend exceptions remain `500`,
    - upstream-source degradation is translated into controlled source-state envelopes rather than raw provider leak-through.

11. **The operational risk register is now implementation-grade.**  
    This batch closes risk definitions and mitigations for:
    - Adobe auth readiness,
    - delegated grant/token storage,
    - principal mapping failures,
    - throttling and rate-limit behavior,
    - stale queue misrepresentation,
    - incorrect or unsafe source links,
    - privacy leakage through logs,
    - privacy leakage through evidence,
    - backend auth/runtime config failure,
    - SharePoint API permission approval gaps,
    - uncontrolled retry amplification,
    - future webhook complexity.

---

# 1. Governing Decisions Carried Forward

## 1.1 Batch 01 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Product boundary | My Dashboard is a **standalone SPFx app/domain**, not a PCC extension. |
| User context | My Dashboard is **authenticated-user contextual**, not project-contextual. |
| Adobe module identity | `adobe-sign-action-queue` remains distinct from PCC’s project-contextual `adobe-sign`. |
| Integration posture | Backend-mediated external-system access; direct Adobe calls from SPFx are prohibited. |
| My Work platform relationship | My Dashboard must not create a competing enterprise personal-work primitive beside `@hbc/my-work-feed`. |

## 1.2 Batch 02 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Target host page | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx` |
| Protected backend routes | SPFx API token provider + backend `withAuth()` contract. |
| Browser config posture | No backend secret, OAuth secret, token, or Adobe operational config in property pane. |
| Runtime transport posture | Governed fixture/backend mode selection, not ad hoc live calls. |
| Deployment dependency | SharePoint API permission approval is required for live protected-route validation. |

## 1.3 Batch 03 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Shell states | `home` and `focused-module` only. |
| Focused module behavior | Adobe queue renders inside the active My Work shell panel. |
| Source-state UX | Non-ready states render intentionally rather than disappearing. |
| Shell/module ownership | Module owns queue content, filtering, refresh affordances, and source-specific copy. |

## 1.4 Batch 04 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Route family | `GET /api/my-work/me/home` and `GET /api/my-work/me/adobe-sign/action-queue`. |
| Source-state envelope vocabulary | `available`, `partial`, `configuration-required`, `authorization-required`, `principal-unresolved`, `source-unavailable`, `backend-unavailable`. |
| Query posture | Queue route accepts only `pageSize` and `cursor`; no user/actor override fields. |
| HTTP source-state posture | Expected source/business degradation returns HTTP 200 with a typed envelope. |
| Queue metadata | Freshness metadata and warning contracts remain structured and deterministic. |
| Source handoff seam | `sourceOpenUrl` remains optional and backend-governed. |

## 1.5 Batch 05 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Adobe auth baseline | Delegated user OAuth. |
| App posture | Acrobat Sign `CUSTOMER` application baseline for internal HB use. |
| Principal resolution | Stable actor/grant relationship; no shared principal fallback. |
| Query endpoint | Adobe `POST v6/search` as the live queue retrieval baseline. |
| Source URL posture | No guessed client-side agreement URLs; row CTA only when backend provides a validated source URL. |
| Token posture | Tokens backend-only; refresh-token lifecycle and secure persistence required. |

---

# 2. Audit and Research Method

## 2.1 Batch 06 objective

This Batch 06 audit was designed to answer twelve implementation-grade operational questions:

1. What backend telemetry conventions already exist in repo truth?
2. What auth telemetry and request-correlation conventions should My Dashboard inherit?
3. What evidence sanitation/redaction doctrine already exists and must be carried forward?
4. Is there an existing repo precedent for source freshness, stale states, source throttling, and sanitized provider errors?
5. Is there a reusable token-store or delegated OAuth persistence pattern already implemented?
6. Should the Adobe queue auto-refresh, manually refresh, or remain fully static after first load?
7. Should MVP use no queue cache, short-lived cache, or a persisted replay layer?
8. How should throttling, `Retry-After`, and transient provider failures behave?
9. What telemetry fields are operationally useful without creating privacy risk?
10. What queue data is safe to return to SPFx, and what may never appear in logs/evidence?
11. What Section 18 error-taxonomy refinements are required by the operational posture?
12. What downstream validation and future-plan constraints must later implementation inherit?

## 2.2 Authority hierarchy

The audit used this order of authority:

1. **Live repository truth at commit `43fdc9cfe4227ba82ef5fb15c2dc7f911f9cfe75`**
2. **Committed My Dashboard Batch 01–05 artifacts**
3. **The umbrella My Dashboard comprehensive development-plan outline**
4. **Current official Adobe Acrobat Sign developer guidance**
5. **Current official Microsoft architecture/security/telemetry guidance**
6. **Current OAuth security best-practice authorities**
7. **Implementation inference where necessary, clearly identified as design guidance rather than sourced fact**

## 2.3 Repo audit lanes

### Lane A — Backend logging, telemetry, auth, and correlation
Inspected:
- `backend/functions/src/utils/withTelemetry.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/request-id.ts`
- `backend/functions/src/utils/logger.ts`

Determined:
- which lifecycle events My Dashboard should inherit,
- what auth telemetry already exists,
- how request IDs are generated and propagated,
- what properties are emitted automatically,
- where feature-specific redaction must tighten generic telemetry behavior.

### Lane B — Evidence redaction and hosted-test sanitation doctrine
Inspected:
- `e2e/pcc-live/pcc-live.evidence-writer.ts`
- `e2e/pcc-live/pcc-live.sanitization.ts`
- `e2e/pcc-live/pcc-live.sanitization.spec.ts`

Determined:
- what credential/PII redaction baseline exists,
- what artifact paths are disallowed,
- what text is scrubbed before writing evidence,
- what My Dashboard evidence must inherit.

### Lane C — Existing source freshness, stale, rate-limit, and sanitized-provider-error patterns
Inspected:
- `packages/models/src/pcc/PccProcoreDataLayer.ts`
- B04 My Work read-model planning artifact

Determined:
- the repo already has mature source-state vocabularies including `stale`, `rate-limited`, and `source-unavailable`,
- freshness is modeled explicitly,
- sanitized provider-error helper patterns exist,
- Batch 06 should mirror the philosophy without copying PCC’s exact domain vocabulary.

### Lane D — External service and token-handling pattern references
Inspected:
- `backend/functions/src/services/foleon-service.ts`
- searches for delegated OAuth refresh-token stores, generic Key Vault token storage, and OAuth callback persistence patterns

Determined:
- the repo contains backend-only external service patterns and safe-config methods,
- the repo does **not** currently expose a production-ready delegated-user refresh-token persistence abstraction suitable for Adobe reuse,
- Adobe refresh-token storage is a new implementation concern and must be planned explicitly.

### Lane E — B04/B05 My Dashboard contract carry-forward
Inspected:
- B04 read models/routes/fixtures development artifact
- B05 Adobe integration architecture development artifact
- outline Sections 18, 22, 23, and 27

Determined:
- Batch 06 must refine, not reopen, the route/read-model decisions already closed in B04 and B05,
- operational posture must preserve B04 HTTP/source-state taxonomy,
- Adobe auth and source-link safety decisions from B05 remain binding.

## 2.4 Web research lanes

Used current authoritative guidance to confirm:

### A. Adobe throttling and retry behavior
- rate-limit posture,
- `429` handling,
- `Retry-After`,
- why polling should be restrained,
- future webhook advantages.

### B. OAuth and token security
- refresh-token secrecy expectations,
- token persistence posture,
- rotation/expiry considerations,
- why browser-side token storage is prohibited.

### C. Telemetry and privacy
- minimizing personal/work-item metadata in telemetry,
- avoiding collection of sensitive or unnecessary personal data,
- documenting and limiting telemetry fields.

### D. Caching and transient-fault handling
- cache-aside caution for sensitive data,
- explicit TTL and freshness considerations,
- bounded retry/backoff patterns,
- avoiding retry amplification.

---

# 3. Files and Documents Inspected

## 3.1 Backend telemetry/auth/correlation files

| Path | Batch 06 use |
|---|---|
| `backend/functions/src/utils/withTelemetry.ts` | Handler lifecycle telemetry shape, `handler.invoke/success/error` pattern, `errorMessage` exposure risk |
| `backend/functions/src/middleware/auth.ts` | `auth.bearer.success/error`, correlation handling, bearer validation posture |
| `backend/functions/src/middleware/validateToken.ts` | Structured token-validation reasons, no token leak in auth error classification |
| `backend/functions/src/middleware/request-id.ts` | `X-Request-Id` extraction or UUID generation |
| `backend/functions/src/utils/logger.ts` | JSON structured logs, custom event/metric envelope |

## 3.2 PCC live evidence redaction and sanitation files

| Path | Batch 06 use |
|---|---|
| `e2e/pcc-live/pcc-live.evidence-writer.ts` | Redacted evidence output, unsafe artifact filtering |
| `e2e/pcc-live/pcc-live.sanitization.ts` | Regex-driven redaction of emails, phones, credential terms, blobs, query strings, unsafe paths |
| `e2e/pcc-live/pcc-live.sanitization.spec.ts` | Test-verified sanitation behavior and redaction expectations |

## 3.3 Source-state / freshness / sanitized-error precedent files

| Path | Batch 06 use |
|---|---|
| `packages/models/src/pcc/PccProcoreDataLayer.ts` | Source states including `stale` and `rate-limited`, freshness bands, sanitized provider-error helper |
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | My Work source-state envelope, warnings, freshness metadata, HTTP/source-state doctrine |

## 3.4 Backend service pattern references

| Path | Batch 06 use |
|---|---|
| `backend/functions/src/services/foleon-service.ts` | Backend-only external service integration pattern, safe config posture, normalized service errors |
| Search results for delegated OAuth refresh-token stores | Negative finding: no direct reusable delegated token-store abstraction located |

## 3.5 Binding predecessor artifacts

| Path | Batch 06 use |
|---|---|
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Scope and boundary authority |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Protected API / SPFx auth posture |
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | UX/source-state rendering posture |
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Route/read-model/error-taxonomy baseline |
| `B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development.md` | Delegated OAuth, grant-record, source-link, Adobe query contract |

---

# 4. Repo-Truth Findings

## 4.1 Current branch posture is stable and directly anchored to B05

The repository at the time of this audit is identical to:
```text
43fdc9cfe4227ba82ef5fb15c2dc7f911f9cfe75
```

That commit introduces the Batch 05 Adobe Sign integration architecture development artifact. There are no intervening commits to reconcile before Batch 06.

**Batch 06 implication:**  
The operational architecture may treat B05 as the immediate binding predecessor without a drift gap.

---

## 4.2 The backend observability baseline is already mature enough to inherit

### Repo truth
`withTelemetry.ts` emits:
- `handler.invoke`
- `handler.success`
- `handler.error`

with:
- domain,
- operation,
- correlation ID,
- HTTP method,
- environment,
- duration,
- status code,
- error code,
- error message.

`auth.ts` emits:
- `auth.bearer.success`
- `auth.bearer.error`

with:
- correlation ID,
- reason classification,
- auth duration.

`request-id.ts` uses:
- incoming `X-Request-Id` when present,
- generated UUID when absent.

`logger.ts` writes:
- JSON structured traces,
- custom event payloads,
- custom metrics payloads.

### Batch 06 decision
My Dashboard backend routes must:
- use the established `withAuth(withTelemetry(...))` route wrapping posture,
- preserve correlation ID usage,
- emit My Dashboard domain/operation names consistently,
- rely on structured event fields rather than free-form diagnostic dumps.

### Critical refinement
The generic telemetry wrapper includes `errorMessage` in `handler.error`. Therefore:

**My Dashboard providers and route adapters must never throw raw provider errors containing:**
- Adobe response bodies,
- token details,
- OAuth callback query values,
- source-open URLs,
- agreement titles,
- sender identities,
- user email addresses where avoidable.

The route layer must throw or return **sanitized operational errors** only.

---

## 4.3 Auth telemetry is already reason-coded and avoids token leakage

### Repo truth
`validateToken.ts` uses structured validation reason codes:
- `missing_header`
- `malformed_header`
- `expired`
- `invalid_issuer`
- `invalid_audience`
- `missing_claims`
- `validation_failed`
- `config_error`

`auth.ts` telemetry records the reason code but not bearer-token contents.

### Batch 06 decision
My Work route auth telemetry should inherit this pattern and must not introduce:
- token excerpts,
- decoded raw token payload dumps,
- raw claim sets in logs,
- end-user email address logging in auth events.

### Operational extension
Where My Work must classify actor/principal issues, it should use a feature-specific, non-sensitive classification field such as:
- `actorResolutionState: 'resolved' | 'principal-unresolved' | 'authorization-required'`
rather than logging actor identity fields.

---

## 4.4 Evidence sanitation doctrine is unusually strong and should be inherited, not reauthored

### Repo truth
The PCC live evidence system:
- strips query strings,
- redacts email addresses,
- redacts phone numbers,
- redacts credential terms such as `token`, `auth`, `session`, `secrets`,
- redacts long token-like blobs,
- redacts raw HTML,
- redacts raw Playwright evidence classes such as `trace.zip`, `video.webm`, and network HARs,
- filters unsafe artifact paths before writing curated evidence.

### Batch 06 decision
My Dashboard live evidence must inherit this doctrine as a minimum baseline.

### My Dashboard-specific extension
Because Adobe Sign queue rows may contain commercially sensitive or personal workflow metadata, My Dashboard evidence must **not** write:
- agreement titles,
- sender display names,
- sender emails,
- source URLs,
- OAuth authorization/reconnect URLs with query content,
- raw queue-item JSON,
- raw Adobe response bodies,
- live actor-specific queue contents captured from hosted production-like pages.

### Safe evidence examples
Safe curated evidence may include:
- shell selector presence,
- focused-module selector presence,
- source-state card selector presence,
- card counts,
- summary count numerics only where the fixture scenario controls them,
- sanitized route-state matrices,
- screenshot evidence using deterministic fixture states or carefully reviewed non-sensitive mock data.

---

## 4.5 PCC Procore source-state doctrine provides a useful operational precedent

### Repo truth
`PccProcoreDataLayer.ts` defines source-state concepts including:
- `available`
- `stale`
- `rate-limited`
- `backend-unavailable`
- `source-unavailable`

It also includes:
- freshness-band derivation,
- `lastIngestedAtUtc`,
- sanitized error-message backstop helper,
- clear guidance that provider error strings should already be sanitized at ingestion boundaries.

### Batch 06 decision
My Dashboard should adopt the **same philosophy**:
- state-first read models,
- source degradation modeled explicitly,
- freshness represented explicitly,
- provider errors sanitized before they can reach UI/log/evidence surfaces.

### Not copied verbatim
My Work should preserve its own B04 source-state vocabulary rather than importing PCC Procore source-state literals.

---

## 4.6 There is no production-ready delegated OAuth token-store abstraction in repo truth

### Repo truth
The Foleon service demonstrates:
- backend-only secret use,
- access-token acquisition within a service boundary,
- safe config reporting,
- normalized service-error classification.

However:
- it uses a service-to-service/client-credentials style flow,
- it does not implement delegated-user refresh-token persistence,
- searches did not locate a reusable general-purpose OAuth grant-record/token-store abstraction.

### Batch 06 decision
The Adobe Sign implementation must treat the delegated grant store and refresh-token persistence layer as **new infrastructure**, not as a copy/paste extension of the current Foleon pattern.

### Planning consequence
The final comprehensive development plan must retain explicit work for:
- secure refresh-token storage,
- encryption/secret-management choice,
- token-at-rest policy,
- refresh failure handling,
- reauthorization mapping,
- revocation/removal workflow if needed later.

---

## 4.7 B04 already anticipated warnings and freshness; Batch 06 closes their operational meaning

### Repo truth
B04 already locked:
- structured warning codes,
- `generatedAtUtc`,
- queue freshness metadata,
- `stale-cache-used` warning code,
- source-state envelope semantics.

### Batch 06 decision
Because MVP will not use a durable queue cache, `stale-cache-used` remains:
- a reserved contract seam,
- a future-state warning code,
- not a normal MVP runtime condition.

If an implementation later introduces a short-lived cache despite this batch’s recommendation, that change must:
- reopen this Batch 06 operational decision,
- specify TTL,
- define when `isStale = true`,
- prove that stale rows cannot be misrepresented as current,
- add corresponding tests and evidence constraints.

---

# 5. Current External Research Findings

## 5.1 Source register

### Adobe sources
| ID | Source | Use in Batch 06 |
|---|---|---|
| **A1** | Adobe Acrobat Sign Developer Guide — API Usage / Throttling | 429 handling, rate-limit posture, `Retry-After` |
| **A2** | Adobe Acrobat Sign Developer Guide — API Best Practices | Avoid unnecessary polling; event-driven alternatives |
| **A3** | Adobe Acrobat Sign Developer Guide — Webhooks | Future webhook posture and event-driven sync |
| **A4** | Adobe Acrobat Sign Developer Guide — Managing OAuth Tokens | Access-token / refresh-token lifecycle |
| **A5** | Adobe Acrobat Sign Developer Guide — OAuth | Authorization-code flow and token handling expectations |

### Microsoft / architecture sources
| ID | Source | Use in Batch 06 |
|---|---|---|
| **M1** | Microsoft Learn — Azure Architecture Center: Cache-Aside Pattern | Caching tradeoffs and stale-data risks |
| **M2** | Microsoft Learn — Retry Pattern / Transient Fault Handling | Bounded retries, backoff, transient-failure classification |
| **M3** | Microsoft Learn — Azure Monitor Personal Data Guidance | Telemetry minimization and personal-data handling |
| **M4** | Microsoft Learn — Application Insights / logging hygiene guidance | Operational telemetry without sensitive payload dumping |

### OAuth / security sources
| ID | Source | Use in Batch 06 |
|---|---|---|
| **O1** | OAuth 2.0 Security Best Current Practice | Token handling, redirect/callback secrecy, replay minimization |
| **O2** | RFC 9700 / OAuth 2.0 Security Best Current Practice | Avoid credential leakage, protect refresh tokens |

### Repo references
| ID | Source | Use in Batch 06 |
|---|---|---|
| **R1** | `withTelemetry.ts` | Backend lifecycle telemetry |
| **R2** | `auth.ts` | Auth telemetry and wrapper pattern |
| **R3** | `validateToken.ts` | Structured token-validation error taxonomy |
| **R4** | `request-id.ts` | Correlation ID extraction/generation |
| **R5** | `logger.ts` | Structured JSON/custom event telemetry |
| **R6** | PCC live evidence writer/sanitizers | Redaction/evidence doctrine |
| **R7** | `PccProcoreDataLayer.ts` | Freshness, rate-limited, sanitized provider-error precedent |
| **R8** | `foleon-service.ts` | Backend service abstraction and safe config posture |
| **R9** | B04 My Work read-model routes/error taxonomy | Binding read-model and HTTP/source-state contract |
| **R10** | B05 Adobe integration architecture | Binding OAuth/token/source-link decisions |

---

## 5.2 Research finding A — Adobe throttling must be treated as a first-class operational state

Adobe documents API throttling behavior and expects clients to respond to rate limiting in a controlled way. The operational implication is not simply “retry until success”; a well-behaved integration must:
- interpret rate limits as a meaningful source condition,
- honor `Retry-After` when provided,
- avoid generating unnecessary repeated demand,
- prevent queue UI refresh loops from amplifying provider stress.

### Batch 06 conclusion
A My Work Adobe provider must classify throttling separately from:
- authorization-required,
- configuration-required,
- principal-unresolved,
- generic source-unavailable.

At the read-model boundary, it may still collapse into the B04 route state:
- `source-unavailable`
or
- `partial`
where safe renderable results legitimately exist.

But operational telemetry should preserve:
- `providerFailureClass: 'rate-limited'`
or equivalent safe classification.

---

## 5.3 Research finding B — Auto-polling is not justified for the MVP queue

Adobe’s broader API best-practice posture favors:
- bounded requests,
- event-driven updates where practical,
- avoiding needless repeated API scans.

The queue use case does not require second-by-second recency. Its primary function is:
- “show me what currently requires my action,”
not
- “stream every source update immediately.”

### Batch 06 conclusion
The MVP must not implement auto-polling.

Recommended user-facing posture:
- load on visit,
- permit manual refresh in the focused module,
- show a last-refreshed timestamp,
- defer near-real-time behavior to a future webhook-backed architecture.

---

## 5.4 Research finding C — Durable caching of personal action queues creates stale-data and privacy risk

General cache-aside guidance notes:
- caches can improve performance,
- cached data must be governed by invalidation and freshness rules,
- cache use is less suitable when data correctness, freshness, or sensitivity materially matters and invalidation is weak.

The Adobe queue is:
- user-specific,
- action-relevant,
- potentially commercially sensitive,
- liable to change at the source after a user signs or approves an agreement,
- not guaranteed to have a simple invalidation signal in MVP.

### Batch 06 conclusion
The MVP should use:
- **no durable queue cache**,
- **no persisted last-known queue fallback**,
- **no background replay of older queue rows as if current.**

A later cache may be considered only with:
- webhook or equally reliable invalidation,
- short TTL,
- per-actor partitioning,
- explicit stale-state UI,
- privacy/security review,
- test evidence proving no stale misrepresentation.

---

## 5.5 Research finding D — Retry logic should be bounded, classified, and jittered

Transient-fault guidance favors:
- retrying only where the failure class is genuinely transient,
- exponential or progressive backoff,
- retry caps,
- jitter to avoid retry synchronization,
- preventing retries from extending beyond an acceptable user-facing latency budget.

### Batch 06 conclusion
My Dashboard should use this posture:

#### Route-path rule
The user-facing queue route may perform:
- zero or a very small number of bounded retries,
- only for clearly transient technical failures,
- never for authorization, principal, or configuration failures.

#### Throttling rule
For `429`:
- honor `Retry-After`,
- do not continue hammering within the same request path when the wait exceeds the route’s interactive execution budget,
- return a controlled degraded envelope.

#### Refresh UX rule
Manual refresh buttons must not become a retry storm vector:
- disable while in flight,
- debounce successive clicks,
- surface a calm degraded-state message rather than encouraging repeated clicks.

---

## 5.6 Research finding E — Refresh tokens require high-severity secret handling

Current Adobe OAuth guidance and modern OAuth security best practice converge on the same conclusion:
- refresh tokens are long-lived credentials,
- access tokens are sensitive credentials,
- tokens must not appear in frontend bundles, browser storage, logs, analytics, screenshots, or evidence artifacts,
- refresh-token persistence must be backend-governed and protected.

### Batch 06 conclusion
The final development plan must require:
- backend-only refresh-token storage,
- encryption at rest or equivalent approved secret-protection design,
- minimal token material exposure to implementation layers,
- no token logging,
- no raw OAuth callback URL logging,
- no query-string logging that could contain authorization codes or state values,
- explicit mapping of refresh failure to `authorization-required`.

---

## 5.7 Research finding F — Telemetry minimization is a design obligation, not a late redaction step

Microsoft’s telemetry/privacy guidance emphasizes:
- collect only what is necessary,
- treat logged personal data as discoverable operational data,
- prefer classifications and counters over payload content,
- avoid accidental collection of sensitive contextual metadata.

Adobe agreement titles and sender identities may disclose:
- customer names,
- project names,
- contract subjects,
- private transaction context,
- internal workflow state.

### Batch 06 conclusion
The queue’s UI DTO may legitimately contain certain metadata for the authenticated user’s use, but telemetry/evidence systems may not treat those fields as casually loggable.

**Allowed for UI read model:** agreement title, sender metadata where required for queue usefulness.  
**Prohibited for logs/evidence:** those same values unless a future explicitly approved diagnostic workflow exists and includes redaction/governance.

---

# 6. Fully Developed Section 22 — Refresh, Caching, Staleness, and Throttling Rules

## 22.1 Objective

The refresh/caching/throttling architecture must preserve four priorities:

1. **Currentness:** avoid showing stale queue rows as though they are live.
2. **Source respect:** avoid aggressive Adobe API demand.
3. **Operational resilience:** degrade gracefully when Adobe or OAuth dependencies are unavailable.
4. **Implementation clarity:** leave no ambiguity about polling, cache, retry, or freshness semantics.

---

## 22.2 Final frontend refresh contract

### Closed MVP behavior
The My Dashboard frontend must use:

| Surface | Initial load | Manual refresh | Auto-poll |
|---|---:|---:|---:|
| My Work Home | Yes | No dedicated refresh control required | No |
| Focused Adobe Sign Action Queue module | Yes | Yes | No |
| Source-state cards | Render from current envelope | Updated through manual focused-module refresh only | No |

### Required UX rules
- Manual refresh control appears **only** in the focused Adobe Sign Action Queue module.
- Manual refresh must be disabled while a request is in flight.
- Repeated refresh attempts must be debounced.
- Refresh failure must not blank a previously visible view without state explanation.
- Refresh failure must present a contract-safe source-state message.

### Recommended implementation constraint
Do not refetch:
- on hover,
- on tab focus,
- on animation completion,
- on scroll,
- on every filter toggle when the current dataset is already loaded,
- on every shell state change if the queue read model is still the current active query result.

---

## 22.3 Final refresh trigger matrix

| Trigger | MVP behavior | Rationale |
|---|---|---|
| Shell first render | Load required home read model | Required for My Work summary/home card |
| Focused Adobe module first render | Load queue read model | Required for module content |
| User selects “View queue” | Load focused queue if not already loaded | Normal data dependency |
| User presses manual refresh | Issue one debounced queue refresh | Explicit user action |
| User changes local filter | Filter current in-memory result if compatible | Avoid source re-query for simple UI filtering |
| Timer interval | **No request** | Auto-poll prohibited |
| Visibility/focus event | **No request** | Avoid hidden implicit polling |
| Window resize | **No request** | Layout-only concern |
| Page reconnect after network outage | No automatic source spam; next explicit data load/refresh resolves | Conservative operational posture |

---

## 22.4 Final cache posture

### Closed decision
**No durable queue cache in MVP.**

This means:
- no database table storing action-queue rows for replay,
- no SharePoint list acting as a queue cache,
- no Redis/distributed cache storing user queue content as a required runtime dependency,
- no last-known-response persistence on the browser,
- no durable persistence of item titles/sender fields for resilience purposes.

### Allowed exceptions
The following are acceptable and do **not** violate the no-durable-cache rule:
- normal in-memory React query state during a single page session,
- backend request-local variables,
- ordinary transient access-token variables inside the provider execution scope,
- deterministic fixture data for test/preview modes.

### Explicitly disallowed
- persisting raw or normalized queue items “just in case Adobe is down,”
- serving a materially old queue result as the current queue,
- writing queue rows to telemetry or evidence files,
- browser localStorage/sessionStorage persistence of queue data.

---

## 22.5 Future-state cache seam

A later phase may consider a **short-lived, per-actor, backend-only cache** only if all of the following become true:

1. A separate architecture decision formally reopens Batch 06’s no-durable-cache posture.
2. TTL is explicitly documented.
3. Per-actor isolation is enforced.
4. Cache values are encrypted or otherwise governed if persistent across process boundaries.
5. The read model sets:
   - `isStale: true` when applicable,
   - a stable stale warning code,
   - appropriate source-state semantics.
6. UI copy explicitly distinguishes current vs. stale.
7. Tests prove stale rows are never represented as live source truth.
8. Privacy review accepts the retention posture.
9. Hosted evidence does not dump cached row contents.

### Current MVP outcome
This seam remains documented but unimplemented.

---

## 22.6 Freshness and staleness model

### Mandatory read-model fields
Batch 04’s queue read model freshness metadata remains required:

```ts
refresh: {
  generatedAtUtc: string;
  isStale: boolean;
}
```

### Final interpretation
| Field | Meaning |
|---|---|
| `generatedAtUtc` | When the backend/fixture generated the read model currently shown |
| `isStale: false` | The response is not being intentionally presented as stale or cached fallback data |
| `isStale: true` | The response is knowingly not current relative to the desired source state and must be messaged accordingly |

### Important guardrail
`isStale` must **not** be set to `true` merely because a user has been on the page for several minutes. Without a cache/replay layer, the response is simply the current loaded snapshot; the UI can show “Last refreshed [time]” without claiming stale degradation.

### MVP UI copy posture
Recommended:
- **Available state:** “Last refreshed [local time].”
- **Source unavailable on current request:** “Adobe Sign information could not be refreshed right now.”
- **Authorization required:** “Adobe Sign access needs to be authorized before this queue can be refreshed.”

Avoid:
- “Real-time”
- “Live continuously”
- “Always current”
- “Updated instantly”

These claims are unsupported by the MVP architecture.

---

## 22.7 Throttling and rate-limit contract

### Provider classification
The Adobe provider must distinguish at least:

| Upstream condition | Provider classification |
|---|---|
| 429 rate limit | `rate-limited` |
| 5xx transient source failure | `source-transient-failure` or equivalent |
| timeout/network failure | `source-unavailable` transient class |
| invalid/expired Adobe grant | `authorization-required` |
| app/config missing | `configuration-required` |
| HB actor unresolved to grant | `principal-unresolved` |

### Read-model mapping
| Provider condition | Route envelope posture |
|---|---|
| Rate-limited with no usable safe data | `source-unavailable` |
| Rate-limited but safe partial data legitimately assembled from the same response path | `partial` |
| Transient source unavailable | `source-unavailable` |
| Retryable but not recoverable within interactive budget | `source-unavailable` |

Because MVP has no queue cache, “partial” should be used sparingly and only when the provider truly obtained legitimate partial current data.

---

## 22.8 Retry contract

### General retry rule
Retries are permitted only for transient technical failures where:
- the provider is configured to do so,
- the operation is read-only,
- the retry can complete within the interactive route budget,
- the retry does not violate provider throttling guidance,
- the retry does not mask a persistent configuration/auth failure.

### Recommended bounded retry defaults
These values should be confirmed during implementation against the selected HTTP client/utilities, but the architecture should assume:

| Failure class | Retry? | Notes |
|---|---:|---|
| 429 with `Retry-After` greater than interactive budget | No immediate same-request retry | Return degraded envelope |
| 429 with very short `Retry-After` and retry budget available | At most one controlled retry | Must remain bounded |
| 408 / network timeout | Optional one retry | Backoff/jitter |
| 502 / 503 / 504 | Optional one retry | Backoff/jitter |
| 400 / 401 / 403 from Adobe | No retry | Classify accurately |
| Refresh-token failure | No retry loop | Map to authorization-required |
| Missing configuration | No retry | Map to configuration-required |

### Backoff posture
- Use progressive/exponential delay where appropriate.
- Add jitter to avoid synchronized retry bursts.
- Cap attempts.
- Do not carry retry loops into the frontend.

---

## 22.9 Manual refresh abuse prevention

### Required protections
- disable button while a queue refresh request is active,
- debounce repeated refresh interaction,
- preserve keyboard/accessibility behavior,
- avoid triggering new requests from both click and Enter/Space paths more than once,
- show a controlled busy state,
- avoid flashing stale or contradictory status copy.

### Recommended telemetry
Safe manual-refresh event fields:
- `domain: 'my-work'`
- `operation: 'refreshAdobeActionQueue'`
- `correlationId`
- `refreshOrigin: 'focused-module-manual'`
- `resultSourceStatus`
- `durationMs`

Prohibited:
- actor email,
- agreement IDs,
- agreement names,
- raw queue counts per category if they are treated as unnecessarily granular beyond operational need; total count bands may be used where helpful.

---

## 22.10 Webhook future-state posture

### Future architecture opportunity
Webhooks may support:
- better queue recency,
- notification workflows,
- lower repeated query pressure,
- background invalidation of an approved future cache.

### Explicitly out of scope for MVP
- webhook subscription lifecycle,
- webhook signature verification,
- webhook deduplication,
- event persistence,
- event-triggered queue recomputation,
- near-real-time UI push.

### Required documentation in final comprehensive plan
The final plan must document webhooks as:
- **recommended future enhancement**,
- **not required for first implementation**,
- **not a reason to prematurely add durable queue caching in MVP**.

---

# 7. Fully Developed Section 23 — Security, Privacy, and Telemetry Contract

## 23.1 Objective

The security/privacy/telemetry contract must ensure that My Dashboard:
- supports secure actor-specific Adobe queue retrieval,
- remains operationally diagnosable,
- avoids exposing tokens or agreement metadata outside strictly necessary UI boundaries,
- produces sanitized evidence consistent with existing HB Intel doctrine.

---

## 23.2 Security data-classification posture

### Data classes

| Data class | Examples | Handling posture |
|---|---|---|
| **Credential secrets** | Adobe refresh tokens, access tokens, OAuth authorization codes, client secrets | Backend-only; never log; never render; never write to evidence |
| **Identity linkage data** | Stable Entra actor key, Adobe grant linkage | Backend-governed; minimal storage; avoid casual telemetry exposure |
| **Sensitive work-item metadata** | Agreement title, sender name, sender email, source-open URL | UI DTO only where necessary; prohibited from logs/evidence by default |
| **Operational status metadata** | source state, count summary, response class, duration | Safe for telemetry when minimized |
| **Fixture/mock metadata** | Deterministic non-sensitive sample titles, mock senders | Permissible in test/evidence if clearly fixture-governed |

---

## 23.3 Token secrecy and persistence rules

### Binding Batch 05 posture
The Adobe integration uses delegated OAuth with backend-governed token persistence.

### Batch 06 additions
The implementation must satisfy all of the following:

1. **No token material in SPFx**
   - no access token in component props,
   - no refresh token in state,
   - no OAuth token in web-part property pane,
   - no browser local/session storage persistence.

2. **No token material in logs**
   - no bearer token,
   - no refresh token,
   - no OAuth code,
   - no raw callback URL including query parameters,
   - no provider error body that might echo sensitive tokens.

3. **No token material in evidence**
   - no screenshots of callback flows containing query strings,
   - no network HAR retention in curated evidence,
   - no auth/session storage-state evidence committed,
   - no raw trace/video artifacts that may capture auth tokens.

4. **Backend-only secure persistence**
   - refresh-token storage must be server-side,
   - encryption at rest or equivalent approved protection is required,
   - token-store access must be narrowly scoped,
   - token retrieval must occur only in backend provider/service code that needs it.

5. **Refresh failure mapping**
   - invalid/expired/revoked grant or refresh failure maps to `authorization-required`,
   - do not convert token refresh failures into generic raw provider errors,
   - do not retry refresh indefinitely.

---

## 23.4 Principal and actor privacy rules

### Binding Batch 05 posture
The queue is:
- actor-specific,
- delegated-user based,
- no shared-principal fallback,
- no cross-user actor override.

### Batch 06 additions
Telemetry and evidence must not expose:
- actor UPN/email in routine logs,
- decoded raw claim payloads,
- actor-to-Adobe mapping keys,
- grant-record identifiers unless transformed to a safe non-identifying operational hash and formally approved.

### Recommended telemetry alternative
Use fields such as:
- `actorResolutionState: 'resolved' | 'principal-unresolved' | 'authorization-required'`
- `grantState: 'present' | 'missing' | 'refresh-failed'`
rather than storing actor identifiers.

---

## 23.5 Queue DTO minimization policy

### UI DTO may include
The SPFx UI read model may include only the data required to render the queue usefully:

| Field category | Allowed? | Notes |
|---|---:|---|
| agreement ID | Yes | Needed for stable row identity; should not be logged |
| agreement name | Yes | Needed for user comprehension |
| sender display name/email | Yes, where available and helpful | UI-only; not telemetry/evidence |
| required action category | Yes | Core queue function |
| dates needed for sort/urgency | Yes | E.g., modified/expiration where available |
| validated source-open URL | Optional | Backend-governed, render only if validated |
| raw provider payload | No | Never returned |
| tokens/auth material | No | Never returned |
| full agreement document contents | No | Out of scope |

### Data minimization rule
Do not add fields “because Adobe returns them.”  
Add fields only when:
- the UI design explicitly needs them,
- the field is included in the My Work read-model contract,
- privacy implications are understood,
- the field is covered by tests and source-state behavior.

---

## 23.6 Telemetry allow/prohibit matrix

### Allowed telemetry fields

| Field | Allowed | Notes |
|---|---:|---|
| `domain` | Yes | Example: `my-work` |
| `operation` | Yes | Example: `getAdobeSignActionQueue` |
| `correlationId` | Yes | Existing route convention |
| `method` | Yes | Existing telemetry convention |
| `environment` | Yes | Existing telemetry convention |
| `durationMs` | Yes | Existing telemetry convention |
| `statusCode` | Yes | Existing telemetry convention |
| `sourceStatus` | Yes | Use My Work envelope status |
| `providerFailureClass` | Yes | e.g., `rate-limited`, `source-unavailable`, `refresh-failed` |
| `retryable` | Yes | Boolean |
| `retryAttemptCount` | Yes | Numeric, bounded |
| `queueItemCount` | Conditionally | Prefer total or bounded band, not row data |
| `manualRefreshInvoked` | Yes | Boolean/operation-specific |
| `authorizationRequired` | Yes | Boolean/status classification |
| `principalResolved` | Prefer state label | Avoid identity details |

### Prohibited telemetry fields

| Field/value | Prohibited | Rationale |
|---|---:|---|
| Adobe access token | Yes | Credential |
| Adobe refresh token | Yes | Credential |
| OAuth authorization code | Yes | Credential |
| OAuth callback URL query string | Yes | Credential/state leakage risk |
| Client secret | Yes | Credential |
| Bearer token | Yes | Credential |
| Raw JWT payload | Yes | Excess identity exposure |
| Agreement title | Yes | Sensitive work-item metadata |
| Agreement source URL | Yes | Could include sensitive pathing/identifiers |
| Sender email | Yes | Personal data |
| Sender full name | Yes by default | Avoid unnecessary telemetry disclosure |
| Raw Adobe API response body | Yes | Broad exposure risk |
| Raw provider error body | Yes | May contain sensitive details |
| Raw request body for OAuth/token exchange | Yes | Credential leakage |
| Full queue-item JSON | Yes | Sensitive unnecessary logging |
| Screenshot OCR/text dumps of live queue rows | Yes | Evidence privacy risk |

---

## 23.7 Error sanitization contract

### Required principle
Provider errors must be converted to:
- safe error codes,
- safe failure classes,
- safe user-facing source states,
- safe internal messages suitable for telemetry.

### Never pass raw provider strings through:
- `throw new Error(rawAdobeBody)`
- telemetry `errorMessage`
- evidence writer warnings
- fixture warnings copied from live provider responses.

### Recommended provider error model
```ts
interface MyWorkProviderFailure {
  readonly classification:
    | 'authorization-required'
    | 'configuration-required'
    | 'principal-unresolved'
    | 'rate-limited'
    | 'source-transient-failure'
    | 'source-unavailable'
    | 'unexpected-provider-shape';
  readonly retryable: boolean;
  readonly safeMessage: string;
  readonly httpStatus?: number;
}
```

### Safe message examples
- “Adobe Sign authorization must be completed before the queue can be refreshed.”
- “Adobe Sign is temporarily unavailable for this request.”
- “Adobe Sign request volume was limited; refresh later.”

### Unsafe message examples
- Raw JSON returned by Adobe.
- Error string containing account-specific route details.
- OAuth callback URL.
- Response body excerpts.

---

## 23.8 Hosted evidence and Playwright privacy contract

### Binding inherited doctrine
My Dashboard hosted evidence must carry forward PCC’s sanitizer capabilities:
- redacted emails,
- credential keywords,
- token-like blobs,
- sensitive query strings,
- unsafe evidence paths,
- raw browser artifacts not appropriate for curation.

### Additional My Dashboard evidence rules
Evidence should prefer:
- fixture states for screenshots,
- structural assertions,
- stable data attributes,
- state labels and card presence,
- counts only when using controlled fixture data.

Evidence should avoid:
- production/live queue-row text,
- actual sender identity capture,
- agreement title capture,
- raw queue response fixtures derived from live content,
- auth flow artifacts with callback query parameters,
- trace/HAR/video artifacts committed as curated proof.

### Required future validation prompts
Later implementation/evidence prompts must explicitly tell the agent:
- do not commit raw auth/session artifacts,
- do not include queue item metadata in evidence JSON,
- sanitize warning strings before writing,
- avoid storing live response payloads in logs or evidence,
- do not claim evidence is deployment-ready when sanitization review remains pending.

---

## 23.9 Data retention posture

### MVP retention rule
The MVP should not persist:
- queue item snapshots,
- queue row metadata,
- sender metadata,
- source links,
- raw Adobe payloads,
for operational resilience.

### Allowed durable storage
Only the OAuth/grant persistence layer approved under Batch 05 may durably store:
- stable actor ↔ grant association,
- encrypted refresh-token material,
- minimum token lifecycle metadata,
- required access-point metadata.

### Documentation requirement
The final comprehensive plan must distinguish:
- **credential store** required for OAuth,
from
- **queue data cache** explicitly rejected in MVP.

These are separate concerns.

---

## 23.10 Security acceptance gates

A later implementation is not acceptable unless it proves:

1. Tokens never enter SPFx props/state/config.
2. Raw OAuth callback query strings are not logged.
3. Raw Adobe response bodies are not logged or exposed to frontend.
4. Queue-row titles/sender identities are absent from telemetry.
5. My Work route errors use sanitized operational messages.
6. Live evidence tooling redacts emails, token-like values, query strings, and unsafe artifact paths.
7. Manual refresh cannot create duplicate in-flight calls.
8. 429 handling is bounded and maps to controlled source-state behavior.
9. No durable queue cache is implemented absent a reopened architecture decision.
10. Refresh-token failures map to authorization-required.

---

# 8. Required Refinements to Section 18 — Backend Route Family and Error Taxonomy

## 18.1 Objective of refinement

Batch 04 already locked the route family and broad HTTP/source-state posture. Batch 06 refines the operational mapping for:
- throttling,
- sanitized provider failures,
- token-refresh failures,
- transient source outages,
- route telemetry expectations.

---

## 18.2 Route family remains unchanged

```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

### Query posture remains unchanged
The focused queue route may accept only:
- `pageSize`
- `cursor`

Prohibited:
- `email`
- `userId`
- `actor`
- `upn`
- `agreementTitle`
- arbitrary raw Adobe query pass-through.

---

## 18.3 Final HTTP vs. read-model response matrix

| Scenario | HTTP | Envelope `sourceStatus` | UI state | Operational notes |
|---|---:|---|---|---|
| Valid user, queue available | 200 | `available` | Ready | Normal render |
| Valid user, no queue items | 200 | `available` | Empty | Empty is successful data |
| Partial provider result safely renderable | 200 | `partial` | Partial warning | Use only when current partial data truly exists |
| Adobe integration missing config | 200 | `configuration-required` | Configuration state | Expected business state |
| User lacks Adobe grant / refresh failed | 200 | `authorization-required` | Authorization state | Refresh failure maps here |
| HB actor cannot resolve to Adobe principal | 200 | `principal-unresolved` | Resolution state | No fallback principal |
| Adobe source temporarily unavailable | 200 | `source-unavailable` | Degraded state | Safe operational envelope |
| Adobe request rate-limited | 200 | `source-unavailable` or `partial` | Degraded/partial | Preserve rate-limit class in telemetry |
| Frontend cannot safely consume backend route | client fallback | `backend-unavailable` | Backend unavailable state | Frontend-generated fixture/fallback envelope |
| Missing/malformed HB API bearer token | 401 | n/a | App auth failure | Existing auth middleware |
| Invalid audience/issuer/expired HB API token | 401 | n/a | App auth failure | Existing structured auth telemetry |
| Authenticated but later policy-denied route | 403 | n/a | Access denied | Future if route authorization policy introduced |
| Invalid `pageSize` / malformed `cursor` | 400 | n/a | Invalid request handling | Standardized error helper |
| Unhandled backend exception | 500 | n/a | General error | Must remain sanitized |

---

## 18.4 Throttling-specific taxonomy refinement

### Provider-level result
`429` should produce a safe internal classification such as:
```ts
providerFailureClass: 'rate-limited'
retryable: true
```

### Route-level translation
If no safe current data exists:
```ts
sourceStatus: 'source-unavailable'
```

If safe current partial data exists legitimately from the same provider execution:
```ts
sourceStatus: 'partial'
```

### UI copy posture
Use calm, non-technical language:
- “Adobe Sign information could not be refreshed right now.”
- “Try again later.”

Do **not** expose:
- “429”
- “Rate limit”
- “Retry-After”
to ordinary end users unless a later admin diagnostic surface expressly requires it.

---

## 18.5 Token-refresh failure taxonomy refinement

### Provider-level result
A failed token refresh should classify as:
```ts
classification: 'authorization-required'
retryable: false
```

### Route-level translation
```ts
sourceStatus: 'authorization-required'
```

### UI behavior
- Render authorization-required state.
- Present onboarding/reconnect CTA only if the OAuth onboarding path is in scope and implemented.
- Do not show generic provider-outage copy for this condition.

---

## 18.6 Error-message redaction refinement

Any 4xx/5xx error returned through HB backend error helpers must be:
- high-level,
- sanitized,
- free of tokens,
- free of provider payloads,
- free of agreement metadata.

The backend route may log:
- safe error code,
- safe failure class,
- retryable flag,
- HTTP status.

It may not log:
- raw provider body,
- raw provider headers containing sensitive values,
- raw OAuth callback URL,
- item-level queue data.

---

## 18.7 Telemetry and route taxonomy alignment

Every My Work route response path should be classifiable using:
- route domain/operation,
- correlation ID,
- HTTP status code,
- source-status classification when an envelope is returned,
- provider-failure classification when relevant,
- retryable flag where relevant,
- duration.

This allows:
- operations to distinguish auth, source, config, and throttle problems,
- dashboards to remain content-minimized,
- support teams to diagnose systemic failures without queue-content leakage.

---

# 9. Fully Developed Section 27 — Risk Exposure Register

## 27.1 Risk scoring posture

The following qualitative scale should be used:

| Rating | Meaning |
|---|---|
| **High** | Could materially compromise product correctness, security, or deployment readiness |
| **Medium** | Could degrade user trust, operations, or schedule if not handled |
| **Low** | Worth addressing but not likely to threaten the initiative materially |

---

## 27.2 Risk register

| ID | Risk | Exposure | Rating | Mitigation | Acceptance condition |
|---|---|---|---|---|---|
| R-01 | Adobe OAuth app registration, redirect URI, or scope posture incomplete | Live integration cannot ship or enters misleading “almost live” state | High | Treat live adapter as gated by confirmed app registration, callback, scope, and secure grant-store readiness | Final plan includes dependency checklist; implementation does not fake live readiness |
| R-02 | Refresh-token storage implemented casually or without approved protection | Credential theft / account compromise | High | Backend-only encrypted or approved protected persistence; no logs/evidence; narrow service access | Security review confirms storage posture |
| R-03 | Tokens leak through logs, telemetry, raw provider error bodies, or auth callback diagnostics | Credential compromise and governance failure | High | Sanitized errors only; no raw callback URLs; no raw provider body logs; telemetry allow/prohibit matrix enforced | Tests and code review prove no token-bearing logging paths |
| R-04 | Actor-to-Adobe principal mapping fails or drifts | Users see wrong queue state or cannot access their queue | High | Stable actor/grant record; no fallback principal; `principal-unresolved` state | Provider tests cover missing/ambiguous/mismatched grant states |
| R-05 | Queue rows become stale after signing/approval but are replayed as current | User distrust and workflow mistakes | High | No durable queue cache in MVP; explicit freshness messaging; no stale replay layer | Architecture remains no-durable-cache unless formally reopened |
| R-06 | Adobe API throttling causes refresh loops or worsens rate-limit condition | Operational instability, degraded UX | High | No auto-polling; manual refresh debounce; `Retry-After` honored; bounded retry | Tests cover 429 translation and no uncontrolled retry |
| R-07 | Provider outage or timeout leaks raw failure details or crashes the module | User-facing instability, support burden | Medium | Safe `source-unavailable` envelope; sanitized error taxonomy | Route/provider tests cover transient source outage |
| R-08 | Unsafe or incorrect source-open URLs are exposed | User sent to wrong/unsafe destination | High | Backend-only URL generation/validation per B05; no client-synthesized links | CTA renders only for validated backend URL |
| R-09 | Agreement title / sender metadata logged in telemetry | Privacy/commercial metadata exposure | High | Prohibit item-level metadata in logs; use classifications/counts only | Telemetry review verifies no row metadata |
| R-10 | Live hosted evidence captures sensitive queue contents | Evidence artifact becomes a privacy/security liability | High | Inherit PCC sanitizer; avoid live row dumps/screenshots; fixture-first evidence | Evidence harness output passes sanitization checks |
| R-11 | Generic `withTelemetry()` error path receives unsanitized provider exception | Sensitive strings reach logs despite high-level architecture | High | Provider/service layer throws safe error objects/messages only; route adapters sanitize before throw | Error-path tests prove raw provider bodies absent |
| R-12 | Backend auth/runtime config missing in hosted deployment | False negative validation or broken My Dashboard page | Medium | B02 permission and runtime readiness checklist remains binding | Hosted proof includes backend readiness preflight |
| R-13 | SharePoint API permission approval not completed | Protected backend reads fail despite good implementation | Medium | Explicit deployment dependency; hosted validation blocks until approved | Deployment checklist closed |
| R-14 | Manual refresh becomes a repeated-click retry storm | Avoidable source demand and poor UX | Medium | In-flight disabled state; debounce; no duplicate request | UI tests cover repeated activation |
| R-15 | Queue filtering causes unnecessary backend re-query | Extra provider load | Medium | Local filter current dataset where possible; no source re-query for simple display toggle | UX/data-flow tests confirm |
| R-16 | Future webhook feature is bolted on without verification/deduplication design | Security and data-consistency issues | Medium | Keep webhooks as separate future initiative with explicit architecture work | MVP contains documentation only, no half-built webhook runtime |
| R-17 | Diagnostic count metrics reveal unnecessary sensitive operational patterns | Excess telemetry collection | Medium | Prefer minimal total counts or bands; avoid rich item distribution where not needed | Telemetry design reviewed before implementation |
| R-18 | Developers confuse OAuth token store with queue cache and persist both casually | Architecture drift | High | Final plan must explicitly separate credential persistence from rejected queue-data persistence | Documentation and prompts name the distinction clearly |
| R-19 | UI copy overstates recency, e.g., “real-time” or “live queue” | User trust degradation | Medium | Copy standards prohibit unsupported recency claims | UX review confirms final wording |
| R-20 | Stale warning codes remain defined but implementation mistakenly activates them with no real cache semantics | Misleading state model | Low/Medium | Reserve stale-cache warning for future reopened cache decision | Tests validate MVP `isStale` semantics |

---

## 27.3 Highest-priority risks requiring explicit downstream implementation prompts

The final comprehensive plan and subsequent local-agent prompt package must call out the following as **hard gates**:

1. **No durable queue cache in MVP**
2. **No auto-polling**
3. **No raw token, provider body, or callback URL logging**
4. **No agreement title/sender metadata in telemetry**
5. **429 handling must honor Retry-After and avoid retry storms**
6. **Refresh-token failure maps to authorization-required**
7. **Evidence artifacts must avoid live queue content**
8. **Provider errors entering `withTelemetry()` must already be sanitized**
9. **No client-synthesized source links**
10. **OAuth token persistence and queue caching are separate architectural concerns**

---

## 27.4 Residual risks accepted for MVP

The following residual risks are acceptable with the current MVP posture:

| Residual risk | Why acceptable | Future enhancement |
|---|---|---|
| Queue snapshot may become outdated after initial page load until user refreshes | Honest snapshot-based MVP with last-refreshed copy | Webhook-backed invalidation or event-driven refresh |
| Source unavailable state may not provide deep operational cause to end user | Better to avoid leaking diagnostics | Admin/support diagnostics later |
| Authorization-required state may block value until user connects Adobe | Correct delegated-auth boundary | OAuth onboarding UX refinements |
| No offline queue replay during source outage | Avoid stale-data misrepresentation | Future short-lived cache only if validated |
| Manual refresh creates one extra provider call | Controlled and user-intentional | Future webhook or smarter source-state reuse |

---

# 10. Final Operational Contracts

## 10.1 Final refresh contract

```text
MVP refresh =
  initial load on render
  + manual focused-module refresh
  + no auto-polling
  + no hidden focus/visibility-trigger refresh
  + debounce + no duplicate in-flight request
```

---

## 10.2 Final cache contract

```text
MVP cache =
  no durable queue cache
  no persistent last-known queue replay
  no browser persistence of queue rows
  session-local UI state only
  future short-lived cache seam documented but unimplemented
```

---

## 10.3 Final staleness contract

```text
generatedAtUtc = required
isStale = false for current fetched/fixture snapshot unless explicitly stale by design
isStale = true only when future architecture intentionally serves stale/replayed data
```

---

## 10.4 Final throttling contract

```text
429 =
  classify as rate-limited
  honor Retry-After where present
  avoid tight retries
  bounded retry only if within route budget
  otherwise emit controlled degraded My Work envelope
```

---

## 10.5 Final telemetry contract

```text
telemetry =
  route state
  source state
  latency
  retry class
  throttle class
  counts only where justified

never =
  tokens
  auth codes
  raw callback URLs
  agreement titles
  sender identities
  source URLs
  raw Adobe bodies
  raw provider errors
  queue JSON dumps
```

---

## 10.6 Final evidence contract

```text
evidence =
  sanitized
  structural
  fixture-first where row text would otherwise be sensitive
  free of auth/session artifacts
  free of live queue payloads
```

---

# 11. Downstream Constraints for Validation and Final Plan Synthesis

## 11.1 Constraints for the final comprehensive development plan

The final plan must incorporate these Batch 06 decisions as closed architecture:

1. **No auto-polling in MVP**
2. **Manual refresh only in focused Adobe module**
3. **No durable queue cache in MVP**
4. **Webhook sync is future-state only**
5. **Retry/429 behavior is bounded and operationally classified**
6. **Telemetry is classification-first, not payload-first**
7. **Evidence must inherit PCC sanitation plus queue-specific privacy restrictions**
8. **Delegated OAuth token persistence must be described separately from rejected queue caching**
9. **Section 18 must include throttling and refresh-token failure mapping**
10. **Risk register must be carried forward into implementation prompts and acceptance gates**

---

## 11.2 Constraints for future implementation prompts

When implementation prompts are later generated, they must explicitly instruct the local code agent to:

- preserve B04/B05 route and integration contracts,
- use repo telemetry/auth wrapper patterns,
- never re-read files already within the session context unless drift is suspected,
- avoid changing unrelated PCC or existing backend telemetry doctrine,
- sanitize any error message capable of entering generic telemetry wrappers,
- implement no queue cache unless a separate architecture decision reopens the subject,
- implement no webhook runtime in MVP,
- add tests for throttling, refresh failure, and no metadata leakage,
- update README/runbook material with operational decisions,
- ensure evidence harnesses do not capture sensitive queue contents.

---

## 11.3 Constraints for hosted validation

Hosted SharePoint validation later must prove:
- protected backend route auth posture works,
- user-facing degraded states render correctly,
- authorization-required/configuration-required states render correctly,
- manual refresh does not duplicate requests,
- no horizontal overflow or shell breakage introduced by queue state cards,
- sanitized evidence output remains free of sensitive artifacts,
- live route failures are surfaced as controlled envelopes, not console dumps.

---

## 11.4 Constraints for security review

Security review must confirm:
- token store design,
- callback/redirect logging posture,
- secrets management,
- error-path redaction,
- telemetry allow/prohibit matrix adherence,
- hosted evidence redaction,
- queue DTO minimization,
- no cross-user override surfaces.

---

# 12. Final Decision Summary

| Area | Final Batch 06 decision |
|---|---|
| Frontend refresh | Load on render; manual focused-module refresh only |
| Auto-polling | Prohibited in MVP |
| Queue caching | No durable queue cache in MVP |
| Queue replay during outage | Prohibited |
| Staleness | Explicit metadata; no stale misrepresentation |
| 429 handling | Honor Retry-After; bounded retries; controlled degraded state |
| Retry strategy | Limited to transient failures; finite/backoff/jittered |
| Webhooks | Future-state only |
| Telemetry | Classification/counts/latency only; no sensitive row metadata |
| Token handling | Backend-only; no logs/evidence; secure persistence |
| Evidence | PCC sanitation inherited plus queue-specific restrictions |
| Section 18 refinement | Add rate-limit and refresh-token-failure mapping |
| Highest risk | Token leakage, stale-data misrepresentation, telemetry/evidence privacy leakage |

---

# 13. Final Target Outcome for Batch 06

The completed My Dashboard development-plan suite should now possess an operational architecture strong enough to prevent later implementation from casually:

- leaking tokens,
- logging agreement metadata,
- polluting evidence with live queue contents,
- polling Adobe Sign aggressively,
- retrying into throttling,
- treating stale queue rows as live truth,
- confusing OAuth credential persistence with queue caching,
- exposing unsafe source links,
- or emitting raw provider details through generic telemetry wrappers.

Batch 06 closes the resilience, security, privacy, telemetry, and risk posture needed before the final comprehensive My Dashboard development plan is synthesized and before implementation prompts are generated.
