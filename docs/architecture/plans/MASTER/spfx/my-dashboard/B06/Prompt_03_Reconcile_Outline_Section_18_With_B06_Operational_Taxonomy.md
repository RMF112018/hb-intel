# Prompt 03 — Reconcile Outline Section 18 with B06 Operational Taxonomy

## 1. Objective

Update the outline’s:

```text
# 18. Backend Route Family and Error Taxonomy
```

so it reflects B06’s operational refinements without replacing B04’s underlying route/read-model contract.

---

# 2. Current repo-truth problem

B04 already locked the base route/error posture. B06 now refines that posture for:
- throttling,
- refresh-token failure,
- provider error sanitization,
- telemetry classification,
- HTTP/source-state mapping.

The outline must now express those refinements to prevent downstream implementation drift.

---

# 3. Exact file to update

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Reference:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
```

---

# 4. Required implementation outcome

Section 18 must preserve:
- `GET /api/my-work/me/home`
- `GET /api/my-work/me/adobe-sign/action-queue`
- no actor override query fields
- B04’s HTTP 200 + typed envelope posture for expected source/business degradation.

Section 18 must add or refine:
1. **429 throttling translation**
   - provider-level safe classification such as `rate-limited`,
   - read-model envelope translation to `source-unavailable` or `partial` where legitimate.
2. **Refresh-token failure mapping**
   - failed refresh → `authorization-required`,
   - no generic provider-outage phrasing.
3. **Sanitized provider error posture**
   - raw provider bodies, callback URLs, tokens, queue metadata must not enter error-message paths.
4. **Telemetry/classification alignment**
   - route domain/operation,
   - correlation ID,
   - HTTP status,
   - source status,
   - provider failure class,
   - retryable flag,
   - duration.
5. **Retained HTTP distinction**
   - 401 auth failures,
   - 400 malformed query,
   - 500 unhandled backend exception,
   - 403 only if a later policy-denial surface is introduced.

---

# 5. Recommended structure

A concise Section 18 update may include:

- `18.x Route family remains unchanged`
- `18.x Final HTTP vs. read-model response matrix`
- `18.x Throttling-specific taxonomy refinement`
- `18.x Token-refresh failure taxonomy refinement`
- `18.x Error-message redaction refinement`
- `18.x Telemetry and route taxonomy alignment`

Keep this outline summary shorter than the full B06 artifact while preserving closed decisions.

---

# 6. Strict constraints

Do not:
- alter the B04 route family,
- introduce new source statuses outside existing batch contracts,
- broaden to implementation detail beyond planning-summary level,
- change runtime code,
- rewrite Sections 22/23/27 in this prompt.

---

# 7. Validation requirements

```bash
rg -n "Retry-After|rate-limited|authorization-required|sanitized|source-unavailable|partial|401|400|500|provider failure" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

The local agent must verify that these terms occur in the Section 18 context, not only elsewhere in the outline.

---

# 8. Proof of closure

Report:
- Section 18 subsections added/updated,
- taxonomy refinements preserved,
- validation result.

---

# 9. Do not re-read files already in active context unless needed to confirm drift

Re-open only Section 18 and the B04/B06 references if exact wording placement needs confirmation.
