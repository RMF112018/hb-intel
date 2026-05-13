# Prompt 04 — Reconcile Outline Sections 15, 16, 17, 20, and Open Items

## 1. Objective

Update the body of:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

so its Sections **15**, **16**, **17**, and **20**, plus its B05-relevant “open items” posture, align with the closed decisions in the canonical B05 artifact.

---

## 2. Why this work exists

The outline was authored before B05 was developed. It still carries draft posture that now conflicts with B05’s closed integration architecture. If future implementation prompts start from the outline rather than B05, they could:
- key Adobe grants by mutable email-like claims,
- treat delegated OAuth as optional rather than closed architecture,
- overpromise “expiration soon first” sorting,
- implement unsafe link behavior,
- continue treating already-closed decisions as unresolved.

This prompt removes that drift while keeping the outline concise.

---

## 3. Current repo-truth problem or gap

The outline currently contains:
- Section 15 claim-priority guidance based on `preferred_username`/`upn`/`email`,
- Section 16 framing that says the plan must later choose one of two OAuth paths,
- Section 17 a sort recommendation that can be read as guaranteed “nearest expiration date first,”
- Section 20 source-handoff text that lacks B05’s signing URL caveat and validated handoff hierarchy,
- Section 29 open items that still list decisions closed by B02/B04/B05.

---

## 4. Attached B05 authority / plan basis

Use the canonical B05 artifact as the governing source for:
- stable actor-key posture,
- app-only token exclusion,
- grant-record lookup,
- delegated OAuth architecture,
- production-live provider gating,
- `POST v6/search` baseline,
- no raw search pass-through,
- sort verification caution,
- bounded enrichment only,
- source URL validation,
- signing URL not being the default row open-link contract,
- module-level general Adobe launch only when validated,
- open item pruning.

---

## 5. Exact files, folders, docs, and symbols to inspect

Primary target:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Authority references:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
```

Repo-truth identity confirmation:
```text
backend/functions/src/middleware/validateToken.ts
```

---

## 6. Required implementation outcome

The outline must end in a B05-compatible state without becoming a duplicate B05 artifact.

---

## 7. Detailed change instructions

## A. Reconcile Section 15 — Authenticated Actor → Adobe Principal Resolution Contract

### Required target state
Replace any claim-priority text that treats `preferred_username`, `upn`, or `email` as an authorization/grant lookup key.

The revised outline summary must state:
- grant binding uses a stable HB actor key derived from trusted tenant context plus `claims.oid`,
- the current backend exposes `claims.oid` and normalized `claims.upn`, but not a separate validated `email` field,
- `upn` remains display/diagnostic copy only,
- app-only identities are not eligible to drive a user Adobe queue read,
- the provider resolves the actor through a backend-only grant record,
- no shared Adobe principal fallback and no ad hoc email search fallback are permitted.

Do not overfill the outline with the full B05 record shape; reference B05 as the detailed authority.

---

## B. Reconcile Section 16 — Adobe Authentication Architecture Gate

### Required target state
Replace the draft “choose one of two implementation paths” posture with a closed B05 summary:

- live architecture = delegated Acrobat Sign OAuth authorization-code flow,
- authorization initiation, callback validation, code exchange, grant persistence, refresh lifecycle, revocation/reauthorization mapping are required architecture surfaces,
- production-live provider remains disabled/gated until app registration, redirect URI, backend secrets, secure grant store, refresh-token encryption, and test account dependencies are present,
- fixture/configuration-mode states may still ship before those production dependencies are ready.

If the outline currently implies the OAuth architecture itself is unresolved, remove that implication.

---

## C. Reconcile Section 17 — Adobe Sign API Query Contract

### Required target state
Update Section 17 so it states:
- bounded `POST v6/search` is the live retrieval baseline,
- the exact six actionable statuses remain the B04/B05 MVP union,
- no actor/user override,
- no source email override,
- no raw Adobe status override from SPFx,
- no raw Adobe search query pass-through,
- `pageSize` is backend-clamped and `cursor` opaque,
- the sort posture must distinguish source-supported sort from UI urgency presentation,
- do **not** claim “expiration soon first” unless the live Adobe request/validation proves that order,
- unbounded per-row `GET /agreements/{id}` enrichment loops are prohibited,
- `429` / `Retry-After` source behavior maps to controlled My Work source states.

---

## D. Reconcile Section 20 — Adobe Sign Source Handoff Contract

### Required target state
Update Section 20 so it states:
- row-level CTA appears only when backend returns a validated `sourceOpenUrl`,
- guessed URLs are prohibited,
- client-side source URL synthesis is prohibited,
- signing URL endpoint is **not** the default row-level open-link contract,
- module-level general “Open Adobe Sign” launch may exist only when built from validated backend-stored access-point context and URL policy evaluation,
- lack of a safe URL is a valid queue state and must not break row rendering.

---

## E. Reconcile Section 29 — Open Items

### Required target state
Remove or reframe items that should not remain listed as unresolved after B02/B04/B05:

1. **OAuth architecture choice**  
   Reframe as closed by B05 with production-live dependency gates, not as an unresolved architecture choice.

2. **Backend source-unavailable transport choice**  
   Reframe or remove if still present because B04 already closes expected source/business states as read-model envelopes.

3. **Actor email claim precedence**  
   Remove entirely as an open item; B05 closes stable actor key posture.

4. **Property-pane operational config exposure**  
   Remove or reframe if still present because B02 already closes no operational backend/Adobe config exposure.

Retain genuinely residual items still outside B05, such as:
- final SharePoint page URL,
- queue cache posture if not closed,
- final user-facing urgency threshold if not closed,
- focused module pagination UX if not closed.

If the section heading currently says all listed items “must be resolved before implementation prompts,” revise it so it accurately separates:
- decisions already closed by batch artifacts,
- truly residual decisions still open.

---

## 8. What done looks like

Done means:
- the outline body no longer contradicts B05,
- B05’s identity/OAuth/search/handoff rules are visible in the outline,
- stale open items are pruned or reclassified,
- detailed implementation remains delegated to B05 rather than duplicated in full.

---

## 9. Strict constraints / prohibitions

Do not:
- modify B05 itself,
- rewrite B01–B04,
- over-convert the outline into a dense implementation spec,
- implement runtime code,
- leave stale claim-priority text in place next to B05-compatible text,
- keep “nearest expiration date first” as a definitive upstream sort claim,
- imply signing URLs are the default row open-link.

---

## 10. Validation requirements

Run:

```bash
rg -n "claims\\.oid|tenant context|app-only|grant record|shared Adobe principal|delegated OAuth|authorization-code flow|production-live provider|POST v6/search|pageSize|cursor|source-supported sort|Retry-After|sourceOpenUrl|signing URL|web_access_point" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

! rg -n "normalized `preferred_username`|normalized `upn`|normalized `email`|Final exact claim precedence for actor email resolution|nearest expiration date first" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

## 11. Proof of closure

Report:
- exact outline sections revised,
- open items removed/reframed,
- contradiction checks passed,
- validation output summary.

---

## 12. Commit/closeout expectations

Do not commit unless instructed.  
Include this outline reconciliation in the final B05 closeout summary.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use B05 and the target outline directly. Re-open B02/B04/validateToken only to confirm exact references that materially affect wording.
