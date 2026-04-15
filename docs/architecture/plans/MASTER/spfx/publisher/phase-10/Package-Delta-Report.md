# Package Delta Report

| Original item | Repo-truth status now | Updated package action | Why |
|---|---|---|---|
| `Prompt-01-Normalize-resolution-read-failures.md` | **Still open** | **Retained and rewritten** | Resolution builder still does not normalize thrown repository read failures into a typed outcome. The updated prompt broadens the scope to cover all current call paths and error observability. |
| `Prompt-02-Close-publish-binding-rollback-gap.md` | **Still open, but under-scoped in the old package** | **Retained, renamed, and expanded** | The real defect is not only the binding row. Late publish failure can now leave contradiction across page, binding, master article, and workflow history. |
| `Prompt-03-Close-archive-withdraw-split-state-gaps.md` | **Still open, changed in shape** | **Retained, renamed, and expanded** | The old prompt focused on binding-update/article-update windows after page demotion. Current repo truth also shows a history-append compensation branch that rolls back only the master row and leaves the page/binding demoted. |
| `Prompt-04-Make-draft-save-atomic-or-compensating.md` | **Still open, but the exact defect changed** | **Retained and rewritten** | Child writers are already keyed-sync and non-destructive. The remaining issue is now controller-owned, cross-list save ambiguity and lack of a truthful service-level persistence model. |

## Summary of package restructuring
- **Prompts retained:** 4
- **Prompts removed:** 0
- **Prompts added:** 0
- **Prompts materially expanded:** 4
- **Prompt titles changed:** 3

## Why no additional prompt file was added
The current repo-truth closure scope still resolves cleanly into the same four workstreams, provided those workstreams are rewritten at the correct technical depth. The missing coverage was not a missing fifth issue; it was that Prompts 02, 03, and 04 were too narrow for the current code shape.

## Highest-impact structural shift
The biggest repo-truth shift is in archive/withdraw: current code already introduced partial compensation, but the compensation is not yet internally truthful because one late-failure path reverts only the master row while leaving the page and binding demoted.
