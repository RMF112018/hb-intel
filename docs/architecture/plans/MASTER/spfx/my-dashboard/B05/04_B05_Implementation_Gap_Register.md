# 04 — B05 Implementation Gap Register

| ID | Current repo-truth issue | Why it matters for B05 | Required implementation action | Owner prompt | Closure proof |
|---|---|---|---|---|---|
| G-01 | B05 attached artifact is not yet the canonical committed dev-plan file | Later agents cannot inherit B05 from repo authority | Add `B05_Adobe_Sign_Integration_Architecture_Development.md` to the dev-plan folder | Prompt 01 | Path exists + B05 scope grep |
| G-02 | Folder README authority index stops at B03 despite B04 being committed | Reading order and batch inheritance are stale before B05 is added | Update README artifact table for B04 and B05 | Prompt 02 | README grep shows B04/B05 |
| G-03 | Outline batch-authority header lists B01/B02 only | The outline misstates current batch authority | Update outline authority table for B03/B04/B05 | Prompt 03 | Outline header grep |
| G-04 | Outline Section 15 still uses claim precedence based on `preferred_username`/`upn`/`email` | Directly conflicts with B05 stable actor-key posture | Replace with tenant context + `claims.oid`; restrict UPN to display/diagnostics | Prompt 04 | Positive identity grep + negative stale-phrase grep |
| G-05 | Outline Section 16 still frames OAuth approach as unresolved path selection | B05 closes delegated OAuth architecture and live-provider gating | Reframe Section 16 to match B05 | Prompt 04 | OAuth/gating grep |
| G-06 | Outline Section 17 contains search/sort posture that can overstate “expiration soon first” | B05 explicitly rejects claiming a sort order unless live request proves it | Update retrieval/sort language to B05 posture | Prompt 04 | Search/sort grep + negative stale sort check |
| G-07 | Outline Section 20 lacks B05’s signing URL and validated-handoff specificity | Could lead future prompts to implement unsafe guessed links or signing-url shortcuts | Expand Section 20 with B05 source-handoff contract | Prompt 04 | Handoff grep |
| G-08 | Outline Section 29 keeps B02/B04/B05-closed decisions as “open items” | Misleads later agents and undermines authority chain | Prune/reframe closed items, retain only genuinely residual decisions | Prompt 04 | Open-item drift checks |
| G-09 | Runtime work could be accidentally inferred from B05 | B05 is planning-only; implementation belongs to later prompts | Keep package instructions docs-only and validate changed paths | All prompts / Prompt 05 | `git diff --name-only` restricted to three docs |

---

## Gap classification

### Must fix in this B05 implementation package
- G-01 through G-08

### Must preserve as out-of-scope guardrail
- G-09

---

## Acceptance threshold

B05 documentation implementation is complete only when:
- every must-fix gap has closure evidence,
- validation passes,
- runtime scope drift is absent,
- future implementation sessions can read the repo and inherit B05 without relying on external chat context.
