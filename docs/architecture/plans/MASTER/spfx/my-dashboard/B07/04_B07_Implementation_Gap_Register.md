# 04 — B07 Implementation Gap Register

| ID | Current repo-truth gap | Why it matters | Required action | Prompt owner | Closure proof |
|---|---|---|---|---|---|
| G-01 | B07 references a stale long-form B05 predecessor filename | Cross-reference/search drift in the plan authority chain | Replace with `B05_Adobe_Sign_Integration_Architecture_Development.md` | Prompt 01 | Negative/positive `rg` passes |
| G-02 | B07 still describes current main as if My Work shell/navigation/hero runtime were absent | Misleads downstream planning and phase sequencing | Reconcile B07 to distinguish original anchor from current main | Prompt 01 | B07 references live shell/runtime files and stale statements are neutralized |
| G-03 | B07 frames package critical-runtime path expansion as future-only, despite shell runtime now landed | Package-proof work can be incorrectly deferred | Reframe as an immediate downstream implementation gap | Prompt 01 | B07 package-proof prose updated |
| G-04 | Dev-plan README indexes only through B03 | Folder authority index is stale relative to B04–B07 | Add B04–B07 rows and update coverage language | Prompt 02 | README grep confirms B04–B07 |
| G-05 | Outline authority table stops at B02 | Downstream readers do not see B03–B07 authority | Expand authority table through B07 | Prompt 02 | Outline grep confirms B03–B07 |
| G-06 | Outline Section 6 under-specifies B07 hosted validation posture | Hosted acceptance gates may be diluted | Reconcile host/page/production-vs-review lane posture | Prompt 03 | Section 6 validation cues present |
| G-07 | Outline Section 8 lacks B07 runtime-version/package-proof refinements | Hosted package identity/version proof can remain weak | Reconcile runtime version proof and critical-path expansion posture | Prompt 03 | Section 8 validation cues present |
| G-08 | Outline Section 25 does not yet carry B07’s layered validation matrix / strict DoD | Later prompts may define acceptance too loosely | Reconcile validation matrix and Definition of Done | Prompt 03 | Section 25 cues present |
| G-09 | Outline Section 26 lacks B07’s dependency-gated phase sequence | Implementation order can drift into unsafe sequencing | Reconcile phase model | Prompt 04 | Section 26 cues present |
| G-10 | Outline Section 27 lacks B07 hosted-validation/evidence risks | Risk register underweights release-gating failure modes | Reconcile risk additions | Prompt 04 | Section 27 cues present |
| G-11 | Potential B07-closed items remain framed as unresolved | Direct contradiction of B07 | Remove/reframe only directly closed validation/evidence items | Prompt 04 | Agent closeout identifies result |
| G-12 | Risk of package broadening into runtime implementation | Scope drift | Keep changes docs-only | All prompts | `git diff --name-only` limited to target docs |

---

## Gap classification

### Must fix in B07 package
- G-01 through G-11

### Must preserve as boundary
- G-12

---

## Acceptance standard

B07 documentation reconciliation is complete only if:
- every must-fix gap has closure evidence,
- the repo reflects B07 through README + outline,
- the B07 artifact is accurate against current main,
- validation passes with docs-only scope.
