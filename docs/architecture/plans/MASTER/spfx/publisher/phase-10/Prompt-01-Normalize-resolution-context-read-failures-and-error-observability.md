# Prompt 01 · Normalize resolution-context read failures and error observability

## Objective
Close the remaining resolution-path contract gap so preview, publish, and republish all receive a stable, typed outcome from the resolution layer even when repository reads fail. The end state is that resolution never leaks a raw infrastructure exception into the workflow surface when the code can instead classify and surface the failure explicitly.

## Critical operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required repo anchors
Read and use these as binding implementation anchors:
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.test.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts`

Also confirm any additional resolution consumers before changing the contract.

## Current issue in repo-truth terms
`buildPublishResolutionContext(...)` currently returns typed failures only for:
- `articleNotFound`
- `templateResolutionFailed`

That is not enough for the current implementation shape.

The function still directly awaits multiple repository reads that can throw:
- `repositories.articles.getByArticleId(...)`
- `repositories.templateRegistry.listActive()`
- `repositories.teamMembers.listByArticle(...)`
- `repositories.media.listByArticle(...)`
- `repositories.pageBindings.getByArticleId(...)`

Today, if one of those repository calls throws, the resolution builder can reject outright instead of returning a stable failure object. That leaks infrastructure failure shape into higher layers.

This matters in at least two places:
1. `publishOrchestrator.run(...)` depends on a stable resolution outcome so it can classify the failure as `stage: 'resolution'` and decide whether to append `HB Article Publishing Errors`.
2. `useDraftLifecycle.ts` reload paths use the resolution builder for authoring-state refresh and currently have to fall back to generic exception handling when the resolution layer throws.

The result is an inconsistent failure model:
- some resolution problems are typed and predictable
- some are generic throws
- non-preview observability is incomplete
- preview/reload surfaces are not guaranteed one stable error contract

## Intended future state
After this prompt is complete:

### Resolution layer contract
`buildPublishResolutionContext(...)` must return a typed failure result for **every** expected resolution-stage repository read failure.

You may choose the exact union shape, but it must include enough information to answer:
- which read seam failed
- whether the failure occurred before or after the article row was loaded
- what message should be surfaced to the caller

A recommended shape is a single new failure family such as:
- `reason: 'repositoryReadFailed'`
- `failedRead: 'articles' | 'templateRegistry' | 'teamMembers' | 'media' | 'pageBindings'`

If repo truth supports a cleaner shape, use that instead. What is not acceptable is leaving raw throws as part of the normal resolution contract.

### Orchestrator behavior
`publishOrchestrator.run(...)` must convert non-preview resolution failures into:
- `ok: false`
- `stage: 'resolution'`
- stable human-usable message text
- `HB Article Publishing Errors` append for non-preview modes when enough identifying information exists to do so safely

If article load itself fails before the article row exists, design the error append logic so it still records a useful row when possible without fabricating data you do not actually have.

### Preview / authoring behavior
Preview and authoring reload paths must preserve no-write semantics and must receive a stable failure shape rather than a raw throw whenever the failure belongs to the resolution contract.

### Contract preservation
Do **not** weaken or blur the existing typed paths for:
- article not found
- template resolution failed

Keep those explicit.

## Implementation expectations
1. Audit every current caller of `buildPublishResolutionContext(...)` before changing the return type.
2. Normalize thrown repository read failures inside the resolution layer or in a single tightly controlled wrapper directly around it. Do not spread ad hoc `try/catch` logic across unrelated callers if one contract-level fix can solve it.
3. Keep the message text technically useful. It should identify the failed seam in a way an operator or developer can act on.
4. Preserve preview no-write semantics.
5. Preserve existing publish gating, validation gating, and workflow policy behavior. This prompt is about failure normalization, not policy redesign.
6. Update any local types, helper functions, or test fixtures required to keep the contract explicit.

## Testing and validation requirements
Add or update targeted tests that prove:

### Resolution builder
- article read failure
- template registry read failure
- team-member read failure
- media read failure
- page-binding read failure

### Orchestrator behavior
- non-preview resolution failure returns `stage: 'resolution'`
- non-preview resolution failure appends `HB Article Publishing Errors` when appropriate
- preview mode still performs no page/list writes for these failures

### Controller / authoring behavior
- the authoring reload path no longer depends on a raw exception to surface a resolution-stage read failure

Use the narrowest seam tests that prove the contract. Do not add broad UI churn.

## Closure artifacts
Create a closure note under:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/`

The closure note must include:
- final typed failure union/result shape
- the exact repository seams now normalized
- changed files
- tests added/updated
- proof that non-preview resolution failures are observable without raw throws

## Anti-drift / non-deferral rules
- Do not mix publish compensation redesign into this prompt.
- Do not mix archive/withdraw lifecycle redesign into this prompt.
- Do not leave any repository-read failure seam outside the normalized contract if it is still part of resolution now.
- Do not mark this closed if a caller can still receive a raw resolution-stage repository exception under normal operation.
