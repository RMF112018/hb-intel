# Plan Summary — Article Publisher Remediation Package

## Package objective
Drive closure of the updated Article Publisher audit findings one remediation gap at a time, in the correct dependency order, without mixing unrelated work.

## Recommended execution order

| Order | Prompt | Gap closed | Priority |
|---|---|---|---|
| 1 | Prompt-01 | List descriptors and list-title bindings | P0 |
| 2 | Prompt-02 | Master record contract (`HB Articles` / `ArticleId`) | P0 |
| 3 | Prompt-03 | Child-list relationships keyed by `ArticleId` | P0 |
| 4 | Prompt-04 | Template registry contract and resolver | P0 |
| 5 | Prompt-05 | Destination-page binding logic | P0 |
| 6 | Prompt-06 | Workflow states and workflow-history writes | P0 |
| 7 | Prompt-07 | Publishing error persistence | P1 |
| 8 | Prompt-08 | Promotion Rules seam | P1 |
| 9 | Prompt-09 | Final modern-page publish semantics | P1 |
| 10 | Prompt-10 | Post-publish master record sync | P1 |
| 11 | Prompt-11 | Archive / withdraw operational flows | P1 |
| 12 | Prompt-12 | Validation engine realignment | P2 |
| 13 | Prompt-13 | Shared publisher + Team Viewer article contract | P2 |
| 14 | Prompt-14 | Terminology cleanup / ubiquitous language | P3 |

## Why this order is correct
1. The current system cannot be trusted until the list bindings, contracts, keys, and repository seams match the tenant.
2. Workflow, binding, validation, preview, and publish logic all depend on the corrected data model.
3. Archive/withdraw and publish hardening should only happen after the data model and state model are trustworthy.
4. Terminology cleanup belongs last so it reflects the corrected architecture, not the broken one.

## Completion standard for each prompt
- The bounded gap is fully closed.
- Typecheck passes.
- Targeted tests pass.
- The agent provides file-by-file proof of closure.
- No unrelated redesign work is mixed into the prompt.

## Package-wide guardrails
- Preserve the **Article Publisher** rebrand.
- Preserve current **Project Spotlight** destination semantics unless the tenant schema itself requires a behavior change.
- Do not rely on obsolete `PostId` / `Project Spotlight *` assumptions.
- Do not combine multiple prompts into one execution wave.

## Recommended starting point
Start with **Prompt-01** immediately, then continue in strict order.
