# Prompt 04 — Reconcile Outline Sections 22, 23, 27 and Prune B06-Closed Open Items

## 1. Objective

Update the comprehensive outline so it visibly inherits B06’s closed decisions for:

- **Section 22** Refresh, Caching, Staleness, and Throttling Rules
- **Section 23** Security, Privacy, and Telemetry Contract
- **Section 27** Risk Exposure Register

Then remove or reframe the open items that B06 has already closed.

---

# 2. Current repo-truth problem

The outline still presents these areas at an older, less specific posture. B06 has since closed:
- no auto-polling in MVP,
- focused-module manual refresh only,
- no durable queue cache,
- explicit staleness semantics,
- bounded retry and `Retry-After` behavior,
- telemetry/evidence minimization,
- sanitized provider error handling,
- a more implementation-grade operational risk model.

The outline must reflect that.

---

# 3. Exact file to update

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Reference:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
```

---

# 4. Required Section 22 outcome

Section 22 must state all of the following:

1. **Refresh posture**
   - initial load on render,
   - manual refresh only in focused Adobe module,
   - no auto-polling,
   - no visibility/focus/resize-driven implicit refresh.
2. **Cache posture**
   - no durable queue cache,
   - no browser persistence of queue rows,
   - no persisted last-known queue replay.
3. **Freshness posture**
   - `generatedAtUtc` required,
   - `isStale` only for genuine stale/replayed behavior,
   - “Last refreshed” is acceptable; “real-time/live continuously” is not.
4. **Retry/throttling posture**
   - recognize 429,
   - honor `Retry-After`,
   - bounded retries only for transient technical failures,
   - no retry loops for auth/config/principal failures.
5. **Webhook posture**
   - future-state only,
   - not an MVP runtime dependency,
   - not a justification for introducing queue caching now.

---

# 5. Required Section 23 outcome

Section 23 must visibly include:

1. **Data-classification posture**
   - credentials,
   - identity-linkage data,
   - sensitive queue metadata,
   - operational status metrics,
   - fixture/mock metadata.
2. **Token secrecy**
   - no tokens in SPFx,
   - no tokens in logs,
   - no OAuth callback query strings in logs,
   - refresh-token persistence backend-only.
3. **Telemetry allow/prohibit posture**
   - allowed: route/status/classification/duration/correlation,
   - prohibited: tokens, raw provider bodies, agreement titles, sender identities, source URLs, queue JSON dumps.
4. **Error sanitization**
   - provider errors converted to safe classifications/messages before generic telemetry paths.
5. **Evidence hygiene**
   - inherit PCC sanitization doctrine,
   - avoid live queue-row payloads and sensitive screenshot/text capture.

---

# 6. Required Section 27 outcome

Section 27 must move beyond a short generic risk list and reflect B06’s implementation-grade risk categories.

At minimum, it must cover:
- OAuth readiness,
- refresh-token storage,
- token leakage through logs/evidence,
- actor/principal mapping failure,
- stale queue misrepresentation,
- rate-limit/retry storms,
- unsafe source URLs,
- telemetry metadata leakage,
- evidence capture leakage,
- backend auth/runtime readiness,
- webhook future complexity.

A concise table is acceptable. It does not need to reproduce every B06 row verbatim, but it must preserve the hard-gate intent.

---

# 7. Open-items cleanup

In the outline’s open-items section, remove or rewrite as closed the items corresponding to:

1. **Final backend source-unavailable transport choice**
   - B04/B06 close expected source/business degradation as **HTTP 200 + typed envelope**.
2. **Final backend queue cache posture**
   - B06 closes **no durable queue cache in MVP**.

Do not use this prompt to resolve unrelated open items that belong to B02, B05, or later batch work unless those items are already clearly closed by repo documentation and directly conflict with B06 wording.

---

# 8. Strict constraints

Do not:
- turn the outline into a duplicate of B06,
- rewrite B05 sections under B06 scope,
- modify README or B06 in this prompt,
- alter runtime code,
- introduce new runtime requirements beyond B06 planning scope.

---

# 9. Validation requirements

```bash
rg -n "manual refresh|auto-poll|no durable queue cache|generatedAtUtc|isStale|Retry-After|webhook" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "refresh tokens|access tokens|OAuth authorization codes|agreement titles|sender emails|source-open URLs|raw provider error|evidence|telemetry" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "token leakage|stale queue|retry storm|unsafe source|telemetry|evidence|throttling|principal mapping" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

! rg -n "Final backend source-unavailable transport choice" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

! rg -n "Final backend queue cache posture" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 10. Proof of closure

Report:
- Section 22 changes,
- Section 23 changes,
- Section 27 changes,
- open-items removed/reframed,
- validation results.

---

# 11. Do not re-read files already in active context unless needed to confirm drift

Use current context. Re-open the exact outline sections only where precise edits are required.
