# 04 — B06 Implementation Gap Register

| ID | Current repo-truth gap | Why it matters | Required action | Prompt owner | Closure proof |
|---|---|---|---|---|---|
| G-01 | B06 front matter points to a non-live long-form B05 filename | Cross-reference/search drift in the plan authority chain | Replace with actual repo filename `B05_Adobe_Sign_Integration_Architecture_Development.md` | Prompt 01 | `rg` confirms old name absent and correct name present |
| G-02 | Dev-plan README indexes only through B03 | Folder authority index is stale relative to B04/B05/B06 presence | Add B04/B05/B06 rows and update coverage language | Prompt 01 | README grep confirms B04/B05/B06 |
| G-03 | Outline authority table only identifies B01 and B02 | Downstream readers do not see B03–B06 as developed authority | Expand authority table through B06 | Prompt 02 | Outline grep confirms B03–B06 |
| G-04 | Outline Section 18 does not express B06 operational error-taxonomy refinements | Later implementation may mishandle 429, refresh failures, sanitized errors, and telemetry classifications | Reconcile Section 18 with B06 | Prompt 03 | Section 18 validation terms present |
| G-05 | Outline Section 22 remains weaker/older than B06 | Later implementation may reintroduce auto-polling or caching drift | Reconcile refresh/cache/staleness/throttling/webhook posture | Prompt 04 | Section 22 validation terms present |
| G-06 | Outline Section 23 does not fully reflect B06 telemetry/privacy/evidence restrictions | Token/content leakage risks are under-specified | Reconcile security/privacy/telemetry/evidence posture | Prompt 04 | Section 23 validation terms present |
| G-07 | Outline Section 27 risk register remains too high-level | B06’s hard gates are not visible in the scaffold | Upgrade risk treatment to reflect B06 categories | Prompt 04 | Section 27 validation terms present |
| G-08 | Outline open-items section still carries B06-closed items as unresolved | Direct contradiction of B06 decisions | Remove/rewrite source-unavailable transport and queue cache posture items | Prompt 04 | Negative greps pass |
| G-09 | Risk of B06 package broadening into runtime implementation | Scope drift | Keep changes docs-only | All prompts | `git diff --name-only` limited to target docs |

---

## Gap classification

### Must fix in B06 package
- G-01 through G-08

### Must preserve as boundary
- G-09

---

## Acceptance standard

B06 documentation reconciliation is complete only if:
- every must-fix gap has closure evidence,
- the repo reflects B06 through README + outline,
- the B06 artifact references the correct B05 predecessor filename,
- validation passes with docs-only scope.
