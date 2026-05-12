# 04 — B01 Implementation Gap Register

| ID | Current repo-truth issue | Why it matters for B01 | Required implementation action | Owner prompt | Closure proof |
|---|---|---|---|---|---|
| G-01 | `dev-plan/` contains outline, B01, and B02 but no folder README/index | Later sessions can misread document precedence | Create `dev-plan/README.md` with authority map and artifact index | Prompt 01 | Path exists + README grep checks |
| G-02 | Comprehensive outline does not visibly defer to B01/B02 batch authority | Later agents may reopen closed B01 decisions or ignore B02 | Add batch-authority posture and artifact table to outline | Prompt 02 | Outline grep checks |
| G-03 | Stale `my-work-alignment-contract.md` says `@hbc/my-work-feed` does not exist | Directly contradicts B01 and implemented repo truth | Mark the document superseded/archival with a top banner and current-authority references | Prompt 03 | Supersession grep checks |
| G-04 | Active docs still cite the stale alignment contract as if it is current | Readers are still routed toward contradicted guidance | Correct active cross-references in runway, provisioning publication contract, and primitive checklist | Prompt 03 | Cross-reference grep checks |
| G-05 | Primitive checklist says a new aggregation surface “conflicts with future My Work implementation” | My Work Feed is already implemented; wording is stale and misleading | Replace with implemented `@hbc/my-work-feed` authority framing | Prompt 03 | Zero results for old phrase |
| G-06 | Active SF29 docs reference nonexistent My Work `ADR-0114` | Breaks My Work authority chain and contradicts current ADR catalog | Normalize SF29 master/T09 docs to ADR-0115 My Work Feed architecture ADR | Prompt 04 | ADR drift grep checks |
| G-07 | Runtime My Dashboard scaffold remains absent | This is expected; B01 is not a runtime batch | No implementation action; preserve as explicit out-of-scope boundary | All prompts | Closeout confirms no runtime work |

---

## Gap classification

### Must fix in this B01 implementation package
- G-01 through G-06

### Must preserve as out-of-scope
- G-07

---

## Acceptance threshold

The B01 documentation posture should be considered closed only when:
- every **must-fix** gap has closure evidence,
- the final validation prompt passes,
- no runtime work was introduced to “solve” a documentation-only batch.
