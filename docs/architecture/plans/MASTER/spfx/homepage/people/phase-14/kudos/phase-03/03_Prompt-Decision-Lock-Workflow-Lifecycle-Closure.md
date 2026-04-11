# Prompt — Decision Lock Workflow Lifecycle Closure

## Objective
Close the runtime workflow lifecycle gap so the HB Kudos employee and moderation surfaces truly support the decision-locked operating model rather than only exposing a subset of the writer-layer actions.

## Repo truth
Work directly against the live repo:
- `https://github.com/RMF112018/hb-intel`

Do not re-read files that are already in your current context or memory.

## Governing authority
Use repo truth and at minimum:
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`


## Scope
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- any supporting shared flyout/detail/workspace components

## Non-negotiable requirements
- Close the gap between supported patch kinds and runtime-reachable UI flows.
- Implement or expose runtime flows for withdrawal, revision/resubmit, reopen where locked, and admin edit-published behavior where required.
- Do not add fake closure via comments or manifest text.
- Preserve same-record revision behavior.
- Do not break existing approval/rejection/schedule/prominence/remove flows while adding missing lifecycle paths.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- runtime UI changes for missing lifecycle flows
- supporting state/writer integration changes
- tests covering newly reachable lifecycle behaviors
- doc updates where lifecycle claims were previously overstated

## Verification
- demonstrate each newly closed lifecycle path and its state transition
- show which decision-lock lifecycle items are now fully closed
- run targeted tests for lifecycle behavior and any affected UI state
